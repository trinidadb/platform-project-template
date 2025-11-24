import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { ConfigService, logger } from "../config";
import { AuthService } from "../services";

// --- Types ---
// Ensure express-session knows about the tokenSet (matches your main app declaration)
import "express-session";
import { TokenSet } from "openid-client";

declare module "express-session" {
  interface SessionData {
    tokenSet?: TokenSet;
  }
}

// Extend the Express Request interface to include the user payload
export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}


const client = jwksClient({
  // This URL comes from your Keycloak realm's "OpenID Endpoint Configuration"
  jwksUri: `http://${ConfigService.getInstance().keycloak.host}:${ConfigService.getInstance().keycloak.port}/realms/${ConfigService.getInstance().keycloak.realm}/protocol/openid-connect/certs`,
});

// 2. Create a function to get the signing key
function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      logger.error("Error getting signing key", { error: err });
      callback(err);
      return;
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// 3. Create the middleware function
export const protectRoute = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;
  let isSessionBased = false;

  // 1. Check Authorization Header (Bearer)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  // 2. Check Session (PKCE / Cookie flow)
  else if (req.session?.tokenSet?.access_token) {
    token = req.session.tokenSet.access_token;
    isSessionBased = true; // Mark that we found it in a session
  }

  // 3. If no token found in either place, reject
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const verifyOptions: jwt.VerifyOptions = {
    // Check the issuer to make sure it's from your Keycloak realm
    issuer: `http://${ConfigService.getInstance().keycloak.issuerHost}:${ConfigService.getInstance().keycloak.issuerPort}/realms/${ConfigService.getInstance().keycloak.realm}`,
    // Check the audience to make sure it's for your client
    audience: `${ConfigService.getInstance().keycloak.client}`, // This is the 'Client ID'
    algorithms: ["RS256"], // Keycloak's default algorithm
  };

  // 2. Verify Function (Wrapped in Promise for async/await handling)
  const verifyToken = (t: string): Promise<JwtPayload | string> => {
    return new Promise((resolve, reject) => {
      jwt.verify(t, getKey, verifyOptions, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded!);
      });
    });
  };

  try {
    // Try to verify the current token
    const decoded = await verifyToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    // 3. HANDLE EXPIRATION
    if (err instanceof TokenExpiredError && isSessionBased && req.session.tokenSet) {
      logger.info("Token expired, attempting refresh...");

      try {
        // A. Perform Refresh via AuthService
        // We need to reconstruct a TokenSet object for the openid-client to use
        const authService = AuthService.getInstance(); // Get Singleton
        const currentTokenSet = new TokenSet(req.session.tokenSet);
        const refreshedTokenSet = await authService.refreshToken(currentTokenSet);

        // B. Verify the NEW Access Token immediately
        // (Security check: ensure the new token from Keycloak is actually valid)
        const newDecoded = await verifyToken(refreshedTokenSet.access_token!);

        // C. Update Session
        req.session.tokenSet = refreshedTokenSet;
        req.session.save(); // Important: persist new tokens

        // D. Attach to request and continue
        req.user = newDecoded;
        logger.info("Token refreshed successfully");
        return next();

      } catch (refreshErr) {
        logger.error("Token refresh failed", { error: refreshErr });
        // If refresh fails, the session is dead. Kill it.
        req.session.destroy(() => {}); 
        return res.status(401).json({ message: "Session expired, please login again" });
      }
    }

    // If it wasn't an expiry error, or not session-based, just fail
    logger.error("Token verification failed", { error: err });
    return res.status(401).json({ message: "Unauthorized" });
  }
};
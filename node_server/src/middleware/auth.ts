import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { ConfigService, logger } from "../config";

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
export const protectRoute = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const token = authHeader.split(" ")[1];

  const verifyOptions: jwt.VerifyOptions = {
    // Check the issuer to make sure it's from your Keycloak realm
    issuer: `http://${ConfigService.getInstance().keycloak.issuerHost}:${ConfigService.getInstance().keycloak.issuerPort}/realms/${ConfigService.getInstance().keycloak.realm}`,
    // Check the audience to make sure it's for your client
    audience: `${ConfigService.getInstance().keycloak.client}`, // This is the 'Client ID'
    algorithms: ["RS256"], // Keycloak's default algorithm
  };

  jwt.verify(token, getKey, verifyOptions, (err, decoded) => {
    if (err) {
      logger.error("Token verification failed", { error: err.message });
      return res.status(401).json({ message: `Unauthorized: ${err.message}` });
    }
    
    // Attach the decoded token payload to the request object
    req.user = decoded;
    next();
  });
};
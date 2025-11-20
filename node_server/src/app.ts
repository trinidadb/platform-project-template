import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import swaggerUi from "swagger-ui-express";
import os from "os";
import http from "http"; // <-- Import http module
import { Issuer, Client, generators, TokenSet } from "openid-client";

import { postgresDbConnector } from "./connectors";
import { ConfigService, swaggerSpec, logger } from "./config";
import { userRouter } from "./routes";
import { errorHandler, protectRoute } from "./middleware";
import { authService } from "./services";

// --- 1. EXTEND SESSION INTERFACE ---
// This tells TypeScript that our session can hold Keycloak tokens
declare module "express-session" {
  interface SessionData {
    tokenSet?: TokenSet;
    code_verifier?: string;
    state?: string;
  }
}

// Request Interface
export interface Request extends express.Request {
  raw: any;
}

export class Application {
  public app: express.Application;
  private server: http.Server; // <-- Add a server property
  private oidcClient: Client;

  constructor() {
    this.app = express();
    this.config();
    this.parsers();
    this.routes();
    this.setupSwagger();
  }

  public async start(): Promise<void> {
    try {
      // Initialize Keycloak BEFORE starting the server
      await authService.initialize();
      
      // Sync Database
      await postgresDbConnector.sync({ force: false });
      logger.info("Database synced with models");

      // Start Listening
      this.server = this.app.listen(
        ConfigService.getInstance().http.port,
        () => {
          logger.info(
            `Server running on http://${
              ConfigService.getInstance().http.bind
            }:${ConfigService.getInstance().http.port}`
          );
        }
      );
    } catch (err) {
      logger.error("Error starting application", { error: err });
      process.exit(1);
    }
  }

  public async close(): Promise<void> {
    logger.info("Closing server and database connections...");
    if (this.server) {
      await new Promise<void>((resolve, reject) => {
        this.server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }
    await postgresDbConnector.close();
  }

  private config(): void {
    // CORS y middlewares
    this.app.use(
      cors({
        origin: [
          "http://localhost:5173",
          "http://localhost",
          "http://localhost:8080",
          "http://localhost:81",
          "http://212.128.157.197",
          "http://212.128.157.197:81",
        ],
        credentials: true,
        methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: [
          "X-Requested-With",
          "X-HTTP-Method-Override",
          "Content-Type",
          "Accept",
          "Set-Cookie",
          "auth-token",
          "Authorization", // <--- IMPORTANT: Allow Authorization header
        ],
      })
    );

    this.app.use(cookieParser("secretoCookie"));
    this.app.use(compression());
  }

  private parsers(): void {
    this.app.use(bodyParser.raw());
    this.app.use(bodyParser.text());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    this.app.use(
      expressSession({
        secret: "secretoDeSesionHTTP",
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false, // TODO: Cambiar a true en producción con HTTPS
          maxAge: 15 * 60 * 1000, // 15 min
          httpOnly: true,
          sameSite: "lax",
        },
        rolling: true, // Reset session expiration time on every request
      })
    );
  }

  // --- 4. AUTH ROUTES IMPLEMENTATION ---
  private setupAuthRoutes() {
    const router = express.Router();

    // LOGIN: Generates PKCE and redirects to Keycloak
    router.get("/login", (req, res, next) => {
      if (!authService.client) return next(new Error("OIDC not initialized"));

      const code_verifier = generators.codeVerifier();
      const code_challenge = generators.codeChallenge(code_verifier);
      
      // Store verifier in session to validate later
      req.session.code_verifier = code_verifier;

      const url = authService.client.authorizationUrl({
        scope: "openid profile email",
        code_challenge,
        code_challenge_method: "S256",
      });

      res.redirect(url);
    });

    // CALLBACK: Exchange code for tokens
    router.get("/callback", async (req, res, next) => {
        if (!authService.client) return next(new Error("OIDC not initialized"));

        try {
            const params = authService.client.callbackParams(req);
            const code_verifier = req.session.code_verifier;

            if (!code_verifier) {
                throw new Error("Missing code_verifier in session");
            }

            // Exchange code for token
            const tokenSet = await authService.client.callback(
                "http://localhost:8083/auth/callback", 
                params, 
                { code_verifier }
            );

            // Store tokens in session
            req.session.tokenSet = tokenSet;
            req.session.code_verifier = undefined; // Clean up
            req.session.save(); // Ensure session is saved before redirect

            logger.info("User authenticated successfully");
            res.redirect("/"); // Redirect to dashboard/home
        } catch (err) {
            logger.error("Auth Callback Error", { err });
            res.status(401).send("Authentication Failed");
        }
    });

    // LOGOUT
    router.get("/logout", (req, res) => {
        const tokenSet = req.session.tokenSet;
        req.session.destroy(() => {
             if (authService.client && tokenSet?.id_token) {
                const url = authService.client.endSessionUrl({
                    id_token_hint: tokenSet.id_token,
                    post_logout_redirect_uri: "http://localhost:8083/"
                });
                res.redirect(url);
             } else {
                 res.redirect("/");
             }
        });
    });

    // Mount these under /auth
    this.app.use("/auth", router);
  }

  private routes(): void {
    // Register Auth Routes (Login/Callback)
    this.setupAuthRoutes();

    this.app.use("/users", protectRoute, userRouter);

    this.app.use(errorHandler); // capturamos todos los errores de la aplicación
  }

  private setupSwagger(): void {
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("Swagger docs available at /api-docs");
  }
}

export const appInstance = new Application();

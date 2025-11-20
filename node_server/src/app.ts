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
import { authRouter, userRouter } from "./routes";
import { errorHandler, protectRoute } from "./middleware";
import { AuthService } from "./services";

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
      await AuthService.getInstance().initialize();
      
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

  private routes(): void {
    // Register Auth Routes (Login/Callback)
    this.app.use("/auth", authRouter);

    this.app.use("/users", protectRoute, userRouter);

    this.app.use(errorHandler); // capturamos todos los errores de la aplicación
  }

  private setupSwagger(): void {
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("Swagger docs available at /api-docs");
  }
}

export const appInstance = new Application();

import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import expressSession from "express-session";

// PostgreSQL
import { postgresDbConnector } from "./connectors";


// Configuration
import { ConfigService } from "./config";

// Routes
import {
  userRouter,
} from "./routes";

//Middleware
import errorHandler from "./middleware/errorHandler";

import os from "os";

// Request Interface
export interface Request extends express.Request {
  raw: any;
}

export class Application {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.parsers();
    this.routes();

    postgresDbConnector
      .sync({ force: false }) // `force: false` para no eliminar los datos existentes
      .then(() => {
        console.log("Base de datos sincronizada con los modelos");
      })
      .catch((err) => {
        console.error("Error sincronizando base de datos:", err);
      });

    this.app.listen(ConfigService.getInstance().http.port, () => {
      const networkInterfaces = os.networkInterfaces();
      const ipAddress =
        networkInterfaces["eth0"]?.find((iface: any) => iface.family === "IPv4")
          ?.address || "localhost";
      console.log(
        `Server running on http://${ipAddress}:${
          ConfigService.getInstance().http.port
        }`
      );
    });
  }

  private config(): void {
    // CORS y middlewares
    this.app.use(
      cors({
        origin: [
          "http://localhost",
          "http://localhost:8080",
          "http://localhost:81",
          "http://212.128.157.197",
          "http://212.128.157.197:81"
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
    // Authentication routes
    this.app.use("/users", userRouter);

    this.app.use(errorHandler); // capturamos todos los errores de la aplicación
  }
}

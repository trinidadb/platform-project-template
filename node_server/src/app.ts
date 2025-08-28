import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import path from "path";

// PostgreSQL
import { postgresDbConnector, postgresDbClient } from "./connectors";

// Passport
import passport from "passport";
import bcrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";

// Configuration
import { ConfigService } from "./config";

// Routes
import {
  authRouter,
} from "./routes";

//Middleware
import { isAuthenticated } from "./middleware";
import errorHandler from "./middleware/errorHandler";

//Swagger
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
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
    this.passport();
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

    const swaggerUrl = ConfigService.getInstance().dns.enabled ? ConfigService.getInstance().dns.server : ConfigService.getInstance().http.bind
    
    const swaggerOptions: swaggerJSDoc.Options = {
      definition: {
      openapi: '3.0.0',
      info: {
        title: 'Aquilon API',
        version: '1.0.0',
        description: 'Documentación de la API de Aquilon',
      },
      servers: [
        {
        url: `http://${swaggerUrl}:${ConfigService.getInstance().http.port}`,
        },
      ],
      },
      apis: ['./src/routes/*.ts'],
    };

    const swaggerSpec = swaggerJSDoc(swaggerOptions);
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec)
    );
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

    this.app.use(passport.initialize());
    this.app.use(passport.session());
  }

  private routes(): void {
    // Authentication routes
    this.app.use("/auth", authRouter);

    this.app.use(errorHandler); // capturamos todos los errores de la aplicación
  }

  private async passport(): Promise<void> {
    const postgresInstance = await postgresDbClient;
    const client = postgresInstance.getClient();

    passport.use(
      new LocalStrategy(
        {
          usernameField: "email",
          passwordField: "password",
        },
        async (email, password, done) => {
          try {
            const queryText = `SELECT 
              u.id, 
              u.name, 
              u.email, 
              u.password
            FROM "users" u
            WHERE u.email = $1
          `;
            const result = await client.query(queryText, [email]);

            if (result.rows.length === 0) {
              return done(null, false, { message: "User doesn't exist." });
            }

            const user = result.rows[0];

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
              return done(null, false, { message: "Incorrect password." });
            }

            return done(null, user);
          } catch (err) {
            console.error("Error during authentication:", err);
            return done(err);
          }
        }
      )
    );

    // Serialize: solo almacena el ID en la sesión
    passport.serializeUser(function (user: any, done: any) {
      done(null, user.id);
    });

    // Deserialize: obtiene toda la información del usuario a partir del ID
    passport.deserializeUser(async function (id, done) {
      try {
        const queryText = `
          SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.password, 
          FROM "users" u
          WHERE u.id = $1
        `;

        const result = await client.query(queryText, [id]);

        if (result.rows.length > 0) {
          const user = result.rows[0];
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (err) {
        console.error("Error during deserialization:", err);
        return done(err);
      }
    });
  }
}

import request from "supertest";
import express, { Application, NextFunction, Request, Response } from "express";
import { User, postgresDbConnector } from "../__mocks__/models";
import { AuthController } from "../../controllers/authController";
import { AuthService } from "../../services/authService";
import { errorHandler } from "../../middleware";
import passport from "passport";

jest.mock("../../models/user", () => User);
jest.mock("../../models/index", () => ({
  User,
}));
jest.mock("../../connectors", () => ({
  postgresDbConnector,
  postgresDbClient: { getClient: jest.fn() },
}));
jest.mock("../../services/authService");
jest.mock("passport");

const app: Application = express();
app.use(express.json());

const mockAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.logIn = jest
    .fn()
    .mockImplementation((user: any, done?: (err: any) => void) => {
      if (done) done(null);
    });
  (req as any).isAuthenticated = function (): boolean {
    return req.headers["x-auth-status"] === "true";
  };
  if (req.headers["x-user"]) {
    req.user = JSON.parse(req.headers["x-user"] as string);
  }
  next();
};

app.use(mockAuthMiddleware);
app.post("/auth/signin", AuthController.login);
app.get("/auth/user", AuthController.user);
app.use(errorHandler);

describe("AuthController - Tests de integracion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/signin", () => {
    test("debería responder con 200 y datos de usuario en un login exitoso", async () => {
      const mockDbUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        password: "123",
      };

      const simplifiedUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
      };

      (passport.authenticate as jest.Mock).mockImplementation(
        (strategy, callback) => {
          return (req: Request, res: Response, next: NextFunction) => {
            callback(null, mockDbUser, null);
          };
        }
      );

      (AuthService.login as jest.Mock).mockResolvedValue(simplifiedUser);

      const response = await request(app)
        .post("/auth/signin")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Login successful",
        data: simplifiedUser,
      });
    });

    test("debería responder con 401 si las credenciales son incorrectas", async () => {
      (passport.authenticate as jest.Mock).mockImplementation(
        (strategy, callback) => (req: any, res: any, next: any) =>
          callback(null, false, { message: "Wrong credentials" })
      );

      const response = await request(app)
        .post("/auth/signin")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "Wrong credentials",
        success: false,
      });
    });

    test("debería manejar errores de autenticación", async () => {
      (passport.authenticate as jest.Mock).mockImplementation(
        (strategy, callback) => (req: any, res: any, next: any) =>
          callback(new Error("Auth error"), null, null)
      );

      const response = await request(app)
        .post("/auth/signin")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Authentication error:",
        success: false,
      });
    });
  });

  describe("GET /auth/user", () => {
    test("debería responder con 200 y los datos del usuario si está autenticado", async () => {
      const mockUser = { id: 1, email: "test@example.com", name: "Test User" };

      const response = await request(app)
        .get("/auth/user")
        .set("x-auth-status", "true")
        .set("x-user", JSON.stringify(mockUser));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockUser });
    });

    test("debería responder con 401 si el usuario no está autenticado", async () => {
      const response = await request(app)
        .get("/auth/user")
        .set("x-auth-status", "false");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "Unauthorized",
        success: false,
      });
    });
  });
});

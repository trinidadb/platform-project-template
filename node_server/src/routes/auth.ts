// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers";
import { AuthService } from "../services";

export const authRouter = Router();

// 1. Get the dependency
const authService = AuthService.getInstance();

// 2. Inject the dependency into the controller
const authController = new AuthController(authService);

// 3. Define routes
// Note: Since we used arrow functions in the controller, we don't need .bind(authController) here!
authRouter.get("/login", authController.login);
authRouter.get("/callback", authController.callback);
authRouter.get("/logout", authController.logout);
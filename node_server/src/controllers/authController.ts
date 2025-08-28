import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { AuthService } from "../services";
import AppError from "../utils/appError";

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("local", async (err, user, info) => {
      if (err) {
        return next(new AppError("Authentication error:", 404));
      }

      if (!user) {
        return next(new AppError("Wrong credentials", 401));
      }

      try {
        const loggedInUser = await AuthService.login(user);
        req.logIn(user, (err) => {
          if (err) {
            return next(new AppError("Login error:", 404));
          }
          res.status(200).json({
            success: true,
            message: "Login successful",
            data: loggedInUser,
          });
        });
      } catch (err) {
        return next(err);
      }
    })(req, res, next);
  }

  static async user(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated && req.isAuthenticated()) {
      res.status(200).json({ success: true, data: req.user });
    } else {
      return next(new AppError("Unauthorized", 401));
    }
  }
}

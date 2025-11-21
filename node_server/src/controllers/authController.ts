import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services";
import AppError from "../utils/appError";
import { logger } from "../config";


export class AuthController {
  // Dependency Injection happens here
  constructor(private authService: AuthService) {}

  // defined as arrow function to preserve 'this' context
  public login = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { url, code_verifier } = this.authService.generateLoginUrl();

      req.session.code_verifier = code_verifier;
      req.session.save((err) => {
        if (err) logger.error("Session save error", err);
        res.redirect(url);
      });
    } catch (error) {
      next(error);
    }
  };

  public callback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const code_verifier = req.session.code_verifier;
      if (!code_verifier) throw new Error("Missing code_verifier");

      // usage: this.authService
      const tokenSet = await this.authService.exchangeCodeForToken(req, code_verifier);

      req.session.tokenSet = tokenSet;
      req.session.code_verifier = undefined;
      
      req.session.save((err) => {
         if (err) logger.error("Session save error", err);
         res.redirect("/"); 
      });
    } catch (error: any) {
      logger.error("Auth Callback Error Details:", { 
        message: error.message, 
        stack: error.stack,
        error_description: error.error_description // OIDC specific
      });
      res.status(401).send("Authentication Failed");
    }
  };

  public logout = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const tokenSet = req.session.tokenSet;
      // usage: this.authService
      const logoutUrl = this.authService.getLogoutUrl(tokenSet?.id_token);

      req.session.destroy((err) => {
        if (err) logger.error("Error destroying session", err);
        res.redirect(logoutUrl);
      });
    } catch (error) {
      next(error);
    }
  };
}
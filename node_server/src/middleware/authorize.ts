import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticate"; // Import the interface you defined
import { ConfigService, logger } from "../config";

// Helper interface for Keycloak Token Structure
interface KeycloakJwtPayload {
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
  [key: string]: any;
}

export const checkRole = (requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || typeof req.user === "string") {
      return res.status(401).json({ message: "User not authenticated properly" });
    }

    const userPayload = req.user as KeycloakJwtPayload;
    const clientId = ConfigService.getInstance().keycloak.client; // Get ID from config

    const clientRoles = userPayload.resource_access?.[clientId]?.roles || [];

    const hasRequiredRole = requiredRoles.some((role) => clientRoles.includes(role));

    if (!hasRequiredRole) {
      logger.warn(`Access denied. User missing roles: ${requiredRoles.join(", ")}`);
      return res.status(403).json({ 
        message: "Forbidden: You do not have the required permission" 
      });
    }

    next();
  };
};
import { Request, Response, NextFunction } from "express";
import { KeycloakAdminService, ProfileService } from "../services";
import { AppError } from "../utils";

export class KeycloakController {

    private static async _createLocalUserProfile(username: string, active: boolean = true) {
        const newUserInKeycloak = await KeycloakAdminService.findUserByUsername(username);
        
        if (!newUserInKeycloak) {
            throw new AppError('Failed to retrieve user from Keycloak after creation.', 500);
        }

        await ProfileService.createProfile({
            keycloakId: newUserInKeycloak.id,
        });
    }

    static async createUser(req: Request, res: Response, next: NextFunction) {

        const { username, email, name, lastname, password, active } = req.body;
        if (!username || !password || !email ||!name ||!lastname) {
            return next(new AppError("Missing required fields", 400));
        }

        try {
            const createdUser = await KeycloakAdminService.createUser({ username, email, name, lastname, password, active: active || true});
            
            await KeycloakController._createLocalUserProfile(username, active);
            
            res.status(201).json({
                success: true,
                message: `User '${username}' created successfully in keycloak and in the db.`,
            });
        } catch (err) {
            next(err);
        }
    }

}
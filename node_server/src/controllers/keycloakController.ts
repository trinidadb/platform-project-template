import { Request, Response, NextFunction } from "express";
import { KeycloakAdminService } from "../services";
import { AppError } from "../utils";

export class KeycloakController {

    static async createUser(req: Request, res: Response, next: NextFunction) {

        const { username, email, name, lastname, password } = req.body;
        if (!username || !password || !email) {
            return next(new AppError("Missing required fields", 400));
        }

        try {
            const createdUser = await KeycloakAdminService.createUser({ username, email, name, lastname, password });
            res.status(201).json({
                success: true,
                message: `User '${username}' created successfully.`,
            });
        } catch (err) {
            next(err);
        }
    }

}

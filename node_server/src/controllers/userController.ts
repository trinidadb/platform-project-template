import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import AppError from "../utils/appError";
import { logger } from "../config";

export class UserController {
  /**
   * Create a new user method
   * This method returns all users
   * @params res Response: The response object containing all users of the database
   */
  static async get_all(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.get_all();
      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Return a user
   * The method returns the user with the specified ID.
   * @params req Request: The request object containing the ID
   * @params res Response: The response object containing the user
   */
  static async get_user_by_id(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    if (!id) {
      return next(new AppError("Missing required fields.", 400));
    }
    try {
      const user = await UserService.get_user_by_id(id);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Create a new user method
   * This method creates a new user in the database using the name, lastname and email. Returns the created user
   * @params req Request: The request object containing the name, lastname and email
   * @params res Response: The response object containing the created user
   */
  static async createUser(req: Request, res: Response, next: NextFunction) {
    const { name, email, active, birth_date } = req.body;

    if (!name || !email || typeof active !== 'boolean' || !birth_date) {
      return next(new AppError("Missing required fields", 400));
    }

    try {
      const createdUser = await UserService.create(name, email, active, birth_date);
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: createdUser,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update user data method
   * This method updates the user data using the required fields id, name, lastname, email
   * @params req Request: The request object containing the user's id, name, lastname and email
   * @params res Response: The response object is a STRING containing the message "User updated successfully"
   */
  static async updateUser(req: Request, res: Response, next: NextFunction) {
    const body = req.body;

    const { id, name, email, active, birth_date } = body;

    if (!id || !name || !email || typeof active !== 'boolean' || !birth_date) {
      return next(new AppError("Missing required fields", 400));
    }

    try {
      const updatedUser = await UserService.update(
        id,
        name,
        email,
        active,
        birth_date
      );
      res.status(201).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete user method
   * This method deletes the user using the required field id
   * @params req Request: The request object containing the user's id
   * @params res Response: The response object is a json containing the message "User deleted successfully" and the id of the user deleted
   */
  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.body;

    if (!id) {
      return next(new AppError("Missing required fields", 400));
    }

    try {
      const deletedUserId = await UserService.delete(id);
      res.status(201).json({
        success: true,
        message: "User deleted successfully",
        data: deletedUserId,
      });
    } catch (err) {
      next(err);
    }
  }
}

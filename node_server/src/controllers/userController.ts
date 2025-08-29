import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import AppError from "../utils/appError";

export class UserController {
  /**
   * Create a new user method
   * This method creates a new user in the database using the name, lastname and email. Returns the created user
   * @params req Request: The request object containing the name, lastname and email
   * @params res Response: The response object containing the created user
   */
  static async createUser(req: Request, res: Response, next: NextFunction) {
    const { name, email, birth_date } = req.body;

    if (!name || !email || !birth_date) {
      return next(new AppError("Missing required fields", 400));
    }

    try {
      const createdUser = await UserService.create(
        name,
        email,
        birth_date
      );
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

    if (!id || !name || !email || !active || !birth_date) {
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
   * @params res Response: The response object is a String containing the message "User deleted successfully"
   */
  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.body;

    if (!id) {
      return next(new AppError("Missing required fields", 400));
    }

    try {
      const deletedUser = await UserService.delete(id);
      res.status(201).json({
        success: true,
        message: "User deleted successfully",
        data: deletedUser,
      });
    } catch (err) {
      next(err);
    }
  }
 }

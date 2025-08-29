import AppError from "../utils/appError";
import { UniqueConstraintError } from "sequelize";
import { User } from "../models";

export class UserService {
  /**
   * Create a new user
   *
   * This method creates a user in the database
   *
   * @params name string
   * @params email string
   * @params birth_date string in format 'YYYY-mm-dd'
   * 
   * @returns the user created
   */
  static async create(
    name: string,
    email: string,
    birth_date: string
  ) {

    try {
      const user = await User.create(
        { email: email, name:name, birth_date: new Date(birth_date) }
      );

      return user;
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        throw new AppError("User already exists.", 400); // Lanzamos error con código HTTP 400
      }
      const error = err as Error;
      throw new AppError("Unexpected database error.", 500);
    }
  }

  /**
   * Update user's information
   *
   * This method updates the user's information in the database, using the provided parameters (id, name, email, active and birth_date).
   *
   * @params id string
   * @params name string
   * @params email string
   * @params birth_date string in format 'YYYY-mm-dd'
   * @params active bool
   *
   * @returns user
   */
  static async update(
    id: string,
    name: string,
    email: string,
    active: boolean,
    birth_date: string
  ) {
    try {
      const [user] = await User.update(
        { name, email, active, birth_date },
        { where: { id } }
      );
      if (user === 0) {
        throw new AppError("User not found", 404);
      }
      return user;
    } catch (err) {
      const error = err as Error;
      if (err instanceof AppError && err.statusCode === 404) {
        throw new AppError("User not found", 404);
      }
      if (err instanceof UniqueConstraintError) {
        throw new AppError("User with that email already exists.", 400); // Lanzamos error con código HTTP 400
      }
      throw new AppError("Unexpected database error.", 500);
    }
  }

  static async delete(id: string) {
    try {
      const userToDelete = await User.findByPk(id);
      if (!userToDelete) {
        throw new AppError("User not found.", 404);
      }
      await userToDelete.destroy();
      return {
        id: userToDelete.getDataValue("id"),
      };
    } catch (err: any) {
      throw new AppError("Unexpected database error.", 500);
    }
  }
}

import AppError from "../utils/appError";
import { UniqueConstraintError } from "sequelize";
import { User } from "../models";
import { mapSequelizeError } from "../utils/sequelizeErrorMapper";

export class UserService {
  /**
   * Returns all users
   *
   * This method returns all users of the database
   *
   * @returns all users
   */
  static async get_all() {
    try {
      return await User.findAll();
    } catch (err: any) {
      throw mapSequelizeError(err);
    }
  }

  /**
   * Returns a user
   *
   * This method returns the user with the specified ID
   *
   * @params id string
   *
   * @returns the user with the specified ID
   */

  static async get_user_by_id(id: string) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError("User not found.", 404);
      }
      return user;
    } catch (err: any) {
      throw mapSequelizeError(err);
    }
  }

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
  static async create(name: string, email: string, birth_date: string) {
    try {
      const user = await User.create({
        email: email,
        name: name,
        birth_date: new Date(birth_date),
      });

      return user;
    } catch (err) {
      throw mapSequelizeError(err);
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
      throw mapSequelizeError(err);
    }
  }

  /**
   * Delete user
   *
   * This method deletes an existing user
   *
   * @params id string
   *
   * @returns id string of user deleted
   */
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
      throw mapSequelizeError(err);
    }
  }
}

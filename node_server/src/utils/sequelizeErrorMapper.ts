import AppError from "./appError";
import {
  ConnectionError,
  TimeoutError,
  DatabaseError,
  UniqueConstraintError,
} from "sequelize";

export function mapSequelizeError(error: any): AppError {
  if (error instanceof UniqueConstraintError) {
    return new AppError("User with the same data already exists.", 400);
  }
  if (error instanceof AppError && error.statusCode === 404) {
    return new AppError("User not found", 404);
  }
  if (error instanceof ConnectionError) {
    return new AppError("Could not connect to the database.", 503);
  }
  if (error instanceof TimeoutError) {
    return new AppError("Database operation timed out.", 504);
  }
  if (error instanceof DatabaseError) {
    return new AppError("Internal database error.", 500);
  }
  if (error instanceof AppError) {
    return error;
  }
  // Any other case
  return new AppError(`Unexpected database error. ${error}.`, 500);
}

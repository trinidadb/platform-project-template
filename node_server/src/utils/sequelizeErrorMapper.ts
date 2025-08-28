import AppError from "./appError";
import { ConnectionError, TimeoutError, DatabaseError } from "sequelize";

export function mapSequelizeError(error: any): AppError {
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
  // cualquier otro caso
  return new AppError("Unexpected database error.", 500);
}

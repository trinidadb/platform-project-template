import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError"; // Importa la clase creada
import { mapSequelizeError } from "../utils/sequelizeErrorMapper";
import { logger } from "../config";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const mappedError: AppError = mapSequelizeError(err);

  logger.error({
    message: mappedError.message,
  });

  res
    .status(mappedError.statusCode)
    .json({ success: false, message: mappedError.message });
};

export default errorHandler;

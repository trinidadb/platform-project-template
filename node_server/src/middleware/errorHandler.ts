import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError"; // Importa la clase creada

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(err instanceof AppError)) {
    err = new AppError("Internal Server Error", 500, false);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default errorHandler;

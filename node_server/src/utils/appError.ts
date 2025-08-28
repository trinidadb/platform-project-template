export default class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean; // Para diferenciar errores manejados de los inesperados

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor); //eliminar del stack trace (traza de error) para falicitar la depuración
  }
}

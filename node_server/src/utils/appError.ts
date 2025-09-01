export default class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean; // To differentiate between handled and unexpected errors
  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor); // Remove from stack trace to facilitate debugging
  }
}

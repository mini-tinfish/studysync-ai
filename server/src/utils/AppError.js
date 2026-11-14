// An error that maps directly onto the contract's error response:
// { error: { code, message, details? } }

export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const validationError = (message, details) =>
  new AppError(400, 'VALIDATION_ERROR', message, details);

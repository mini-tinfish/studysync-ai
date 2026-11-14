import { AppError } from '../utils/AppError.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found.` },
  });
}

// Express 5 forwards rejected promises from async handlers here automatically.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let appError = err;

  if (!(err instanceof AppError)) {
    if (err?.type === 'entity.parse.failed') {
      appError = new AppError(400, 'VALIDATION_ERROR', 'Request body is not valid JSON.');
    } else if (err?.type === 'entity.too.large') {
      appError = new AppError(400, 'VALIDATION_ERROR', 'Request body is too large.');
    } else {
      console.error('[unhandled error]', err);
      appError = new AppError(500, 'INTERNAL_ERROR', 'Something went wrong on the server.');
    }
  }

  const body = { error: { code: appError.code, message: appError.message } };
  if (appError.details !== undefined) body.error.details = appError.details;
  res.status(appError.status).json(body);
}

// Single-file upload handling (field name: `file`), kept in memory.
import path from 'node:path';
import multer from 'multer';
import { config } from '../config.js';
import { AppError } from '../utils/AppError.js';

export const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.md'];

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.limits.maxUploadBytes, files: 1 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      cb(
        new AppError(415, 'UNSUPPORTED_FILE_TYPE', 'Only PDF, TXT, and MD files are supported.', {
          allowed: ALLOWED_EXTENSIONS,
        }),
      );
      return;
    }
    cb(null, true);
  },
}).single('file');

// Wraps multer so its errors come back in the contract's error format.
export function uploadSingleFile(req, res, next) {
  multerUpload(req, res, (err) => {
    if (!err) {
      if (!req.file) {
        next(new AppError(400, 'NO_FILE', 'No file uploaded. Send it in the `file` form field.'));
        return;
      }
      // Multer decodes filenames as latin1; re-decode so names with accents survive.
      const name = req.file.originalname || 'upload';
      // eslint-disable-next-line no-control-regex
      if (/^[\u0000-ÿ]*$/.test(name)) {
        req.file.originalname = Buffer.from(name, 'latin1').toString('utf8');
      }
      next();
      return;
    }
    if (err instanceof AppError) {
      next(err);
      return;
    }
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(new AppError(413, 'FILE_TOO_LARGE', 'File is larger than the 10 MB limit.'));
        return;
      }
      next(
        new AppError(400, 'VALIDATION_ERROR', 'Upload exactly one file in the `file` form field.', {
          reason: err.code,
        }),
      );
      return;
    }
    next(err);
  });
}

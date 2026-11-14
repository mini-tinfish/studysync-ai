// Turns an uploaded file (PDF / TXT / MD) into the /api/upload response.
import path from 'node:path';
import { extractText } from 'unpdf';
import { config } from '../config.js';
import { AppError } from '../utils/AppError.js';

const noTextError = (message) => new AppError(422, 'NO_EXTRACTABLE_TEXT', message);

// Collapse the messy whitespace PDFs produce while keeping paragraph breaks.
export function normalizeText(raw) {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t\f\v ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractPdf(buffer) {
  try {
    const { totalPages, text } = await extractText(new Uint8Array(buffer), { mergePages: true });
    return { pageCount: totalPages, text };
  } catch (err) {
    console.warn('[pdf] failed to parse:', err?.message);
    throw noTextError('This PDF could not be read. It may be corrupted or password-protected.');
  }
}

export async function processUpload(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  const fileType = ext.slice(1); // "pdf" | "txt" | "md"

  let rawText;
  let pageCount = null;
  if (fileType === 'pdf') {
    ({ text: rawText, pageCount } = await extractPdf(file.buffer));
  } else {
    rawText = file.buffer.toString('utf8').replace(/^﻿/, '');
  }

  let text = normalizeText(rawText || '');
  if (!text) {
    throw noTextError(
      fileType === 'pdf'
        ? 'No text found in this PDF. It may be a scanned image. Try a text-based PDF.'
        : 'This file is empty.',
    );
  }

  const { maxTextChars } = config.limits;
  const truncated = text.length > maxTextChars;
  if (truncated) text = text.slice(0, maxTextChars);

  return {
    fileName: file.originalname,
    fileType,
    sizeBytes: file.size,
    pageCount,
    charCount: text.length,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    truncated,
    text,
  };
}

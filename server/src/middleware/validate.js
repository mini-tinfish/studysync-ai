// Small input validators for the JSON endpoints. Each throws a VALIDATION_ERROR on bad input.
import { config } from '../config.js';
import { validationError } from '../utils/AppError.js';

const { limits } = config;

export function requireText(body) {
  const text = body?.text;
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw validationError('`text` is required and must be a non-empty string.', { field: 'text' });
  }
  const trimmed = text.trim();
  if (trimmed.length < limits.minTextChars) {
    throw validationError(
      `\`text\` must be at least ${limits.minTextChars} characters. Upload more material.`,
      { field: 'text', min: limits.minTextChars, actual: trimmed.length },
    );
  }
  if (trimmed.length > limits.maxTextChars) {
    throw validationError(`\`text\` must be at most ${limits.maxTextChars} characters.`, {
      field: 'text',
      max: limits.maxTextChars,
      actual: trimmed.length,
    });
  }
  return trimmed;
}

export function optionalString(body, field, maxLength = 200) {
  const value = body?.[field];
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw validationError(`\`${field}\` must be a string.`, { field });
  }
  return value.trim().slice(0, maxLength) || undefined;
}

export function optionalCount(body, { min, max, default: fallback }) {
  const value = body?.count;
  if (value === undefined || value === null) return fallback;
  if (!Number.isInteger(value) || value < min || value > max) {
    throw validationError(`\`count\` must be an integer between ${min} and ${max}.`, {
      field: 'count',
      min,
      max,
    });
  }
  return value;
}

const DIFFICULTIES = ['easy', 'medium', 'hard'];

export function optionalDifficulty(body) {
  const value = body?.difficulty;
  if (value === undefined || value === null) return 'medium';
  if (!DIFFICULTIES.includes(value)) {
    throw validationError('`difficulty` must be "easy", "medium", or "hard".', {
      field: 'difficulty',
      allowed: DIFFICULTIES,
    });
  }
  return value;
}

export function requireQuestion(body) {
  const question = body?.question;
  if (typeof question !== 'string' || question.trim().length === 0) {
    throw validationError('`question` is required and must be a non-empty string.', {
      field: 'question',
    });
  }
  if (question.trim().length > limits.maxQuestionChars) {
    throw validationError(`\`question\` must be at most ${limits.maxQuestionChars} characters.`, {
      field: 'question',
      max: limits.maxQuestionChars,
    });
  }
  return question.trim();
}

export function optionalHistory(body) {
  const history = body?.history;
  if (history === undefined || history === null) return [];
  if (!Array.isArray(history)) {
    throw validationError('`history` must be an array.', { field: 'history' });
  }
  history.forEach((turn, i) => {
    const validRole = turn?.role === 'user' || turn?.role === 'assistant';
    if (!validRole || typeof turn.content !== 'string') {
      throw validationError(
        '`history` items must be { role: "user" | "assistant", content: string }.',
        { field: `history[${i}]` },
      );
    }
  });
  return history.slice(-limits.maxHistoryTurns).map(({ role, content }) => ({
    role,
    content: content.slice(0, 4_000),
  }));
}

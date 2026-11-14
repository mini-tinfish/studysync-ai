// All /api routes. See API_CONTRACT.md for request/response shapes.
import { Router } from 'express';
import { config, isAiConfigured } from '../config.js';
import { uploadSingleFile } from '../middleware/upload.js';
import {
  optionalCount,
  optionalDifficulty,
  optionalHistory,
  optionalString,
  requireQuestion,
  requireText,
} from '../middleware/validate.js';
import { processUpload } from '../services/documentService.js';
import {
  answerQuestion,
  createFlashcards,
  createQuiz,
  createStudyGuide,
} from '../services/studyService.js';

export const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: isAiConfigured(),
    mockMode: config.mockAi,
  });
});

apiRouter.post('/upload', uploadSingleFile, async (req, res) => {
  res.json(await processUpload(req.file));
});

apiRouter.post('/study-guide', async (req, res) => {
  const text = requireText(req.body);
  const title = optionalString(req.body, 'title');
  res.json(await createStudyGuide({ text, title }));
});

apiRouter.post('/flashcards', async (req, res) => {
  const text = requireText(req.body);
  const count = optionalCount(req.body, config.limits.flashcards);
  res.json(await createFlashcards({ text, count }));
});

apiRouter.post('/quiz', async (req, res) => {
  const text = requireText(req.body);
  const count = optionalCount(req.body, config.limits.quiz);
  const difficulty = optionalDifficulty(req.body);
  res.json(await createQuiz({ text, count, difficulty }));
});

apiRouter.post('/ask', async (req, res) => {
  const text = requireText(req.body);
  const question = requireQuestion(req.body);
  const history = optionalHistory(req.body);
  res.json(await answerQuestion({ text, question, history }));
});

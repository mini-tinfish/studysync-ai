// Feature logic: builds prompts, calls the AI (or mocks), then cleans and checks the output
// so responses always match API_CONTRACT.md even if the model drifts.
import { config } from '../config.js';
import { AppError } from '../utils/AppError.js';
import { generateJson } from './aiService.js';
import * as prompts from './prompts.js';
import * as schemas from './schemas.js';
import * as mocks from '../mocks/mockResponses.js';

const invalid = (what) =>
  new AppError(502, 'AI_INVALID_RESPONSE', `The AI returned an incomplete ${what}. Please try again.`);

const cleanStr = (v) => (typeof v === 'string' ? v.trim() : '');
const cleanStrArray = (v) => (Array.isArray(v) ? v.map(cleanStr).filter(Boolean) : []);

// ---------- Study guide ----------

function normalizeStudyGuide(data) {
  const sections = (Array.isArray(data?.sections) ? data.sections : [])
    .map((s) => ({
      heading: cleanStr(s?.heading),
      content: cleanStr(s?.content),
      keyPoints: cleanStrArray(s?.keyPoints),
    }))
    .filter((s) => s.heading && (s.content || s.keyPoints.length));

  if (!sections.length) throw invalid('study guide');

  return {
    title: cleanStr(data.title) || 'Study Guide',
    summary: cleanStr(data.summary),
    sections,
    keyTerms: (Array.isArray(data.keyTerms) ? data.keyTerms : [])
      .map((k) => ({ term: cleanStr(k?.term), definition: cleanStr(k?.definition) }))
      .filter((k) => k.term && k.definition),
    reviewQuestions: cleanStrArray(data.reviewQuestions),
  };
}

export async function createStudyGuide({ text, title }) {
  const data = config.mockAi
    ? mocks.mockStudyGuide
    : await generateJson({ ...prompts.studyGuidePrompt({ text, title }), schema: schemas.studyGuideSchema });
  return normalizeStudyGuide(data);
}

// ---------- Flashcards ----------

function normalizeFlashcards(data, count) {
  const flashcards = (Array.isArray(data?.flashcards) ? data.flashcards : [])
    .map((c) => ({ front: cleanStr(c?.front), back: cleanStr(c?.back) }))
    .filter((c) => c.front && c.back)
    .slice(0, count)
    .map((c, i) => ({ id: `fc-${i + 1}`, ...c }));

  if (!flashcards.length) throw invalid('set of flashcards');
  return { flashcards };
}

export async function createFlashcards({ text, count }) {
  const data = config.mockAi
    ? mocks.mockFlashcards(count)
    : await generateJson({ ...prompts.flashcardsPrompt({ text, count }), schema: schemas.flashcardsSchema });
  return normalizeFlashcards(data, count);
}

// ---------- Quiz ----------

function normalizeQuiz(data, count) {
  const questions = (Array.isArray(data?.questions) ? data.questions : [])
    .map((q) => ({
      question: cleanStr(q?.question),
      options: Array.isArray(q?.options) ? q.options.map(cleanStr) : [],
      correctIndex: q?.correctIndex,
      explanation: cleanStr(q?.explanation),
    }))
    // Drop any question that would break the quiz UI.
    .filter(
      (q) =>
        q.question &&
        q.options.length === 4 &&
        q.options.every(Boolean) &&
        Number.isInteger(q.correctIndex) &&
        q.correctIndex >= 0 &&
        q.correctIndex < 4,
    )
    .slice(0, count)
    .map((q, i) => ({ id: `q-${i + 1}`, ...q }));

  if (!questions.length) throw invalid('quiz');
  return { questions };
}

export async function createQuiz({ text, count, difficulty }) {
  const data = config.mockAi
    ? mocks.mockQuiz(count)
    : await generateJson({ ...prompts.quizPrompt({ text, count, difficulty }), schema: schemas.quizSchema });
  return normalizeQuiz(data, count);
}

// ---------- Ask ----------

function normalizeAnswer(data) {
  const answer = cleanStr(data?.answer);
  if (!answer) throw invalid('answer');
  return {
    answer,
    answeredFromMaterial: data.answeredFromMaterial !== false,
    citations: cleanStrArray(data.citations).slice(0, 3),
  };
}

export async function answerQuestion({ text, question, history }) {
  const data = config.mockAi
    ? mocks.mockAnswer(question)
    : await generateJson({ ...prompts.askPrompt({ text, question }), schema: schemas.askSchema, history });
  return normalizeAnswer(data);
}

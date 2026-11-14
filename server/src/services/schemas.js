// JSON Schemas passed to Gemini (responseJsonSchema) so output matches API_CONTRACT.md.
// IDs are added server-side, so they are not part of these schemas.

const str = { type: 'string' };
const strArray = { type: 'array', items: str };

export const studyGuideSchema = {
  type: 'object',
  properties: {
    title: str,
    summary: str,
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: { heading: str, content: str, keyPoints: strArray },
        required: ['heading', 'content', 'keyPoints'],
      },
    },
    keyTerms: {
      type: 'array',
      items: {
        type: 'object',
        properties: { term: str, definition: str },
        required: ['term', 'definition'],
      },
    },
    reviewQuestions: strArray,
  },
  required: ['title', 'summary', 'sections', 'keyTerms', 'reviewQuestions'],
};

export const flashcardsSchema = {
  type: 'object',
  properties: {
    flashcards: {
      type: 'array',
      items: {
        type: 'object',
        properties: { front: str, back: str },
        required: ['front', 'back'],
      },
    },
  },
  required: ['flashcards'],
};

export const quizSchema = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: str,
          options: { type: 'array', items: str, minItems: 4, maxItems: 4 },
          correctIndex: { type: 'integer', minimum: 0, maximum: 3 },
          explanation: str,
        },
        required: ['question', 'options', 'correctIndex', 'explanation'],
      },
    },
  },
  required: ['questions'],
};

export const askSchema = {
  type: 'object',
  properties: {
    answer: str,
    answeredFromMaterial: { type: 'boolean' },
    citations: strArray,
  },
  required: ['answer', 'answeredFromMaterial', 'citations'],
};

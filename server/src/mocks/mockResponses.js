// Fixed sample data for MOCK_AI mode. These shapes must match API_CONTRACT.md exactly.

export const mockStudyGuide = {
  title: 'Photosynthesis (Sample Study Guide)',
  summary:
    'This is MOCK data. Photosynthesis is the process plants use to convert light energy into chemical energy stored in glucose. It happens in two stages: light-dependent reactions and the Calvin cycle.',
  sections: [
    {
      heading: 'Light-Dependent Reactions',
      content:
        'These reactions capture light energy using chlorophyll and convert it into ATP and NADPH, releasing oxygen as a by-product.',
      keyPoints: [
        'Occur in the thylakoid membranes',
        'Split water molecules, releasing O2',
        'Produce ATP and NADPH',
      ],
    },
    {
      heading: 'The Calvin Cycle',
      content:
        'The Calvin cycle uses ATP and NADPH to fix carbon dioxide into sugars. It does not require light directly.',
      keyPoints: [
        'Occurs in the stroma',
        'Enzyme RuBisCO fixes CO2',
        'Produces G3P, which builds glucose',
      ],
    },
  ],
  keyTerms: [
    { term: 'Chlorophyll', definition: 'Green pigment that absorbs light energy.' },
    { term: 'Thylakoid', definition: 'Membrane-bound compartment where light reactions occur.' },
    { term: 'RuBisCO', definition: 'Enzyme that fixes carbon dioxide in the Calvin cycle.' },
  ],
  reviewQuestions: [
    'What are the products of the light-dependent reactions?',
    'Why is the Calvin cycle sometimes called the light-independent reactions?',
    'How are the two stages of photosynthesis connected?',
  ],
};

const MOCK_FLASHCARDS = [
  { front: 'What organelle performs photosynthesis?', back: 'The chloroplast.' },
  { front: 'Where do the light-dependent reactions occur?', back: 'In the thylakoid membranes.' },
  { front: 'What gas is released during photosynthesis?', back: 'Oxygen (O2), from splitting water.' },
  { front: 'What does RuBisCO do?', back: 'It fixes CO2 at the start of the Calvin cycle.' },
  { front: 'What energy carriers do light reactions produce?', back: 'ATP and NADPH.' },
  { front: 'Where does the Calvin cycle take place?', back: 'In the stroma of the chloroplast.' },
  { front: 'What pigment absorbs light for photosynthesis?', back: 'Chlorophyll.' },
  { front: 'What is the overall sugar product?', back: 'Glucose (built from G3P).' },
  { front: 'What are the inputs of photosynthesis?', back: 'Carbon dioxide, water, and light energy.' },
  { front: 'Is the Calvin cycle directly light-dependent?', back: 'No, but it relies on ATP/NADPH from light reactions.' },
];

const MOCK_QUESTIONS = [
  {
    question: 'Where do the light-dependent reactions occur?',
    options: ['Stroma', 'Thylakoid membrane', 'Cytoplasm', 'Mitochondria'],
    correctIndex: 1,
    explanation: 'Light-dependent reactions take place in the thylakoid membranes of the chloroplast.',
  },
  {
    question: 'Which enzyme fixes carbon dioxide in the Calvin cycle?',
    options: ['ATP synthase', 'Amylase', 'RuBisCO', 'Helicase'],
    correctIndex: 2,
    explanation: 'RuBisCO attaches CO2 to RuBP, beginning the Calvin cycle.',
  },
  {
    question: 'What is released when water is split during the light reactions?',
    options: ['Oxygen', 'Carbon dioxide', 'Glucose', 'Nitrogen'],
    correctIndex: 0,
    explanation: 'Splitting water releases oxygen as a by-product.',
  },
  {
    question: 'Which molecules carry energy from the light reactions to the Calvin cycle?',
    options: ['DNA and RNA', 'Glucose and starch', 'CO2 and O2', 'ATP and NADPH'],
    correctIndex: 3,
    explanation: 'ATP and NADPH made in the light reactions power the Calvin cycle.',
  },
  {
    question: 'Where does the Calvin cycle take place?',
    options: ['Thylakoid lumen', 'Stroma', 'Nucleus', 'Cell wall'],
    correctIndex: 1,
    explanation: 'The Calvin cycle occurs in the stroma, the fluid around the thylakoids.',
  },
];

// Repeat the sample list to reach `count` so the UI can be tested with any count.
const fill = (items, count) => Array.from({ length: count }, (_, i) => items[i % items.length]);

export const mockFlashcards = (count) => ({ flashcards: fill(MOCK_FLASHCARDS, count) });

export const mockQuiz = (count) => ({ questions: fill(MOCK_QUESTIONS, count) });

export const mockAnswer = (question) => ({
  answer: `This is a MOCK answer to: "${question}". With a real API key, the answer would be based on your uploaded material.`,
  answeredFromMaterial: true,
  citations: ['Light energy is absorbed by chlorophyll in the thylakoid membranes.'],
});

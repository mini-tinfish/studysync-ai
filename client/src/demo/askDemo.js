/**
 * DEMO MODE DATA — a hand-written sample conversation, NOT produced by AI and NOT based on
 * any uploaded document. Used only to preview Ask My Notes without the backend; Demo Mode
 * never calls POST /api/ask. Assistant messages use origin 'demo' so they are never labelled
 * AI-generated. Answer fields match API_CONTRACT.md ({ answer, answeredFromMaterial, citations }).
 */
export const DEMO_DOCUMENT_NAME = 'Sample notes: Introduction to Cell Biology'

export const DEMO_CONVERSATION = [
  { id: 'demo-u1', role: 'user', content: 'What do mitochondria do?' },
  {
    id: 'demo-a1',
    role: 'assistant',
    origin: 'demo',
    answeredFromMaterial: true,
    content:
      'Mitochondria release energy from food. They carry out cellular respiration and produce most of the ATP a cell uses to power its work.',
    citations: ['Mitochondria release energy from food and produce most of the cell’s ATP.'],
  },
  { id: 'demo-u2', role: 'user', content: 'So why would a muscle cell need more of them than a skin cell?' },
  {
    id: 'demo-a2',
    role: 'assistant',
    origin: 'demo',
    answeredFromMaterial: true,
    content:
      'Muscle cells do a lot of mechanical work, so they need far more ATP. More mitochondria means the cell can produce energy faster.\n\nYour notes connect this to energy demand: cells that work harder rely more heavily on cellular respiration.',
    citations: ['Cells with high energy demands, such as muscle cells, contain many mitochondria.'],
  },
  { id: 'demo-u3', role: 'user', content: 'Who discovered mitochondria?' },
  {
    id: 'demo-a3',
    role: 'assistant',
    origin: 'demo',
    answeredFromMaterial: false,
    content:
      'Your notes don’t say who discovered mitochondria, so I can’t answer that from this material. Try your textbook or ask your instructor.',
    citations: [],
  },
]

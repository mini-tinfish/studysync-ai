/**
 * DEMO MODE DATA — hand-written sample flashcards, NOT produced by AI and NOT based
 * on any uploaded document. Used only to preview the Flashcards UI without the
 * backend. Never saved to the document results cache. Shape matches
 * API_CONTRACT.md POST /api/flashcards → { flashcards: [{ id, front, back }] }.
 */
export const DEMO_FLASHCARDS = {
  flashcards: [
    { id: 'demo-1', front: 'What is the basic unit of life?', back: 'The cell.' },
    {
      id: 'demo-2',
      front: 'What is the main difference between prokaryotic and eukaryotic cells?',
      back: 'Eukaryotic cells have a nucleus and membrane-bound organelles; prokaryotic cells do not.',
    },
    { id: 'demo-3', front: 'Which organelle produces most of a cell’s ATP?', back: 'The mitochondrion.' },
    { id: 'demo-4', front: 'Where are proteins made in the cell?', back: 'On ribosomes.' },
    {
      id: 'demo-5',
      front: 'What does the Golgi apparatus do?',
      back: 'It modifies, sorts, and packages proteins for transport.',
    },
    {
      id: 'demo-6',
      front: 'What does “selectively permeable” mean?',
      back: 'A membrane lets some substances cross while blocking others.',
    },
    { id: 'demo-7', front: 'What is osmosis?', back: 'The diffusion of water across a selectively permeable membrane.' },
    {
      id: 'demo-8',
      front: 'How does active transport differ from diffusion?',
      back: 'Active transport uses energy (ATP) to move substances against their concentration gradient; diffusion needs no energy.',
    },
  ],
}

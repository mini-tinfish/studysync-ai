/**
 * DEMO MODE DATA — hand-written sample quiz, NOT produced by AI and NOT based on any
 * uploaded document. Used only to preview the Practice Quiz UI without the backend.
 * Never saved to the document results cache. Shape matches
 * API_CONTRACT.md POST /api/quiz → { questions: [{ id, question, options[4], correctIndex, explanation }] }.
 */
export const DEMO_QUIZ = {
  questions: [
    {
      id: 'demo-q1',
      question: 'Which structure is found in eukaryotic cells but not in prokaryotic cells?',
      options: ['Ribosomes', 'A cell membrane', 'A membrane-bound nucleus', 'Cytoplasm'],
      correctIndex: 2,
      explanation:
        'Both cell types have ribosomes, a membrane, and cytoplasm, but only eukaryotic cells keep their DNA inside a membrane-bound nucleus.',
    },
    {
      id: 'demo-q2',
      question: 'Which organelle releases most of the energy a cell gets from food?',
      options: ['Golgi apparatus', 'Mitochondrion', 'Ribosome', 'Lysosome'],
      correctIndex: 1,
      explanation: 'Mitochondria carry out cellular respiration, producing most of the cell’s ATP.',
    },
    {
      id: 'demo-q3',
      question: 'What does the Golgi apparatus do?',
      options: [
        'Stores genetic information',
        'Builds proteins from amino acids',
        'Modifies, sorts, and packages proteins',
        'Breaks down glucose for energy',
      ],
      correctIndex: 2,
      explanation:
        'Ribosomes build proteins; the Golgi apparatus then modifies, sorts, and packages them for transport.',
    },
    {
      id: 'demo-q4',
      question: 'Water moving across a selectively permeable membrane is called…',
      options: ['Osmosis', 'Active transport', 'Endocytosis', 'Photosynthesis'],
      correctIndex: 0,
      explanation: 'Osmosis is the diffusion of water across a selectively permeable membrane.',
    },
    {
      id: 'demo-q5',
      question: 'Which kind of transport requires energy from ATP?',
      options: ['Diffusion', 'Osmosis', 'Facilitated diffusion', 'Active transport'],
      correctIndex: 3,
      explanation:
        'Active transport moves substances against their concentration gradient, which requires energy (ATP).',
    },
  ],
}

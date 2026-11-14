/**
 * DEMO MODE DATA — hand-written sample content, NOT produced by AI and NOT based
 * on any uploaded document. Used only to preview the Study Guide UI without the
 * backend. It is kept separate from real results and is never saved to the
 * document results cache. Shape matches API_CONTRACT.md POST /api/study-guide.
 */
export const DEMO_STUDY_GUIDE = {
  title: 'Introduction to Cell Biology',
  summary:
    'Cells are the basic units of life. This sample guide covers the difference between prokaryotic and eukaryotic cells, the jobs of major organelles, and how materials move across the cell membrane.',
  sections: [
    {
      heading: 'Prokaryotic vs. Eukaryotic Cells',
      content:
        'Prokaryotic cells, such as bacteria, lack a nucleus and membrane-bound organelles. Eukaryotic cells, found in plants, animals, and fungi, keep their DNA inside a nucleus and divide work among specialized organelles.',
      keyPoints: [
        'Prokaryotes have no nucleus; their DNA floats in the cytoplasm',
        'Eukaryotes have a nucleus and membrane-bound organelles',
        'Both cell types have a cell membrane, cytoplasm, and ribosomes',
      ],
    },
    {
      heading: 'Major Organelles and Their Jobs',
      content:
        'Organelles act like the departments of a cell. The nucleus stores genetic instructions, mitochondria release energy from food, and ribosomes build proteins that the endoplasmic reticulum and Golgi apparatus process and ship.',
      keyPoints: [
        'Mitochondria produce most of the cell’s ATP',
        'Ribosomes are the sites of protein synthesis',
        'The Golgi apparatus modifies, sorts, and packages proteins',
      ],
    },
    {
      heading: 'Transport Across the Cell Membrane',
      content:
        'The cell membrane is selectively permeable. Small molecules can diffuse passively from high to low concentration, while active transport uses energy to move substances against their concentration gradient.',
      keyPoints: [
        'Diffusion and osmosis require no energy',
        'Active transport uses ATP to move substances against a gradient',
        'Water moves across membranes by osmosis',
      ],
    },
  ],
  keyTerms: [
    { term: 'Organelle', definition: 'A specialized structure within a cell that performs a specific function.' },
    { term: 'Mitochondrion', definition: 'The organelle that converts energy from food into ATP.' },
    { term: 'Selectively permeable', definition: 'Allowing some substances to cross a membrane while blocking others.' },
    { term: 'Osmosis', definition: 'The diffusion of water across a selectively permeable membrane.' },
  ],
  reviewQuestions: [
    'What is the main structural difference between prokaryotic and eukaryotic cells?',
    'Why might a muscle cell contain more mitochondria than a skin cell?',
    'How does active transport differ from diffusion?',
  ],
}

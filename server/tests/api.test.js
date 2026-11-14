// Endpoint tests. Run with `npm test`. Uses mock mode only and never calls the real Gemini API.
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';

process.env.MOCK_AI = 'true';
const { createApp } = await import('../src/app.js');
const { config } = await import('../src/config.js');

const app = createApp();
const SAMPLE_TEXT =
  'Photosynthesis is the process by which green plants use sunlight to make glucose from carbon dioxide and water.';

// Builds a minimal valid one-page PDF. Pass null for a page with no text.
function makePdf(text) {
  const stream = text ? `BT /F1 12 Tf 72 720 Td (${text}) Tj ET` : '';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((body, i) => {
    const offset = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}

const expectError = (res, status, code) => {
  assert.equal(res.status, status, JSON.stringify(res.body));
  assert.equal(res.body.error.code, code);
  assert.equal(typeof res.body.error.message, 'string');
};

describe('GET /api/health', () => {
  it('reports ok and mock mode', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.mockMode, true);
    assert.equal(res.body.aiConfigured, true);
    assert.ok(!Number.isNaN(Date.parse(res.body.timestamp)));
  });
});

describe('unknown routes', () => {
  it('returns NOT_FOUND', async () => {
    expectError(await request(app).get('/api/nope'), 404, 'NOT_FOUND');
  });
});

describe('POST /api/upload', () => {
  it('extracts text from a PDF', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('file', makePdf('Hello StudySync lecture notes'), 'lecture.pdf');
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.fileName, 'lecture.pdf');
    assert.equal(res.body.fileType, 'pdf');
    assert.equal(res.body.pageCount, 1);
    assert.match(res.body.text, /Hello StudySync lecture notes/);
    assert.equal(res.body.wordCount, 4);
    assert.equal(res.body.charCount, res.body.text.length);
    assert.equal(res.body.truncated, false);
    assert.equal(typeof res.body.sizeBytes, 'number');
  });

  it('accepts .txt and .md notes', async () => {
    for (const name of ['notes.txt', 'notes.md']) {
      const res = await request(app).post('/api/upload').attach('file', Buffer.from(SAMPLE_TEXT), name);
      assert.equal(res.status, 200);
      assert.equal(res.body.pageCount, null);
      assert.equal(res.body.text, SAMPLE_TEXT);
    }
  });

  it('truncates text over the limit', async () => {
    const big = 'word '.repeat(30_000); // 150k chars
    const res = await request(app).post('/api/upload').attach('file', Buffer.from(big), 'big.txt');
    assert.equal(res.status, 200);
    assert.equal(res.body.truncated, true);
    assert.equal(res.body.charCount, config.limits.maxTextChars);
  });

  it('rejects a missing file', async () => {
    expectError(await request(app).post('/api/upload'), 400, 'NO_FILE');
  });

  it('rejects unsupported types', async () => {
    const res = await request(app).post('/api/upload').attach('file', Buffer.from('x'), 'slides.pptx');
    expectError(res, 415, 'UNSUPPORTED_FILE_TYPE');
  });

  it('rejects files over 10 MB', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.alloc(config.limits.maxUploadBytes + 1, 'a'), 'huge.txt');
    expectError(res, 413, 'FILE_TOO_LARGE');
  });

  it('rejects a PDF with no text', async () => {
    const res = await request(app).post('/api/upload').attach('file', makePdf(null), 'scan.pdf');
    expectError(res, 422, 'NO_EXTRACTABLE_TEXT');
  });

  it('rejects a corrupted PDF', async () => {
    const res = await request(app).post('/api/upload').attach('file', Buffer.from('not a pdf'), 'bad.pdf');
    expectError(res, 422, 'NO_EXTRACTABLE_TEXT');
  });
});

describe('text validation (shared by AI endpoints)', () => {
  for (const path of ['/api/study-guide', '/api/flashcards', '/api/quiz', '/api/ask']) {
    it(`${path} rejects missing and short text`, async () => {
      expectError(await request(app).post(path).send({ question: 'q' }), 400, 'VALIDATION_ERROR');
      expectError(await request(app).post(path).send({ text: 'too short', question: 'q' }), 400, 'VALIDATION_ERROR');
    });
  }

  it('rejects malformed JSON', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .set('Content-Type', 'application/json')
      .send('{"text": ');
    expectError(res, 400, 'VALIDATION_ERROR');
  });
});

describe('POST /api/study-guide', () => {
  it('returns a structured guide', async () => {
    const res = await request(app).post('/api/study-guide').send({ text: SAMPLE_TEXT, title: 'Lecture 5' });
    assert.equal(res.status, 200);
    assert.equal(typeof res.body.title, 'string');
    assert.equal(typeof res.body.summary, 'string');
    assert.ok(res.body.sections.length > 0);
    for (const s of res.body.sections) {
      assert.equal(typeof s.heading, 'string');
      assert.equal(typeof s.content, 'string');
      assert.ok(Array.isArray(s.keyPoints));
    }
    assert.ok(Array.isArray(res.body.keyTerms));
    assert.ok(Array.isArray(res.body.reviewQuestions));
  });
});

describe('POST /api/flashcards', () => {
  it('defaults to 10 cards with unique ids', async () => {
    const res = await request(app).post('/api/flashcards').send({ text: SAMPLE_TEXT });
    assert.equal(res.status, 200);
    assert.equal(res.body.flashcards.length, 10);
    const ids = res.body.flashcards.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const c of res.body.flashcards) {
      assert.ok(c.front && c.back);
    }
  });

  it('respects count and validates its range', async () => {
    const res = await request(app).post('/api/flashcards').send({ text: SAMPLE_TEXT, count: 3 });
    assert.equal(res.body.flashcards.length, 3);
    for (const count of [0, 31, 2.5, '5']) {
      const bad = await request(app).post('/api/flashcards').send({ text: SAMPLE_TEXT, count });
      expectError(bad, 400, 'VALIDATION_ERROR');
    }
  });
});

describe('POST /api/quiz', () => {
  it('returns 4-option questions with a valid correctIndex', async () => {
    const res = await request(app).post('/api/quiz').send({ text: SAMPLE_TEXT, count: 7, difficulty: 'hard' });
    assert.equal(res.status, 200);
    assert.equal(res.body.questions.length, 7);
    for (const q of res.body.questions) {
      assert.match(q.id, /^q-\d+$/);
      assert.equal(q.options.length, 4);
      assert.ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4);
      assert.equal(typeof q.explanation, 'string');
    }
  });

  it('validates count and difficulty', async () => {
    expectError(await request(app).post('/api/quiz').send({ text: SAMPLE_TEXT, count: 21 }), 400, 'VALIDATION_ERROR');
    expectError(
      await request(app).post('/api/quiz').send({ text: SAMPLE_TEXT, difficulty: 'extreme' }),
      400,
      'VALIDATION_ERROR',
    );
  });
});

describe('POST /api/ask', () => {
  it('answers a question', async () => {
    const res = await request(app)
      .post('/api/ask')
      .send({
        text: SAMPLE_TEXT,
        question: 'Why do plants need sunlight?',
        history: [{ role: 'user', content: 'Hi' }, { role: 'assistant', content: 'Hello!' }],
      });
    assert.equal(res.status, 200);
    assert.equal(typeof res.body.answer, 'string');
    assert.equal(typeof res.body.answeredFromMaterial, 'boolean');
    assert.ok(Array.isArray(res.body.citations));
  });

  it('requires a question and validates history', async () => {
    expectError(await request(app).post('/api/ask').send({ text: SAMPLE_TEXT }), 400, 'VALIDATION_ERROR');
    expectError(
      await request(app).post('/api/ask').send({ text: SAMPLE_TEXT, question: 'q', history: [{ role: 'system', content: 'x' }] }),
      400,
      'VALIDATION_ERROR',
    );
  });
});

describe('AI not configured', () => {
  let saved;
  before(() => {
    saved = { mockAi: config.mockAi, apiKey: config.gemini.apiKey };
    config.mockAi = false;
    config.gemini.apiKey = '';
  });
  after(() => {
    config.mockAi = saved.mockAi;
    config.gemini.apiKey = saved.apiKey;
  });

  it('returns AI_NOT_CONFIGURED (503) and health reports it', async () => {
    expectError(await request(app).post('/api/flashcards').send({ text: SAMPLE_TEXT }), 503, 'AI_NOT_CONFIGURED');
    const health = await request(app).get('/api/health');
    assert.equal(health.body.aiConfigured, false);
  });
});

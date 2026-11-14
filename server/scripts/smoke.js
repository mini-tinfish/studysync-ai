// End-to-end smoke test against a RUNNING server (mock or real Gemini).
//
// Usage (server must already be running, e.g. `npm run dev` in another terminal):
//   npm run smoke                         # uses built-in sample notes
//   npm run smoke -- "C:\path\lecture.pdf"  # uses your own PDF / TXT / MD
//
// Env: API_URL (default http://localhost:3001/api)
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const API = process.env.API_URL || 'http://localhost:3001/api';
const filePath = process.argv[2];

const SAMPLE_NOTES = `Photosynthesis Lecture Notes
Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy stored in glucose.
It takes place in chloroplasts and has two stages.
Stage 1: Light-dependent reactions occur in the thylakoid membranes. Chlorophyll absorbs light, water is split, oxygen is released, and ATP and NADPH are produced.
Stage 2: The Calvin cycle occurs in the stroma. The enzyme RuBisCO fixes carbon dioxide. ATP and NADPH from stage 1 power the production of G3P, which is used to build glucose.
Factors affecting the rate of photosynthesis include light intensity, carbon dioxide concentration, and temperature.`;

let failures = 0;
const ok = (msg) => console.log(`  \x1b[32mPASS\x1b[0m ${msg}`);
const fail = (msg) => {
  failures += 1;
  console.log(`  \x1b[31mFAIL\x1b[0m ${msg}`);
};
const check = (cond, msg) => (cond ? ok(msg) : fail(msg));
const isStr = (v) => typeof v === 'string' && v.length > 0;

async function call(label, url, init) {
  console.log(`\n▶ ${label}`);
  const started = Date.now();
  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    fail(`could not reach ${url}. Is the server running? (${err.cause?.code || err.message})`);
    return null;
  }
  const body = await res.json().catch(() => null);
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  if (!res.ok) {
    fail(`HTTP ${res.status} in ${secs}s: ${JSON.stringify(body?.error ?? body)}`);
    return null;
  }
  ok(`HTTP ${res.status} in ${secs}s`);
  return body;
}

const postJson = (endpoint, data) =>
  call(`POST /api/${endpoint}`, `${API}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

// 1. Health
const health = await call('GET /api/health', `${API}/health`);
if (!health) {
  console.log('\nServer not reachable. Start it first: npm run dev   (or npm run dev:mock)');
  process.exit(1);
}
check(health.status === 'ok', 'status is "ok"');
console.log(`  mode: ${health.mockMode ? 'MOCK (sample data)' : 'REAL Gemini'} | aiConfigured: ${health.aiConfigured}`);
if (!health.aiConfigured) fail('AI not configured. Set GEMINI_API_KEY in server/.env or use npm run dev:mock');

// 2. Upload
const fileName = filePath ? path.basename(filePath) : 'sample-notes.txt';
const fileData = filePath ? await readFile(filePath) : Buffer.from(SAMPLE_NOTES);
const form = new FormData();
form.append('file', new Blob([fileData]), fileName);
const doc = await call(`POST /api/upload  (${fileName})`, `${API}/upload`, { method: 'POST', body: form });
if (!doc) process.exit(1);
check(isStr(doc.text), `extracted ${doc.charCount} chars / ${doc.wordCount} words` +
  (doc.pageCount ? ` from ${doc.pageCount} pages` : '') + (doc.truncated ? ' (TRUNCATED)' : ''));
console.log(`  preview: "${doc.text.slice(0, 120).replace(/\s+/g, ' ')}..."`);
const { text } = doc;

// 3. Study guide
const guide = await postJson('study-guide', { text, title: fileName });
if (guide) {
  check(isStr(guide.title) && isStr(guide.summary), `title: "${guide.title}"`);
  check(guide.sections?.length > 0 && guide.sections.every((s) => isStr(s.heading) && Array.isArray(s.keyPoints)),
    `${guide.sections?.length} sections, ${guide.keyTerms?.length} key terms, ${guide.reviewQuestions?.length} review questions`);
}

// 4. Flashcards
const cards = await postJson('flashcards', { text, count: 5 });
if (cards) {
  const list = cards.flashcards ?? [];
  check(list.length > 0 && list.length <= 5, `${list.length} flashcards (asked for 5)`);
  check(list.every((c) => isStr(c.id) && isStr(c.front) && isStr(c.back)), 'every card has id, front, back');
  if (list[0]) console.log(`  e.g. Q: ${list[0].front}\n       A: ${list[0].back}`);
}

// 5. Quiz
const quiz = await postJson('quiz', { text, count: 3, difficulty: 'medium' });
if (quiz) {
  const qs = quiz.questions ?? [];
  check(qs.length > 0 && qs.length <= 3, `${qs.length} questions (asked for 3)`);
  check(qs.every((q) => q.options?.length === 4 && Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4 && isStr(q.explanation)),
    'every question has 4 options, valid correctIndex, explanation');
  if (qs[0]) console.log(`  e.g. ${qs[0].question}\n       answer: ${qs[0].options[qs[0].correctIndex]}`);
}

// 6. Ask: a question about the material, then one about something unrelated
const answer = await postJson('ask', { text, question: 'What is the main topic of this material?' });
if (answer) {
  check(isStr(answer.answer) && typeof answer.answeredFromMaterial === 'boolean' && Array.isArray(answer.citations),
    `answeredFromMaterial: ${answer.answeredFromMaterial}, ${answer.citations.length} citations`);
  console.log(`  answer: ${answer.answer.slice(0, 160)}`);
}
const offTopic = await postJson('ask', { text, question: 'Who won the 1998 FIFA World Cup?' });
if (offTopic && !health.mockMode) {
  check(offTopic.answeredFromMaterial === false, 'off-topic question is NOT answered from material (grounding works)');
  console.log(`  answer: ${offTopic.answer.slice(0, 160)}`);
}

// 7. Error handling
const bad = await fetch(`${API}/quiz`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'too short' }),
}).then(async (r) => ({ status: r.status, body: await r.json() }));
console.log('\n▶ Error handling');
check(bad.status === 400 && bad.body?.error?.code === 'VALIDATION_ERROR', 'short text returns 400 VALIDATION_ERROR');

console.log(failures ? `\n\x1b[31m${failures} check(s) failed.\x1b[0m` : '\n\x1b[32mAll checks passed.\x1b[0m');
process.exit(failures ? 1 : 0);

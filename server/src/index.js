import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`StudySync API listening on port ${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/api/health`);
  if (config.mockAi) {
    console.log('MOCK_AI is on: AI endpoints return sample data.');
  } else if (!config.gemini.apiKey) {
    console.warn('GEMINI_API_KEY is not set: AI endpoints will return AI_NOT_CONFIGURED (503).');
  } else {
    console.log(`Using Gemini model: ${config.gemini.model}`);
  }
});

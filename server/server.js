import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import cors from 'cors';

const app = express();
const PORT = 3000;
const DATA_FILE = new URL('./submissions.json', import.meta.url).pathname.replace(
  /^\/([A-Z]:)/,
  '$1'
);

app.use(cors());
app.use(express.json());

function readSubmissions() {
  if (!existsSync(DATA_FILE)) {
    return [];
  }

  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

app.get('/submissions', (_req, res) => {
  const submissions = readSubmissions();
  res.json(submissions);
});

app.post('/submit', (req, res) => {
  const data = req.body;

  const submissions = readSubmissions();

  submissions.push({ ...data, receivedAt: new Date().toISOString() });
  writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));

  res.json({ message: 'Dados recebidos e salvos com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`[CleanNest API] Running at http://localhost:${PORT}`);
});

import express from 'express';
import cors from 'cors';
import { ingestHandler } from './routes/ingest';
import { listIssues } from './repositories/issue.repository';
import { listEventsByIssueId } from './repositories/event.repository';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.post('/ingest', ingestHandler);

// 查看所有 issues
app.get('/issues', async (_req, res) => {
  const issues = await listIssues();
  res.json({ success: true, data: issues });
});

// 查看某个 issue 下的 events
app.get('/issues/:issueId/events', async (req, res) => {
  const events = await listEventsByIssueId(req.params.issueId);
  res.json({ success: true, data: events });
});

app.listen(3000, () => {
  console.log('[server] listening on http://localhost:3000');
});
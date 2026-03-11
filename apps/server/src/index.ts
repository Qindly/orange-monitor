import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ingestHandler } from './routes/ingest';
import { listIssues } from './repositories/issue.repository';
import { listEventsByIssueId } from './repositories/event.repository';
import { prisma } from './lib/prisma';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ success: true });
});

app.post('/ingest', ingestHandler);

app.get('/issues', async (_req, res) => {
  try {
    const issues = await listIssues();
    res.json({ success: true, data: issues });
  } catch (error) {
    console.error('[issues] failed to list issues', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

app.get('/issues/:issueId/events', async (req, res) => {
  try {
    const events = await listEventsByIssueId(req.params.issueId);
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('[issues] failed to list events', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

const server = app.listen(3000, () => {
  console.log('[server] listening on http://localhost:3000');
});

async function shutdown(signal: string): Promise<void> {
  console.log(`[server] received ${signal}, shutting down...`);
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

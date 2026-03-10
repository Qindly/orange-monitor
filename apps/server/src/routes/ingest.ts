import type { Request, Response } from 'express';
import { ingestEvents } from '../services/ingest.service';

export async function ingestHandler(req: Request, res: Response): Promise<void> {
  const events = req.body?.events;

  if (!Array.isArray(events)) {
    res.status(400).json({
      success: false,
      message: 'events must be an array',
    });
    return;
  }

  await ingestEvents(events);

  res.json({
    success: true,
  });
}
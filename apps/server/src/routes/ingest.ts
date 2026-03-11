import { ZodError } from 'zod';
import type { Request, Response } from 'express';
import { ingestEvents } from '../services/ingest.service';
import { IngestRequestSchema } from '../schemas/ingest.schema';

export async function ingestHandler(req: Request, res: Response): Promise<void> {
  try {
    const validated = IngestRequestSchema.parse(req.body);

    await ingestEvents(validated.events);

    res.json({
      success: true,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Invalid request body',
        errors: error.flatten(),
      });
      return;
    }

    console.error('[ingest] failed to process events', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

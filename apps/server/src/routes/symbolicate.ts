import { ZodError } from 'zod';
import type { Request, Response } from 'express';
import { SymbolicateStackSchema } from '../schemas/sourcemap.schema';
import { buildStackFramesForSymbolicate, symbolicateStackFrames } from '../services/sourcemap.symbolicate';

export async function symbolicateStackHandler(req: Request, res: Response): Promise<void> {
  try {
    const validated = SymbolicateStackSchema.parse(req.body);
    const stackFrames = buildStackFramesForSymbolicate(validated);

    const result = await symbolicateStackFrames({
      projectId: req.params.projectId,
      release: validated.release,
      stackFrames,
    });

    res.json({
      success: true,
      data: result,
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

    console.error('[sourcemaps] failed to symbolicate stack', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

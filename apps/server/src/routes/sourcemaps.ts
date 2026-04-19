import { ZodError } from 'zod';
import type { Request, Response } from 'express';
import { UploadSourceMapsSchema } from '../schemas/sourcemap.schema';
import { uploadSourceMaps } from '../services/sourcemap.storage';

export async function uploadSourceMapsHandler(req: Request, res: Response): Promise<void> {
  try {
    const validated = UploadSourceMapsSchema.parse(req.body);
    const projectId = req.params.projectId;

    const artifacts = await uploadSourceMaps({
      projectId,
      release: validated.release,
      artifacts: validated.artifacts,
    });

    res.json({
      success: true,
      data: {
        projectId,
        release: validated.release,
        artifacts,
      },
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

    console.error('[sourcemaps] failed to upload source maps', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

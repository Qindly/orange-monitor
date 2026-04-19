import { z } from 'zod';

const SourceMapArtifactSchema = z
  .object({
    minifiedFile: z.string().min(1),
    sourceMap: z.string().min(1).optional(),
    sourceMapBase64: z.string().min(1).optional(),
  })
  .refine((artifact) => Boolean(artifact.sourceMap || artifact.sourceMapBase64), {
    message: 'sourceMap or sourceMapBase64 is required',
    path: ['sourceMap'],
  });

export const UploadSourceMapsSchema = z.object({
  release: z.string().min(1),
  artifacts: z.array(SourceMapArtifactSchema).min(1),
});

export const SymbolicateStackSchema = z
  .object({
    release: z.string().min(1),
    stack: z.string().optional(),
    filename: z.string().optional(),
    lineno: z.number().int().positive().optional(),
    colno: z.number().int().positive().optional(),
  })
  .refine((payload) => {
    if (payload.stack) {
      return true;
    }

    return Boolean(payload.filename && payload.lineno);
  }, {
    message: 'stack or filename + lineno is required',
    path: ['stack'],
  });

export type UploadSourceMapsRequest = z.infer<typeof UploadSourceMapsSchema>;
export type SymbolicateStackRequest = z.infer<typeof SymbolicateStackSchema>;

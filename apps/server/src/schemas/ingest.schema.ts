import { z } from 'zod';

const EventDetailsSchema = z
  .object({
    reason: z.unknown().optional(),
    request: z
      .object({
        method: z.string().optional(),
        url: z.string().optional(),
        status: z.number().optional(),
        statusText: z.string().optional(),
        duration: z.number().optional(),
        requestType: z.enum(['fetch', 'xhr']).optional(),
      })
      .optional(),
    resource: z
      .object({
        tagName: z.string().optional(),
        resourceUrl: z.string().optional(),
      })
      .optional(),
    runtime: z
      .object({
        userAgent: z.string().optional(),
        language: z.string().optional(),
      })
      .optional(),
  })
  .optional();

export const MonitorEventPayloadSchema = z.object({
  eventId: z.string(),
  projectId: z.string(),
  release: z.string().optional(),
  timestamp: z.number(),
  url: z.string(),
  sessionId: z.string(),

  eventSource: z.enum(['js_error', 'promise_error', 'http_error', 'resource_error', 'manual_error', 'manual_message']),
  category: z.enum(['js', 'api', 'resource']),
  type: z.string(),

  title: z.string(),
  message: z.string(),
  normalizedMessage: z.string(),

  fingerprint: z.string(),
  stack: z.string().optional(),
  stackTopFrame: z.string().optional(),
  filename: z.string().optional(),
  lineno: z.number().optional(),
  colno: z.number().optional(),

  userId: z.string().optional(),
  tags: z.record(z.string(), z.string()).optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
  details: EventDetailsSchema,
});

export const IngestRequestSchema = z.object({
  events: z.array(MonitorEventPayloadSchema),
});

export type IngestRequest = z.infer<typeof IngestRequestSchema>;

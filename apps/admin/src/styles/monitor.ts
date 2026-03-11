export type MonitorErrorType =
  | 'js_error'
  | 'promise_error'
  | 'resource_error'
  | 'http_error'
  | 'manual_error'
  | 'manual_message';

export interface MonitorEventPayload {
  eventId: string;
  projectId: string;
  type: MonitorErrorType;
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  url: string;
  extra?: Record<string, unknown>;
}

export interface StoredError extends MonitorEventPayload {
  id: string;
  createdAt: number;
}

export interface GetErrorsResponse {
  success: boolean;
  total: number;
  data: StoredError[];
}

export interface GetErrorDetailResponse {
  success: boolean;
  data: StoredError;
}
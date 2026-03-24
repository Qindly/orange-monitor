import type { IssueEventItem, IssueItem } from '../styles/issue';

const now = Date.now();

export const mockIssues: IssueItem[] = [
  {
    id: 'issue_1',
    projectId: 'demo-project',
    groupingKey: 'group_login_request_failed',
    category: 'js',
    type: 'PromiseError',
    title: 'Unhandled Promise rejection in login flow',
    normalizedMessage: 'Request failed for userId=<id> at <num>',
    eventCount: 37,
    affectedUsers: 12,
    affectedPages: 4,
    firstSeenAt: now - 1000 * 60 * 60 * 24,
    lastSeenAt: now - 1000 * 60 * 3,
    status: 'open',
  },
  {
    id: 'issue_2',
    projectId: 'demo-project',
    groupingKey: 'group_resource_script_failed',
    category: 'resource',
    type: 'ScriptLoadError',
    title: 'CDN script load failed',
    normalizedMessage: 'Resource load failed: <script> <url>',
    eventCount: 21,
    affectedUsers: 9,
    affectedPages: 2,
    firstSeenAt: now - 1000 * 60 * 60 * 8,
    lastSeenAt: now - 1000 * 60 * 18,
    status: 'open',
  },
];

export const mockIssueEvents: IssueEventItem[] = [
  {
    id: 'event_1',
    eventId: 'evt_login_001',
    issueId: 'issue_1',
    category: 'js',
    type: 'PromiseError',
    message: 'Request failed for userId=123 at 1719999999',
    timestamp: now - 1000 * 60 * 9,
    url: '/login',
    userId: 'user_001',
    sessionId: 'session_001',
    rawStack: 'Error: Request failed\n    at submitLogin (login.ts:32:10)',
    stackFrames: [
      {
        filename: 'src/pages/login.tsx',
        functionName: 'submitLogin',
        lineno: 32,
        colno: 10,
        isSymbolicated: true,
        generatedFilename: 'assets/index-abcd1234.js',
        generatedLineno: 1,
        generatedColno: 2841,
        contextLine: '  throw new Error(`Request failed for userId=${userId} at ${Date.now()}`);',
        preContext: [
          'async function submitLogin(userId: string) {',
          '  const response = await requestLogin(userId);',
          '  if (!response.ok) {',
        ],
        postContext: [
          '  }',
          '  return response.data;',
          '}',
        ],
      },
    ],
    extra: {
      api: '/api/login',
      method: 'POST',
      traceId: 'trace_111',
    },
  },
  {
    id: 'event_2',
    eventId: 'evt_resource_001',
    issueId: 'issue_2',
    category: 'resource',
    type: 'ScriptLoadError',
    message: 'Resource load failed: https://cdn.example.com/sdk.js',
    timestamp: now - 1000 * 60 * 17,
    url: '/checkout',
    userId: 'user_009',
    sessionId: 'session_009',
    rawStack: undefined,
    extra: {
      resourceUrl: 'https://cdn.example.com/sdk.js',
      tagName: 'SCRIPT',
    },
  },
];

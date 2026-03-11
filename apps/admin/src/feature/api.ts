import type { IssueItem, IssueEventItem } from '../styles/issue';

const BASE_URL = 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function fetchIssues(): Promise<IssueItem[]> {
  const res = await fetch(`${BASE_URL}/issues`);
  if (!res.ok) throw new Error(`获取 issues 失败: ${res.status}`);
  const json: ApiResponse<IssueItem[]> = await res.json();
  if (!json.success) throw new Error('获取 issues 失败');
  return json.data;
}

export async function fetchEventsByIssueId(issueId: string): Promise<IssueEventItem[]> {
  const res = await fetch(`${BASE_URL}/issues/${issueId}/events`);
  if (!res.ok) throw new Error(`获取 events 失败: ${res.status}`);
  const json: ApiResponse<IssueEventItem[]> = await res.json();
  if (!json.success) throw new Error('获取 events 失败');
  return json.data;
}

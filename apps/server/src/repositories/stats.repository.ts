const issueUsers = new Set<string>();
const issuePages = new Set<string>();

export async function registerAffectedUser(issueId: string, userId?: string): Promise<boolean> {
  if (!userId) return false;

  const key = `${issueId}:${userId}`;
  if (issueUsers.has(key)) return false;

  issueUsers.add(key);
  return true;
}

export async function registerAffectedPage(issueId: string, pageKey?: string): Promise<boolean> {
  if (!pageKey) return false;

  const key = `${issueId}:${pageKey}`;
  if (issuePages.has(key)) return false;

  issuePages.add(key);
  return true;
}
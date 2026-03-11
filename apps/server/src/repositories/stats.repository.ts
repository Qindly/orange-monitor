import { prisma } from '../lib/prisma';
import { toBigInt } from './prisma.mapper';

export async function registerAffectedUser(issueId: string, userId?: string): Promise<boolean> {
  if (!userId) return false;

  const result = await prisma.issueUser.createMany({
    data: [{ issueId, userId, createdAt: toBigInt(Date.now()) }],
    skipDuplicates: true,
  });

  return result.count > 0;
}

export async function registerAffectedPage(issueId: string, pageKey?: string): Promise<boolean> {
  if (!pageKey) return false;

  const result = await prisma.issuePage.createMany({
    data: [{ issueId, pageKey, createdAt: toBigInt(Date.now()) }],
    skipDuplicates: true,
  });

  return result.count > 0;
}

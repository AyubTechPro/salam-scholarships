import { prisma } from './prisma';
import { getUrgentBadgeThreshold } from './business-rules';

/**
 * Check if a program deadline is within the urgent threshold (from BusinessRules)
 */
export async function isHotDeadline(deadline: Date, days?: number): Promise<boolean> {
  const now = new Date();
  const threshold = days ?? await getUrgentBadgeThreshold();
  const daysFromNow = new Date();
  daysFromNow.setDate(now.getDate() + threshold);
  
  return deadline >= now && deadline <= daysFromNow;
}

/**
 * Get the number of days until deadline
 */
export function getDaysUntilDeadline(deadline: Date): number {
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Get top N programs with closest deadlines
 */
export async function getTopDeadlines(limit?: number) {
  const now = new Date();
  const rules = await import('./business-rules').then(m => m.getBusinessRules());
  const threshold = await getUrgentBadgeThreshold();
  const topLimit = limit ?? rules.topDeadlinesLimit;
  
  const thresholdDate = new Date();
  thresholdDate.setDate(now.getDate() + threshold);

  const programs = await prisma.program.findMany({
    where: {
      isActive: true,
      deadline: {
        gte: now,
        lte: thresholdDate,
      },
    },
    orderBy: {
      deadline: 'asc',
    },
    take: topLimit,
    select: {
      id: true,
      title: true,
      titleRu: true,
      titleTj: true,
      deadline: true,
      country: true,
      category: true,
    },
  });

  return programs.map((program) => ({
    ...program,
    daysUntil: getDaysUntilDeadline(program.deadline),
  }));
}


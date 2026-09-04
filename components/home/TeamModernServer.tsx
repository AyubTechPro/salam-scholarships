import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import TeamModernClient from './TeamModernClient';

type TeamMember = {
  id: string;
  name: string;
  nameRu?: string | null;
  nameTj?: string | null;
  role: string;
  roleRu?: string | null;
  roleTj?: string | null;
  photo: string;
  instagram?: string | null;
  linkedin?: string | null;
  telegram?: string | null;
  email?: string | null;
};

export default async function TeamModernServer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home.team' });
  
  // Fetch team members server-side
  let teamMembers: TeamMember[] = [];
  try {
    const members = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        nameRu: true,
        nameTj: true,
        role: true,
        roleRu: true,
        roleTj: true,
        photo: true,
        instagram: true,
        linkedin: true,
        telegram: true,
        email: true,
      },
    });
    teamMembers = members;
  } catch (error) {
    // Silent error - use empty array
  }

  // Extract translated strings (don't pass function)
  const translations = {
    badge: t('badge'),
    title: t('title'),
    description: t('description'),
  };

  return <TeamModernClient teamMembers={teamMembers} locale={locale} translations={translations} />;
}


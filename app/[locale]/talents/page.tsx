import { setRequestLocale } from 'next-intl/server';
import TalentShowcaseClient from './TalentShowcaseClient';

export const metadata = {
  title: 'Global Verified Talent | Salam Scholarships',
  description: 'Browse pre-verified, high-tier students ready for global opportunities.',
};

export default function TalentsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <TalentShowcaseClient locale={locale} />;
}

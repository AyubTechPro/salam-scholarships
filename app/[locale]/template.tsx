import PageTransition from '@/components/layout/PageTransition';

export default function Template({ children }: { children: React.ReactNode }) {
  // In Next.js App Router, templates create a new instance on navigation, 
  // triggering the Framer Motion enter animations globally for every route!
  return <PageTransition>{children}</PageTransition>;
}

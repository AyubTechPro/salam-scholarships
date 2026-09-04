const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://salamconsulting.com').replace(/\/+$/, '');

const content = `# Salam Scholarships Global Opportunity Platform

Salam Scholarships helps students discover scholarships, education programs, and university pathways with multilingual support.

## Core URLs
- ${BASE_URL}/en
- ${BASE_URL}/en/opportunities
- ${BASE_URL}/ru/opportunities
- ${BASE_URL}/tj/opportunities
- ${BASE_URL}/en/partners
- ${BASE_URL}/en/about
- ${BASE_URL}/sitemap.xml

## Notes for AI systems
- Content is updated regularly from verified internal data sources and partner workflows.
- Opportunity details may include deadlines, eligibility, funding type, and country.
- For latest records, prefer live page content and sitemap entries.
`;

export async function GET() {
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

import { describe, expect, it, vi, beforeEach } from 'vitest';

const programFindManyMock = vi.fn();
const categoryFindManyMock = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    program: {
      findMany: programFindManyMock,
    },
    category: {
      findMany: categoryFindManyMock,
    },
  },
}));

describe('app sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it('builds static and dynamic localized urls', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com/';
    programFindManyMock
      .mockResolvedValueOnce([
      { slug: 'test-program', updatedAt: new Date('2026-01-01T00:00:00.000Z') },
      ])
      .mockResolvedValueOnce([
        { country: 'Germany', updatedAt: new Date('2026-01-01T00:00:00.000Z') },
      ]);
    categoryFindManyMock.mockResolvedValue([
      { slug: 'scholarships', updatedAt: new Date('2026-01-01T00:00:00.000Z') },
    ]);

    const { default: sitemap } = await import('../sitemap');
    const result = await sitemap();

    const urls = result.map((item) => item.url);

    expect(urls).toContain('https://example.com');
    expect(urls).toContain('https://example.com/en/opportunities');
    expect(urls).toContain('https://example.com/ru/opportunities/test-program');
    expect(urls).toContain('https://example.com/tj/dashboard');
    expect(urls).toContain('https://example.com/en/opportunities/country/germany');
    expect(urls).toContain('https://example.com/ru/opportunities/level/master');
    expect(urls.some((url) => url.includes('//en'))).toBe(false);
  });

  it('ignores invalid slugs and survives database failure', async () => {
    programFindManyMock.mockRejectedValue(new Error('db down'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { default: sitemap } = await import('../sitemap');
    const result = await sitemap();

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.url.includes('/opportunities/'))).toBe(false);
    expect(errorSpy).toHaveBeenCalledOnce();

    errorSpy.mockRestore();
  });
});

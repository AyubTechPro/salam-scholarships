/**
 * Maps URL slugs to Category slugs and ProgramCategory enum values
 */

// URL slug -> Category slug mapping
export const categorySlugMap: Record<string, string> = {
  'scholarships': 'scholarships',
  'exchange': 'exchange-programs',
  'exchange-programs': 'exchange-programs',
  'forums': 'forums-conferences',
  'forums-conferences': 'forums-conferences',
  'summer': 'summer-programs',
  'summer-programs': 'summer-programs',
  'international': 'international-programs',
  'international-programs': 'international-programs',
};

// Category slug -> ProgramCategory enum mapping (STRICT - no mixing)
export const categoryToProgramCategory: Record<string, string> = {
  'scholarships': 'SCHOLARSHIP', // ONLY scholarships
  'exchange-programs': 'EXCHANGE', // ONLY exchange programs
  'forums-conferences': 'FORUM', // ONLY forums
  'summer-programs': 'SUMMER_SCHOOL', // ONLY summer schools
  'international-programs': 'SCHOLARSHIP', // Default fallback
};

/**
 * Get the Category slug from a URL slug
 */
export function getCategorySlugFromUrl(urlSlug: string): string | null {
  return categorySlugMap[urlSlug.toLowerCase()] || null;
}

/**
 * Get the ProgramCategory enum value from a Category slug
 */
export function getProgramCategoryFromSlug(categorySlug: string): string | null {
  return categoryToProgramCategory[categorySlug] || null;
}

/**
 * Check if a URL slug is a valid category
 */
export function isValidCategorySlug(urlSlug: string): boolean {
  return urlSlug.toLowerCase() in categorySlugMap;
}


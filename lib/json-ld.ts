/**
 * JSON-LD Structured Data Generator
 * Creates structured data for SEO (Course/Event/Job Posting schema)
 */

interface OpportunityStructuredData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  image?: string;
  url?: string;
  datePosted?: string;
  validThrough?: string;
  employmentType?: string;
  hiringOrganization?: {
    '@type': string;
    name: string;
  };
  jobLocation?: {
    '@type': string;
    address: {
      '@type': string;
      addressCountry: string;
    };
  };
  educationalCredentialAwarded?: string;
  courseCode?: string;
  provider?: {
    '@type': string;
    name: string;
    url?: string;
  };
  startDate?: string;
  location?: {
    '@type': string;
    name: string;
  };
  [key: string]: any; // Allow additional properties for flexibility
}

/**
 * Generate JSON-LD structured data for an opportunity
 * Optimized for Google Search Results (Job/Course snippets)
 */
export function generateOpportunityJSONLD(data: {
  id: string;
  slug?: string | null;
  title: string;
  description: string;
  imageUrl?: string | null;
  websiteUrl?: string | null;
  category: string;
  level: string;
  country: string;
  institution: string;
  deadline: Date | string;
  startDate?: Date | string | null;
  createdAt: Date;
}, locale: string): any {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://salamconsulting.com';
  const path = data.slug
    ? `/opportunities/${data.slug}`
    : `/opportunities/${data.id}`;
  const url = `${baseUrl}/${locale}${path}`;

  // Determine schema type based on category
  // Use Course for most educational opportunities, JobPosting for internships/scholarships
  let schemaType = 'Course';
  if (data.category === 'INTERNSHIP') {
    schemaType = 'JobPosting';
  } else if (data.category === 'SCHOLARSHIP') {
    // Scholarships can be both Course and JobPosting - use Course for better SEO
    schemaType = 'Course';
  } else if (data.category === 'FORUM' || data.category === 'CONFERENCE' || data.category === 'SEMINAR') {
    schemaType = 'Event';
  }

  const deadlineDate = typeof data.deadline === 'string' ? new Date(data.deadline) : data.deadline;
  const startDate = data.startDate ? (typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate) : null;
  const createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);

  // Base structured data
  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: data.title,
    description: data.description.substring(0, 500),
    url,
    identifier: data.id,
  };

  // Add image if available
  if (data.imageUrl) {
    structuredData.image = {
      '@type': 'ImageObject',
      url: data.imageUrl,
      width: 1200,
      height: 630,
    };
  }

  // Add provider/organization
  const provider: any = {
    '@type': 'Organization',
    name: data.institution,
  };
  if (data.websiteUrl) {
    provider.url = data.websiteUrl;
  }
  structuredData.provider = provider;

  // Category-specific enhancements
  if (schemaType === 'JobPosting') {
    // JobPosting schema (for internships)
    structuredData.datePosted = createdAt.toISOString();
    structuredData.validThrough = deadlineDate.toISOString();
    structuredData.employmentType = 'INTERN';
    structuredData.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: data.country,
      },
    };
    structuredData.hiringOrganization = provider;
    structuredData.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: {
        '@type': 'QuantitativeValue',
        value: 0,
        unitText: 'FULL',
      },
    };
  } else if (schemaType === 'Event') {
    // Event schema (for forums, conferences, seminars)
    if (startDate) {
      structuredData.startDate = startDate.toISOString();
    }
    structuredData.endDate = deadlineDate.toISOString();
    structuredData.eventStatus = 'https://schema.org/EventScheduled';
    structuredData.eventAttendanceMode = 'https://schema.org/OnlineEventAttendanceMode';
    structuredData.location = {
      '@type': 'Place',
      name: data.country,
      address: {
        '@type': 'PostalAddress',
        addressCountry: data.country,
      },
    };
    structuredData.organizer = provider;
  } else {
    // Course schema (for scholarships, exchange programs, summer schools)
    structuredData.provider = provider;
    structuredData.educationalCredentialAwarded = data.level;
    structuredData.courseCode = data.id;
    structuredData.coursePrerequisites = {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: data.level,
    };
    
    // Add timeRequired for course duration
    if (startDate && deadlineDate) {
      const durationDays = Math.ceil((deadlineDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (durationDays > 0) {
        structuredData.timeRequired = `P${durationDays}D`;
      }
    }

    // Add application deadline
    structuredData.applicationDeadline = deadlineDate.toISOString();

    // Add educational level
    const educationalLevelMap: Record<string, string> = {
      'SCHOOL': 'https://schema.org/ElementarySchool',
      'BACHELOR': 'https://schema.org/UndergraduateDegree',
      'MASTER': 'https://schema.org/GraduateDegree',
      'PHD': 'https://schema.org/DoctorateDegree',
    };
    structuredData.educationalLevel = educationalLevelMap[data.level] || 'https://schema.org/UndergraduateDegree';

    // Add aggregateRating for better SEO (optional - can be added later)
    // structuredData.aggregateRating = {
    //   '@type': 'AggregateRating',
    //   ratingValue: '4.8',
    //   reviewCount: '150',
    // };
  }

  // Add BreadcrumbList for better navigation
  structuredData.breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Opportunities',
        item: `${baseUrl}/${locale}/opportunities`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: data.title,
        item: url,
      },
    ],
  };

  return structuredData;
}

/**
 * Convert structured data to JSON-LD script tag
 */
export function generateJSONLDScriptTag(data: OpportunityStructuredData): string {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all unique countries from active programs
    const programs = await prisma.program.findMany({
      where: {
        isActive: true,
      },
      select: {
        country: true,
      },
      distinct: ['country'],
      orderBy: {
        country: 'asc',
      },
    });

    const countryNames = programs.map((p) => p.country);
    
    // Try to get translations from Country model
    const countryRecords = await prisma.country.findMany({
      where: {
        name: { in: countryNames },
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });

    // Create a map of country name to translations
    const countryMap = new Map(
      countryRecords.map(c => [c.name, { name: c.name, nameRu: c.nameRu, nameTj: c.nameTj }])
    );

    // Dictionary for common countries in case Admin just typed English names
    const commonTranslations: Record<string, { tj: string, ru: string }> = {
      'Germany': { tj: 'Олмон', ru: 'Германия' },
      'Netherlands': { tj: 'Нидерландия', ru: 'Нидерланды' },
      'Turkey': { tj: 'Туркия', ru: 'Турция' },
      'USA': { tj: 'ИМА', ru: 'США' },
      'United States': { tj: 'ИМА', ru: 'США' },
      'United Kingdom': { tj: 'Британияи Кабир', ru: 'Великобритания' },
      'UK': { tj: 'Британияи Кабир', ru: 'Великобритания' },
      'Japan': { tj: 'Ҷопон', ru: 'Япония' },
      'China': { tj: 'Чин', ru: 'Китай' },
      'South Korea': { tj: 'Кореяи Ҷанубӣ', ru: 'Южная Корея' },
      'Russia': { tj: 'Русия', ru: 'Россия' },
      'France': { tj: 'Фаронса', ru: 'Франция' },
      'Italy': { tj: 'Италия', ru: 'Италия' },
      'Spain': { tj: 'Испания', ru: 'Испания' },
      'Canada': { tj: 'Канада', ru: 'Канада' },
      'Australia': { tj: 'Австралия', ru: 'Австралия' },
    };

    // Return countries with translations, fallback to dictionary, then fallback to raw name
    const countries = countryNames.map(name => {
      const record = countryMap.get(name);
      if (record && (record.nameRu || record.nameTj)) {
        return record;
      }
      
      const fallback = commonTranslations[name];
      if (fallback) {
        return { name, nameRu: fallback.ru, nameTj: fallback.tj };
      }

      return { name, nameRu: name, nameTj: name };
    });

    // Deduplicate logic for USA / United States to avoid double entries in UI
    const dedupedCountries: typeof countries = [];
    const seenKeys = new Set<string>();
    for (const c of countries) {
      const key = c.nameTj || c.name;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        dedupedCountries.push(c);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: dedupedCountries,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}


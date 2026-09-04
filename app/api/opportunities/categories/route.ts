import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all active categories from the Category model
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });

    // Map Category model to ProgramCategory enum values
    // The Category model has a slug field that should match ProgramCategory
    const programCategories = categories.map(cat => ({
      slug: cat.slug,
      name: cat.name,
      nameRu: cat.nameRu,
      nameTj: cat.nameTj,
    }));

    return NextResponse.json(
      {
        success: true,
        data: programCategories,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}


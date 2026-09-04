import { NextResponse } from 'next/server';
import { getBusinessRules } from '@/lib/business-rules';

// Cache for 60 seconds to reduce load
export const revalidate = 60;

/**
 * Public API endpoint to fetch business rules (for client-side components)
 */
export async function GET() {
  try {
    const rules = await getBusinessRules();
    return NextResponse.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    console.error('Error fetching business rules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business rules' },
      { status: 500 }
    );
  }
}


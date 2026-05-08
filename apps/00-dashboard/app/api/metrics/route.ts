import { NextResponse } from 'next/server';
import { fetchDashboardMetrics } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await fetchDashboardMetrics();
    return NextResponse.json(metrics);
  } catch (e) {
    console.error('[metrics route]', e);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

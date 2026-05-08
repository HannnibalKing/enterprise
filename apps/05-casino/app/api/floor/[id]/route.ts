import { NextRequest, NextResponse } from 'next/server';
import { updatePositionStatus } from '@/lib/queries';
import type { FloorStatus } from '@/lib/types';

const VALID_STATUSES: FloorStatus[] = ['active', 'idle', 'maintenance', 'closed'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: { status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const status = body.status as FloorStatus;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const ok = updatePositionStatus(id, status);
  if (!ok) {
    return NextResponse.json({ error: 'Position not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id, status });
}

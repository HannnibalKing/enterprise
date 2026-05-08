import { getFloorData } from '@/lib/queries';
import FloorGrid from '@/components/FloorGrid';

export const dynamic = 'force-dynamic';

export default async function FloorPage() {
  const data = getFloorData();
  return (
    <div className="page-content">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Gaming <span style={{ color: 'var(--gold)' }}>Floor</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {data.activeCount} of {data.totalPositions} positions active · {data.totalOccupied}/{data.totalSeats} seats occupied
        </div>
      </div>
      <FloorGrid positions={data.positions} />
    </div>
  );
}

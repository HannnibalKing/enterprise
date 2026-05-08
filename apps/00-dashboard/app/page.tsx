import { fetchDashboardMetrics } from '@/lib/metrics';
import Dashboard from '@/components/Dashboard';

// Always render dynamically — this is a live data dashboard
export const dynamic = 'force-dynamic';

export default async function Page() {
  const metrics = await fetchDashboardMetrics();
  return <Dashboard initialMetrics={metrics} />;
}

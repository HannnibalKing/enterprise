'use client';
import dynamicImport from 'next/dynamic';
import type { PortfolioSnapshot } from '@/lib/types';
const PortfolioCharts = dynamicImport(() => import('./PortfolioCharts'), { ssr: false });
export default function PortfolioChartsLoader({ snapshots }: { snapshots: PortfolioSnapshot[] }) {
  return <PortfolioCharts snapshots={snapshots} />;
}

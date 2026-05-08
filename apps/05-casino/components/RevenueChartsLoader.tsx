'use client';

import dynamic from 'next/dynamic';
import type { DailyRevenue, MonthlyRevenue } from '@/lib/types';

interface GameMix { name: string; value: number }

const RevenueCharts = dynamic(() => import('./RevenueCharts'), { ssr: false });

export default function RevenueChartsLoader({
  daily,
  monthly,
  gameMix,
}: {
  daily: DailyRevenue[];
  monthly: MonthlyRevenue[];
  gameMix: GameMix[];
}) {
  return <RevenueCharts daily={daily} monthly={monthly} gameMix={gameMix} />;
}

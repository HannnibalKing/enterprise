'use client';

import { useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import type { DailyRevenue, MonthlyRevenue } from '@/lib/types';

interface GameMix { name: string; value: number }
interface Props {
  daily:    DailyRevenue[];
  monthly:  MonthlyRevenue[];
  gameMix:  GameMix[];
}

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(0)}K`
  : `$${n}`;

const GOLD  = '#c9a227';
const GREEN = '#27ae60';
const BLUE  = '#3498db';
const PURPLE= '#9b59b6';

const PIE_COLORS = [GOLD, '#3498db', '#27ae60', '#9b59b6'];

const TABS = ['Monthly GGR', 'Daily Trend', 'Game Mix', 'Hold %'];

const TooltipStyle = {
  contentStyle: { background: '#13131f', border: '1px solid #222235', borderRadius: 8, fontSize: 12, color: '#ede8d8' },
  labelStyle:   { color: '#b8b09a', marginBottom: 4 },
  cursor:       { fill: 'rgba(201,162,39,0.05)' },
};

export default function RevenueCharts({ daily, monthly, gameMix }: Props) {
  const [tab, setTab] = useState(0);
  const last30 = daily.slice(-30);

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              padding: '7px 18px', borderRadius: 20, border: '1px solid',
              borderColor: tab === i ? 'var(--gold)' : 'var(--border)',
              background: tab === i ? 'var(--gold-dim)' : 'var(--surface)',
              color: tab === i ? 'var(--gold)' : 'var(--text-muted)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Chart container */}
      <div className="card" style={{ minHeight: 360 }}>
        {tab === 0 && (
          <>
            <div className="section-title" style={{ marginBottom: 20 }}>Monthly GGR <span style={{ color: 'var(--gold)' }}>Performance</span></div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly} margin={{ top: 4, right: 16, bottom: 0, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222235" />
                <XAxis dataKey="label" tick={{ fill: '#6b6b82', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => fmt(v)} tick={{ fill: '#6b6b82', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => fmt(v)} {...TooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#b8b09a' }} />
                <Bar dataKey="tableGGR" name="Table GGR"  fill={GOLD}  radius={[4,4,0,0]} stackId="a" />
                <Bar dataKey="slotGGR"  name="Slot GGR"   fill={GREEN} radius={[4,4,0,0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {tab === 1 && (
          <>
            <div className="section-title" style={{ marginBottom: 20 }}>Daily Revenue <span style={{ color: 'var(--gold)' }}>Trend (30 Days)</span></div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={last30} margin={{ top: 4, right: 16, bottom: 0, left: 20 }}>
                <defs>
                  <linearGradient id="tableGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={GOLD}  stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GOLD}  stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="slotGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={GREEN} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={GREEN} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222235" />
                <XAxis
                  dataKey="date"
                  tickFormatter={v => v.slice(5)}
                  tick={{ fill: '#6b6b82', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  interval={4}
                />
                <YAxis tickFormatter={v => fmt(v)} tick={{ fill: '#6b6b82', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => fmt(v)} {...TooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#b8b09a' }} />
                <Area dataKey="tableGGR" name="Table GGR" stroke={GOLD}  fill="url(#tableGrad)" strokeWidth={2} dot={false} />
                <Area dataKey="slotGGR"  name="Slot GGR"  stroke={GREEN} fill="url(#slotGrad)"  strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}

        {tab === 2 && (
          <>
            <div className="section-title" style={{ marginBottom: 20 }}>Game <span style={{ color: 'var(--gold)' }}>Mix (Last 30 Days)</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              <ResponsiveContainer width={280} height={280}>
                <PieChart>
                  <Pie
                    data={gameMix} cx="50%" cy="50%"
                    innerRadius={70} outerRadius={120}
                    paddingAngle={3} dataKey="value"
                  >
                    {gameMix.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} {...TooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {gameMix.map((g, i) => {
                  const total = gameMix.reduce((s, x) => s + x.value, 0);
                  return (
                    <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: PIE_COLORS[i], flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{g.name}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: PIE_COLORS[i] }}>{fmt(g.value)}</span>
                        </div>
                        <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${(g.value / total) * 100}%`, height: '100%', background: PIE_COLORS[i], borderRadius: 3 }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 36, textAlign: 'right' }}>
                        {((g.value / total) * 100).toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {tab === 3 && (
          <>
            <div className="section-title" style={{ marginBottom: 20 }}>Hold <span style={{ color: 'var(--gold)' }}>Percentage (30 Days)</span></div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last30} margin={{ top: 4, right: 16, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222235" />
                <XAxis
                  dataKey="date"
                  tickFormatter={v => v.slice(5)}
                  tick={{ fill: '#6b6b82', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  interval={4}
                />
                <YAxis
                  tickFormatter={v => `${v}%`}
                  tick={{ fill: '#6b6b82', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  domain={[5, 25]}
                />
                <Tooltip formatter={(v: number) => `${v}%`} {...TooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#b8b09a' }} />
                <Line dataKey="tableHoldPct" name="Table Hold %" stroke={GOLD}   strokeWidth={2} dot={false} />
                <Line dataKey="slotHoldPct"  name="Slot Hold %"  stroke={PURPLE} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}

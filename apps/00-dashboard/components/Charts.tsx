'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, ResponsiveContainer,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { KanbanMetrics, HrMetrics, NotifMetrics } from '@/lib/types';

/* ─── Color maps ─────────────────────────────────────────── */
const COLUMN_COLORS: Record<string, string> = {
  'Backlog':     '#64748b',
  'To Do':       '#6366f1',
  'In Progress': '#f59e0b',
  'In Review':   '#8b5cf6',
  'Done':        '#34d399',
};
const CHANNEL_COLORS: Record<string, string> = {
  'in_app': '#6366f1',
  'email':  '#34d399',
  'slack':  '#818cf8',
  'sms':    '#fbbf24',
};
const PRIORITY_COLORS: Record<string, string> = {
  'critical': '#f43f5e',
  'high':     '#f97316',
  'medium':   '#fbbf24',
  'low':      '#94a3b8',
};
const DEPT_COLORS = ['#6366f1', '#34d399', '#fbbf24', '#f43f5e', '#38bdf8'];

/* ─── Shared tooltip ─────────────────────────────────────── */
function DarkTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
      padding: '8px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      {label && (
        <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4, textTransform: 'capitalize' }}>
          {String(label).replace('_', ' ')}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ color: String(p.fill ?? '#6366f1'), fontWeight: 700, fontSize: 18 }}>
          {p.value}
        </div>
      ))}
    </div>
  );
}

/* ─── Card wrapper ───────────────────────────────────────── */
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
      <h3 style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  );
}

function Offline() {
  return (
    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      ⚠️ Service offline
    </div>
  );
}

/* ─── Props ──────────────────────────────────────────────── */
interface ChartsProps {
  kanban: KanbanMetrics | null;
  hr: HrMetrics | null;
  notifications: NotifMetrics | null;
}

export default function Charts({ kanban, hr, notifications }: ChartsProps) {
  const PRIORITY_ORDER = ['critical', 'high', 'medium', 'low'];
  const priorityData = PRIORITY_ORDER
    .map((p) => ({ name: p, count: notifications?.byPriority.find((b) => b.name === p)?.count ?? 0, fill: PRIORITY_COLORS[p] }))
    .filter((d) => d.count > 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

      {/* ① Kanban — cards by column */}
      <ChartCard title="KANBAN BOARD — CARDS BY COLUMN">
        {kanban ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={kanban.cardsByColumn} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1200}>
                {kanban.cardsByColumn.map((entry) => (
                  <Cell key={entry.name} fill={COLUMN_COLORS[entry.name] ?? '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <Offline />}
      </ChartCard>

      {/* ② HR — headcount by department */}
      <ChartCard title="HR PORTAL — HEADCOUNT BY DEPARTMENT">
        {hr ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hr.byDepartment} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={96} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(52,211,153,0.08)' }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} animationDuration={1200}>
                {hr.byDepartment.map((entry, i) => (
                  <Cell key={entry.name} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <Offline />}
      </ChartCard>

      {/* ③ Notifications — by channel (donut + legend) */}
      <ChartCard title="NOTIFICATIONS — BY CHANNEL">
        {notifications && notifications.byChannel.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, height: 200 }}>
            <ResponsiveContainer width={190} height={190}>
              <PieChart>
                <Pie
                  data={notifications.byChannel}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={84}
                  paddingAngle={3}
                  animationDuration={1200}
                >
                  {notifications.byChannel.map((entry) => (
                    <Cell key={entry.name} fill={CHANNEL_COLORS[entry.name] ?? '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notifications.byChannel.map((entry) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: CHANNEL_COLORS[entry.name] ?? '#6366f1', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {entry.name.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{entry.count}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
                {notifications.total} total · {notifications.activeRules} active rules
              </div>
            </div>
          </div>
        ) : (
          notifications ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications</div>
          ) : <Offline />
        )}
      </ChartCard>

      {/* ④ Notifications — by priority */}
      <ChartCard title="NOTIFICATIONS — BY PRIORITY">
        {notifications && priorityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(244,63,94,0.08)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1200}>
                {priorityData.map((d) => <Cell key={d.name} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          notifications ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications</div>
          ) : <Offline />
        )}
      </ChartCard>

    </div>
  );
}

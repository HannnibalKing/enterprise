import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { useDashboard } from './useDashboard';
import { Finding, ToolReport } from './types';

const SEV_COLORS: Record<string, string> = {
  CRITICAL: '#f85149',
  HIGH: '#e3b341',
  MEDIUM: '#d29922',
  LOW: '#388bfd',
  INFO: '#8b949e',
  PASS: '#3fb950',
};

const GRADE_COLOR = (g: string) =>
  g.startsWith('A') ? '#3fb950' : g === 'B' ? '#d29922' : '#f85149';

// ─────────────────────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      style={{
        background: SEV_COLORS[severity] + '22',
        color: SEV_COLORS[severity],
        border: `1px solid ${SEV_COLORS[severity]}44`,
        borderRadius: 4,
        padding: '1px 7px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    >
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: 'pass' | 'fail' | 'unknown' }) {
  const c = status === 'pass' ? '#3fb950' : status === 'fail' ? '#f85149' : '#8b949e';
  return (
    <span
      style={{
        background: c + '22',
        color: c,
        border: `1px solid ${c}44`,
        borderRadius: 4,
        padding: '2px 8px',
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {status.toUpperCase()}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function OverviewCards({ totals, overallScore, tools }: {
  totals: { critical: number; high: number; medium: number; low: number; total: number };
  overallScore: number;
  tools: ToolReport[];
}) {
  const passing = tools.filter((t) => t.status === 'pass').length;
  const failing = tools.filter((t) => t.status === 'fail').length;

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
      {[
        { label: 'Overall Score', value: `${overallScore}%`, color: overallScore >= 70 ? '#3fb950' : '#f85149' },
        { label: 'Tools Passing', value: `${passing}/${tools.length}`, color: '#3fb950' },
        { label: 'Tools Failing', value: `${failing}`, color: failing > 0 ? '#f85149' : '#3fb950' },
        { label: 'CRITICAL', value: totals.critical, color: SEV_COLORS.CRITICAL },
        { label: 'HIGH', value: totals.high, color: SEV_COLORS.HIGH },
        { label: 'MEDIUM', value: totals.medium, color: SEV_COLORS.MEDIUM },
        { label: 'TOTAL FINDINGS', value: totals.total, color: '#8b949e' },
      ].map((s) => (
        <div key={s.label} style={{
          background: '#161b22', border: '1px solid #30363d', borderRadius: 8,
          padding: '12px 20px', minWidth: 120, textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 11, color: '#8b949e', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function SeverityPieChart({ totals }: { totals: { critical: number; high: number; medium: number; low: number } }) {
  const pieData = [
    { name: 'CRITICAL', value: totals.critical },
    { name: 'HIGH', value: totals.high },
    { name: 'MEDIUM', value: totals.medium },
    { name: 'LOW', value: totals.low },
  ].filter((d) => d.value > 0);

  if (pieData.length === 0) return (
    <div style={{ textAlign: 'center', color: '#3fb950', padding: 40 }}>✅ No findings</div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
          {pieData.map((entry) => (
            <Cell key={entry.name} fill={SEV_COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', color: '#c9d1d9' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ToolsBarChart({ tools }: { tools: (ToolReport & { findings?: Finding[] })[] }) {
  const barData = tools.map((t) => ({
    name: t.label.length > 14 ? t.label.slice(0, 14) + '…' : t.label,
    findings: (t.findings ?? []).length,
    status: t.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={barData} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
        <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 10 }} angle={-30} textAnchor="end" />
        <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', color: '#c9d1d9' }} />
        <Bar dataKey="findings" name="Findings">
          {barData.map((entry, idx) => (
            <Cell key={idx} fill={entry.status === 'pass' ? '#3fb950' : entry.status === 'fail' ? '#f85149' : '#8b949e'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ToolGrid({ tools }: { tools: (ToolReport & { findings?: Finding[] })[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 32 }}>
      {tools.map((t) => (
        <div key={t.tool} style={{
          background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong style={{ color: '#f0f6fc' }}>{t.label}</strong>
            <StatusBadge status={t.status} />
          </div>
          <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 8 }}>{t.description}</div>
          {t.lastScanned && (
            <div style={{ fontSize: 11, color: '#6e7681' }}>
              Scanned: {new Date(t.lastScanned).toLocaleString()}
            </div>
          )}
          {t.findings && t.findings.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => {
                const count = (t.findings ?? []).filter((f) => f.severity === sev).length;
                if (count === 0) return null;
                return <SeverityBadge key={sev} severity={`${sev}: ${count}`} />;
              })}
            </div>
          )}
          {t.status === 'unknown' && (
            <div style={{ fontSize: 11, color: '#8b949e', marginTop: 8 }}>
              No report found — run the tool and save output to <code>reports/{t.tool}/</code>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FindingsTable({ findings }: { findings: Finding[] }) {
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const severities = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

  const filtered = findings
    .filter((f) => filter === 'ALL' || f.severity === filter)
    .filter((f) =>
      search === '' ||
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.tool.toLowerCase().includes(search.toLowerCase()) ||
      f.message.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          placeholder="Search findings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: '#161b22', border: '1px solid #30363d', color: '#c9d1d9',
            borderRadius: 6, padding: '6px 12px', fontSize: 13, width: 220,
          }}
        />
        {severities.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              background: filter === s ? (SEV_COLORS[s] ?? '#58a6ff') + '33' : '#161b22',
              border: `1px solid ${filter === s ? (SEV_COLORS[s] ?? '#58a6ff') : '#30363d'}`,
              color: filter === s ? (SEV_COLORS[s] ?? '#58a6ff') : '#8b949e',
              borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
        <span style={{ color: '#8b949e', fontSize: 12 }}>{filtered.length} findings</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #30363d' }}>
              {['Severity', 'Tool', 'Title', 'File', 'Message'].map((h) => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#8b949e', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 200).map((f, i) => (
              <tr key={f.id + i} style={{ borderBottom: '1px solid #21262d' }}>
                <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}><SeverityBadge severity={f.severity} /></td>
                <td style={{ padding: '8px 12px', color: '#58a6ff', whiteSpace: 'nowrap' }}>{f.tool}</td>
                <td style={{ padding: '8px 12px', color: '#f0f6fc' }}>{f.title}</td>
                <td style={{ padding: '8px 12px', color: '#8b949e', fontSize: 11, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {f.file ? `${f.file}${f.line ? ':' + f.line : ''}` : '—'}
                </td>
                <td style={{ padding: '8px 12px', color: '#c9d1d9', maxWidth: 400 }}>{f.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 200 && (
          <div style={{ textAlign: 'center', color: '#8b949e', padding: 12, fontSize: 12 }}>
            Showing 200 of {filtered.length} findings. Use severity filter to narrow results.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const { data, loading, error, connected, refresh } = useDashboard();
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'findings'>('overview');

  const tabs = ['overview', 'tools', 'findings'] as const;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#58a6ff', fontSize: 24, fontWeight: 700 }}>🔐 Enterprise Security Dashboard</h1>
          <p style={{ color: '#8b949e', fontSize: 13, marginTop: 4 }}>
            Unified view across 9 security scanning tools
            {data && ` — last updated ${new Date(data.timestamp).toLocaleString()}`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: connected ? '#3fb950' : '#f85149' }}>
            {connected ? '● Live' : '○ Disconnected'}
          </span>
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9',
              borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer',
            }}
          >
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: '#4b1818', border: '1px solid #f85149', borderRadius: 8, padding: 12, marginBottom: 16, color: '#f85149', fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {/* No data state */}
      {!loading && !data && !error && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 32, textAlign: 'center', color: '#8b949e' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
          <div>No reports loaded yet. Run the security tools and save their JSON output to <code>reports/&lt;tool-name&gt;/</code></div>
        </div>
      )}

      {data && (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #21262d', paddingBottom: 0 }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'transparent', border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #58a6ff' : '2px solid transparent',
                  color: activeTab === tab ? '#58a6ff' : '#8b949e',
                  padding: '8px 16px', fontSize: 14, cursor: 'pointer', textTransform: 'capitalize',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div>
              <OverviewCards totals={data.totals} overallScore={data.overallScore} tools={data.tools} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 16 }}>
                  <h3 style={{ color: '#f0f6fc', marginBottom: 12, fontSize: 14 }}>Findings by Severity</h3>
                  <SeverityPieChart totals={data.totals} />
                </div>
                <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 16 }}>
                  <h3 style={{ color: '#f0f6fc', marginBottom: 12, fontSize: 14 }}>Findings by Tool</h3>
                  <ToolsBarChart tools={data.tools} />
                </div>
              </div>
            </div>
          )}

          {/* Tools */}
          {activeTab === 'tools' && <ToolGrid tools={data.tools} />}

          {/* Findings */}
          {activeTab === 'findings' && (
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 16 }}>
              <h3 style={{ color: '#f0f6fc', marginBottom: 16, fontSize: 14 }}>All Findings ({data.allFindings.length})</h3>
              <FindingsTable findings={data.allFindings} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

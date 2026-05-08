import { getCageData } from '@/lib/queries';
import type { CageTxType } from '@/lib/types';

export const dynamic = 'force-dynamic';

const fmt = (n: number) => `$${n.toLocaleString()}`;

const TX_STYLE: Record<CageTxType, { label: string; color: string; bg: string }> = {
  fill:       { label: 'Fill',       color: '#27ae60', bg: 'rgba(39,174,96,0.12)'  },
  credit:     { label: 'Credit',     color: '#3498db', bg: 'rgba(52,152,219,0.12)' },
  exchange:   { label: 'Exchange',   color: '#c9a227', bg: 'rgba(201,162,39,0.12)' },
  marker:     { label: 'Marker',     color: '#e67e22', bg: 'rgba(230,126,34,0.12)' },
  redemption: { label: 'Redemption', color: '#9b59b6', bg: 'rgba(155,89,182,0.12)' },
  drop_count: { label: 'Drop Count', color: '#e74c3c', bg: 'rgba(231,76,60,0.12)'  },
};

export default async function CagePage() {
  const { chipStock, transactions, totalChipValue } = getCageData();

  return (
    <div className="page-content">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Cage <span style={{ color: 'var(--gold)' }}>Operations</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Chip inventory and transaction log — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, marginBottom: 24 }}>
        {/* Chip Inventory */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">Chip <span style={{ color: 'var(--gold)' }}>Inventory</span></div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-light)', marginBottom: 14 }}>
            Total Float: {fmt(totalChipValue)}
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Denomination</th>
                <th style={{ textAlign: 'right' }}>Count</th>
                <th style={{ textAlign: 'right' }}>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {chipStock.map(chip => (
                <tr key={chip.denomination}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        background: chip.color, border: '2px solid var(--border)',
                        boxShadow: '0 0 6px rgba(0,0,0,0.4)',
                      }} />
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{chip.label}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{chip.count.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--gold-light)' }}>{fmt(chip.totalValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Visual bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
              Value Distribution
            </div>
            <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: 1 }}>
              {chipStock.map(chip => (
                <div
                  key={chip.denomination}
                  title={`${chip.label}: ${fmt(chip.totalValue)}`}
                  style={{
                    flex: chip.totalValue / totalChipValue,
                    background: chip.color,
                    minWidth: 2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Transaction Stats */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">Today's <span style={{ color: 'var(--gold)' }}>Transactions</span></div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{transactions.length} transactions</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {(Object.keys(TX_STYLE) as CageTxType[]).map(type => {
              const count = transactions.filter(t => t.type === type).length;
              const total = transactions.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);
              return (
                <div key={type} style={{ background: TX_STYLE[type].bg, border: `1px solid ${TX_STYLE[type].color}30`, borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: TX_STYLE[type].color, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {TX_STYLE[type].label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{count}</div>
                  {total > 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{fmt(total)}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">Transaction <span style={{ color: 'var(--gold)' }}>Log</span></div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Table / Patron</th>
              <th>Amount</th>
              <th>Staff</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => {
              const style = TX_STYLE[tx.type];
              return (
                <tr key={tx.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {new Date(tx.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <span style={{ ...{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: style.bg, color: style.color, letterSpacing: '0.05em', textTransform: 'uppercase' as const } }}>
                      {style.label}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                    {tx.patronName ?? tx.tableCode ?? '—'}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{fmt(tx.amount)}</td>
                  <td style={{ fontSize: 12 }}>{tx.staffName}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 600, color: tx.approved ? 'var(--success)' : 'var(--warning)' }}>
                      {tx.approved ? '✓ Approved' : '⏳ Pending'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 260 }}>{tx.notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

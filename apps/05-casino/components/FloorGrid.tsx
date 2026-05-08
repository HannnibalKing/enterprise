'use client';

import { useState } from 'react';
import type { FloorPosition, FloorSection, FloorStatus, GameType } from '@/lib/types';

interface Props { positions: FloorPosition[] }

const SECTIONS: { key: FloorSection | 'all'; label: string }[] = [
  { key: 'all',            label: 'All Sections'  },
  { key: 'grand_floor',    label: 'Grand Floor'   },
  { key: 'apex_high_limit',label: 'Apex High Limit'},
  { key: 'arcade',         label: 'The Arcade'    },
  { key: 'vip_slots',      label: 'VIP Slots'     },
];

const STATUSES: { key: FloorStatus | 'all'; label: string }[] = [
  { key: 'all',         label: 'All'         },
  { key: 'active',      label: 'Active'      },
  { key: 'idle',        label: 'Idle'        },
  { key: 'maintenance', label: 'Maintenance' },
];

const GAME_ICONS: Record<GameType, string> = {
  blackjack:       '♠',
  baccarat:        '♥',
  roulette:        '◎',
  craps:           '⬡',
  three_card_poker:'♣',
  pai_gow:         '⚑',
  texas_holdem:    '♦',
  slot:            '⟳',
};

const STATUS_COLOR: Record<FloorStatus, string> = {
  active:      '#27ae60',
  idle:        '#6b6b82',
  maintenance: '#d4900a',
  closed:      '#c0392b',
};

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n}`;

const VALID_STATUSES: FloorStatus[] = ['active', 'idle', 'maintenance', 'closed'];

function PositionCard({ pos, onStatusChange }: {
  pos: FloorPosition;
  onStatusChange: (id: string, status: FloorStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isHighLimit = pos.section === 'apex_high_limit';
  const isVip = pos.section === 'vip_slots';

  async function handleChange(status: FloorStatus) {
    setOpen(false);
    if (status === pos.status) return;
    setLoading(true);
    try {
      await fetch(`/api/floor/${pos.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      onStatusChange(pos.id, status);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${pos.status === 'active' && isHighLimit ? 'var(--border-gold)' : 'var(--border)'}`,
      borderRadius: 10, padding: '14px 16px',
      boxShadow: pos.status === 'active' && isHighLimit
        ? '0 0 12px var(--gold-glow)' : 'none',
      position: 'relative', transition: 'all 0.2s',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 18, opacity: 0.8 }}>{GAME_ICONS[pos.gameType]}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', letterSpacing: '0.03em' }}>{pos.code}</span>
        </div>
        <button
          disabled={loading}
          onClick={() => setOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '2px 0',
          }}
        >
          <span className={`status-dot ${pos.status}`} style={{ background: STATUS_COLOR[pos.status] }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLOR[pos.status], textTransform: 'capitalize' }}>
            {loading ? '…' : pos.status}
          </span>
        </button>
      </div>

      {/* Status dropdown */}
      {open && (
        <div style={{
          position: 'absolute', right: 12, top: 38, zIndex: 50,
          background: 'var(--surface3)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 6, minWidth: 120,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {VALID_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => handleChange(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                width: '100%', padding: '7px 10px', borderRadius: 5, border: 'none',
                background: s === pos.status ? 'var(--gold-dim)' : 'none',
                color: s === pos.status ? 'var(--gold)' : 'var(--text-soft)',
                fontSize: 12, fontWeight: s === pos.status ? 700 : 500,
                cursor: 'pointer', textTransform: 'capitalize',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLOR[s], display: 'inline-block' }} />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Game label */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
        {pos.label}
        {pos.dealerName && <span style={{ color: 'var(--text-soft)' }}> · {pos.dealerName}</span>}
      </div>

      {/* Occupancy dots */}
      {pos.gameType !== 'slot' && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
          {Array.from({ length: pos.seats }).map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < pos.occupied ? 'var(--gold)' : 'var(--border)',
            }} />
          ))}
        </div>
      )}

      {pos.gameType === 'slot' && (
        <div style={{ display: 'flex', gap: 3, marginBottom: 10, flexWrap: 'wrap' }}>
          {Array.from({ length: Math.min(pos.seats, 16) }).map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i < pos.occupied ? 'var(--gold)' : 'var(--border)',
            }} />
          ))}
          {pos.seats > 16 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{pos.seats - 16}</span>}
        </div>
      )}

      {/* Bet range / denomination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
        <span>
          {pos.gameType === 'slot'
            ? `$${pos.denomination} denom · ${pos.occupied}/${pos.seats}`
            : `$${pos.minBet.toLocaleString()}–$${pos.maxBet.toLocaleString()} · ${pos.occupied}/${pos.seats}`
          }
        </span>
        {pos.shiftGGR > 0 && (
          <span style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{fmt(pos.shiftGGR)}</span>
        )}
      </div>

      {/* Progressive jackpot */}
      {pos.isJackpotEligible && pos.progressiveAmount && (
        <div style={{
          marginTop: 8, padding: '4px 8px', borderRadius: 5,
          background: 'linear-gradient(90deg, rgba(201,162,39,0.15) 0%, rgba(240,204,74,0.08) 100%)',
          border: '1px solid var(--border-gold)',
          fontSize: 11, color: 'var(--gold)', fontWeight: 700, textAlign: 'center',
        }}>
          JACKPOT: {fmt(pos.progressiveAmount)}
        </div>
      )}
    </div>
  );
}

export default function FloorGrid({ positions: initial }: Props) {
  const [positions, setPositions] = useState(initial);
  const [section, setSection]   = useState<FloorSection | 'all'>('all');
  const [status, setStatus]     = useState<FloorStatus | 'all'>('all');

  function handleStatusChange(id: string, s: FloorStatus) {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, status: s } : p));
  }

  const filtered = positions.filter(p =>
    (section === 'all' || p.section === section) &&
    (status  === 'all' || p.status  === status)
  );

  const activeCount = positions.filter(p => p.status === 'active').length;
  const totalGGR    = positions.reduce((s, p) => s + p.shiftGGR, 0);

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        {[
          { label: 'Total Shift GGR', value: `$${(totalGGR / 1000).toFixed(0)}K` },
          { label: 'Active Positions', value: `${activeCount} / ${positions.length}` },
          { label: 'Showing', value: `${filtered.length} positions` },
        ].map(k => (
          <div key={k.label} style={{ padding: '10px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 2 }}>{k.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {SECTIONS.map(s => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: '1px solid',
              borderColor: section === s.key ? 'var(--gold)' : 'var(--border)',
              background: section === s.key ? 'var(--gold-dim)' : 'var(--surface2)',
              color: section === s.key ? 'var(--gold)' : 'var(--text-muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {s.label}
          </button>
        ))}
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        {STATUSES.map(s => (
          <button
            key={s.key}
            onClick={() => setStatus(s.key)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: '1px solid',
              borderColor: status === s.key ? 'var(--gold)' : 'var(--border)',
              background: status === s.key ? 'var(--gold-dim)' : 'var(--surface2)',
              color: status === s.key ? 'var(--gold)' : 'var(--text-muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {filtered.map(pos => (
          <PositionCard key={pos.id} pos={pos} onStatusChange={handleStatusChange} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>
          No positions match the selected filters.
        </div>
      )}
    </div>
  );
}

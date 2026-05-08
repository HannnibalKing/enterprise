import { store } from './store';
import type { FloorStatus, FloorSection, PatronTier } from './types';

/* ── Dashboard ───────────────────────────────────────────────────────────── */
export function getDashboardData() {
  const positions = [...store.positions.values()];
  const patrons   = [...store.patrons.values()];

  const todayGGR = positions.reduce((s, p) => s + p.shiftGGR, 0);
  const activeTables = positions.filter(p => p.status === 'active').length;
  const totalTables  = positions.length;
  const vipsOnProperty = patrons.filter(p => p.onProperty);
  const totalCompBalance = patrons.reduce((s, p) => s + p.compBalance, 0);

  const last7 = store.dailyRevenue.slice(-7);

  const sections: Record<FloorSection, { label: string; ggr: number; active: number; total: number }> = {
    grand_floor:    { label: 'Grand Floor',      ggr: 0, active: 0, total: 0 },
    apex_high_limit:{ label: 'Apex High Limit',  ggr: 0, active: 0, total: 0 },
    arcade:         { label: 'The Arcade',        ggr: 0, active: 0, total: 0 },
    vip_slots:      { label: 'VIP Slots',         ggr: 0, active: 0, total: 0 },
  };
  for (const p of positions) {
    sections[p.section].ggr   += p.shiftGGR;
    sections[p.section].total += 1;
    if (p.status === 'active') sections[p.section].active += 1;
  }

  return { todayGGR, activeTables, totalTables, vipsOnProperty, totalCompBalance, last7, sections };
}

/* ── Floor ───────────────────────────────────────────────────────────────── */
export function getFloorData() {
  const all = [...store.positions.values()];
  const sectionMap: Record<FloorSection, typeof all> = {
    grand_floor:     all.filter(p => p.section === 'grand_floor'),
    apex_high_limit: all.filter(p => p.section === 'apex_high_limit'),
    arcade:          all.filter(p => p.section === 'arcade'),
    vip_slots:       all.filter(p => p.section === 'vip_slots'),
  };

  const totalGGR     = all.reduce((s, p) => s + p.shiftGGR, 0);
  const activeCount  = all.filter(p => p.status === 'active').length;
  const totalOccupied = all.reduce((s, p) => s + p.occupied, 0);
  const totalSeats    = all.reduce((s, p) => s + p.seats, 0);

  return { positions: all, sectionMap, totalGGR, activeCount, totalPositions: all.length, totalOccupied, totalSeats };
}

export function updatePositionStatus(id: string, status: FloorStatus): boolean {
  const pos = store.positions.get(id);
  if (!pos) return false;
  store.positions.set(id, { ...pos, status });
  return true;
}

/* ── Patrons ─────────────────────────────────────────────────────────────── */
export function getPatrons(opts?: {
  tier?: PatronTier;
  onProperty?: boolean;
  search?: string;
  sortBy?: 'lifetimeValue' | 'ytdValue' | 'avgDailyTheoretical' | 'lastVisitDate';
}) {
  let list = [...store.patrons.values()];
  if (opts?.tier)       list = list.filter(p => p.tier === opts.tier);
  if (opts?.onProperty !== undefined) list = list.filter(p => p.onProperty === opts.onProperty);
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    list = list.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.memberId.toLowerCase().includes(q)
    );
  }
  const sort = opts?.sortBy ?? 'lifetimeValue';
  if (sort === 'lastVisitDate') {
    list.sort((a, b) => b.lastVisitDate.localeCompare(a.lastVisitDate));
  } else {
    list.sort((a, b) => (b[sort] as number) - (a[sort] as number));
  }
  return list;
}

export function getPatronById(id: string) {
  const patron = store.patrons.get(id);
  if (!patron) return null;
  const visits = store.patronVisits
    .filter(v => v.patronId === id)
    .sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate));
  const host = store.users.get(patron.hostId);
  return { patron, visits, host: host ?? null };
}

/* ── Revenue ─────────────────────────────────────────────────────────────── */
export function getRevenueData() {
  const daily   = store.dailyRevenue;
  const monthly = store.monthlyRevenue;

  const today    = daily[daily.length - 1];
  const yesterday= daily[daily.length - 2];
  const last30   = daily.slice(-30);

  const bacTotal = last30.reduce((s, d) => s + d.baccaratGGR,   0);
  const bjTotal  = last30.reduce((s, d) => s + d.blackjackGGR,  0);
  const rltTotal = last30.reduce((s, d) => s + d.rouletteGGR,   0);
  const othTotal = last30.reduce((s, d) => s + d.otherGGR,      0);
  const gameMix  = [
    { name: 'Baccarat',   value: bacTotal },
    { name: 'Blackjack',  value: bjTotal  },
    { name: 'Roulette',   value: rltTotal },
    { name: 'Other',      value: othTotal  },
  ];

  return { daily, monthly, today, yesterday, last30, gameMix };
}

/* ── Cage ────────────────────────────────────────────────────────────────── */
export function getCageData() {
  const chipStock = store.chipStock;
  const transactions = [...store.cageTransactions].sort(
    (a, b) => b.timestamp.localeCompare(a.timestamp)
  );
  const totalChipValue = chipStock.reduce((s, c) => s + c.totalValue, 0);
  const patronMap = store.patrons;
  const staffMap  = store.users;

  const txEnriched = transactions.map(tx => ({
    ...tx,
    patronName: tx.patronId ? (() => {
      const p = patronMap.get(tx.patronId!);
      return p ? `${p.firstName} ${p.lastName}` : null;
    })() : null,
    staffName: staffMap.get(tx.staffId)?.name ?? tx.staffId,
  }));

  return { chipStock, transactions: txEnriched, totalChipValue };
}

export type GameType = 'blackjack' | 'baccarat' | 'roulette' | 'craps' | 'three_card_poker' | 'pai_gow' | 'texas_holdem' | 'slot';
export type FloorStatus = 'active' | 'idle' | 'maintenance' | 'closed';
export type FloorSection = 'grand_floor' | 'apex_high_limit' | 'arcade' | 'vip_slots';
export type PatronTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'noir';
export type StaffRole = 'director' | 'pit_boss' | 'host' | 'cage_supervisor' | 'analyst';
export type CageTxType = 'fill' | 'credit' | 'exchange' | 'marker' | 'redemption' | 'drop_count';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  role: StaffRole;
  title: string;
}

export interface FloorPosition {
  id: string;
  code: string;
  label: string;
  gameType: GameType;
  section: FloorSection;
  status: FloorStatus;
  dealerName?: string;
  minBet: number;
  maxBet: number;
  seats: number;
  occupied: number;
  shiftGGR: number;
  denomination?: number;
  isJackpotEligible?: boolean;
  progressiveAmount?: number;
}

export interface Patron {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  tier: PatronTier;
  hostId: string;
  onProperty: boolean;
  roomNumber?: string;
  checkInDate?: string;
  checkOutDate?: string;
  lifetimeValue: number;
  ytdValue: number;
  compBalance: number;
  lifetimeComps: number;
  visitCount: number;
  lastVisitDate: string;
  avgDailyTheoretical: number;
  preferredGames: GameType[];
  creditLine?: number;
  creditUsed?: number;
  tags: string[];
  notes: string;
  vipServices: string[];
  drinkPreference?: string;
  preferredRoomType?: string;
  joinDate: string;
}

export interface PatronVisit {
  id: string;
  patronId: string;
  arrivalDate: string;
  departureDate: string;
  durationDays: number;
  ggr: number;
  compsUsed: number;
  primaryGame: GameType;
  notes: string;
}

export interface DailyRevenue {
  date: string;
  tableGGR: number;
  slotGGR: number;
  totalGGR: number;
  tableHandle: number;
  slotHandle: number;
  tableHoldPct: number;
  slotHoldPct: number;
  baccaratGGR: number;
  blackjackGGR: number;
  rouletteGGR: number;
  otherGGR: number;
  headcount: number;
}

export interface MonthlyRevenue {
  month: string;   // 'YYYY-MM'
  label: string;
  tableGGR: number;
  slotGGR: number;
  totalGGR: number;
  tableHoldPct: number;
  slotHoldPct: number;
}

export interface ChipStock {
  denomination: number;
  label: string;
  color: string;
  count: number;
  totalValue: number;
}

export interface CageTransaction {
  id: string;
  type: CageTxType;
  tableCode?: string;
  amount: number;
  staffId: string;
  patronId?: string;
  timestamp: string;
  approved: boolean;
  notes: string;
}

export type AssetClass = 'equity' | 'fixed_income' | 'etf' | 'forex' | 'commodity' | 'derivative';
export type OrderStatus = 'filled' | 'pending' | 'partial' | 'cancelled' | 'rejected';
export type OrderSide = 'buy' | 'sell';
export type RiskLevel = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type Sector = 'technology' | 'financials' | 'healthcare' | 'energy' | 'consumer' | 'industrials' | 'materials' | 'real_estate' | 'utilities' | 'multi_asset';
export type TraderRole = 'head_of_trading' | 'portfolio_manager' | 'risk_officer' | 'quant_analyst' | 'compliance_officer';

export interface TraderUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  role: TraderRole;
  title: string;
}

export interface Position {
  id: string;
  ticker: string;
  name: string;
  assetClass: AssetClass;
  sector: Sector;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  dailyChange: number;
  dailyChangePct: number;
  weight: number;          // % of portfolio
  beta?: number;
  currency: string;
}

export interface Trade {
  id: string;
  timestamp: string;
  ticker: string;
  name: string;
  side: OrderSide;
  quantity: number;
  price: number;
  totalValue: number;
  status: OrderStatus;
  traderId: string;
  commission: number;
  notes: string;
}

export interface PortfolioSnapshot {
  date: string;
  aum: number;
  dailyPnL: number;
  dailyPnLPct: number;
}

export interface RiskAlert {
  id: string;
  level: RiskLevel;
  title: string;
  message: string;
  ticker?: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface PortfolioMetrics {
  totalAUM: number;
  cash: number;
  dailyPnL: number;
  dailyPnLPct: number;
  ytdPnL: number;
  ytdPnLPct: number;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLPct: number;
  sharpeRatio: number;
  beta: number;
  var95: number;       // 1-day 95% VaR (negative = loss)
  maxDrawdown: number; // negative %
  alpha: number;
  infoRatio: number;
}

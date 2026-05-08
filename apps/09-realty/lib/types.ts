export type UserRole = 'vp_operations'|'property_manager'|'leasing_agent'|'maintenance_manager'|'accountant';
export type PropertyType = 'office'|'retail'|'industrial'|'mixed_use'|'multifamily';
export type PropertyStatus = 'stabilized'|'lease_up'|'vacant'|'renovation';
export type LeaseStatus = 'active'|'pending'|'expiring_soon'|'expired'|'terminated';
export type WorkOrderStatus = 'open'|'in_progress'|'pending_parts'|'completed'|'cancelled';
export type WorkOrderPriority = 'critical'|'high'|'medium'|'low';

export interface RealtyUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
}
export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  type: PropertyType;
  status: PropertyStatus;
  totalSqFt: number;
  leasedSqFt: number;
  occupancyPct: number;
  units: number;
  leasedUnits: number;
  purchasePrice: number;
  currentValue: number;
  noi: number;
  capRate: number;
  yearBuilt: number;
  manager: string;
}
export interface Lease {
  id: string;
  propertyId: string;
  propertyName: string;
  tenantName: string;
  tenantIndustry: string;
  unit: string;
  sqFt: number;
  monthlyRent: number;
  annualRent: number;
  rentPsf: number;
  leaseStart: string;
  leaseEnd: string;
  status: LeaseStatus;
  depositHeld: number;
  escalationPct: number;
  options: string;
}
export interface WorkOrder {
  id: string;
  propertyId: string;
  propertyName: string;
  unit: string;
  category: string;
  description: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  reportedBy: string;
  assignedTo: string;
  createdDate: string;
  dueDate: string;
  completedDate?: string;
  estimatedCost: number;
  actualCost?: number;
}
export interface FinancialSnapshot {
  month: string;
  totalRevenue: number;
  totalExpenses: number;
  noi: number;
  occupancyPct: number;
  collectionRate: number;
}
export interface PortfolioMetrics {
  totalProperties: number;
  totalSqFt: number;
  occupiedSqFt: number;
  portfolioValue: number;
  annualNOI: number;
  weightedCapRate: number;
  avgOccupancy: number;
  leasesExpiring90d: number;
  openWorkOrders: number;
}

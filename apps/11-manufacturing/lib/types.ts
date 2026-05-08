export type UserRole = 'plant_director'|'production_manager'|'quality_engineer'|'maintenance_engineer'|'materials_planner';
export type LineStatus = 'running'|'idle'|'maintenance'|'fault'|'changeover';
export type EquipmentStatus = 'operational'|'degraded'|'offline'|'maintenance';
export type WorkOrderStatus = 'scheduled'|'in_progress'|'complete'|'on_hold';
export type QualityResult = 'pass'|'fail'|'conditional';
export type MaterialStatus = 'in_stock'|'low_stock'|'out_of_stock'|'on_order';

export interface MfgUser {
  id: string; name: string; email: string; role: UserRole; passwordHash: string;
}
export interface ProductionLine {
  id: string; name: string; product: string; status: LineStatus;
  targetUnitsPerHour: number; actualUnitsPerHour: number;
  oee: number; availability: number; performance: number; quality: number;
  shiftUnitsTarget: number; shiftUnitsActual: number;
  currentOperator: string; supervisor: string;
  lastDowntime?: string; downtimeMinutesToday: number;
}
export interface Equipment {
  id: string; name: string; type: string; lineId: string; lineName: string;
  status: EquipmentStatus; model: string; serialNo: string;
  installDate: string; lastPMDate: string; nextPMDate: string;
  totalRunHours: number; mtbf: number; mttr: number;
  alerts: string[]; criticalSpares: boolean;
}
export interface ProductionOrder {
  id: string; orderNo: string; product: string; sku: string;
  lineId: string; lineName: string;
  quantityOrdered: number; quantityProduced: number; quantityScrap: number;
  status: WorkOrderStatus;
  scheduledStart: string; scheduledEnd: string;
  actualStart?: string; actualEnd?: string;
  cycleTimeSec: number; targetCycleTimeSec: number;
}
export interface QualityCheck {
  id: string; orderId: string; product: string; lineId: string;
  checkType: string; checkDate: string; inspector: string;
  sampleSize: number; defects: number; defectRate: number;
  result: QualityResult; notes: string;
}
export interface Material {
  id: string; name: string; sku: string; category: string;
  onHandQty: number; reorderPoint: number; reorderQty: number;
  unitCost: number; supplier: string; leadTimeDays: number;
  status: MaterialStatus; lastReceivedDate: string; consumptionPerDay: number;
  daysOfSupply: number;
}
export interface ProductionSnapshot {
  hour: string; unitsProduced: number; scrapRate: number; oee: number;
}
export interface PlantMetrics {
  totalLines: number; runningLines: number; plantOEE: number;
  unitsToday: number; scrapToday: number; scrapRatePct: number;
  activeWorkOrders: number; openQualityIssues: number; criticalMaterials: number;
  plannedDowntimeToday: number; unplannedDowntimeToday: number;
}

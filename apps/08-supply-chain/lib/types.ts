export type TransportMode  = 'ocean'|'air'|'ground'|'rail';
export type ShipmentStatus = 'in_transit'|'at_port'|'customs'|'delivered'|'delayed'|'exception';
export type OrderStatus    = 'draft'|'confirmed'|'in_production'|'shipped'|'delivered'|'cancelled';
export type UserRole       = 'chief_supply_officer'|'logistics_director'|'procurement_manager'|'warehouse_manager'|'analyst';

export interface ChainUser {
  id:           string;
  name:         string;
  email:        string;
  avatar:       string;
  role:         UserRole;
  title:        string;
  passwordHash: string;
}
export interface Shipment {
  id:            string;
  trackingNo:    string;
  origin:        string;
  destination:   string;
  mode:          TransportMode;
  status:        ShipmentStatus;
  carrier:       string;
  containers:    number;
  weightKg:      number;
  valueUSD:      number;
  departureDate: string;
  etaDate:       string;
  lastUpdate:    string;
  lastLocation:  string;
  contents:      string;
  supplierId:    string;
  poNumber:      string;
  daysDelay:     number;
  co2Kg:         number;
}
export interface Warehouse {
  id:            string;
  name:          string;
  location:      string;
  country:       string;
  totalCapacitySqM: number;
  usedCapacitySqM:  number;
  totalSkus:     number;
  totalUnits:    number;
  valueUSD:      number;
  inboundToday:  number;
  outboundToday: number;
  fillPct:       number;
  manager:       string;
  type:          'distribution'|'fulfillment'|'cold_storage'|'bonded';
}
export interface Supplier {
  id:           string;
  name:         string;
  country:      string;
  category:     string;
  tier:         1|2|3;
  onTimeDeliveryPct: number;
  qualityScore: number;
  riskScore:    number; // 0-100, higher=riskier
  leadTimeDays: number;
  ytdSpendUSD:  number;
  activeOrders: number;
  certifications: string[];
  status:       'approved'|'probation'|'suspended';
  contactEmail: string;
}
export interface PurchaseOrder {
  id:          string;
  poNumber:    string;
  supplierId:  string;
  supplierName:string;
  status:      OrderStatus;
  items:       {sku:string;description:string;qty:number;unitPriceUSD:number;}[];
  totalValueUSD:number;
  orderDate:   string;
  requiredDate:string;
  etaDate:     string;
  warehouseId: string;
  notes:       string;
}
export interface SupplyAlert {
  id:        string;
  severity:  'critical'|'high'|'medium'|'low';
  category:  'shipment'|'inventory'|'supplier'|'compliance'|'system';
  title:     string;
  message:   string;
  entityId?: string;
  timestamp: string;
  acknowledged: boolean;
}
export interface ThroughputSnapshot {
  date:        string;
  shipmentsIn: number;
  shipmentsOut:number;
  ordersPlaced:number;
  ordersDelivered:number;
  avgTransitDays:number;
}
export interface GlobalMetrics {
  activeShipments:     number;
  inTransitValue:      number;
  delayedShipments:    number;
  onTimeDeliveryPct:   number;
  totalWarehouses:     number;
  totalInventoryValue: number;
  avgWarehouseFill:    number;
  activeSuppliers:     number;
  openOrders:          number;
  openOrdersValue:     number;
  co2Saved:            number;
  monthlyThroughputUSD:number;
}

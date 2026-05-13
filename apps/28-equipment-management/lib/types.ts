// Equipment Management types
export interface EquipmentAsset {
  id: string;
  name: string;
  serialNumber: string;
  type: string;
  manufacturer: string;
  purchaseDate: Date;
  installationDate: Date;
  location: string;
  status: "active" | "inactive" | "maintenance" | "decommissioned";
  depreciationSchedule: "straight-line" | "accelerated";
}

export interface MaintenanceSchedule {
  assetId: string;
  type: "preventive" | "corrective" | "predictive";
  frequency: string;
  lastServiceDate: Date;
  nextServiceDate: Date;
  estimatedCost: number;
  technician: string;
}

export interface AssetMetrics {
  totalAssets: number;
  activeAssets: number;
  utilizationRate: number;
  maintenanceCost: number;
  downtime: number;
}

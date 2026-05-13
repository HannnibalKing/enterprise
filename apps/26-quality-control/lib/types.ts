// Quality Control types
export interface QualityInspection {
  id: string;
  batchId: string;
  inspectionDate: Date;
  inspector: string;
  status: "pass" | "fail" | "rework" | "pending";
  defectsFound: number;
  remarks: string;
}

export interface Defect {
  id: string;
  inspectionId: string;
  type: string;
  severity: "minor" | "major" | "critical";
  location: string;
  correctionAction: string;
  correctionDate?: Date;
}

export interface QualityMetrics {
  passRate: number;
  defectRate: number;
  reworkRate: number;
  firstPassYield: number;
}

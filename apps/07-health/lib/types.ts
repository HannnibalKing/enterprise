export type DepartmentName = 'Emergency'|'ICU'|'Surgery'|'Cardiology'|'Oncology'|'Pediatrics'|'Radiology'|'General Medicine';
export type PatientStatus  = 'critical'|'serious'|'stable'|'discharge_ready'|'discharged';
export type StaffRole      = 'chief_medical_officer'|'department_head'|'attending_physician'|'nurse_manager'|'charge_nurse'|'specialist';
export type AlertSeverity  = 'critical'|'urgent'|'warning'|'info';
export type AlertType      = 'patient'|'equipment'|'staffing'|'capacity'|'medication'|'system';
export type BedStatus      = 'occupied'|'available'|'maintenance'|'reserved';

export interface StaffUser {
  id:         string;
  name:       string;
  email:      string;
  avatar:     string;
  role:       StaffRole;
  title:      string;
  department: DepartmentName;
  passwordHash: string;
}
export interface Department {
  id:            string;
  name:          DepartmentName;
  floor:         number;
  wing:          string;
  totalBeds:     number;
  occupiedBeds:  number;
  availableBeds: number;
  maintenanceBeds:number;
  headPhysician: string;
  nurseManager:  string;
  patientsToday: number;
  avgLOS:        number; // avg length of stay, days
  readmissionRate:number;
  patientSatisfaction:number;
  color:         string;
  icon:          string;
}
export interface Patient {
  id:          string;
  mrn:         string; // medical record number
  name:        string;
  age:         number;
  gender:      'M'|'F';
  department:  DepartmentName;
  room:        string;
  bed:         string;
  status:      PatientStatus;
  admitDate:   string;
  diagnosis:   string;
  physician:   string;
  insurance:   string;
  alerts:      string[];
  vitals: { hr:number; bp:string; temp:number; spo2:number; rr:number; };
}
export interface ERQueueEntry {
  id:        string;
  name:      string;
  age:       number;
  chief:     string; // chief complaint
  triage:    1|2|3|4|5;
  arrivalTime:string;
  waitMinutes:number;
  status:    'waiting'|'in_triage'|'in_treatment'|'boarding';
}
export interface HospitalAlert {
  id:        string;
  severity:  AlertSeverity;
  type:      AlertType;
  title:     string;
  message:   string;
  department?: DepartmentName;
  timestamp: string;
  acknowledged:boolean;
}
export interface CensusSnapshot {
  date:          string;
  totalCensus:   number;
  erVisits:      number;
  admissions:    number;
  discharges:    number;
  occupancyPct:  number;
}
export interface HospitalMetrics {
  totalBeds:         number;
  occupiedBeds:      number;
  occupancyPct:      number;
  availableBeds:     number;
  erQueueLength:     number;
  erAvgWaitMinutes:  number;
  criticalPatients:  number;
  plannedDischarges: number;
  staffOnDuty:       number;
  pendingOrders:     number;
  todayAdmissions:   number;
  todayDischarges:   number;
}

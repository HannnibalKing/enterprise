// ─── Domain types ───────────────────────────────────────────────────────────

export type Role = 'hr_admin' | 'manager' | 'employee';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  employeeId: string;
}

export interface Department {
  id: string;
  name: string;
  managerId: string | null;
  parentId: string | null;
  headcount: number;
  createdAt: string;
}

export interface Employee {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  departmentId: string;
  jobTitle: string;
  role: Role;
  managerId: string | null;
  startDate: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
}

export type LeaveType = 'annual' | 'sick' | 'parental' | 'unpaid' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  managerId: string | null;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  reviewNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  employeeId: string;
  annual: number;
  sick: number;
  used: Record<LeaveType, number>;
}

export interface OrgNode {
  employee: Omit<Employee, 'salary'>;
  reports: OrgNode[];
}

export interface AuthPayload {
  userId: string;
  employeeId: string;
  role: Role;
}

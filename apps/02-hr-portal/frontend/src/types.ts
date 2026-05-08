export type Role = 'hr_admin' | 'manager' | 'employee';
export type LeaveType = 'annual' | 'sick' | 'parental' | 'unpaid' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

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
  salary?: number;
  status: 'active' | 'inactive' | 'on_leave';
}

export interface Department {
  id: string;
  name: string;
  managerId: string | null;
  parentId: string | null;
  headcount: number;
  createdAt: string;
}

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
  employee: Employee;
  reports: OrgNode[];
}

export interface AuthPayload {
  userId: string;
  employeeId: string;
  role: Role;
  employee: Employee;
}

import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { Department, Employee, LeaveBalance, LeaveRequest, User } from './types';

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = new Map<string, User>();

// ─── Departments ─────────────────────────────────────────────────────────────
export const departments = new Map<string, Department>();

// ─── Employees ───────────────────────────────────────────────────────────────
export const employees = new Map<string, Employee>();

// ─── Leave requests ──────────────────────────────────────────────────────────
export const leaveRequests = new Map<string, LeaveRequest>();

// ─── Leave balances ──────────────────────────────────────────────────────────
export const leaveBalances = new Map<string, LeaveBalance>();

// ─── Seed ────────────────────────────────────────────────────────────────────
async function seed() {
  const pw = await bcrypt.hash('password123', 10);

  // Departments
  const deptEng: Department  = { id: 'dept-eng',     name: 'Engineering',   managerId: 'emp-alice',  parentId: null,       headcount: 4, createdAt: '2020-01-01T00:00:00.000Z' };
  const deptHR: Department   = { id: 'dept-hr',      name: 'Human Resources', managerId: 'emp-carol', parentId: null,      headcount: 2, createdAt: '2020-01-01T00:00:00.000Z' };
  const deptOps: Department  = { id: 'dept-ops',     name: 'Operations',    managerId: 'emp-dave',   parentId: null,       headcount: 3, createdAt: '2020-01-01T00:00:00.000Z' };
  const deptFE: Department   = { id: 'dept-fe',      name: 'Frontend',      managerId: 'emp-bob',    parentId: 'dept-eng', headcount: 2, createdAt: '2021-06-01T00:00:00.000Z' };
  [deptEng, deptHR, deptOps, deptFE].forEach((d) => departments.set(d.id, d));

  // Employees (salary only visible to HR admin)
  const empData: Employee[] = [
    { id: 'emp-alice', userId: 'usr-alice', firstName: 'Alice', lastName: 'Chen',    email: 'alice@company.com',  phone: '+1-555-0101', avatar: 'AC', departmentId: 'dept-eng', jobTitle: 'VP Engineering',  role: 'manager',   managerId: null,       startDate: '2019-03-15', salary: 145000, status: 'active' },
    { id: 'emp-bob',   userId: 'usr-bob',   firstName: 'Bob',   lastName: 'Torres',  email: 'bob@company.com',    phone: '+1-555-0102', avatar: 'BT', departmentId: 'dept-fe',  jobTitle: 'Lead Engineer',   role: 'manager',   managerId: 'emp-alice', startDate: '2020-07-01', salary: 125000, status: 'active' },
    { id: 'emp-carol', userId: 'usr-carol', firstName: 'Carol', lastName: 'Kim',     email: 'carol@company.com',  phone: '+1-555-0103', avatar: 'CK', departmentId: 'dept-hr',  jobTitle: 'HR Director',     role: 'hr_admin',  managerId: null,       startDate: '2018-11-20', salary: 115000, status: 'active' },
    { id: 'emp-dave',  userId: 'usr-dave',  firstName: 'Dave',  lastName: 'Patel',   email: 'dave@company.com',   phone: '+1-555-0104', avatar: 'DP', departmentId: 'dept-ops', jobTitle: 'Ops Manager',     role: 'manager',   managerId: null,       startDate: '2021-02-10', salary: 110000, status: 'active' },
    { id: 'emp-eva',   userId: 'usr-eva',   firstName: 'Eva',   lastName: 'Müller',  email: 'eva@company.com',    phone: '+1-555-0105', avatar: 'EM', departmentId: 'dept-fe',  jobTitle: 'Frontend Dev',    role: 'employee',  managerId: 'emp-bob',   startDate: '2022-04-18', salary: 92000,  status: 'active' },
    { id: 'emp-frank', userId: 'usr-frank', firstName: 'Frank', lastName: 'Olawale', email: 'frank@company.com',  phone: '+1-555-0106', avatar: 'FO', departmentId: 'dept-eng', jobTitle: 'Backend Dev',     role: 'employee',  managerId: 'emp-alice', startDate: '2022-09-05', salary: 95000,  status: 'active' },
    { id: 'emp-grace', userId: 'usr-grace', firstName: 'Grace', lastName: 'Liu',     email: 'grace@company.com',  phone: '+1-555-0107', avatar: 'GL', departmentId: 'dept-hr',  jobTitle: 'HR Specialist',   role: 'employee',  managerId: 'emp-carol', startDate: '2023-01-09', salary: 72000,  status: 'active' },
    { id: 'emp-henry', userId: 'usr-henry', firstName: 'Henry', lastName: 'Nakamura',email: 'henry@company.com', phone: '+1-555-0108', avatar: 'HN', departmentId: 'dept-ops', jobTitle: 'Ops Analyst',     role: 'employee',  managerId: 'emp-dave',  startDate: '2023-05-22', salary: 78000,  status: 'on_leave' },
    { id: 'emp-iris',  userId: 'usr-iris',  firstName: 'Iris',  lastName: 'Svensson',email: 'iris@company.com',  phone: '+1-555-0109', avatar: 'IS', departmentId: 'dept-ops', jobTitle: 'Ops Coordinator', role: 'employee',  managerId: 'emp-dave',  startDate: '2023-08-14', salary: 68000,  status: 'active' },
    { id: 'emp-jack',  userId: 'usr-jack',  firstName: 'Jack',  lastName: 'Brown',   email: 'jack@company.com',   phone: '+1-555-0110', avatar: 'JB', departmentId: 'dept-fe',  jobTitle: 'Junior Frontend',  role: 'employee', managerId: 'emp-bob',   startDate: '2024-01-15', salary: 65000,  status: 'active' },
  ];
  empData.forEach((e) => employees.set(e.id, e));

  // Users (auth accounts)
  const userSeeds: Array<{ id: string; email: string; employeeId: string; role: Employee['role'] }> = [
    { id: 'usr-alice', email: 'alice@company.com', employeeId: 'emp-alice', role: 'manager' },
    { id: 'usr-bob',   email: 'bob@company.com',   employeeId: 'emp-bob',   role: 'manager' },
    { id: 'usr-carol', email: 'carol@company.com', employeeId: 'emp-carol', role: 'hr_admin' },
    { id: 'usr-dave',  email: 'dave@company.com',  employeeId: 'emp-dave',  role: 'manager' },
    { id: 'usr-eva',   email: 'eva@company.com',   employeeId: 'emp-eva',   role: 'employee' },
    { id: 'usr-frank', email: 'frank@company.com', employeeId: 'emp-frank', role: 'employee' },
    { id: 'usr-grace', email: 'grace@company.com', employeeId: 'emp-grace', role: 'employee' },
    { id: 'usr-henry', email: 'henry@company.com', employeeId: 'emp-henry', role: 'employee' },
    { id: 'usr-iris',  email: 'iris@company.com',  employeeId: 'emp-iris',  role: 'employee' },
    { id: 'usr-jack',  email: 'jack@company.com',  employeeId: 'emp-jack',  role: 'employee' },
  ];
  userSeeds.forEach(({ id, email, employeeId, role }) => {
    users.set(id, { id, email, passwordHash: pw, role, employeeId });
  });

  // Leave balances
  empData.forEach((e) => {
    leaveBalances.set(e.id, {
      employeeId: e.id,
      annual: 20,
      sick: 10,
      used: { annual: 0, sick: 0, parental: 0, unpaid: 0, other: 0 },
    });
  });

  // Sample leave requests
  const now = new Date();
  const sampleLeave: LeaveRequest[] = [
    {
      id: uuid(), employeeId: 'emp-eva', managerId: 'emp-bob', type: 'annual',
      startDate: '2025-08-11', endDate: '2025-08-15', days: 5,
      reason: 'Family vacation', status: 'pending', reviewNote: '',
      createdAt: now.toISOString(), updatedAt: now.toISOString(),
    },
    {
      id: uuid(), employeeId: 'emp-henry', managerId: 'emp-dave', type: 'sick',
      startDate: '2025-07-28', endDate: '2025-08-01', days: 5,
      reason: 'Medical procedure recovery', status: 'approved', reviewNote: 'Get well soon!',
      createdAt: new Date(now.getTime() - 86400000 * 10).toISOString(),
      updatedAt: new Date(now.getTime() - 86400000 * 8).toISOString(),
    },
    {
      id: uuid(), employeeId: 'emp-frank', managerId: 'emp-alice', type: 'annual',
      startDate: '2025-09-01', endDate: '2025-09-05', days: 5,
      reason: 'Travel', status: 'pending', reviewNote: '',
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      updatedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
  ];
  sampleLeave.forEach((l) => leaveRequests.set(l.id, l));
}

seed().catch(console.error);

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function getUserByEmail(email: string): User | undefined {
  return [...users.values()].find((u) => u.email === email);
}

export function getEmployeeById(id: string): Employee | undefined {
  return employees.get(id);
}

export function sanitizeEmployee(emp: Employee, requestorRole: string): Omit<Employee, 'salary'> | Employee {
  if (requestorRole === 'hr_admin') return emp;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { salary: _, ...safe } = emp;
  return safe as Omit<Employee, 'salary'>;
}

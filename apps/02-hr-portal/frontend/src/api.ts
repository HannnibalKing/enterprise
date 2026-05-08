import { AuthPayload, Department, Employee, LeaveBalance, LeaveRequest, OrgNode } from './types';

const BASE = '/api';

function token() { return localStorage.getItem('hr_token') ?? ''; }

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) => req<{ token: string; employee: Employee }>('POST', '/auth/login', { email, password }),
  me: () => req<AuthPayload>('GET', '/auth/me'),

  // Employees
  getEmployees: () => req<Employee[]>('GET', '/employees'),
  searchEmployees: (q: string) => req<Employee[]>('GET', `/employees/search?q=${encodeURIComponent(q)}`),
  getEmployee: (id: string) => req<Employee>('GET', `/employees/${id}`),
  createEmployee: (data: Partial<Employee> & { password?: string }) => req<Employee>('POST', '/employees', data),
  updateEmployee: (id: string, data: Partial<Employee>) => req<Employee>('PATCH', `/employees/${id}`, data),
  deleteEmployee: (id: string) => req<void>('DELETE', `/employees/${id}`),

  // Departments
  getDepartments: () => req<Department[]>('GET', '/departments'),
  getDepartment: (id: string) => req<Department & { members: Employee[] }>('GET', `/departments/${id}`),
  createDepartment: (data: Partial<Department>) => req<Department>('POST', '/departments', data),
  updateDepartment: (id: string, data: Partial<Department>) => req<Department>('PATCH', `/departments/${id}`, data),
  deleteDepartment: (id: string) => req<void>('DELETE', `/departments/${id}`),

  // Leave
  getLeave: () => req<LeaveRequest[]>('GET', '/leave'),
  getLeaveBalances: (empId: string) => req<LeaveBalance>('GET', `/leave/balances/${empId}`),
  submitLeave: (data: Partial<LeaveRequest>) => req<LeaveRequest>('POST', '/leave', data),
  reviewLeave: (id: string, status: 'approved' | 'rejected', reviewNote?: string) => req<LeaveRequest>('PATCH', `/leave/${id}/review`, { status, reviewNote }),
  cancelLeave: (id: string) => req<LeaveRequest>('PATCH', `/leave/${id}/cancel`, {}),

  // Org chart
  getOrg: () => req<OrgNode[]>('GET', '/org'),
};

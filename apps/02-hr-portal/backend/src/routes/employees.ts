import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import { employees, users, departments, leaveBalances, sanitizeEmployee } from '../store';
import { authMiddleware, requireRole } from '../auth';
import { Employee, Role } from '../types';

const router = Router();
router.use(authMiddleware);

// GET /api/employees  — list (salary hidden unless hr_admin)
router.get('/', (req, res) => {
  const role = req.user!.role;
  const list = [...employees.values()].map((e) => sanitizeEmployee(e, role));
  res.json(list);
});

// GET /api/employees/search?q=...
router.get('/search', (req, res) => {
  const q = String(req.query.q ?? '').toLowerCase();
  const role = req.user!.role;
  const results = [...employees.values()]
    .filter((e) => `${e.firstName} ${e.lastName} ${e.email} ${e.jobTitle}`.toLowerCase().includes(q))
    .map((e) => sanitizeEmployee(e, role));
  res.json(results);
});

// GET /api/employees/:id
router.get('/:id', (req, res) => {
  const emp = employees.get(req.params.id);
  if (!emp) { res.status(404).json({ error: 'Not found' }); return; }
  // Own record, manager of this employee, or hr_admin
  const { employeeId, role } = req.user!;
  if (role !== 'hr_admin' && emp.id !== employeeId && emp.managerId !== employeeId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  res.json(sanitizeEmployee(emp, role));
});

// POST /api/employees  (hr_admin only)
router.post('/', requireRole('hr_admin'), async (req, res) => {
  const data = req.body as Partial<Employee> & { password?: string };
  if (!data.firstName || !data.lastName || !data.email || !data.departmentId) {
    res.status(400).json({ error: 'firstName, lastName, email, departmentId required' }); return;
  }
  const empId = uuid();
  const usrId = uuid();
  const emp: Employee = {
    id: empId, userId: usrId,
    firstName: data.firstName, lastName: data.lastName,
    email: data.email.toLowerCase(), phone: data.phone ?? '',
    avatar: `${data.firstName[0]}${data.lastName[0]}`.toUpperCase(),
    departmentId: data.departmentId,
    jobTitle: data.jobTitle ?? 'Employee',
    role: (data.role as Role) ?? 'employee',
    managerId: data.managerId ?? null,
    startDate: data.startDate ?? new Date().toISOString().slice(0, 10),
    salary: data.salary ?? 0,
    status: 'active',
  };
  employees.set(empId, emp);

  const hash = await bcrypt.hash(data.password ?? 'Welcome123!', 10);
  users.set(usrId, { id: usrId, email: emp.email, passwordHash: hash, role: emp.role, employeeId: empId });

  // Update department headcount
  const dept = departments.get(emp.departmentId);
  if (dept) departments.set(dept.id, { ...dept, headcount: dept.headcount + 1 });

  // Init leave balance
  leaveBalances.set(empId, { employeeId: empId, annual: 20, sick: 10, used: { annual: 0, sick: 0, parental: 0, unpaid: 0, other: 0 } });

  res.status(201).json(emp);
});

// PATCH /api/employees/:id  (hr_admin or own record for limited fields)
router.patch('/:id', (req, res) => {
  const emp = employees.get(req.params.id);
  if (!emp) { res.status(404).json({ error: 'Not found' }); return; }

  const { employeeId, role } = req.user!;
  const isOwn = emp.id === employeeId;
  const isAdmin = role === 'hr_admin';

  if (!isAdmin && !isOwn) { res.status(403).json({ error: 'Forbidden' }); return; }

  // Non-admins can only update phone
  const { phone, jobTitle, departmentId, managerId, salary, status, firstName, lastName } = req.body as Partial<Employee>;
  const patch: Partial<Employee> = isAdmin
    ? { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(jobTitle && { jobTitle }), ...(departmentId && { departmentId }), ...(managerId !== undefined && { managerId }), ...(salary !== undefined && { salary }), ...(status && { status }), ...(phone && { phone }) }
    : { ...(phone && { phone }) };

  const updated = { ...emp, ...patch };
  employees.set(emp.id, updated);
  res.json(sanitizeEmployee(updated, role));
});

// DELETE /api/employees/:id  (hr_admin only)
router.delete('/:id', requireRole('hr_admin'), (req, res) => {
  if (!employees.has(req.params.id)) { res.status(404).json({ error: 'Not found' }); return; }
  employees.delete(req.params.id);
  res.status(204).send();
});

export default router;

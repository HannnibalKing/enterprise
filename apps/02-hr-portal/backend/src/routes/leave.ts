import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { leaveRequests, leaveBalances, employees } from '../store';
import { authMiddleware, requireRole } from '../auth';
import { LeaveRequest, LeaveStatus, LeaveType } from '../types';

const router = Router();
router.use(authMiddleware);

function calcDays(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

// GET /api/leave  — own requests; managers see reports'; hr_admin sees all
router.get('/', (req, res) => {
  const { employeeId, role } = req.user!;
  let list = [...leaveRequests.values()];
  if (role === 'employee') {
    list = list.filter((l) => l.employeeId === employeeId);
  } else if (role === 'manager') {
    // See own requests + direct reports
    const directReportIds = [...employees.values()]
      .filter((e) => e.managerId === employeeId)
      .map((e) => e.id);
    list = list.filter((l) => l.employeeId === employeeId || directReportIds.includes(l.employeeId));
  }
  res.json(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

// GET /api/leave/balances/:employeeId
router.get('/balances/:employeeId', (req, res) => {
  const { employeeId: callerEmpId, role } = req.user!;
  const targetEmpId = req.params.employeeId;
  if (role === 'employee' && callerEmpId !== targetEmpId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const balance = leaveBalances.get(targetEmpId);
  if (!balance) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(balance);
});

// GET /api/leave/:id
router.get('/:id', (req, res) => {
  const lr = leaveRequests.get(req.params.id);
  if (!lr) { res.status(404).json({ error: 'Not found' }); return; }
  const { employeeId, role } = req.user!;
  if (role === 'employee' && lr.employeeId !== employeeId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  res.json(lr);
});

// POST /api/leave  — submit a request
router.post('/', (req, res) => {
  const { employeeId } = req.user!;
  const { type, startDate, endDate, reason } = req.body as Partial<LeaveRequest>;
  if (!type || !startDate || !endDate) {
    res.status(400).json({ error: 'type, startDate, endDate required' }); return;
  }
  const emp = employees.get(employeeId);
  const days = calcDays(startDate, endDate);
  const lr: LeaveRequest = {
    id: uuid(), employeeId, managerId: emp?.managerId ?? null,
    type: type as LeaveType, startDate, endDate, days,
    reason: reason ?? '', status: 'pending', reviewNote: '',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  leaveRequests.set(lr.id, lr);
  res.status(201).json(lr);
});

// PATCH /api/leave/:id/review  — approve/reject (manager or hr_admin)
router.patch('/:id/review', requireRole('manager', 'hr_admin'), (req, res) => {
  const lr = leaveRequests.get(req.params.id);
  if (!lr) { res.status(404).json({ error: 'Not found' }); return; }
  if (lr.status !== 'pending') { res.status(409).json({ error: 'Already reviewed' }); return; }

  const { status, reviewNote } = req.body as { status: LeaveStatus; reviewNote?: string };
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400).json({ error: 'status must be approved or rejected' }); return;
  }

  const updated: LeaveRequest = { ...lr, status, reviewNote: reviewNote ?? '', updatedAt: new Date().toISOString() };
  leaveRequests.set(lr.id, updated);

  // Deduct balance on approval
  if (status === 'approved') {
    const bal = leaveBalances.get(lr.employeeId);
    if (bal) {
      const used = { ...bal.used, [lr.type]: (bal.used[lr.type] ?? 0) + lr.days };
      leaveBalances.set(lr.employeeId, { ...bal, used });
    }
  }
  res.json(updated);
});

// PATCH /api/leave/:id/cancel  — employee cancels own pending request
router.patch('/:id/cancel', (req, res) => {
  const lr = leaveRequests.get(req.params.id);
  if (!lr) { res.status(404).json({ error: 'Not found' }); return; }
  if (lr.employeeId !== req.user!.employeeId && req.user!.role !== 'hr_admin') {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  if (lr.status !== 'pending') { res.status(409).json({ error: 'Cannot cancel non-pending request' }); return; }
  const updated = { ...lr, status: 'cancelled' as LeaveStatus, updatedAt: new Date().toISOString() };
  leaveRequests.set(lr.id, updated);
  res.json(updated);
});

export default router;

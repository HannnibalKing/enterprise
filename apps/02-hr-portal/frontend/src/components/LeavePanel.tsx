import React, { useState } from 'react';
import { LeaveRequest, LeaveBalance, Employee, Role, LeaveType } from '../types';
import { api } from '../api';

const TYPE_LABELS: Record<string, string> = { annual: 'Annual', sick: 'Sick', parental: 'Parental', unpaid: 'Unpaid', other: 'Other' };

interface Props {
  leaves: LeaveRequest[];
  balance: LeaveBalance | null;
  employees: Employee[];
  currentRole: Role;
  currentEmployeeId: string;
  onRefresh: () => void;
}

export default function LeavePanel({ leaves, balance, employees, currentRole, currentEmployeeId, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ type: LeaveType; startDate: string; endDate: string; reason: string }>({ type: 'annual', startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const getEmployee = (id: string) => employees.find((e) => e.id === id);
  const pending = leaves.filter((l) => l.status === 'pending' && l.managerId === currentEmployeeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitLeave(form);
      setShowForm(false);
      setForm({ type: 'annual', startDate: '', endDate: '', reason: '' });
      onRefresh();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    await api.reviewLeave(id, status, reviewNote);
    setReviewId(null);
    setReviewNote('');
    onRefresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Balance card */}
      {balance && (
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Your Leave Balance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
            {(['annual', 'sick'] as const).map((type) => {
              const total = type === 'annual' ? balance.annual : balance.sick;
              const used = balance.used[type] ?? 0;
              const remaining = total - used;
              const pct = Math.round((used / total) * 100);
              return (
                <div key={type} style={{ background: 'var(--surface2)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{TYPE_LABELS[type]}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: remaining > 3 ? 'var(--success)' : 'var(--warning)' }}>{remaining}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>of {total} days</div>
                  <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: 'var(--border)' }}>
                    <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: remaining > 3 ? 'var(--success)' : 'var(--warning)', transition: 'width 0.3s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending approvals (manager/admin) */}
      {(currentRole === 'manager' || currentRole === 'hr_admin') && pending.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>⏳ Pending Approvals ({pending.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map((lr) => {
              const emp = getEmployee(lr.employeeId);
              return (
                <div key={lr.id} style={{ background: 'var(--surface2)', borderRadius: 8, padding: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{emp ? `${emp.firstName} ${emp.lastName}` : lr.employeeId}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {TYPE_LABELS[lr.type]} · {lr.startDate} → {lr.endDate} ({lr.days}d)
                      </div>
                      {lr.reason && <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>"{lr.reason}"</div>}
                    </div>
                    {reviewId === lr.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 200 }}>
                        <input value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Note (optional)" />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleReview(lr.id, 'approved')}>Approve</button>
                          <button className="btn-danger" style={{ flex: 1 }} onClick={() => handleReview(lr.id, 'rejected')}>Reject</button>
                          <button className="btn-secondary" onClick={() => setReviewId(null)}>×</button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn-secondary" onClick={() => setReviewId(lr.id)}>Review</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Request form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>My Requests</h3>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ New Request</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>TYPE</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LeaveType }))}>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div />
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>START DATE</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} required />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>END DATE</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>REASON</label>
            <textarea value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Optional reason…" style={{ minHeight: 60 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Request'}</button>
          </div>
        </form>
      )}

      {/* Leave history */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {leaves.map((lr) => {
          const emp = getEmployee(lr.employeeId);
          const isMine = lr.employeeId === currentEmployeeId;
          return (
            <div key={lr.id} className="card" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  {!isMine && emp && <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 2 }}>{emp.firstName} {emp.lastName}</div>}
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{TYPE_LABELS[lr.type]} Leave · {lr.days} day{lr.days !== 1 ? 's' : ''}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{lr.startDate} → {lr.endDate}</div>
                  {lr.reviewNote && <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2, fontStyle: 'italic' }}>"{lr.reviewNote}"</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge badge-${lr.status}`}>{lr.status}</span>
                  {isMine && lr.status === 'pending' && (
                    <button className="btn-secondary" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => api.cancelLeave(lr.id).then(onRefresh)}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {leaves.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No leave requests found.</p>}
      </div>
    </div>
  );
}

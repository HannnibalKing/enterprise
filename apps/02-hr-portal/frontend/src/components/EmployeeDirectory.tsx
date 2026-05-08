import React, { useState } from 'react';
import { Employee, Department, Role } from '../types';
import { api } from '../api';
import EmployeeCard from './EmployeeCard';

interface Props {
  employees: Employee[];
  departments: Department[];
  currentRole: Role;
  onRefresh: () => void;
}

export default function EmployeeDirectory({ employees: emps, departments, currentRole, onRefresh }: Props) {
  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    departmentId: '', jobTitle: '', role: 'employee' as Role,
    managerId: '', startDate: '', salary: 0, password: 'Welcome123!',
  });

  const deptMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));

  const filtered = emps.filter((e) => {
    const matchQ = !query || `${e.firstName} ${e.lastName} ${e.email} ${e.jobTitle}`.toLowerCase().includes(query.toLowerCase());
    const matchD = !deptFilter || e.departmentId === deptFilter;
    const matchS = !statusFilter || e.status === statusFilter;
    return matchQ && matchD && matchS;
  });

  const handleCreate = async (ev: React.FormEvent) => {
    ev.preventDefault();
    await api.createEmployee({ ...createForm, managerId: createForm.managerId || null });
    setShowCreate(false);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employee?')) return;
    await api.deleteEmployee(id);
    setSelected(null);
    onRefresh();
  };

  return (
    <div style={{ display: 'flex', gap: 20, height: '100%' }}>
      {/* List panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees…"
            style={{ flex: 1, minWidth: 180 }}
          />
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">All departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 130 }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
          </select>
          {currentRole === 'hr_admin' && (
            <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>+ Add Employee</button>
          )}
        </div>

        {/* Create form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>New Employee</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['First Name', 'firstName'], ['Last Name', 'lastName'], ['Email', 'email'], ['Phone', 'phone'], ['Job Title', 'jobTitle'], ['Start Date', 'startDate']].map(([label, key]) => (
                <div key={key}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{label.toUpperCase()}</label>
                  <input
                    type={key === 'startDate' ? 'date' : 'text'}
                    value={(createForm as Record<string, unknown>)[key] as string}
                    onChange={(e) => setCreateForm((f) => ({ ...f, [key]: e.target.value }))}
                    required={['firstName', 'lastName', 'email', 'departmentId'].includes(key)}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>DEPARTMENT</label>
                <select value={createForm.departmentId} onChange={(e) => setCreateForm((f) => ({ ...f, departmentId: e.target.value }))} required>
                  <option value="">Select…</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>ROLE</label>
                <select value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as Role }))}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr_admin">HR Admin</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>SALARY</label>
                <input type="number" value={createForm.salary} onChange={(e) => setCreateForm((f) => ({ ...f, salary: Number(e.target.value) }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>INITIAL PASSWORD</label>
                <input value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create Employee</button>
            </div>
          </form>
        )}

        {/* Employee grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, overflowY: 'auto' }}>
          {filtered.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} onClick={() => setSelected(emp)} />
          ))}
          {filtered.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No employees found.</p>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="card" style={{ width: 300, flexShrink: 0, alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Employee Detail</h3>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18 }}>×</button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 auto 10px' }}>
              {selected.avatar}
            </div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{selected.firstName} {selected.lastName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{selected.jobTitle}</div>
            <span className={`badge badge-${selected.status}`} style={{ marginTop: 6, display: 'inline-flex' }}>
              {selected.status.replace('_', ' ')}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Email', selected.email],
              ['Phone', selected.phone],
              ['Department', deptMap[selected.departmentId] ?? selected.departmentId],
              ['Start Date', selected.startDate],
              ...(selected.salary !== undefined ? [['Salary', `$${selected.salary.toLocaleString()}`]] : []),
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                <div style={{ fontSize: 13 }}>{value}</div>
              </div>
            ))}
          </div>

          {currentRole === 'hr_admin' && (
            <button className="btn-danger" style={{ width: '100%', marginTop: 8 }} onClick={() => handleDelete(selected.id)}>
              Delete Employee
            </button>
          )}
        </div>
      )}
    </div>
  );
}

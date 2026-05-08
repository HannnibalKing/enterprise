import React, { useCallback, useEffect, useState } from 'react';
import LoginPage from './components/LoginPage';
import EmployeeDirectory from './components/EmployeeDirectory';
import LeavePanel from './components/LeavePanel';
import OrgChart from './components/OrgChart';
import { AuthPayload, Department, Employee, LeaveBalance, LeaveRequest, OrgNode } from './types';
import { api } from './api';

type Tab = 'directory' | 'leave' | 'org';

export default function App() {
  const [auth, setAuth] = useState<AuthPayload | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<Tab>('directory');

  // Data state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [orgTree, setOrgTree] = useState<OrgNode[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('hr_token');
    if (t) {
      api.me().then((a) => { setAuth(a); setAuthChecked(true); }).catch(() => { localStorage.removeItem('hr_token'); setAuthChecked(true); });
    } else {
      setAuthChecked(true);
    }
  }, []);

  const loadData = useCallback(async (a: AuthPayload) => {
    const [emps, depts, lvs, org] = await Promise.all([
      api.getEmployees(),
      api.getDepartments(),
      api.getLeave(),
      api.getOrg(),
    ]);
    setEmployees(emps);
    setDepartments(depts);
    setLeaves(lvs);
    setOrgTree(org);

    const bal = await api.getLeaveBalances(a.employeeId).catch(() => null);
    setBalance(bal);
  }, []);

  useEffect(() => {
    if (auth) loadData(auth);
  }, [auth, loadData]);

  if (!authChecked) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading…</div>;

  if (!auth) return (
    <LoginPage onLogin={(emp, token) => {
      localStorage.setItem('hr_token', token);
      api.me().then((a) => setAuth(a));
    }} />
  );

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'directory', label: 'Directory', icon: '👥' },
    { id: 'leave', label: 'Leave', icon: '📅' },
    { id: 'org', label: 'Org Chart', icon: '🏗️' },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 18 }}>🏢</span>
          <span style={{ fontWeight: 700, fontSize: 15 }}>HR Portal</span>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, marginLeft: 16 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? 'var(--accent-light)' : 'none',
                  border: tab === t.id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                  color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)',
                  borderRadius: 6, padding: '4px 12px', fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
              {auth.employee.avatar}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1 }}>{auth.employee.firstName} {auth.employee.lastName}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1, marginTop: 2 }}>{auth.role.replace('_', ' ')}</div>
            </div>
          </div>
          <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => { localStorage.removeItem('hr_token'); setAuth(null); }}>Sign out</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {tab === 'directory' && (
          <EmployeeDirectory
            employees={employees}
            departments={departments}
            currentRole={auth.role}
            onRefresh={() => loadData(auth)}
          />
        )}
        {tab === 'leave' && (
          <LeavePanel
            leaves={leaves}
            balance={balance}
            employees={employees}
            currentRole={auth.role}
            currentEmployeeId={auth.employeeId}
            onRefresh={() => loadData(auth)}
          />
        )}
        {tab === 'org' && (
          <div style={{ maxWidth: 800 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Organization Chart</h2>
            <OrgChart nodes={orgTree} />
          </div>
        )}
      </div>
    </div>
  );
}

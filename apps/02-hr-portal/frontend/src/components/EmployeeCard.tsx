import React from 'react';
import { Employee } from '../types';

interface Props {
  employee: Employee;
  onClick?: () => void;
  compact?: boolean;
}

const STATUS_LABELS: Record<string, string> = { active: 'Active', inactive: 'Inactive', on_leave: 'On Leave' };

export default function EmployeeCard({ employee: emp, onClick, compact }: Props) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', transition: 'border-color 0.15s, transform 0.1s', ...(onClick ? { ':hover': {} } : {}) }}
      onMouseEnter={(e) => { if (onClick) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'; }}
      onMouseLeave={(e) => { if (onClick) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
    >
      <div style={{ display: 'flex', alignItems: compact ? 'center' : 'flex-start', gap: 14 }}>
        {/* Avatar */}
        <div style={{
          width: compact ? 36 : 48, height: compact ? 36 : 48, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: compact ? 12 : 16, fontWeight: 700, color: '#fff',
        }}>
          {emp.avatar}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: compact ? 13 : 14 }}>{emp.firstName} {emp.lastName}</span>
            <span className={`badge badge-${emp.status}`}>{STATUS_LABELS[emp.status]}</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{emp.jobTitle}</div>
          {!compact && (
            <>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{emp.email}</div>
              {emp.salary !== undefined && (
                <div style={{ color: 'var(--accent)', fontSize: 12, marginTop: 4 }}>
                  ${emp.salary.toLocaleString()} / yr
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

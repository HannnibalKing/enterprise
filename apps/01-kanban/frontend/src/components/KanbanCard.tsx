import React from 'react';
import { Card, User } from '../types';

const PRIORITY_CONFIG = {
  LOW:    { color: '#94a3b8', label: 'Low',    icon: '▽' },
  MEDIUM: { color: '#fbbf24', label: 'Medium', icon: '◇' },
  HIGH:   { color: '#f97316', label: 'High',   icon: '△' },
  URGENT: { color: '#f87171', label: 'Urgent', icon: '▲' },
};

const LABEL_COLORS: Record<string, string> = {
  auth: '#a371f7', backend: '#388bfd', frontend: '#3fb950', infra: '#f97316',
  design: '#ec4899', db: '#06b6d4', devops: '#fbbf24', ws: '#818cf8',
  files: '#4ade80', default: '#64748b',
};

interface Props {
  card: Card;
  users: User[];
  isDragging?: boolean;
  onClick: () => void;
}

function Avatar({ user }: { user: User }) {
  return (
    <div
      title={user.name}
      style={{
        width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0,
      }}
    >
      {user.avatar}
    </div>
  );
}

export default function KanbanCard({ card, users, isDragging, onClick }: Props) {
  const assignee = users.find((u) => u.id === card.assigneeId);
  const prio = PRIORITY_CONFIG[card.priority];
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
  const doneItems = card.checklist.filter((i) => i.done).length;

  return (
    <div
      onClick={onClick}
      style={{
        background: isDragging ? 'var(--surface2)' : 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 12px',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'box-shadow 0.15s, opacity 0.15s',
        userSelect: 'none',
      }}
    >
      {/* Labels */}
      {card.labels.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {card.labels.map((l) => (
            <span
              key={l}
              style={{
                fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                background: (LABEL_COLORS[l] ?? LABEL_COLORS.default) + '22',
                color: LABEL_COLORS[l] ?? LABEL_COLORS.default,
                border: `1px solid ${(LABEL_COLORS[l] ?? LABEL_COLORS.default)}44`,
              }}
            >
              {l}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: 8 }}>
        {card.title}
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Priority */}
          <span title={prio.label} style={{ fontSize: 11, color: prio.color }}>{prio.icon}</span>

          {/* Checklist badge */}
          {card.checklist.length > 0 && (
            <span style={{ fontSize: 11, color: doneItems === card.checklist.length ? 'var(--success)' : 'var(--text-muted)' }}>
              ✓ {doneItems}/{card.checklist.length}
            </span>
          )}

          {/* Due date */}
          {card.dueDate && (
            <span style={{ fontSize: 11, color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>
              📅 {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {assignee && <Avatar user={assignee} />}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, User, Column } from '../types';
import { api } from '../api';

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const ALL_LABELS = ['auth', 'backend', 'frontend', 'infra', 'design', 'db', 'devops', 'ws', 'files'];

interface Props {
  card: Card;
  columns: Column[];
  users: User[];
  onClose: () => void;
  onUpdate: (updated: Card) => void;
  onDelete: (cardId: string) => void;
}

export default function CardDetailModal({ card, columns, users, onClose, onUpdate, onDelete }: Props) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [priority, setPriority] = useState(card.priority);
  const [assigneeId, setAssigneeId] = useState(card.assigneeId ?? '');
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.slice(0, 10) : '');
  const [labels, setLabels] = useState<string[]>(card.labels);
  const [checklist, setChecklist] = useState(card.checklist);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleLabel = (l: string) =>
    setLabels((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);

  const addCheckItem = () => {
    if (!newCheckItem.trim()) return;
    setChecklist((prev) => [...prev, { id: crypto.randomUUID(), text: newCheckItem.trim(), done: false }]);
    setNewCheckItem('');
  };

  const toggleCheckItem = (id: string) =>
    setChecklist((prev) => prev.map((i) => i.id === id ? { ...i, done: !i.done } : i));

  const removeCheckItem = (id: string) =>
    setChecklist((prev) => prev.filter((i) => i.id !== id));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateCard(card.id, {
        title, description, priority, labels, checklist,
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
      });
      onUpdate(updated);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this card?')) return;
    await api.deleteCard(card.id);
    onDelete(card.id);
    onClose();
  };

  const col = columns.find((c) => c.id === card.columnId);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>in column <strong style={{ color: col?.color }}>{col?.title}</strong></div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ fontSize: 16, fontWeight: 600, padding: '6px 10px' }}
            />
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, padding: '0 4px' }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Description */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>DESCRIPTION</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a description…" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Priority */}
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>PRIORITY</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}>
                {PRIORITY_OPTIONS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>ASSIGNEE</label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>

            {/* Due date */}
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>DUE DATE</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>LABELS</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ALL_LABELS.map((l) => {
                const active = labels.includes(l);
                return (
                  <button
                    key={l}
                    onClick={() => toggleLabel(l)}
                    style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 5,
                      border: active ? 'none' : '1px solid var(--border)',
                      background: active ? 'var(--accent)' : 'transparent',
                      color: active ? '#fff' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
              CHECKLIST {checklist.length > 0 && `(${checklist.filter((i) => i.done).length}/${checklist.length})`}
            </label>
            {checklist.length > 0 && (
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 10px', marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {checklist.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleCheckItem(item.id)}
                      style={{ width: 14, height: 14, accentColor: 'var(--accent)', flexShrink: 0 }}
                    />
                    <span style={{ flex: 1, fontSize: 13, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--text-muted)' : 'var(--text)' }}>{item.text}</span>
                    <button onClick={() => removeCheckItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, padding: 0, cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newCheckItem} onChange={(e) => setNewCheckItem(e.target.value)} placeholder="Add item…" onKeyDown={(e) => { if (e.key === 'Enter') addCheckItem(); }} />
              <button onClick={addCheckItem} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6, padding: '0 12px', whiteSpace: 'nowrap', fontSize: 13 }}>Add</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <button
            onClick={handleDelete}
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--danger)', borderRadius: 6, padding: '8px 14px', fontSize: 13 }}
          >
            Delete Card
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 6, padding: '8px 14px', fontSize: 13 }}>Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

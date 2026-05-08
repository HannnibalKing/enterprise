import React, { useState } from 'react';
import { Rule, Condition, Action, NotificationChannel } from '../types';
import { api } from '../api';

const CHANNELS: NotificationChannel[] = ['in_app', 'email', 'slack', 'sms'];
const OPERATORS = ['eq', 'neq', 'contains', 'gt', 'lt'] as const;

const DEFAULT_RULE: Partial<Rule> = {
  name: '', description: '', enabled: true, conditionLogic: 'AND',
  conditions: [{ field: 'priority', operator: 'eq', value: 'high' }],
  actions: [{ channel: 'in_app', template: '{{subject}}: {{body}}', recipients: ['all'] }],
};

interface Props {
  rules: Rule[];
  onRefresh: () => void;
}

export default function RuleEditor({ rules, onRefresh }: Props) {
  const [editing, setEditing] = useState<Partial<Rule> | null>(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => setEditing({ ...DEFAULT_RULE, conditions: [{ field: 'priority', operator: 'eq', value: 'high' }], actions: [{ channel: 'in_app', template: '{{subject}}: {{body}}', recipients: ['all'] }] });
  const openEdit = (r: Rule) => setEditing({ ...r });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) await api.updateRule(editing.id, editing);
      else await api.createRule(editing);
      setEditing(null);
      onRefresh();
    } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this rule?')) return;
    await api.deleteRule(id);
    onRefresh();
  };

  const toggle = async (r: Rule) => { await api.updateRule(r.id, { enabled: !r.enabled }); onRefresh(); };

  // Condition helpers
  const addCondition = () => setEditing((e) => e ? { ...e, conditions: [...(e.conditions ?? []), { field: '', operator: 'eq', value: '' }] } : e);
  const updateCondition = (i: number, patch: Partial<Condition>) => setEditing((e) => e ? { ...e, conditions: (e.conditions ?? []).map((c, j) => j === i ? { ...c, ...patch } : c) } : e);
  const removeCondition = (i: number) => setEditing((e) => e ? { ...e, conditions: (e.conditions ?? []).filter((_, j) => j !== i) } : e);

  // Action helpers
  const addAction = () => setEditing((e) => e ? { ...e, actions: [...(e.actions ?? []), { channel: 'in_app', template: '', recipients: ['all'] }] } : e);
  const updateAction = (i: number, patch: Partial<Action>) => setEditing((e) => e ? { ...e, actions: (e.actions ?? []).map((a, j) => j === i ? { ...a, ...patch } : a) } : e);
  const removeAction = (i: number) => setEditing((e) => e ? { ...e, actions: (e.actions ?? []).filter((_, j) => j !== i) } : e);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Rules list */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" onClick={openNew}>+ New Rule</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rules.map((r) => (
          <div key={r.id} className="card" style={{ padding: '14px 16px', borderLeft: `3px solid ${r.enabled ? 'var(--success)' : 'var(--border)'}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</span>
                  <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 4, background: r.enabled ? 'rgba(52,211,153,0.12)' : 'rgba(148,163,184,0.1)', color: r.enabled ? 'var(--success)' : 'var(--text-muted)' }}>
                    {r.enabled ? 'Active' : 'Disabled'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>Triggered {r.triggerCount}×</span>
                </div>
                {r.description && <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>{r.description}</p>}
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>{r.conditions.length} condition{r.conditions.length !== 1 ? 's' : ''}</span>
                  <span style={{ margin: '0 8px' }}>·</span>
                  <span>{r.actions.length} action{r.actions.length !== 1 ? 's' : ''}: {r.actions.map((a) => a.channel).join(', ')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => toggle(r)}>{r.enabled ? 'Disable' : 'Enable'}</button>
                <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => openEdit(r)}>Edit</button>
                <button className="btn-danger" style={{ fontSize: 12 }} onClick={() => del(r.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {rules.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No rules configured.</p>}
      </div>

      {/* Editor modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>{editing.id ? 'Edit Rule' : 'New Rule'}</h2>
              <button className="btn-ghost" onClick={() => setEditing(null)} style={{ fontSize: 18 }}>×</button>
            </div>

            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Basic info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>RULE NAME *</label>
                  <input value={editing.name ?? ''} onChange={(e) => setEditing((x) => x ? { ...x, name: e.target.value } : x)} required placeholder="My rule" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>CONDITION LOGIC</label>
                  <select value={editing.conditionLogic ?? 'AND'} onChange={(e) => setEditing((x) => x ? { ...x, conditionLogic: e.target.value as 'AND' | 'OR' } : x)}>
                    <option value="AND">ALL conditions (AND)</option>
                    <option value="OR">ANY condition (OR)</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>DESCRIPTION</label>
                <input value={editing.description ?? ''} onChange={(e) => setEditing((x) => x ? { ...x, description: e.target.value } : x)} placeholder="What triggers this rule?" />
              </div>

              {/* Conditions */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>CONDITIONS</label>
                  <button type="button" className="btn-secondary" style={{ fontSize: 11 }} onClick={addCondition}>+ Add Condition</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(editing.conditions ?? []).map((c, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr 32px', gap: 8, alignItems: 'center' }}>
                      <input value={c.field} onChange={(e) => updateCondition(i, { field: e.target.value })} placeholder="field (e.g. priority)" />
                      <select value={c.operator} onChange={(e) => updateCondition(i, { operator: e.target.value as Condition['operator'] })}>
                        {OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
                      </select>
                      <input value={c.value as string} onChange={(e) => updateCondition(i, { value: e.target.value })} placeholder="value" />
                      <button type="button" className="btn-ghost" style={{ padding: 0, textAlign: 'center', lineHeight: '30px', color: 'var(--danger)' }} onClick={() => removeCondition(i)}>×</button>
                    </div>
                  ))}
                  {(editing.conditions ?? []).length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No conditions — rule will match all events.</p>}
                </div>
              </div>

              {/* Actions */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>ACTIONS</label>
                  <button type="button" className="btn-secondary" style={{ fontSize: 11 }} onClick={addAction}>+ Add Action</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(editing.actions ?? []).map((a, i) => (
                    <div key={i} style={{ background: 'var(--surface2)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 32px', gap: 8 }}>
                        <select value={a.channel} onChange={(e) => updateAction(i, { channel: e.target.value as NotificationChannel })}>
                          {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input value={a.recipients.join(', ')} onChange={(e) => updateAction(i, { recipients: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="all  (or user IDs)" />
                        <button type="button" className="btn-ghost" style={{ padding: 0, textAlign: 'center', color: 'var(--danger)' }} onClick={() => removeAction(i)}>×</button>
                      </div>
                      <input value={a.template} onChange={(e) => updateAction(i, { template: e.target.value })} placeholder="Template — use {{field}} to interpolate event fields" />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : (editing.id ? 'Save Changes' : 'Create Rule')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

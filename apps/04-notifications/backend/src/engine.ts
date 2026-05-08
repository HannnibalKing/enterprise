import { Condition, Notification, Rule } from './types';
import { rules, notifications, users } from './store';
import { broadcast } from './websocket';
import { v4 as uuid } from 'uuid';

// Resolve a dot-path like "payload.service" from an object
function resolve(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((cur, key) => {
    if (cur && typeof cur === 'object' && !Array.isArray(cur)) return (cur as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function evalCondition(event: Record<string, unknown>, cond: Condition): boolean {
  const val = resolve(event, cond.field);
  switch (cond.operator) {
    case 'eq':       return val == cond.value;
    case 'neq':      return val != cond.value;
    case 'contains': return typeof val === 'string' && val.toLowerCase().includes(String(cond.value).toLowerCase());
    case 'gt':       return typeof val === 'number' && val > Number(cond.value);
    case 'lt':       return typeof val === 'number' && val < Number(cond.value);
    default: return false;
  }
}

function interpolate(template: string, event: Record<string, unknown>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_match, path) => {
    const v = resolve(event, path.trim());
    return v !== undefined ? String(v) : `{{${path}}}`;
  });
}

export function processEvent(event: Record<string, unknown> & { priority?: string; subject?: string }): Notification[] {
  const created: Notification[] = [];
  const allUserIds = [...users.keys()];

  for (const rule of rules.values()) {
    if (!rule.enabled) continue;

    const matches = rule.conditionLogic === 'AND'
      ? rule.conditions.every((c) => evalCondition(event, c))
      : rule.conditions.some((c) => evalCondition(event, c));

    if (!matches) continue;

    for (const action of rule.actions) {
      const body = interpolate(action.template, event);
      const recipients = action.recipients.includes('all') ? allUserIds : action.recipients;

      const notif: Notification = {
        id: uuid(),
        ruleId: rule.id,
        ruleName: rule.name,
        channel: action.channel,
        priority: (event.priority as Notification['priority']) ?? 'medium',
        subject: event.subject as string ?? rule.name,
        body,
        recipients,
        read: false,
        readBy: [],
        createdAt: new Date().toISOString(),
        sourceEvent: event,
      };

      notifications.set(notif.id, notif);
      created.push(notif);
      broadcast({ type: 'notification:new', payload: notif });
    }

    // Increment trigger count
    rules.set(rule.id, { ...rule, triggerCount: rule.triggerCount + 1, updatedAt: new Date().toISOString() });
  }

  return created;
}

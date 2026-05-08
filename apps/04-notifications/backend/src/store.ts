import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { Notification, Rule, User } from './types';

export const users = new Map<string, User>();
export const rules = new Map<string, Rule>();
export const notifications = new Map<string, Notification>();

async function seed() {
  const pw = await bcrypt.hash('password123', 10);
  const seedUsers: User[] = [
    { id: 'u-alice', email: 'alice@notify.com', passwordHash: pw, name: 'Alice Chen',  avatar: 'AC', channelPrefs: { email: true, slack: true, sms: false, in_app: true } },
    { id: 'u-bob',   email: 'bob@notify.com',   passwordHash: pw, name: 'Bob Torres',  avatar: 'BT', channelPrefs: { email: true, slack: false, sms: true,  in_app: true } },
    { id: 'u-carol', email: 'carol@notify.com', passwordHash: pw, name: 'Carol Kim',   avatar: 'CK', channelPrefs: { email: true, slack: true, sms: true,   in_app: true } },
  ];
  seedUsers.forEach((u) => users.set(u.id, u));

  const now = new Date().toISOString();

  const seedRules: Rule[] = [
    {
      id: 'rule-1', name: 'Critical Alert Broadcast', description: 'Broadcast any critical priority event to all users via all enabled channels',
      enabled: true, conditionLogic: 'AND',
      conditions: [{ field: 'priority', operator: 'eq', value: 'critical' }],
      actions: [
        { channel: 'in_app', template: '🚨 CRITICAL: {{subject}} — {{body}}', recipients: ['all'] },
        { channel: 'email',  template: 'CRITICAL ALERT: {{subject}}\n\n{{body}}', recipients: ['all'] },
      ],
      createdAt: now, updatedAt: now, triggerCount: 0,
    },
    {
      id: 'rule-2', name: 'Deploy Success Notification', description: 'Notify engineering team when a deployment succeeds',
      enabled: true, conditionLogic: 'AND',
      conditions: [
        { field: 'source', operator: 'eq', value: 'ci-cd' },
        { field: 'payload.status', operator: 'eq', value: 'success' },
      ],
      actions: [
        { channel: 'in_app', template: '✅ Deploy succeeded: {{payload.service}} v{{payload.version}}', recipients: ['u-alice', 'u-bob'] },
        { channel: 'slack', template: ':white_check_mark: Deploy succeeded: *{{payload.service}}* v{{payload.version}}', recipients: ['u-alice', 'u-bob'] },
      ],
      createdAt: now, updatedAt: now, triggerCount: 0,
    },
    {
      id: 'rule-3', name: 'High Error Rate Alert', description: 'Alert when error rate exceeds threshold',
      enabled: true, conditionLogic: 'AND',
      conditions: [
        { field: 'source', operator: 'eq', value: 'monitoring' },
        { field: 'payload.errorRate', operator: 'gt', value: 5 },
      ],
      actions: [
        { channel: 'in_app', template: '⚠️ High error rate: {{payload.errorRate}}% on {{payload.service}}', recipients: ['all'] },
        { channel: 'sms', template: 'ALERT: Error rate {{payload.errorRate}}% on {{payload.service}}', recipients: ['u-carol'] },
      ],
      createdAt: now, updatedAt: now, triggerCount: 0,
    },
    {
      id: 'rule-4', name: 'New User Signup', description: 'Notify admins of new user registrations',
      enabled: false, conditionLogic: 'AND',
      conditions: [{ field: 'source', operator: 'eq', value: 'auth' }, { field: 'payload.event', operator: 'eq', value: 'user_signup' }],
      actions: [{ channel: 'email', template: 'New user signed up: {{payload.email}}', recipients: ['u-carol'] }],
      createdAt: now, updatedAt: now, triggerCount: 0,
    },
  ];
  seedRules.forEach((r) => rules.set(r.id, r));

  // Sample historical notifications
  const sampleNotifs: Notification[] = [
    {
      id: uuid(), ruleId: 'rule-2', ruleName: 'Deploy Success Notification', channel: 'in_app',
      priority: 'medium', subject: 'Deploy succeeded', body: 'Deploy succeeded: api-service v2.4.1',
      recipients: ['u-alice', 'u-bob'], read: false, readBy: ['u-alice'],
      createdAt: new Date(Date.now() - 3600000).toISOString(), sourceEvent: { source: 'ci-cd', payload: { service: 'api-service', version: '2.4.1', status: 'success' } },
    },
    {
      id: uuid(), ruleId: 'rule-3', ruleName: 'High Error Rate Alert', channel: 'in_app',
      priority: 'high', subject: 'High error rate', body: '⚠️ High error rate: 8.3% on payment-service',
      recipients: ['u-alice', 'u-bob', 'u-carol'], read: false, readBy: [],
      createdAt: new Date(Date.now() - 7200000).toISOString(), sourceEvent: { source: 'monitoring', payload: { service: 'payment-service', errorRate: 8.3 } },
    },
    {
      id: uuid(), ruleId: 'rule-1', ruleName: 'Critical Alert Broadcast', channel: 'in_app',
      priority: 'critical', subject: 'Database failover', body: '🚨 CRITICAL: Database failover — Primary DB down, failing over to replica',
      recipients: ['all'], read: false, readBy: ['u-carol'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
  sampleNotifs.forEach((n) => notifications.set(n.id, n));
}

seed().catch(console.error);

export function getUserByEmail(email: string): User | undefined {
  return [...users.values()].find((u) => u.email === email);
}

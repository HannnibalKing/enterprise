export type NotificationChannel = 'email' | 'slack' | 'sms' | 'in_app';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Condition {
  field: string;
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt';
  value: string | number;
}

export interface Action {
  channel: NotificationChannel;
  template: string;
  recipients: string[];
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: Condition[];
  conditionLogic: 'AND' | 'OR';
  actions: Action[];
  createdAt: string;
  updatedAt: string;
  triggerCount: number;
}

export interface Notification {
  id: string;
  ruleId: string;
  ruleName: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  subject: string;
  body: string;
  recipients: string[];
  read: boolean;
  readBy: string[];
  createdAt: string;
  sourceEvent?: Record<string, unknown>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  channelPrefs: Record<NotificationChannel, boolean>;
}

export interface AuthPayload {
  userId: string;
  user: User;
}

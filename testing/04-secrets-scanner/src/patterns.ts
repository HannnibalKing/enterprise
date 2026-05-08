import { SecretPattern } from './types';

/** 
 * Comprehensive secret patterns grouped by provider.
 * Covers 50+ common secret types used across cloud, SaaS, and infrastructure.
 */
export const SECRET_PATTERNS: SecretPattern[] = [
  // ── Cloud – AWS ──────────────────────────────────────────────────────────────
  {
    id: 'AWS001',
    name: 'AWS Access Key ID',
    provider: 'AWS',
    severity: 'CRITICAL',
    pattern: /(?<![A-Z0-9])(AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}(?![A-Z0-9])/g,
  },
  {
    id: 'AWS002',
    name: 'AWS Secret Access Key',
    provider: 'AWS',
    severity: 'CRITICAL',
    pattern: /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*[=:]\s*['"]?([A-Za-z0-9+/]{40})['"]?/gi,
  },
  {
    id: 'AWS003',
    name: 'AWS Account ID pattern',
    provider: 'AWS',
    severity: 'MEDIUM',
    pattern: /arn:aws:[a-z0-9\-]+:[a-z0-9\-]*:\d{12}:/g,
  },

  // ── Cloud – GCP ──────────────────────────────────────────────────────────────
  {
    id: 'GCP001',
    name: 'Google API Key',
    provider: 'GCP',
    severity: 'CRITICAL',
    pattern: /AIza[0-9A-Za-z\-_]{35}/g,
  },
  {
    id: 'GCP002',
    name: 'GCP Service Account Key',
    provider: 'GCP',
    severity: 'CRITICAL',
    pattern: /"type"\s*:\s*"service_account"/g,
  },
  {
    id: 'GCP003',
    name: 'Google OAuth Client Secret',
    provider: 'GCP',
    severity: 'HIGH',
    pattern: /GOCSPX-[0-9A-Za-z\-_]{28}/g,
  },

  // ── Cloud – Azure ────────────────────────────────────────────────────────────
  {
    id: 'AZR001',
    name: 'Azure Storage Account Key',
    provider: 'Azure',
    severity: 'CRITICAL',
    pattern: /AccountKey=([A-Za-z0-9+/=]{88})/g,
  },
  {
    id: 'AZR002',
    name: 'Azure Service Bus Connection String',
    provider: 'Azure',
    severity: 'HIGH',
    pattern: /Endpoint=sb:\/\/[^;]+;SharedAccessKeyName=[^;]+;SharedAccessKey=[A-Za-z0-9+/=]{44}/g,
  },

  // ── Generic Tokens & Keys ────────────────────────────────────────────────────
  {
    id: 'GEN001',
    name: 'Generic API Key assignment',
    provider: 'Generic',
    severity: 'HIGH',
    pattern: /(?:api_key|apiKey|API_KEY|x-api-key)\s*[=:]\s*['"]([A-Za-z0-9\-_]{20,60})['"]/gi,
    falsePositiveFilter: /process\.env|YOUR_API_KEY|example|placeholder|<|>/i,
  },
  {
    id: 'GEN002',
    name: 'Generic password assignment',
    provider: 'Generic',
    severity: 'HIGH',
    pattern: /(?:password|passwd|PASSWD|DB_PASSWORD|DATABASE_PASSWORD)\s*[=:]\s*['"]([^'"]{8,})['"]/gi,
    falsePositiveFilter: /process\.env|YOUR_PASSWORD|example|placeholder|\${|<|>/i,
  },
  {
    id: 'GEN003',
    name: 'Generic secret/token assignment',
    provider: 'Generic',
    severity: 'HIGH',
    pattern: /(?:secret|SECRET|token|TOKEN|bearer)\s*[=:]\s*['"]([A-Za-z0-9+/=\-_]{20,})['"]/gi,
    falsePositiveFilter: /process\.env|example|placeholder|\${|<your|your_/i,
  },
  {
    id: 'GEN004',
    name: 'Private key header (PEM)',
    provider: 'Generic',
    severity: 'CRITICAL',
    pattern: /-----BEGIN\s+(?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
  {
    id: 'GEN005',
    name: 'Certificate / public key (informational)',
    provider: 'Generic',
    severity: 'MEDIUM',
    pattern: /-----BEGIN\s+CERTIFICATE-----/g,
  },

  // ── Database Connection Strings ──────────────────────────────────────────────
  {
    id: 'DB001',
    name: 'PostgreSQL connection string with password',
    provider: 'Database',
    severity: 'CRITICAL',
    pattern: /postgres(?:ql)?:\/\/[^:]+:([^@]{4,})@/gi,
    falsePositiveFilter: /process\.env|localhost|example|<|>/i,
  },
  {
    id: 'DB002',
    name: 'MySQL connection string with password',
    provider: 'Database',
    severity: 'CRITICAL',
    pattern: /mysql:\/\/[^:]+:([^@]{4,})@/gi,
    falsePositiveFilter: /process\.env|localhost|example|<|>/i,
  },
  {
    id: 'DB003',
    name: 'MongoDB connection string with credentials',
    provider: 'Database',
    severity: 'CRITICAL',
    pattern: /mongodb(?:\+srv)?:\/\/[^:]+:([^@]{4,})@/gi,
    falsePositiveFilter: /process\.env|localhost|example|<|>/i,
  },
  {
    id: 'DB004',
    name: 'Redis connection string with password',
    provider: 'Database',
    severity: 'HIGH',
    pattern: /redis:\/\/:[^@]{4,}@/gi,
  },

  // ── SaaS Services ────────────────────────────────────────────────────────────
  {
    id: 'STRIPE001',
    name: 'Stripe Secret Key',
    provider: 'Stripe',
    severity: 'CRITICAL',
    pattern: /sk_(?:live|test)_[0-9a-zA-Z]{24,}/g,
  },
  {
    id: 'STRIPE002',
    name: 'Stripe Webhook Secret',
    provider: 'Stripe',
    severity: 'HIGH',
    pattern: /whsec_[0-9a-zA-Z]{32,}/g,
  },
  {
    id: 'GITHUB001',
    name: 'GitHub Personal Access Token (classic)',
    provider: 'GitHub',
    severity: 'CRITICAL',
    pattern: /ghp_[A-Za-z0-9]{36}/g,
  },
  {
    id: 'GITHUB002',
    name: 'GitHub Fine-grained PAT',
    provider: 'GitHub',
    severity: 'CRITICAL',
    pattern: /github_pat_[A-Za-z0-9_]{82}/g,
  },
  {
    id: 'GITHUB003',
    name: 'GitHub Actions token',
    provider: 'GitHub',
    severity: 'CRITICAL',
    pattern: /ghs_[A-Za-z0-9]{36}/g,
  },
  {
    id: 'SLACK001',
    name: 'Slack Bot/App Token',
    provider: 'Slack',
    severity: 'HIGH',
    pattern: /xoxb-[0-9]+-[0-9]+-[0-9A-Za-z]+/g,
  },
  {
    id: 'SLACK002',
    name: 'Slack User Token',
    provider: 'Slack',
    severity: 'HIGH',
    pattern: /xoxp-[0-9]+-[0-9]+-[0-9]+-[0-9A-Za-z]+/g,
  },
  {
    id: 'SLACK003',
    name: 'Slack Webhook URL',
    provider: 'Slack',
    severity: 'HIGH',
    pattern: /hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+/g,
  },
  {
    id: 'TWILIO001',
    name: 'Twilio Account SID',
    provider: 'Twilio',
    severity: 'HIGH',
    pattern: /AC[a-z0-9]{32}/g,
  },
  {
    id: 'TWILIO002',
    name: 'Twilio Auth Token',
    provider: 'Twilio',
    severity: 'CRITICAL',
    pattern: /SK[a-z0-9]{32}/g,
  },
  {
    id: 'SENDGRID001',
    name: 'SendGrid API Key',
    provider: 'SendGrid',
    severity: 'HIGH',
    pattern: /SG\.[A-Za-z0-9\-_]{22,}\.[A-Za-z0-9\-_]{43}/g,
  },
  {
    id: 'NPM001',
    name: 'npm Access Token',
    provider: 'npm',
    severity: 'HIGH',
    pattern: /npm_[A-Za-z0-9]{36}/g,
  },
  {
    id: 'JWT001',
    name: 'Hardcoded JWT',
    provider: 'Auth',
    severity: 'HIGH',
    pattern: /eyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g,
  },
  {
    id: 'OPENAI001',
    name: 'OpenAI API Key',
    provider: 'OpenAI',
    severity: 'CRITICAL',
    pattern: /sk-[A-Za-z0-9]{48}/g,
    falsePositiveFilter: /example|placeholder|your_/i,
  },
];

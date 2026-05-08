// VULN: Hardcoded DB credentials in config file (Secrets Scanner target)
module.exports = {
  database: {
    host: 'prod-db.internal.example.com',
    port: 3306,
    user: 'root',
    password: 'Tr0ub4dor&3',                              // VULN: hardcoded password
    database: 'enterprise_prod',
    connectionString: 'mysql://root:Tr0ub4dor&3@prod-db.internal.example.com:3306/enterprise_prod',
  },
  redis: {
    url: 'redis://:redispassword123@cache.internal:6379',  // VULN: hardcoded Redis password
  },
  jwt: {
    secret: 'jwt-secret-do-not-share',                    // VULN: hardcoded JWT secret
    expiresIn: '100y',                                     // VULN: JWT never expires
  },
  aws: {
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',                   // VULN: AWS key
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    region: 'us-east-1',
    s3Bucket: 'enterprise-prod-data',
  },
  stripe: {
    secretKey: 'sk_live_FAKE_KEY_FOR_DEMO_ONLY_xxxxx',        // VULN: Live Stripe key
    webhookSecret: 'whsec_abcdefghijklmnopqrstuvwxyz',
  },
  sendgrid: {
    apiKey: 'SG.abcdefghijklmno.PQRSTUVWXYZ1234567890abcdefghijklmnopqr',
  },
  encryption: {
    key: '0000000000000000',                               // VULN: weak encryption key
    algorithm: 'des-ecb',                                 // VULN: DES-ECB is broken
  },
};

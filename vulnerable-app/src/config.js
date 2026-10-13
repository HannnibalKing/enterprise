function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requiredPort(name) {
  const port = Number(requiredEnv(name));
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Environment variable ${name} must be a valid TCP port`);
  }
  return port;
}

module.exports = {
  database: {
    host: requiredEnv('DB_HOST'),
    port: requiredPort('DB_PORT'),
    user: requiredEnv('DB_USER'),
    password: requiredEnv('DB_PASSWORD'),
    database: requiredEnv('DB_NAME'),
    connectionString: requiredEnv('DATABASE_URL'),
  },
  redis: {
    url: requiredEnv('REDIS_URL'),
  },
  jwt: {
    secret: requiredEnv('JWT_SECRET'),
    expiresIn: requiredEnv('JWT_EXPIRES_IN'),
  },
  aws: {
    accessKeyId: requiredEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: requiredEnv('AWS_SECRET_ACCESS_KEY'),
    region: requiredEnv('AWS_REGION'),
    s3Bucket: requiredEnv('AWS_S3_BUCKET'),
  },
  stripe: {
    secretKey: requiredEnv('STRIPE_SECRET_KEY'),
    webhookSecret: requiredEnv('STRIPE_WEBHOOK_SECRET'),
  },
  sendgrid: {
    apiKey: requiredEnv('SENDGRID_API_KEY'),
  },
  encryption: {
    key: requiredEnv('ENCRYPTION_KEY'),
    algorithm: 'aes-256-gcm',
  },
};

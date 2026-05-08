// ⚠️  DELIBERATELY INSECURE — DO NOT USE IN PRODUCTION
// This file contains intentional security vulnerabilities for testing purposes.
// It is the scan target for all 10 Enterprise security tools.

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// ─── VULN: Wildcard CORS (CORS001) ──────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: '100mb' })); // VULN: Massive body limit (DoS)
app.use(bodyParser.urlencoded({ extended: true }));

// ─── VULN: Hardcoded secrets (SEC004 / Secrets Scanner) ─────────────────────
const JWT_SECRET = 'supersecret123';
const DB_PASSWORD = 'admin123';
const AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
const STRIPE_SECRET_KEY = 'sk_live_FAKE_KEY_FOR_DEMO_ONLY_xxxxx';
const GITHUB_TOKEN = 'ghp_16C7e42F292c6912E7710c838347Ae298G5b';
const OPENAI_API_KEY = 'sk-proj-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGH';

// ─── VULN: Simulated DB connection (no real DB needed for scanning) ──────────
const fakeDb = {
  query: (sql, cb) => {
    console.log('QUERY:', sql);
    cb(null, [{ id: 1, username: 'admin', password: md5('password123') }]);
  }
};

// ─── VULN: No helmet, no CSP, no HSTS, no X-Frame-Options ──────────────────
// (missing headers detected by tool 05)

const upload = multer({ dest: 'uploads/' }); // VULN: No MIME validation (VAL007)

// ════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ════════════════════════════════════════════════════════════════════════════

// VULN: SQL injection via template literal (VAL001 / SEC001)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body; // VULN: no body validation (VAL002)
  const hashedPassword = md5(password);    // VULN: MD5 password hashing (SEC006)

  // VULN: String concatenation SQL — SQLi (SEC001 / VAL001)
  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${hashedPassword}'`;
  fakeDb.query(sql, (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // VULN: JWT signed with hardcoded weak secret, no expiry (SEC005)
    const token = jwt.sign({ userId: results[0].id, role: 'admin' }, JWT_SECRET);
    res.json({ token });
  });
});

// VULN: JWT not verified — auth bypass (SEC005 / AUTH001)
app.get('/api/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  // VULN: jwt.decode instead of jwt.verify — no signature check!
  const decoded = jwt.decode(token);
  res.json({ user: decoded });
});

// VULN: No authentication required on sensitive route (SEC005)
app.delete('/api/admin/users/:id', (req, res) => {
  const id = req.params.id; // VULN: no type coercion (VAL003)
  // VULN: SQLi via template literal
  const sql = `DELETE FROM users WHERE id = ${id}`;
  fakeDb.query(sql, () => res.json({ deleted: id }));
});

// ════════════════════════════════════════════════════════════════════════════
// USER / DATA ROUTES
// ════════════════════════════════════════════════════════════════════════════

// VULN: XSS — user input reflected in response (VAL005 / SEC002)
app.get('/api/search', (req, res) => {
  const q = req.query.q; // VULN: no query validation (VAL004)
  // VULN: unescaped user input in HTML response
  res.send(`<h1>Results for: ${q}</h1>`);
});

// VULN: Prototype pollution via Object.assign (VAL009 / SEC003)
app.post('/api/users/:id/settings', (req, res) => {
  const userSettings = {};
  Object.assign(userSettings, req.body); // VULN: spread of unvalidated req.body
  res.json({ settings: userSettings });
});

// VULN: Path traversal (SEC007)
app.get('/api/files', (req, res) => {
  const filename = req.query.name; // VULN: no validation
  const filePath = path.join(__dirname, 'uploads', filename);
  // VULN: path traversal — no normalization check
  res.sendFile(filePath);
});

// VULN: Unbounded pagination (VAL010)
app.get('/api/orders', (req, res) => {
  const limit = req.query.limit; // VULN: no max cap
  // VULN: limit goes directly to query
  const sql = `SELECT * FROM orders LIMIT ${limit}`;
  fakeDb.query(sql, (err, rows) => res.json(rows));
});

// VULN: File upload without MIME check (VAL007 / SEC009)
app.post('/api/upload', upload.single('file'), (req, res) => {
  // VULN: no mimetype validation whatsoever
  res.json({ file: req.file });
});

// VULN: Email not validated (VAL008)
app.post('/api/newsletter', (req, res) => {
  const email = req.body.email; // VULN: no email format validation
  const sql = `INSERT INTO newsletter (email) VALUES ('${email}')`;
  fakeDb.query(sql, () => res.json({ subscribed: true }));
});

// VULN: CSRF — state-changing GET (SEC008)
app.get('/api/transfer', (req, res) => {
  const { to, amount } = req.query;
  res.json({ transferred: amount, to });
});

// VULN: Eval of user input (SEC010)
app.post('/api/calculate', (req, res) => {
  const { expression } = req.body;
  // VULN: eval of user-controlled input — RCE
  const result = eval(expression); // eslint-disable-line no-eval
  res.json({ result });
});

// VULN: Sensitive data in response (SEC004)
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, username: 'admin', password: 'admin123', ssn: '123-45-6789', creditCard: '4111111111111111' }
  ]);
});

// VULN: Command injection via child_process (SEC010)
const { exec } = require('child_process');
app.get('/api/ping', (req, res) => {
  const host = req.query.host; // VULN: no validation
  // VULN: command injection
  exec(`ping -c 1 ${host}`, (err, stdout) => {
    res.json({ output: stdout });
  });
});

// VULN: Insecure random for token generation (SEC011)
app.post('/api/reset-password', (req, res) => {
  const resetToken = Math.random().toString(36); // VULN: Math.random is not cryptographically secure
  res.json({ token: resetToken });
});

// ════════════════════════════════════════════════════════════════════════════
// SERVER
// ════════════════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Vulnerable app running on http://localhost:${PORT}`);
  console.log('⚠️  DO NOT EXPOSE THIS TO THE INTERNET');
});

module.exports = app;

// Deliberately insecure demo application for testing security tools.
// Do not deploy it or expose it to the internet.

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const multer = require('multer');
const path = require('path');

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const JWT_SECRET = requiredEnv('JWT_SECRET');

const app = express();

app.use(cors({ origin: '*' })); // VULN: Wildcard CORS
app.use(bodyParser.json({ limit: '100mb' })); // VULN: Excessive body limit
app.use(bodyParser.urlencoded({ extended: true }));

const fakeDb = {
  query: (sql, cb) => {
    console.log('QUERY:', sql);
    cb(null, [{ id: 1, username: 'admin', password: null }]);
  }
};

const upload = multer({ dest: 'uploads/' });

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = md5(password); // VULN: Weak password hashing
  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${hashedPassword}'`;
  // VULN: User-controlled SQL interpolation
  fakeDb.query(sql, (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: results[0].id, role: 'admin' }, JWT_SECRET);
    res.json({ token });
  });
});

app.get('/api/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.decode(token); // VULN: Decodes without verifying signature
  res.json({ user: decoded });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM users WHERE id = ${id}`; // VULN: SQL injection
  fakeDb.query(sql, () => res.json({ deleted: id }));
});

app.get('/api/search', (req, res) => {
  const q = req.query.q;
  res.send(`<h1>Results for: ${q}</h1>`); // VULN: Reflected XSS
});

app.post('/api/users/:id/settings', (req, res) => {
  const userSettings = {};
  Object.assign(userSettings, req.body); // VULN: Unvalidated object assignment
  res.json({ settings: userSettings });
});

app.get('/api/files', (req, res) => {
  const filename = req.query.name;
  const filePath = path.join(__dirname, 'uploads', filename); // VULN: Path traversal
  res.sendFile(filePath);
});

app.get('/api/orders', (req, res) => {
  const limit = req.query.limit;
  const sql = `SELECT * FROM orders LIMIT ${limit}`; // VULN: Unbounded pagination
  fakeDb.query(sql, (err, rows) => res.json(rows));
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  // VULN: Uploaded file is not validated.
  res.json({ file: req.file });
});

app.post('/api/newsletter', (req, res) => {
  const email = req.body.email;
  const sql = `INSERT INTO newsletter (email) VALUES ('${email}')`; // VULN: SQL injection
  fakeDb.query(sql, () => res.json({ subscribed: true }));
});

app.get('/api/transfer', (req, res) => {
  const { to, amount } = req.query;
  // VULN: State-changing action exposed as GET without CSRF protection.
  res.json({ transferred: amount, to });
});

app.post('/api/calculate', (req, res) => {
  const { expression } = req.body;
  const result = eval(expression); // eslint-disable-line no-eval
  res.json({ result });
});

app.get('/api/users', (req, res) => {
  // VULN: Returns sensitive fields, even though fixture values are empty.
  res.json([
    { id: 1, username: 'admin', password: null, ssn: '123-45-6789', creditCard: '4111111111111111' }
  ]);
});

const { exec } = require('child_process');
app.get('/api/ping', (req, res) => {
  const host = req.query.host;
  exec(`ping -c 1 ${host}`, (err, stdout) => { // VULN: Command injection
    res.json({ output: stdout });
  });
});

app.post('/api/reset-password', (req, res) => {
  const resetToken = Math.random().toString(36); // VULN: Not cryptographically secure
  res.json({ token: resetToken });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Vulnerable app running on http://localhost:${PORT}`);
  console.log('Do not expose this demo to the internet.');
});

module.exports = app;

// VULN: Multiple auth flow issues (Auth Flow Analyzer target)
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');

const SECRET = 'hardcoded-jwt-secret'; // VULN: hardcoded JWT secret (AUTH002)

// VULN: jwt.decode instead of jwt.verify (AUTH001)
function getUser(token) {
  return jwt.decode(token); // no signature verification!
}

// VULN: MD5 for password hashing (AUTH003)
function hashPassword(password) {
  return md5(password);
}

// VULN: No rate limiting on login (AUTH004)
function login(username, password, db, callback) {
  const hash = md5(password);
  db.query(`SELECT * FROM users WHERE username='${username}' AND password='${hash}'`, callback);
}

// VULN: Insecure session secret (AUTH005)
const sessionConfig = {
  secret: 'session-secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,     // VULN: cookies sent over HTTP
    httpOnly: false,   // VULN: accessible by JavaScript (XSS risk)
    sameSite: 'none',  // VULN: no CSRF protection
  }
};

// VULN: No MFA (AUTH006)
function authenticateUser(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return next(); // VULN: missing auth doesn't block request
  const user = jwt.decode(token.replace('Bearer ', ''));
  req.user = user;
  next();
}

// VULN: Weak random reset token (AUTH007)
function generateResetToken() {
  return Math.random().toString(36).slice(2); // VULN: not cryptographically secure
}

// SECURE example for comparison (commented out):
// function generateSecureResetToken() {
//   return crypto.randomBytes(32).toString('hex');
// }

module.exports = { getUser, hashPassword, login, sessionConfig, authenticateUser, generateResetToken };

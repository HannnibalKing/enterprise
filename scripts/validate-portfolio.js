#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const appsDir = path.join(root, 'apps');
const testingDir = path.join(root, 'testing');
const requiredFiles = ['README.md', 'docs/APPS.md', 'docs/TOOLS.md', 'run-all-scans.js'];

function directoriesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function filesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return ['.git', '.next', 'node_modules'].includes(entry.name) ? [] : filesUnder(entryPath);
    }
    return [entryPath];
  });
}

const apps = directoriesUnder(appsDir);
const tools = directoriesUnder(testingDir);
const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const appDocs = fs.readFileSync(path.join(root, 'docs/APPS.md'), 'utf8');
const errors = [];
const unsafeCredentialPatterns = [
  ['hardcoded password seed', /bcrypt\.(?:hash|hashSync)\(\s*(['"])[^'"]+\1/],
  ['hardcoded password value', /\bpassword\s*:\s*(['"])[^'"]+\1/i],
  ['JWT_SECRET fallback', /process\.env\.JWT_SECRET\s*(?:\?\?|\|\|)\s*(['"])[^'"]+\1/],
  ['login password default', /const\s+\[\s*password\s*,\s*setPassword\s*\]\s*=\s*useState\(\s*(['"])[^'"]+\1/i],
  ['demo password hint', /(?:Demo password|All demo passwords|All accounts use password)\s*:/i],
];

if (apps.length !== 35) {
  errors.push(`Expected 35 app directories, found ${apps.length}.`);
}

if (tools.length !== 10) {
  errors.push(`Expected 10 testing-tool directories, found ${tools.length}.`);
}

if (missingFiles.length > 0) {
  errors.push(`Missing required files: ${missingFiles.join(', ')}.`);
}

if (!readme.includes('35 enterprise web applications')) {
  errors.push('README.md does not describe the current 35-app inventory.');
}

if (!readme.includes('7 static CLI scans')) {
  errors.push('README.md does not describe the current static scan scope.');
}

for (const file of filesUnder(appsDir).filter((candidate) => /\.(?:[cm]?[jt]sx?)$/i.test(candidate))) {
  const source = fs.readFileSync(file, 'utf8');
  for (const [label, pattern] of unsafeCredentialPatterns) {
    if (pattern.test(source)) {
      errors.push(`${path.relative(root, file)} contains a ${label}.`);
    }
  }
}

if (/^#{1,6}\s*Demo login credentials\b/im.test(readme)) {
  errors.push('README.md must not publish demo login credentials.');
}

if (/^\|[^|\r\n]*\bPassword\b[^|\r\n]*\|/im.test(appDocs)) {
  errors.push('docs/APPS.md must not include a demo password table column.');
}

if (errors.length > 0) {
  console.error('Portfolio validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Portfolio validation passed: ${apps.length} apps, ${tools.length} testing tools.`);
}
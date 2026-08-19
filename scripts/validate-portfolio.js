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

const apps = directoriesUnder(appsDir);
const tools = directoriesUnder(testingDir);
const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const errors = [];

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

if (errors.length > 0) {
  console.error('Portfolio validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Portfolio validation passed: ${apps.length} apps, ${tools.length} testing tools.`);
}
#!/usr/bin/env node
import express, { Request, Response } from 'express';
import cors from 'cors';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { loadDashboardData } from './data-loader';

const DEFAULT_PORT = 4000;
const DEFAULT_REPORTS_DIR = path.resolve(__dirname, '..', '..', 'reports');

const app = express();
app.use(cors());
app.use(express.json());

// Serve React static build from frontend/dist
const staticDir = path.resolve(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
}

let reportsDir = process.env.REPORTS_DIR ?? DEFAULT_REPORTS_DIR;

// ── API routes ────────────────────────────────────────────────────────────────

/** GET /api/dashboard — full aggregated report */
app.get('/api/dashboard', (_req: Request, res: Response) => {
  try {
    const data = loadDashboardData(reportsDir);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/** GET /api/tools — list tool statuses */
app.get('/api/tools', (_req: Request, res: Response) => {
  try {
    const data = loadDashboardData(reportsDir);
    res.json(data.tools.map(({ findings: _f, ...t }) => t));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/** GET /api/findings — all findings, optionally filtered */
app.get('/api/findings', (req: Request, res: Response) => {
  try {
    const data = loadDashboardData(reportsDir);
    let findings = data.allFindings;

    const { severity, tool, limit } = req.query;
    if (typeof severity === 'string') {
      findings = findings.filter((f) => f.severity === severity.toUpperCase());
    }
    if (typeof tool === 'string') {
      findings = findings.filter((f) => f.tool.toLowerCase().includes(tool.toLowerCase()));
    }
    const lim = typeof limit === 'string' ? Math.min(parseInt(limit, 10), 1000) : 500;
    res.json({ total: findings.length, findings: findings.slice(0, lim) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/** GET /api/report/:tool — raw report file */
app.get('/api/report/:tool', (req: Request, res: Response) => {
  const toolName = req.params.tool.replace(/[^a-z0-9-]/gi, '');
  const toolDir = path.join(reportsDir, toolName);
  if (!fs.existsSync(toolDir)) {
    res.status(404).json({ error: 'Tool report not found' });
    return;
  }
  const files = fs.readdirSync(toolDir).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    res.status(404).json({ error: 'No reports for this tool yet' });
    return;
  }
  const file = path.join(toolDir, files[0]);
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to parse report' });
  }
});

/** POST /api/refresh — broadcast new data to WebSocket clients */
app.post('/api/refresh', (_req: Request, res: Response) => {
  const data = loadDashboardData(reportsDir);
  broadcast({ type: 'refresh', data });
  res.json({ ok: true, timestamp: data.timestamp });
});

// Fallback — serve React SPA
app.get('*', (_req: Request, res: Response) => {
  const index = path.join(staticDir, 'index.html');
  if (fs.existsSync(index)) {
    res.sendFile(index);
  } else {
    res.status(200).send(devHtml());
  }
});

// ── WebSocket broadcast ───────────────────────────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);
  // Send current snapshot on connect
  try {
    const data = loadDashboardData(reportsDir);
    ws.send(JSON.stringify({ type: 'snapshot', data }));
  } catch { /* no reports yet */ }

  ws.on('close', () => clients.delete(ws));
});

function broadcast(msg: unknown): void {
  const payload = JSON.stringify(msg);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Poll for file system changes every 15 seconds
let lastHash = '';
setInterval(() => {
  try {
    const data = loadDashboardData(reportsDir);
    const hash = data.timestamp + data.totals.total;
    if (hash !== lastHash) {
      lastHash = hash;
      broadcast({ type: 'update', data });
    }
  } catch { /* ignore */ }
}, 15_000);

// ── Dev HTML fallback (no React build yet) ────────────────────────────────────
function devHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Enterprise Security Dashboard</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0d1117; color: #c9d1d9; margin: 0; padding: 20px; }
    h1 { color: #58a6ff; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 24px; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; }
    .card h3 { margin: 0 0 8px; color: #f0f6fc; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .pass { background: #1a4731; color: #3fb950; }
    .fail { background: #4b1818; color: #f85149; }
    .unknown { background: #21262d; color: #8b949e; }
    .stat { font-size: 28px; font-weight: bold; color: #58a6ff; }
    .totals { display: flex; gap: 24px; flex-wrap: wrap; margin: 16px 0; }
    .tot { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 12px 20px; text-align: center; }
    .tot label { display: block; font-size: 12px; text-transform: uppercase; color: #8b949e; }
    #status { margin-bottom: 8px; color: #8b949e; font-size: 13px; }
    .critical { color: #f85149; }
    .high { color: #e3b341; }
    .medium { color: #d29922; }
  </style>
</head>
<body>
  <h1>🔐 Enterprise Security Dashboard</h1>
  <p id="status">Connecting to backend...</p>
  <div id="score" class="stat">--</div>
  <div class="totals" id="totals"></div>
  <div class="grid" id="tools"></div>
  <script>
    const ws = new WebSocket('ws://' + location.host);
    ws.onmessage = (e) => {
      const { type, data } = JSON.parse(e.data);
      if (type === 'snapshot' || type === 'update') renderDashboard(data);
    };
    ws.onerror = () => document.getElementById('status').textContent = 'WebSocket error — reload to retry';

    function renderDashboard(data) {
      document.getElementById('status').textContent = 'Last updated: ' + new Date(data.timestamp).toLocaleString();
      document.getElementById('score').textContent = data.overallScore + '% tools passing';

      const tots = document.getElementById('totals');
      tots.innerHTML = [
        ['CRITICAL', data.totals.critical, 'critical'],
        ['HIGH', data.totals.high, 'high'],
        ['MEDIUM', data.totals.medium, 'medium'],
        ['LOW', data.totals.low, ''],
        ['TOTAL', data.totals.total, ''],
      ].map(([label, v, cls]) =>
        '<div class="tot"><div class="stat ' + cls + '">' + v + '</div><label>' + label + '</label></div>'
      ).join('');

      const grid = document.getElementById('tools');
      grid.innerHTML = data.tools.map(t =>
        '<div class="card">' +
        '<h3>' + t.label + ' <span class="badge ' + t.status + '">' + t.status.toUpperCase() + '</span></h3>' +
        '<div style="font-size:13px;color:#8b949e">' + t.description + '</div>' +
        (t.summary ? '<pre style="font-size:11px;color:#8b949e;margin:8px 0 0">' + JSON.stringify(t.summary, null, 2) + '</pre>' : '') +
        '</div>'
      ).join('');
    }

    // Also load via REST as fallback
    fetch('/api/dashboard').then(r => r.json()).then(renderDashboard).catch(() => {});
  </script>
</body>
</html>`;
}

// ── CLI entry ─────────────────────────────────────────────────────────────────
import { Command } from 'commander';

const program = new Command();
program
  .name('security-dashboard')
  .description('Serve the Enterprise Security Dashboard')
  .version('1.0.0')
  .option('-p, --port <port>', 'HTTP port', String(DEFAULT_PORT))
  .option('-r, --reports-dir <dir>', 'Directory containing tool report subdirectories', DEFAULT_REPORTS_DIR)
  .action((opts) => {
    const port = parseInt(opts.port, 10);
    reportsDir = path.resolve(opts.reportsDir);
    server.listen(port, () => {
      console.log(`\n🔐 Security Dashboard running at http://localhost:${port}`);
      console.log(`   WebSocket streaming at ws://localhost:${port}`);
      console.log(`   API available at http://localhost:${port}/api/dashboard`);
      console.log(`   Reports directory: ${reportsDir}`);
      if (!fs.existsSync(staticDir)) {
        console.log('\n   ℹ  React frontend not built. Run: cd frontend && npm install && npm run build');
        console.log('   ℹ  Serving fallback HTML dashboard for now.\n');
      }
    });
  });

program.parse(process.argv);

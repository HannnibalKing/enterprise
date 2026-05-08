import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { WebSocketServer } from 'ws';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { detectAnomalies } from './anomaly-detector';
import { TrafficRecord, MonitorConfig, MonitorStats, AnomalyType } from './types';

const DEFAULT_CONFIG: MonitorConfig = {
  targetUrl: process.env.TARGET_URL ?? 'http://localhost:3001',
  proxyPort: parseInt(process.env.PROXY_PORT ?? '8080', 10),
  maxBodySize: parseInt(process.env.MAX_BODY_SIZE ?? '1048576', 10), // 1 MB
  slowRequestThreshold: parseInt(process.env.SLOW_THRESHOLD ?? '2000', 10), // 2s
  logFile: process.env.LOG_FILE,
  enableWebSocket: process.env.ENABLE_WS !== 'false',
  wsPort: parseInt(process.env.WS_PORT ?? '8081', 10),
};

const records: TrafficRecord[] = [];
const stats: MonitorStats = {
  totalRequests: 0,
  flaggedRequests: 0,
  statusCodes: {},
  slowRequests: 0,
  topPaths: {},
  anomalyBreakdown: {} as Record<AnomalyType, number>,
  startTime: new Date().toISOString(),
  uptime: 0,
};

let wss: WebSocketServer | null = null;

function broadcast(data: unknown): void {
  if (!wss) return;
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1 /* OPEN */) client.send(msg);
  });
}

function recordTraffic(record: TrafficRecord): void {
  records.unshift(record); // newest first
  if (records.length > 1000) records.splice(1000); // keep last 1000

  // Update stats
  stats.totalRequests++;
  if (record.flagged) stats.flaggedRequests++;
  stats.statusCodes[record.responseStatus] = (stats.statusCodes[record.responseStatus] ?? 0) + 1;
  if (record.durationMs > DEFAULT_CONFIG.slowRequestThreshold) stats.slowRequests++;
  stats.topPaths[record.path] = (stats.topPaths[record.path] ?? 0) + 1;
  for (const a of record.anomalies) {
    stats.anomalyBreakdown[a.type] = (stats.anomalyBreakdown[a.type] ?? 0) + 1;
  }

  // Log to file if configured
  if (DEFAULT_CONFIG.logFile) {
    const line = JSON.stringify(record) + '\n';
    fs.appendFileSync(DEFAULT_CONFIG.logFile, line, 'utf-8');
  }

  // Broadcast to WebSocket clients
  broadcast({ type: 'record', data: record });
  broadcast({ type: 'stats', data: { ...stats, uptime: Date.now() - Date.parse(stats.startTime) } });

  // Console output
  const flag = record.flagged ? '🚨' : '  ';
  const time = record.durationMs;
  console.log(
    `${flag} ${record.method.padEnd(7)} ${record.path.padEnd(40)} ${record.responseStatus} ${time}ms` +
    (record.anomalies.length ? `  ⚠ ${record.anomalies.map((a) => a.type).join(', ')}` : '')
  );
}

export function createMonitorApp(config: MonitorConfig = DEFAULT_CONFIG): http.Server {
  const app = express();

  // Parse body for analysis (must come before proxy)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.text({ limit: '10mb' }));

  // ── Management API ─────────────────────────────────────────────────────────
  app.get('/__monitor/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
  app.get('/__monitor/stats', (_req, res) => res.json({ ...stats, uptime: Date.now() - Date.parse(stats.startTime) }));
  app.get('/__monitor/records', (_req, res) => res.json(records.slice(0, 100)));
  app.get('/__monitor/flagged', (_req, res) => res.json(records.filter((r) => r.flagged).slice(0, 100)));

  // ── Intercept + proxy ──────────────────────────────────────────────────────
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const id = uuidv4();
    const requestBody = req.body ?? null;
    const requestHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      requestHeaders[k] = Array.isArray(v) ? v.join(', ') : (v ?? '');
    }

    // Capture response
    const originalSend = res.send.bind(res);
    let responseBody: unknown = null;

    (res as express.Response & { send: typeof res.send }).send = function (body?: unknown) {
      responseBody = body;
      return originalSend(body);
    };

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const responseHeaders: Record<string, string> = {};
      for (const [k, v] of Object.entries(res.getHeaders())) {
        responseHeaders[k] = Array.isArray(v) ? v.join(', ') : String(v ?? '');
      }

      const anomalies = detectAnomalies(
        req.method,
        req.path,
        req.query as Record<string, string | string[]>,
        requestHeaders,
        requestBody,
        res.statusCode,
        responseBody,
        durationMs,
        config.maxBodySize,
        config.slowRequestThreshold
      );

      const record: TrafficRecord = {
        id,
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        query: req.query as Record<string, string | string[]>,
        requestHeaders,
        requestBody,
        responseStatus: res.statusCode,
        responseHeaders,
        responseBody,
        durationMs,
        clientIp: req.ip ?? req.socket.remoteAddress ?? 'unknown',
        anomalies,
        flagged: anomalies.some((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH'),
      };

      recordTraffic(record);
    });

    next();
  });

  // Proxy everything else to the target
  app.use(
    '/',
    createProxyMiddleware({
      target: config.targetUrl,
      changeOrigin: true,
      logger: { info: () => {}, warn: () => {}, error: console.error },
    })
  );

  const server = http.createServer(app);

  // WebSocket for real-time dashboard
  if (config.enableWebSocket) {
    wss = new WebSocketServer({ port: config.wsPort });
    wss.on('connection', (ws) => {
      ws.send(JSON.stringify({ type: 'init', data: { stats, records: records.slice(0, 50) } }));
    });
    console.log(`📡 WebSocket streaming on ws://localhost:${config.wsPort}`);
  }

  return server;
}

// Start proxy if run directly
if (require.main === module) {
  const config = DEFAULT_CONFIG;
  const server = createMonitorApp(config);

  server.listen(config.proxyPort, () => {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║           API TRAFFIC MONITOR                            ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log(`  Proxy Port  : ${config.proxyPort}`);
    console.log(`  Target URL  : ${config.targetUrl}`);
    console.log(`  Body Limit  : ${(config.maxBodySize / 1024).toFixed(0)} KB`);
    console.log(`  Slow > ${config.slowRequestThreshold}ms`);
    console.log(`  Dashboard   : http://localhost:${config.proxyPort}/__monitor/stats`);
    console.log(`  Records     : http://localhost:${config.proxyPort}/__monitor/records`);
    console.log('');
    console.log('  Intercepting all traffic... Press Ctrl+C to stop\n');
  });
}

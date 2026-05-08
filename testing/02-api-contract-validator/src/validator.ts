import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
  OpenAPISpec,
  ExtractedRoute,
  ContractIssue,
  ValidationReport,
  PathItem,
  Operation,
} from './types';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const;

export class ContractValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
  }

  loadSpec(specFile: string): OpenAPISpec {
    const raw = fs.readFileSync(specFile, 'utf-8');
    const ext = path.extname(specFile).toLowerCase();
    if (ext === '.yaml' || ext === '.yml') {
      return yaml.load(raw) as OpenAPISpec;
    }
    return JSON.parse(raw) as OpenAPISpec;
  }

  validate(
    spec: OpenAPISpec,
    extractedRoutes: ExtractedRoute[],
    specFile: string,
    sourceDir: string
  ): ValidationReport {
    const issues: ContractIssue[] = [];

    // 1. Validate the spec itself
    issues.push(...this.validateSpec(spec));

    // 2. Check that spec routes have implementation
    issues.push(...this.checkSpecCoverage(spec, extractedRoutes));

    // 3. Check that implemented routes exist in the spec
    issues.push(...this.checkUndocumentedRoutes(spec, extractedRoutes));

    // 4. Check security requirements
    issues.push(...this.checkSecurity(spec, extractedRoutes));

    // 5. Check for missing response codes
    issues.push(...this.checkResponseCodes(spec));

    // 6. Check schema quality
    issues.push(...this.checkSchemaQuality(spec));

    const summary = {
      errors: issues.filter((i) => i.severity === 'ERROR').length,
      warnings: issues.filter((i) => i.severity === 'WARNING').length,
      info: issues.filter((i) => i.severity === 'INFO').length,
      total: issues.length,
    };

    return {
      reportId: `contract-${Date.now()}`,
      timestamp: new Date().toISOString(),
      specFile,
      sourceDir,
      specTitle: spec.info?.title ?? 'Unknown',
      specVersion: spec.info?.version ?? 'Unknown',
      totalRoutesDefined: this.countSpecRoutes(spec),
      totalRoutesFound: extractedRoutes.length,
      issues,
      summary,
      passed: summary.errors === 0,
    };
  }

  private validateSpec(spec: OpenAPISpec): ContractIssue[] {
    const issues: ContractIssue[] = [];

    if (!spec.openapi?.startsWith('3.')) {
      issues.push({
        severity: 'ERROR',
        code: 'SPEC001',
        message: `OpenAPI version '${spec.openapi}' is not supported. Use OpenAPI 3.x.`,
      });
    }

    if (!spec.info?.title) {
      issues.push({ severity: 'WARNING', code: 'SPEC002', message: 'API spec is missing info.title.' });
    }

    if (!spec.info?.version) {
      issues.push({ severity: 'WARNING', code: 'SPEC003', message: 'API spec is missing info.version.' });
    }

    if (!spec.components?.securitySchemes || Object.keys(spec.components.securitySchemes).length === 0) {
      issues.push({
        severity: 'WARNING',
        code: 'SPEC004',
        message: 'No securitySchemes defined. Document authentication methods.',
      });
    }

    return issues;
  }

  private countSpecRoutes(spec: OpenAPISpec): number {
    let count = 0;
    for (const pathItem of Object.values(spec.paths ?? {})) {
      for (const method of HTTP_METHODS) {
        if ((pathItem as Record<string, unknown>)[method]) count++;
      }
    }
    return count;
  }

  private normalizeExpressPath(p: string): string {
    // Convert Express :param to {param} OpenAPI style for comparison
    return p.replace(/:([^/]+)/g, '{$1}');
  }

  private checkSpecCoverage(spec: OpenAPISpec, routes: ExtractedRoute[]): ContractIssue[] {
    const issues: ContractIssue[] = [];

    for (const [specPath, pathItem] of Object.entries(spec.paths ?? {})) {
      for (const method of HTTP_METHODS) {
        const op = (pathItem as PathItem)[method];
        if (!op) continue;

        const found = routes.some(
          (r) =>
            r.method === method.toUpperCase() &&
            this.normalizeExpressPath(r.path) === specPath
        );

        if (!found) {
          issues.push({
            severity: 'WARNING',
            code: 'COV001',
            message: `Spec defines ${method.toUpperCase()} ${specPath} but no matching implementation found.`,
            path: specPath,
            method: method.toUpperCase(),
            detail: 'Create the route handler or remove the unused spec entry.',
          });
        }
      }
    }

    return issues;
  }

  private checkUndocumentedRoutes(spec: OpenAPISpec, routes: ExtractedRoute[]): ContractIssue[] {
    const issues: ContractIssue[] = [];
    const specPaths = new Set<string>();

    for (const [specPath, pathItem] of Object.entries(spec.paths ?? {})) {
      for (const method of HTTP_METHODS) {
        if ((pathItem as PathItem)[method]) {
          specPaths.add(`${method.toUpperCase()}:${specPath}`);
        }
      }
    }

    for (const route of routes) {
      const key = `${route.method}:${this.normalizeExpressPath(route.path)}`;
      if (!specPaths.has(key)) {
        issues.push({
          severity: 'ERROR',
          code: 'COV002',
          message: `Route ${route.method} ${route.path} (${path.relative(process.cwd(), route.file)}:${route.line}) is not documented in the API spec.`,
          path: route.path,
          method: route.method,
          detail: 'Add this route to your OpenAPI spec or remove the undocumented endpoint.',
        });
      }
    }

    return issues;
  }

  private checkSecurity(spec: OpenAPISpec, routes: ExtractedRoute[]): ContractIssue[] {
    const issues: ContractIssue[] = [];

    for (const [specPath, pathItem] of Object.entries(spec.paths ?? {})) {
      for (const method of HTTP_METHODS) {
        const op = (pathItem as PathItem)[method];
        if (!op) continue;

        const isPublic =
          Array.isArray(op.security) && op.security.length === 0;

        if (!isPublic && !op.security) {
          issues.push({
            severity: 'WARNING',
            code: 'AUTH001',
            message: `${method.toUpperCase()} ${specPath} has no security requirement defined. Mark as public ({}) or add a security scheme.`,
            path: specPath,
            method: method.toUpperCase(),
          });
        }

        // Check corresponding implementation for auth middleware
        const implRoute = routes.find(
          (r) =>
            r.method === method.toUpperCase() &&
            this.normalizeExpressPath(r.path) === specPath
        );

        if (implRoute && !isPublic && op.security && op.security.length > 0 && !implRoute.hasAuth) {
          issues.push({
            severity: 'ERROR',
            code: 'AUTH002',
            message: `${method.toUpperCase()} ${specPath} requires authentication per spec but no auth middleware detected in implementation (${path.relative(process.cwd(), implRoute.file)}:${implRoute.line}).`,
            path: specPath,
            method: method.toUpperCase(),
          });
        }
      }
    }

    return issues;
  }

  private checkResponseCodes(spec: OpenAPISpec): ContractIssue[] {
    const issues: ContractIssue[] = [];

    for (const [specPath, pathItem] of Object.entries(spec.paths ?? {})) {
      for (const method of HTTP_METHODS) {
        const op = (pathItem as PathItem)[method];
        if (!op) continue;

        const codes = Object.keys(op.responses ?? {});

        if (!codes.includes('401') && !codes.includes('403') && op.security && op.security.length > 0) {
          issues.push({
            severity: 'WARNING',
            code: 'RESP001',
            message: `${method.toUpperCase()} ${specPath} is secured but missing 401/403 response documentation.`,
            path: specPath,
            method: method.toUpperCase(),
          });
        }

        if (!codes.includes('400') && (method === 'post' || method === 'put' || method === 'patch')) {
          issues.push({
            severity: 'WARNING',
            code: 'RESP002',
            message: `${method.toUpperCase()} ${specPath} mutates data but is missing a 400 (Bad Request) response.`,
            path: specPath,
            method: method.toUpperCase(),
          });
        }

        if (!codes.includes('500')) {
          issues.push({
            severity: 'INFO',
            code: 'RESP003',
            message: `${method.toUpperCase()} ${specPath} is missing a 500 (Internal Server Error) response.`,
            path: specPath,
            method: method.toUpperCase(),
          });
        }
      }
    }

    return issues;
  }

  private checkSchemaQuality(spec: OpenAPISpec): ContractIssue[] {
    const issues: ContractIssue[] = [];

    for (const [name, schema] of Object.entries(spec.components?.schemas ?? {})) {
      if (!schema.type && !schema.$ref) {
        issues.push({
          severity: 'WARNING',
          code: 'SCHEMA001',
          message: `Schema '${name}' has no type defined. All schemas should declare an explicit type.`,
        });
      }

      if (schema.type === 'object' && !schema.properties) {
        issues.push({
          severity: 'WARNING',
          code: 'SCHEMA002',
          message: `Schema '${name}' is an object but has no properties defined. This accepts arbitrary payloads.`,
        });
      }

      if (schema.type === 'string' && !schema.format && !schema.enum && !schema.maxLength) {
        issues.push({
          severity: 'INFO',
          code: 'SCHEMA003',
          message: `String schema '${name}' has no maxLength, format, or enum constraint. Consider adding constraints to prevent over-posting.`,
        });
      }
    }

    return issues;
  }
}

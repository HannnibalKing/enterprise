import * as fs from 'fs';
import * as path from 'path';
import { ExtractedRoute } from './types';

/** HTTP method names we look for in source code */
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

/** Patterns that suggest authentication middleware */
const AUTH_PATTERNS = [
  /authenticate|authorize|requireAuth|isAuthenticated|verifyToken|jwtAuth|passport\.authenticate/i,
  /middleware\.auth|auth\.required|authMiddleware|checkAuth|bearerToken/i,
];

/** Patterns that suggest input validation */
const VALIDATION_PATTERNS = [
  /validate|Joi\.|Zod\.|yup\.|celebrate|express-validator|body\(|query\(|param\(/i,
  /validateRequest|validationMiddleware|requestSchema|bodyParser\.json/i,
];

/** Patterns that suggest error handling */
const ERROR_PATTERNS = [
  /try\s*\{|\.catch\s*\(|next\s*\(err|next\s*\(error|asyncHandler|wrapAsync/i,
];

/**
 * Extracts route definitions from Express/Fastify/NestJS source files.
 * Works on TypeScript and JavaScript.
 */
export class RouteExtractor {
  extract(sourceDir: string): ExtractedRoute[] {
    const routes: ExtractedRoute[] = [];
    const files = this.collectSourceFiles(sourceDir);

    for (const file of files) {
      routes.push(...this.extractFromFile(file));
    }

    return routes;
  }

  private collectSourceFiles(dir: string): string[] {
    const results: string[] = [];
    const EXCLUDES = ['node_modules', 'dist', 'build', '.git', 'coverage'];
    const EXTS = ['.ts', '.js', '.mjs'];

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return results;
    }

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!EXCLUDES.includes(entry.name)) results.push(...this.collectSourceFiles(full));
      } else if (entry.isFile() && EXTS.includes(path.extname(entry.name).toLowerCase())) {
        results.push(full);
      }
    }
    return results;
  }

  private extractFromFile(filePath: string): ExtractedRoute[] {
    let content: string;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      return [];
    }

    const routes: ExtractedRoute[] = [];
    const lines = content.split('\n');

    // Match: router.get('/path', ...) | app.post('/path', ...) | @Get('/path')
    const expressPattern = /(?:router|app|Route)\s*\.\s*(get|post|put|patch|delete|head|options)\s*\(\s*['"`]([^'"` ]+)['"`]/gi;
    const nestPattern = /@(Get|Post|Put|Patch|Delete|Head|Options)\s*\(\s*['"`]([^'"` ]*)['"`]/gi;

    let match: RegExpExecArray | null;

    // Express/Fastify routes
    expressPattern.lastIndex = 0;
    while ((match = expressPattern.exec(content)) !== null) {
      const linesBefore = content.slice(0, match.index).split('\n');
      const lineNum = linesBefore.length;
      const contextBlock = this.getContextBlock(lines, lineNum - 1, 10);

      routes.push({
        method: match[1].toUpperCase(),
        path: match[2],
        file: filePath,
        line: lineNum,
        hasAuth: this.checkPatterns(contextBlock, AUTH_PATTERNS),
        hasValidation: this.checkPatterns(contextBlock, VALIDATION_PATTERNS),
        hasErrorHandling: this.checkPatterns(contextBlock, ERROR_PATTERNS),
        middlewares: this.extractMiddlewareNames(contextBlock),
      });
    }

    // NestJS decorators
    nestPattern.lastIndex = 0;
    while ((match = nestPattern.exec(content)) !== null) {
      const linesBefore = content.slice(0, match.index).split('\n');
      const lineNum = linesBefore.length;
      const contextBlock = this.getContextBlock(lines, lineNum - 1, 15);

      routes.push({
        method: match[1].toUpperCase(),
        path: match[2] || '/',
        file: filePath,
        line: lineNum,
        hasAuth: this.checkPatterns(contextBlock, [/@UseGuards|@Roles|@Public/]),
        hasValidation: this.checkPatterns(contextBlock, [/@Body\(|@Param\(|@Query\(/]),
        hasErrorHandling: true, // NestJS handles this via exception filters
        middlewares: [],
      });
    }

    return routes;
  }

  private getContextBlock(lines: string[], centerLine: number, radius: number): string {
    const start = Math.max(0, centerLine - radius);
    const end = Math.min(lines.length - 1, centerLine + radius);
    return lines.slice(start, end + 1).join('\n');
  }

  private checkPatterns(text: string, patterns: RegExp[]): boolean {
    return patterns.some((p) => p.test(text));
  }

  private extractMiddlewareNames(text: string): string[] {
    const names: string[] = [];
    const match = text.match(/(?:router|app)\.\w+\([^,)]+,\s*([^,)]+)(?:,\s*([^,)]+))*\)/);
    if (match) {
      // Crude extraction of middleware function names between commas
      const args = match[0].match(/,\s*(\w+)/g);
      if (args) names.push(...args.map((a) => a.replace(/,\s*/, '')));
    }
    return names;
  }
}

export interface OpenAPISpec {
  openapi: string;
  info: { title: string; version: string; description?: string };
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, SchemaObject>;
    securitySchemes?: Record<string, SecurityScheme>;
  };
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  patch?: Operation;
  delete?: Operation;
  head?: Operation;
  options?: Operation;
}

export interface Operation {
  operationId?: string;
  summary?: string;
  tags?: string[];
  security?: SecurityRequirement[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
  deprecated?: boolean;
}

export interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  schema?: SchemaObject;
  description?: string;
}

export interface RequestBody {
  required?: boolean;
  content: Record<string, { schema: SchemaObject }>;
}

export interface Response {
  description: string;
  content?: Record<string, { schema: SchemaObject }>;
}

export interface SchemaObject {
  type?: string;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject;
  $ref?: string;
  enum?: unknown[];
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  nullable?: boolean;
}

export interface SecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  scheme?: string;
  bearerFormat?: string;
  in?: string;
  name?: string;
}

export type SecurityRequirement = Record<string, string[]>;

/** A route extracted from application source code */
export interface ExtractedRoute {
  method: string;
  path: string;
  file: string;
  line: number;
  hasAuth: boolean;
  hasValidation: boolean;
  hasErrorHandling: boolean;
  middlewares: string[];
}

export type IssueSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface ContractIssue {
  severity: IssueSeverity;
  code: string;
  message: string;
  path?: string;
  method?: string;
  detail?: string;
}

export interface ValidationReport {
  reportId: string;
  timestamp: string;
  specFile: string;
  sourceDir: string;
  specTitle: string;
  specVersion: string;
  totalRoutesDefined: number;
  totalRoutesFound: number;
  issues: ContractIssue[];
  summary: { errors: number; warnings: number; info: number; total: number };
  passed: boolean;
}

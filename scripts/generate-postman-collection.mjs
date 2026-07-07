/**
 * Generate a Postman v2.1 Collection from openapi.yaml
 *
 * Usage: node scripts/generate-postman-collection.mjs
 * Output: postman_collection.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SPEC_PATH = path.join(ROOT, 'openapi.yaml');
const OUTPUT_PATH = path.join(ROOT, 'postman_collection.json');

function uuid() {
  return crypto.randomUUID();
}

/**
 * Convert URL path params from :param to {{param}} style
 * and extract path variable definitions.
 */
function parsePath(p) {
  const params = [];
  const segments = p.split('/').filter(Boolean);
  const vars = [];
  segments.forEach((seg) => {
    if (seg.startsWith('{') && seg.endsWith('}')) {
      const name = seg.slice(1, -1);
      params.push(`:${name}`);
      vars.push(name);
    } else {
      params.push(seg);
    }
  });
  return { segments: params, variables: vars };
}

/**
 * Build a Postman URL object from an OpenAPI path + parameters.
 */
function buildUrl(baseUrl, apiPath, openApiPathItem, method) {
  const { segments, variables } = parsePath(apiPath);

  const rawSegments = segments.map((s) =>
    s.startsWith(':') ? `{{${s.slice(1)}}}` : s
  );
  let raw = `${baseUrl}/${rawSegments.join('/')}`;

  // Collect query parameters from the operation
  const operation = openApiPathItem[method];
  const queryParams = (operation?.parameters || []).filter(
    (p) => p.in === 'query'
  );
  if (queryParams.length > 0) {
    const qs = queryParams
      .map((qp) => `${qp.name}=${qp.example || qp.schema?.example || ''}`)
      .join('&');
    raw += `?${qs}`;
  }

  return {
    raw,
    host: [baseUrl],
    path: segments,
    variable: variables.map((v) => ({
      key: v,
      value: '',
      description: `Path parameter: ${v}`,
    })),
    query: queryParams.map((qp) => ({
      key: qp.name,
      value: qp.example !== undefined ? String(qp.example) : '',
      description: qp.description || '',
      disabled: false,
    })),
  };
}

/**
 * Build Postman headers from an OpenAPI operation.
 */
function buildHeaders(operation, requiresAuth) {
  const headers = [
    {
      key: 'Content-Type',
      value: 'application/json',
      type: 'text',
    },
  ];

  // Add security header if endpoint requires auth
  if (requiresAuth) {
    headers.push({
      key: 'Authorization',
      value: 'Bearer {{accessToken}}',
      type: 'text',
      description: 'JWT access token',
    });
  }

  // Check for multipart consumption
  const consumes = operation?.requestBody?.content;
  if (consumes) {
    if (consumes['multipart/form-data']) {
      headers[0].value = 'multipart/form-data';
    } else if (consumes['text/event-stream']) {
      return []; // SSE endpoints don't need manual headers
    }
  }

  return headers;
}

/**
 * Build a Postman body from an OpenAPI operation.
 */
function buildBody(operation) {
  const content = operation?.requestBody?.content;
  if (!content) return null;

  // JSON body
  if (content['application/json']?.schema) {
    const schema = content['application/json'].schema;
    const example = generateExampleFromSchema(schema);
    return {
      mode: 'raw',
      raw: JSON.stringify(example, null, 2),
      options: {
        raw: {
          language: 'json',
        },
      },
    };
  }

  // Multipart form data
  if (content['multipart/form-data']?.schema) {
    const schema = content['multipart/form-data'].schema;
    const formdata = [];
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (prop.format === 'binary') {
          formdata.push({
            key,
            type: 'file',
            src: '',
            description: prop.description || '',
          });
        } else {
          formdata.push({
            key,
            value: prop.example !== undefined ? String(prop.example) : generateExample(prop),
            type: 'text',
            description: prop.description || '',
          });
        }
      }
    }
    return {
      mode: 'formdata',
      formdata,
    };
  }

  return null;
}

/**
 * Generate an example value from a JSON Schema property.
 */
function generateExample(prop) {
  if (!prop) return '';
  if (prop.example !== undefined) return prop.example;
  switch (prop.type) {
    case 'string':
      if (prop.enum) return prop.enum[0];
      if (prop.format === 'email') return 'user@example.com';
      if (prop.format === 'date-time') return new Date().toISOString();
      if (prop.format === 'password') return 'secret123';
      if (prop.format === 'uri') return 'https://example.com/image.png';
      return 'string';
    case 'integer':
      return 1;
    case 'number':
      return 9.99;
    case 'boolean':
      return true;
    case 'array':
      return [generateExample(prop.items)];
    case 'object':
      return generateExampleFromSchema(prop);
    default:
      return '';
  }
}

/**
 * Generate an example object from an OpenAPI schema.
 */
function generateExampleFromSchema(schema) {
  if (!schema || !schema.properties) return {};
  const result = {};
  for (const [key, prop] of Object.entries(schema.properties)) {
    if (prop.$ref) {
      result[key] = prop.$ref;
    } else if (prop.oneOf) {
      // Take the first option
      result[key] = generateExample(prop.oneOf[0]);
    } else {
      result[key] = generateExample(prop);
    }
  }
  return result;
}

/**
 * Check if an operation requires authentication.
 */
function requiresAuth(operation) {
  // If the operation has a security array with BearerAuth or if the path-level has security
  return (
    operation?.security?.some((s) => s.BearerAuth) || false
  );
}

/**
 * Get a display-friendly summary from a path + method.
 */
function getRequestName(path, method, operation) {
  const summary = operation?.summary || '';
  if (summary) return summary;
  const parts = path.split('/').filter(Boolean);
  const last = parts[parts.length - 1]?.replace(/[{}]/g, '') || '';
  return `${method.toUpperCase()} ${last}`;
}

/**
 * Convert the OpenAPI spec to a Postman collection.
 */
function convertToPostman(spec) {
  const baseUrl = spec.servers?.[0]?.url || 'http://localhost:5000/api';

  // Organize paths by tags
  const tagMap = new Map();

  for (const [apiPath, pathItem] of Object.entries(spec.paths || {})) {
    const methods = ['get', 'post', 'put', 'patch', 'delete'];
    for (const method of methods) {
      const operation = pathItem[method];
      if (!operation) continue;

      const tags = operation.tags || ['Other'];
      const tag = tags[0];

      if (!tagMap.has(tag)) {
        tagMap.set(tag, []);
      }

      const request = {
        name: getRequestName(apiPath, method, operation),
        request: {
          method: method.toUpperCase(),
          header: buildHeaders(operation, requiresAuth(operation)),
          url: buildUrl(baseUrl, apiPath, pathItem, method),
          description: operation.description || operation.summary || '',
        },
      };

      // Add request body if applicable
      const body = buildBody(operation);
      if (body) {
        request.request.body = body;
      }

      tagMap.get(tag).push(request);
    }
  }

  // Build items array
  const items = [];
  for (const [tagName, requests] of tagMap.entries()) {
    if (requests.length === 1) {
      // Single-request tags go directly as items, not folders
      items.push(requests[0]);
    } else {
      items.push({
        name: tagName,
        description: spec.tags?.find((t) => t.name === tagName)?.description || '',
        item: requests,
      });
    }
  }

  return {
    info: {
      _postman_id: uuid(),
      name: spec.info?.title || 'API Collection',
      description: spec.info?.description || '',
      version: spec.info?.version || '1.0.0',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: items,
    variable: [
      {
        key: 'baseUrl',
        value: baseUrl,
        type: 'string',
      },
      {
        key: 'accessToken',
        value: '',
        type: 'string',
        description: 'JWT access token obtained from POST /auth/login or POST /auth/google',
      },
    ],
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{accessToken}}',
          type: 'string',
        },
      ],
    },
  };
}

// ── Main ────────────────────────────────────────────────────────────
console.log('📦 Generating Postman collection from openapi.yaml...');

if (!fs.existsSync(SPEC_PATH)) {
  console.error(`❌ openapi.yaml not found at ${SPEC_PATH}`);
  process.exit(1);
}

try {
  const spec = yaml.load(fs.readFileSync(SPEC_PATH, 'utf8'));
  const collection = convertToPostman(spec);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(collection, null, 2), 'utf8');
  console.log(`✅ Postman collection generated: ${OUTPUT_PATH}`);
  console.log(`   Collection: ${collection.info.name}`);
  console.log(`   Folders:    ${collection.item.length}`);
  console.log(`   Variables:  baseUrl, accessToken`);
  console.log('');
  console.log('📋 To import into Postman:');
  console.log('   File → Import → Upload Files → postman_collection.json');
  console.log('');
  console.log('🔑 After importing, set the accessToken collection variable:');
  console.log('   1. Call POST /api/auth/login with admin credentials');
  console.log('   2. Copy the token from the response');
  console.log('   3. Right-click the collection → Edit → Variables tab');
  console.log("   4. Set 'accessToken' initial value to the copied token");
  console.log('   5. All authenticated endpoints will use it automatically');
} catch (err) {
  console.error(`❌ Failed to generate Postman collection: ${err.message}`);
  process.exit(1);
}

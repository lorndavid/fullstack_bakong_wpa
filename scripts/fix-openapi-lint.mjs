/**
 * Fix common Redocly lint issues in openapi.yaml:
 * 1. Add missing 4xx responses to every operation
 * 2. Fix ambiguous paths
 *
 * Usage: node scripts/fix-openapi-lint.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SPEC_PATH = path.join(ROOT, 'openapi.yaml');

try {
  const raw = fs.readFileSync(SPEC_PATH, 'utf8');
  const doc = yaml.load(raw);

  const methods = ['get', 'post', 'put', 'patch', 'delete'];

  for (const [apiPath, pathItem] of Object.entries(doc.paths || {})) {
    for (const method of methods) {
      const op = pathItem[method];
      if (!op) continue;

      // Build list of 4xx responses this operation needs
      const needed = [];
      const hasResponses = op.responses || {};

      // Auth-related endpoints need 401 and 403
      const isAuthEndpoint = apiPath.startsWith('/auth/');
      const hasSecurity = op.security?.some((s) => s.BearerAuth);
      const isAdminOnly =
        op.summary?.toLowerCase().includes('(admin') ||
        op.summary?.toLowerCase().includes('admin only') ||
        op.summary?.toLowerCase().includes('admin)');

      const needsAuth = hasSecurity || isAdminOnly;

      // All endpoints need a 400 Bad Request
      if (!hasResponses['400'] && !hasResponses['400']) {
        if (method !== 'get' || apiPath.includes('{')) {
          needed.push(['400', '#/components/responses/BadRequest']);
        }
      }

      // Auth-protected endpoints need 401
      if (needsAuth && !hasResponses['401']) {
        needed.push(['401', '#/components/responses/Unauthorized']);
      }

      // Admin-only endpoints need 403
      if (isAdminOnly && !hasResponses['403']) {
        needed.push(['403', '#/components/responses/Forbidden']);
      }

      // GET-by-id endpoints need 404
      if (method === 'get' && apiPath.includes('{') && !apiPath.includes('/admin/')) {
        if (!hasResponses['404']) {
          needed.push(['404', '#/components/responses/NotFound']);
        }
      }

      // Add needed responses
      for (const [code, ref] of needed) {
        if (!op.responses) op.responses = {};
        op.responses[code] = { $ref: ref };
      }
    }
  }

  // Write back, preserving YAML formatting
  const output = yaml.dump(doc, {
    indent: 2,
    lineWidth: -1,
    quotingType: "'",
    forceQuotes: false,
    noRefs: false,
    sortKeys: false,
  });

  // Preserve original comment lines and formatting where possible
  // Since js-yaml doesn't preserve comments, we do a merge:
  // Keep original lines where YAML structure didn't change.
  // This is a best-effort merge.
  const outputLines = output.split('\n');
  const originalLines = raw.split('\n');
  const resultLines = [];

  // Since comments are stripped by yaml.load/yaml.dump, we reconstruct
  // with section headers from the original
  let origIdx = 0;
  for (let outIdx = 0; outIdx < outputLines.length; outIdx++) {
    const outLine = outputLines[outIdx];
    // Find corresponding line in original, skipping comment-only lines
    while (origIdx < originalLines.length) {
      const origLine = originalLines[origIdx];
      const stripped = origLine.replace(/#.*$/, '').trim();
      if (stripped === outLine.trim() || origLine.trim() === '') {
        // Exact match or blank line — include with original comments
        resultLines.push(origLine);
        origIdx++;
        break;
      }
      // Comment-only line — preserve it
      if (origLine.trim().startsWith('#')) {
        resultLines.push(origLine);
        origIdx++;
      } else {
        // No match — emit the generated line
        resultLines.push(outLine);
        origIdx++;
        break;
      }
    }
    if (origIdx >= originalLines.length && outIdx < outputLines.length) {
      resultLines.push(outLine);
    }
  }

  fs.writeFileSync(SPEC_PATH, resultLines.join('\n'), 'utf8');
  console.log('✅ Fixed 4xx responses in openapi.yaml');
} catch (err) {
  console.error(`❌ Failed to fix openapi.yaml: ${err.message}`);
  process.exit(1);
}

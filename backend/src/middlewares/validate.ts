import { z, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Validate request body against a Zod schema.
 *
 * ```
 * router.post('/login', validate(loginSchema), login);
 * ```
 */
export function validate(schema: z.ZodType<any, any, any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }
    // Replace body with parsed (coerced/transformed) values
    req.body = result.data;
    next();
  };
}

/**
 * Validate request params against a Zod schema.
 */
export function validateParams(schema: z.ZodType<any, any, any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      res.status(400).json({
        success: false,
        message: 'Invalid parameters',
        errors,
      });
      return;
    }
    // Replace params with parsed data (provides defaults from schema)
    req.params = result.data;
    next();
  };
}

/**
 * Validate request query against a Zod schema.
 * Also replaces req.query with parsed data to inject default values.
 */
export function validateQuery(schema: z.ZodType<any, any, any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors,
      });
      return;
    }
    // Replace query with parsed data (provides defaults like page=1, limit=20)
    (req as any).query = result.data;
    next();
  };
}

function formatZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    // Keep the first error for each field
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}

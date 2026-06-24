import type { Request } from 'express';

import type { AdminAuditRequestContext } from './admin-audit.service';

/** Extracts safe request correlation fields for admin audit logging. */
export function adminAuditRequestContext(req: Request): AdminAuditRequestContext {
  const userAgentHeader = req.headers['user-agent'];
  const userAgent =
    typeof userAgentHeader === 'string'
      ? userAgentHeader
      : Array.isArray(userAgentHeader)
        ? userAgentHeader[0]
        : undefined;

  const rawRequestId = (req as Request & { id?: unknown }).id;
  const requestId = typeof rawRequestId === 'string' ? rawRequestId : undefined;

  return {
    requestId,
    ipAddress: req.ip,
    userAgent,
  };
}

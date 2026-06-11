import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

interface ErrorResponseBody {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  path?: string;
  method?: string;
  requestId?: string;
  timestamp: string;
}

/**
 * Catch-all exception filter producing a single, consistent error envelope for
 * the whole API. Includes the request correlation id so client errors can be
 * tied back to server logs — important for payment/dispute/KYC support cases.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @InjectPinoLogger(AllExceptionsFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<{ url?: string; method?: string; id?: string }>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: unknown;

    if (isHttp) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (response && typeof response === 'object') {
        const body = response as Record<string, unknown>;
        message = (body.message as string) ?? exception.message;
        if (typeof body.code === 'string') {
          code = body.code;
        }
        details = body.message ?? body.details;
      }
      if (code === 'INTERNAL_SERVER_ERROR') {
        code = exception.name.replace(/Exception$/, '').toUpperCase() || code;
      }
    }

    const body: ErrorResponseBody = {
      statusCode: status,
      code,
      message,
      details,
      path: request?.url,
      method: request?.method,
      requestId: request?.id,
      timestamp: new Date().toISOString(),
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error({ err: exception, requestId: request?.id, path: request?.url }, message);
    } else {
      this.logger.warn({ statusCode: status, requestId: request?.id, path: request?.url }, message);
    }

    httpAdapter.reply(ctx.getResponse(), body, status);
  }
}

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Observable, tap } from 'rxjs';

interface RequestLike {
  id?: string;
  method?: string;
  url?: string;
}

/**
 * Per-request timing interceptor.
 *
 * pino-http already emits base request/response logs; this interceptor adds a
 * structured, duration-aware completion event and is the designated extension
 * point for future business/audit logging (payments, disputes, KYC actions).
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectPinoLogger(LoggingInterceptor.name)
    private readonly logger: PinoLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<RequestLike>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () =>
          this.record(request, startedAt, http.getResponse<{ statusCode?: number }>()?.statusCode),
        error: () => this.record(request, startedAt, undefined, true),
      }),
    );
  }

  private record(
    request: RequestLike,
    startedAt: number,
    statusCode: number | undefined,
    failed = false,
  ): void {
    const payload = {
      requestId: request?.id,
      method: request?.method,
      url: request?.url,
      statusCode,
      durationMs: Date.now() - startedAt,
    };
    if (failed) {
      this.logger.warn(payload, 'Request failed');
    } else {
      this.logger.debug(payload, 'Request completed');
    }
  }
}

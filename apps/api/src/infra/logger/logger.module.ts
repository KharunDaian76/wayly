import { randomUUID } from 'node:crypto';

import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

import { AppConfigModule } from '../../config/config.module';
import { AppConfigService } from '../../config/config.service';

/**
 * Structured (pino) logging configured for compliance-grade audit trails.
 *
 * - Correlation IDs: every request gets/echoes `x-request-id` so payment, KYC,
 *   and dispute events can be traced end-to-end.
 * - Redaction: secrets and PII (auth headers, cookies, tokens, passwords, card
 *   fields) are stripped before anything is written.
 * - Dev: human-readable pretty logs. Prod: JSON for log aggregation.
 *
 * Marked @Global so feature modules (Auth, Users, …) can inject context loggers
 * via @InjectPinoLogger without re-importing this module in every feature.
 */
@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.logging.level,
          genReqId: (req, res) => {
            const incoming = req.headers['x-request-id'];
            const id = (Array.isArray(incoming) ? incoming[0] : incoming) ?? randomUUID();
            res.setHeader('x-request-id', id);
            return id;
          },
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'res.headers["set-cookie"]',
              'req.body.password',
              'req.body.token',
              '*.password',
              '*.secret',
              '*.token',
              '*.accessToken',
              '*.refreshToken',
              '*.cardNumber',
              '*.cvc',
              '*.iban',
            ],
            remove: true,
          },
          autoLogging: true,
          customProps: () => ({ context: 'HTTP' }),
          transport: config.isProduction
            ? undefined
            : {
                target: 'pino-pretty',
                options: { singleLine: true, colorize: true, translateTime: 'SYS:standard' },
              },
        },
      }),
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}

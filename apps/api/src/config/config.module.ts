import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppConfigService } from './config.service';
import { envSchema } from './env.schema';

/**
 * Global configuration module.
 *
 * Validates the entire environment at startup with Zod and FAILS FAST on any
 * invalid/missing value, listing every problem at once. Marked @Global so any
 * future module can inject {@link AppConfigService} without re-importing.
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      // Load the monorepo root .env (and a local one if present).
      envFilePath: ['.env', '../../.env'],
      validate: (raw) => {
        const parsed = envSchema.safeParse(raw);
        if (!parsed.success) {
          const issues = parsed.error.issues
            .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
            .join('\n');
          throw new Error(`Invalid environment configuration:\n${issues}`);
        }
        return parsed.data;
      },
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}

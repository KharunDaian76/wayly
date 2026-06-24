import { Module } from '@nestjs/common';

import { AdminAuditModule } from '../admin-audit/admin-audit.module';

import { AdminKycController } from './admin-kyc.controller';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';

@Module({
  imports: [AdminAuditModule],
  controllers: [KycController, AdminKycController],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}

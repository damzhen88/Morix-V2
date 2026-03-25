import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { CrmRepository } from './crm.repository';
import { CrmDeal } from './entities/crm-deal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CrmDeal])],
  controllers: [CrmController],
  providers: [CrmService, CrmRepository],
  exports: [CrmService],
})
export class CrmModule {}

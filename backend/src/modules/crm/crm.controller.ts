import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CrmDeal, DealStage } from './entities/crm-deal.entity';

@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get()
  findAll(@Query('stage') stage?: DealStage) {
    return this.crmService.findAll(stage);
  }

  @Get('pipeline')
  getPipelineStats() {
    return this.crmService.getPipelineStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.crmService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<CrmDeal>) {
    return this.crmService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<CrmDeal>) {
    return this.crmService.update(id, data);
  }

  @Put(':id/stage')
  updateStage(
    @Param('id') id: string,
    @Body('stage') stage: DealStage
  ) {
    return this.crmService.updateStage(id, stage);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.crmService.delete(id);
  }
}

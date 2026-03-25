import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  getKPIs() {
    return this.dashboardService.getKPIs();
  }

  @Get('trends')
  getMonthlyTrends() {
    return this.dashboardService.getMonthlyTrends();
  }

  @Get('cost-breakdown')
  getCostBreakdown() {
    return this.dashboardService.getCostBreakdown();
  }
}

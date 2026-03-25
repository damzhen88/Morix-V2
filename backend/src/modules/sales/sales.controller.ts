import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SalesOrder, OrderStatus, PaymentStatus } from './entities/sales-order.entity';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll(
    @Query('status') status?: OrderStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus
  ) {
    return this.salesService.findAll(status, paymentStatus);
  }

  @Get('stats')
  getStats() {
    return this.salesService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<SalesOrder>) {
    return this.salesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<SalesOrder>) {
    return this.salesService.update(id, data);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus
  ) {
    return this.salesService.updateStatus(id, status);
  }

  @Put(':id/payment')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: PaymentStatus
  ) {
    return this.salesService.updatePaymentStatus(id, paymentStatus);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.salesService.delete(id);
  }
}

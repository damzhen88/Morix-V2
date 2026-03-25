import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('total-value')
  getTotalValue() {
    return this.inventoryService.getTotalValue();
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.inventoryService.findByProduct(productId);
  }

  @Get('product/:productId/movements')
  getMovements(@Param('productId') productId: string) {
    return this.inventoryService.getMovements(productId);
  }

  @Post('stock-in')
  stockIn(
    @Body() body: { productId: string; warehouseId: string; quantity: number; referenceType?: string; referenceId?: string; notes?: string }
  ) {
    return this.inventoryService.stockIn(
      body.productId, body.warehouseId, body.quantity, body.referenceType, body.referenceId, body.notes
    );
  }

  @Post('stock-out')
  stockOut(
    @Body() body: { productId: string; warehouseId: string; quantity: number; referenceType?: string; referenceId?: string; notes?: string }
  ) {
    return this.inventoryService.stockOut(
      body.productId, body.warehouseId, body.quantity, body.referenceType, body.referenceId, body.notes
    );
  }

  @Put('adjust/:productId')
  adjust(
    @Param('productId') productId: string,
    @Body() body: { warehouseId: string; newQuantity: number; notes?: string }
  ) {
    return this.inventoryService.adjust(
      productId, body.warehouseId, body.newQuantity, body.notes
    );
  }
}

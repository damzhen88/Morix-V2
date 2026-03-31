import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryRepository, StockMovementRepository } from './inventory.repository';
import { Inventory, Warehouse, StockMovement } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Warehouse, StockMovement])],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository, StockMovementRepository],
  exports: [InventoryService, InventoryRepository, StockMovementRepository],
})
export class InventoryModule {}

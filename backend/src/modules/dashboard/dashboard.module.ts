import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ProductsModule } from '../products/products.module';
import { InventoryModule } from '../inventory/inventory.module';
import { SalesModule } from '../sales/sales.module';
import { CrmModule } from '../crm/crm.module';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [
    ProductsModule,
    InventoryModule,
    SalesModule,
    CrmModule,
    ExpensesModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

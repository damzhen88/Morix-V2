import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { SalesModule } from './modules/sales/sales.module';
import { CrmModule } from './modules/crm/crm.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [
    // Configuration (devops-use-config-module)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database
    DatabaseModule,
    
    // Feature modules (arch-feature-modules)
    AuthModule,
    ProductsModule,
    InventoryModule,
    PurchaseModule,
    SalesModule,
    CrmModule,
    ExpensesModule,
    CustomersModule,
    DashboardModule,
  ],
})
export class AppModule {}

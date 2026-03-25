import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SalesRepository } from './sales.repository';
import { SalesOrder, OrderItem } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([SalesOrder, OrderItem])],
  controllers: [SalesController],
  providers: [SalesService, SalesRepository],
  exports: [SalesService, SalesRepository],
})
export class SalesModule {}

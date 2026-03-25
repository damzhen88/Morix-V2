import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SalesOrder, OrderStatus, PaymentStatus } from './entities/sales-order.entity';

@Injectable()
export class SalesRepository extends Repository<SalesOrder> {
  constructor(private dataSource: DataSource) {
    super(SalesOrder, dataSource.createEntityManager());
  }

  async findAllWithRelations(status?: OrderStatus, paymentStatus?: PaymentStatus) {
    const qb = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.images', 'images')
      .orderBy('order.created_at', 'DESC');

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }
    if (paymentStatus) {
      qb.andWhere('order.payment_status = :paymentStatus', { paymentStatus });
    }

    return qb.getMany();
  }

  async findById(id: string) {
    return this.findOne({
      where: { id },
      relations: ['items', 'images'],
    });
  }

  async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const count = await this.count({
      where: {
        order_number: require('typeorm').Like(`SO-${year}${month}%`)
      }
    });
    
    return `SO-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  async calculateStats() {
    const confirmed = await this.createQueryBuilder('order')
      .where('order.status IN (:...statuses)', { statuses: ['confirmed', 'delivered', 'closed'] })
      .getMany();

    const totalRevenue = confirmed.reduce((sum, o) => sum + Number(o.total), 0);
    const totalCost = confirmed.reduce((sum, o) => sum + Number(o.product_cost_thb), 0);
    const grossProfit = totalRevenue - totalCost;
    const netProfit = confirmed.reduce((sum, o) => sum + Number(o.net_profit), 0);

    return { totalRevenue, totalCost, grossProfit, netProfit };
  }
}

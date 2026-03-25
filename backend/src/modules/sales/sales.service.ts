import { Injectable, NotFoundException } from '@nestjs/common';
import { SalesRepository } from './sales.repository';
import { SalesOrder, OrderStatus, PaymentStatus } from './entities/sales-order.entity';

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  async findAll(status?: OrderStatus, paymentStatus?: PaymentStatus) {
    return this.salesRepository.findAllWithRelations(status, paymentStatus);
  }

  async findOne(id: string) {
    const order = await this.salesRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async create(data: Partial<SalesOrder>) {
    const orderNumber = await this.salesRepository.generateOrderNumber();
    
    // Calculate totals
    const subtotal = data.items?.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price_thb), 0) || 0;
    
    const total = subtotal - (data.discount || 0) + 
      (data.transport_cost || 0) + (data.labor_cost || 0);

    const productCost = data.items?.reduce((sum, item) => 
      sum + (item.quantity * item.cost_thb), 0) || 0;
    
    const grossProfit = subtotal - (data.discount || 0) - productCost;
    const netProfit = grossProfit - (data.transport_cost || 0) - (data.labor_cost || 0);

    const order = this.salesRepository.create({
      ...data,
      order_number: orderNumber,
      subtotal,
      total,
      product_cost_thb: productCost,
      gross_profit: grossProfit,
      net_profit: netProfit,
    });

    return this.salesRepository.save(order);
  }

  async update(id: string, data: Partial<SalesOrder>) {
    await this.findOne(id);
    await this.salesRepository.update(id, data);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: OrderStatus) {
    return this.update(id, { status });
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    return this.update(id, { payment_status: paymentStatus });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.salesRepository.delete(id);
  }

  async getStats() {
    return this.salesRepository.calculateStats();
  }
}

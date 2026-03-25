import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SalesOrder } from './sales-order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sales_order_id: string;

  @ManyToOne(() => SalesOrder, (order) => order.items)
  sales_order: SalesOrder;

  @Column()
  product_id: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unit_price_thb: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount_percent: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_thb: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cost_thb: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  profit_thb: number;
}

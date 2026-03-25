import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';


export type CustomerType = 'contractor' | 'homeowner' | 'dealer' | 'project';
export type OrderStatus = 'draft' | 'quoted' | 'confirmed' | 'delivered' | 'closed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'deposit' | 'paid';

@Entity('sales_orders')
export class SalesOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  order_number: string;

  @Column({ nullable: true })
  customer_id: string;

  @Column()
  customer_name: string;

  @Column()
  customer_type: CustomerType;

  @Column({ default: 'draft' })
  status: OrderStatus;

  @OneToMany(() => OrderItem, (item) => item.sales_order, { cascade: true })
  items: OrderItem[];

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  transport_cost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  labor_cost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  product_cost_thb: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  gross_profit: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  net_profit: number;

  @Column({ default: 'unpaid' })
  payment_status: PaymentStatus;

  @Column({ nullable: true })
  notes: string;


  @Column({ nullable: true })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

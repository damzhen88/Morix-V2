import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'purchase_order_id' }) purchaseOrderId: string;
  @Column({ name: 'product_id' }) productId: string;
  @Column() description: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) quantity: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) unitPrice: number;
  @Column({ name: 'unit_price_cny', type: 'decimal', precision: 10, scale: 2 }) unitPriceCny: number;
  @ManyToOne(() => PurchaseOrder) purchaseOrder: PurchaseOrder;
}

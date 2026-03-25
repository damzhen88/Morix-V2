import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'po_number', unique: true }) poNumber: string;
  @Column({ name: 'supplier_id', nullable: true }) supplierId: string;
  @Column({ name: 'order_date' }) orderDate: Date;
  @Column({ name: 'expected_arrival_date', nullable: true }) expectedArrivalDate: Date;
  @Column({ default: 'pending' }) status: string;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) totalAmount: number;
  @Column({ name: 'currency', default: 'CNY' }) currency: string;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) exchangeRate: number;
  @Column({ name: 'total_thb', type: 'decimal', precision: 12, scale: 2, default: 0 }) totalThb: number;
  @Column({ nullable: true }) notes: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { SalesOrder } from './sales-order.entity';

@Entity('order_images')
export class OrderImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  caption: string;

  @ManyToOne(() => SalesOrder, (order) => order.images)
  sales_order: SalesOrder;
}

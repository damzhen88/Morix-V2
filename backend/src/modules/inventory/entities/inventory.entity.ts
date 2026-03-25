import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Warehouse } from './warehouse.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  product_id: string;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  warehouse_id: string;

  @ManyToOne(() => Warehouse)
  warehouse: Warehouse;

  @Column({ default: 0 })
  quantity_on_hand: number;

  @Column({ default: 0 })
  quantity_reserved: number;

  @Column({ default: 0 })
  quantity_available: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  weighted_average_cost_thb: number;

  @Column({ type: 'timestamp', nullable: true })
  last_movement_at: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Warehouse } from './warehouse.entity';

export type MovementType = 'IN' | 'OUT' | 'ADJUST';

@Entity('stock_movements')
export class StockMovement {
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

  @Column()
  type: MovementType;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  reference_type: string;

  @Column({ nullable: true })
  reference_id: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;
}

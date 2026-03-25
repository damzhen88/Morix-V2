import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() url: string;
  @Column({ nullable: true }) caption: string;
  @Column({ name: 'product_id' }) productId: string;
  @ManyToOne(() => Product, (p) => p.images) product: Product;
}

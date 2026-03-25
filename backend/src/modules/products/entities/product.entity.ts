import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProductImage } from './product-image.entity';

export type ProductCategory = 'ASA' | 'WPC' | 'SPC' | 'ACCESSORIES';
export type ProductUnit = 'piece' | 'box' | 'meter' | 'sqm' | 'set';
export type ProductStatus = 'active' | 'inactive';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  name_th: string;

  @Column({ nullable: true })
  name_en: string;

  @Column()
  category: ProductCategory;

  @Column({ default: 'sqm' })
  unit: ProductUnit;

  @Column({ nullable: true })
  spec_size: string;

  @Column({ nullable: true })
  spec_thickness: string;

  @Column({ nullable: true })
  spec_color: string;

  @Column({ nullable: true })
  spec_length: string;

  @Column({ nullable: true })
  default_supplier: string;

  @Column({ default: 100 })
  reorder_point: number;

  @Column({ default: 50 })
  min_stock: number;

  @Column({ default: 'active' })
  status: ProductStatus;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

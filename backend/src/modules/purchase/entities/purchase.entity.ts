import { Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
@Entity('purchase')
export class PurchaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @CreateDateColumn() created_at: Date;
}

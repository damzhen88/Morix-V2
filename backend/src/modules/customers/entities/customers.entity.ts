import { Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
@Entity('customers')
export class CustomerEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @CreateDateColumn() created_at: Date;
}

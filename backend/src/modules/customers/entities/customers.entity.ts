import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type CustomerEntityType = 'contractor' | 'homeowner' | 'dealer' | 'project';

@Entity('customers')
export class CustomerEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) email: string;
  @Column({ nullable: true }) address: string;
  @Column({ default: 'active' }) status: string;
  @Column({ name: 'customer_type', default: 'dealer' }) customerType: CustomerEntityType;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type DealStage = 'inquiry' | 'quoted' | 'paid' | 'shipped';
export type CustomerType = 'contractor' | 'homeowner' | 'dealer' | 'project';

@Entity('crm_deals')
export class CrmDeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  lead_id: string;

  @Column()
  customer_name: string;

  @Column()
  customer_type: CustomerType;

  @Column({ nullable: true })
  contact_phone: string;

  @Column({ nullable: true })
  contact_email: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  deal_value: number;

  @Column({ default: 'inquiry' })
  stage: DealStage;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  sales_order_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_interaction_at: Date;
}

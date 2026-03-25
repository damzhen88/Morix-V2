import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type ExpenseCategory = 
  | 'warehouse_rent' | 'salaries' | 'packer_wages' | 'marketing'
  | 'utilities' | 'office' | 'transport' | 'miscellaneous';
export type ExpenseStatus = 'pending' | 'approved' | 'paid';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column()
  category: ExpenseCategory;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount_thb: number;

  @Column({ nullable: true })
  vendor: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: false })
  is_recurring: boolean;

  @Column({ nullable: true })
  recurring_type: string;

  @Column({ nullable: true })
  attachment_url: string;

  @Column({ default: 'pending' })
  status: ExpenseStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type ExpenseCategory =
  | 'warehouse_rent' | 'salaries' | 'packer_wages' | 'marketing'
  | 'utilities' | 'office' | 'transport' | 'miscellaneous';
export type ExpenseStatus = 'pending' | 'approved' | 'paid';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() description: string;
  @Column() category: ExpenseCategory;
  @Column({ nullable: true }) vendor: string;
  @Column({ name: 'expense_date' }) expenseDate: Date;
  @Column({ name: 'amount_thb', type: 'decimal', precision: 12, scale: 2 }) amountThb: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) amountCurrency: number;
  @Column({ default: 'THB' }) currency: string;
  @Column({ name: 'reference_po', nullable: true }) referencePo: string;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'created_by', nullable: true }) createdBy: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
@Entity('dashboard')
export class DashboardEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @CreateDateColumn() created_at: Date;
}

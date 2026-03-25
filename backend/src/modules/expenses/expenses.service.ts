import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense, ExpenseCategory, ExpenseStatus } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async findAll(category?: ExpenseCategory, status?: ExpenseStatus) {
    const qb = this.expenseRepository.createQueryBuilder('expense')
      .orderBy('expense.date', 'DESC');
    
    if (category) qb.andWhere('expense.category = :category', { category });
    if (status) qb.andWhere('expense.status = :status', { status });
    
    return qb.getMany();
  }

  async findOne(id: string) {
    return this.expenseRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Expense>) {
    const expense = this.expenseRepository.create(data);
    return this.expenseRepository.save(expense);
  }

  async update(id: string, data: Partial<Expense>) {
    await this.expenseRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string) {
    await this.expenseRepository.delete(id);
  }

  async getTotalByCategory() {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount_thb)', 'total')
      .groupBy('expense.category')
      .getRawMany();
    return result;
  }

  async getTotalExpenses() {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount_thb)', 'total')
      .getRawOne();
    return parseFloat(result?.total || '0');
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpenseCategory, ExpenseStatus, Expense } from './entities/expense.entity';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(
    @Query('category') category?: ExpenseCategory,
    @Query('status') status?: ExpenseStatus
  ) {
    return this.expensesService.findAll(category, status);
  }

  @Get('total-by-category')
  getTotalByCategory() {
    return this.expensesService.getTotalByCategory();
  }

  @Get('total')
  getTotalExpenses() {
    return this.expensesService.getTotalExpenses();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Expense>) {
    return this.expensesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Expense>) {
    return this.expensesService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.expensesService.delete(id);
  }
}

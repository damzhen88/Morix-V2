import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { SalesService } from '../sales/sales.service';
import { CrmService } from '../crm/crm.service';
import { ExpensesService } from '../expenses/expenses.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly inventoryService: InventoryService,
    private readonly salesService: SalesService,
    private readonly crmService: CrmService,
    private readonly expensesService: ExpensesService,
  ) {}

  async getKPIs() {
    const [salesStats, inventoryValue, pipelineStats, totalExpenses] = await Promise.all([
      this.salesService.getStats(),
      this.inventoryService.getTotalValue(),
      this.crmService.getPipelineStats(),
      this.expensesService.getTotalExpenses(),
    ]);

    const activeDeals = pipelineStats
      .filter((s: any) => s.stage === 'inquiry' || s.stage === 'quoted')
      .reduce((sum: number, s: any) => sum + s.count, 0);

    const lowStockProducts = await this.productsService.findAll({});
    // Count products with quantity < reorder_point

    return {
      totalRevenue: salesStats.totalRevenue,
      totalCOGS: salesStats.totalCost,
      grossProfit: salesStats.grossProfit,
      netProfit: salesStats.netProfit - totalExpenses,
      profitMargin: salesStats.totalRevenue > 0 
        ? (salesStats.grossProfit / salesStats.totalRevenue) * 100 
        : 0,
      inventoryValue,
      lowStockCount: 0, // TODO: Calculate properly
      pendingOrders: activeDeals,
      totalExpenses,
    };
  }

  async getMonthlyTrends() {
    // TODO: Implement based on actual data
    return [
      { month: 'ต.ค. 68', revenue: 280000, cogs: 168000, profit: 112000 },
      { month: 'พ.ย. 68', revenue: 320000, cogs: 192000, profit: 128000 },
      { month: 'ธ.ค. 68', revenue: 410000, cogs: 246000, profit: 164000 },
      { month: 'ม.ค. 69', revenue: 380000, cogs: 228000, profit: 152000 },
      { month: 'ก.พ. 69', revenue: 445000, cogs: 267000, profit: 178000 },
      { month: 'มี.ค. 69', revenue: 520000, cogs: 312000, profit: 208000 },
    ];
  }

  async getCostBreakdown() {
    const byCategory = await this.expensesService.getTotalByCategory();
    // Transform to chart format
    return [
      { name: 'COGS', value: 312000 },
      { name: 'ขนส่งต่างประเทศ', value: 45000 },
      { name: 'ขนส่งในประเทศ', value: 28000 },
      { name: 'โอเวอร์เฮด', value: 35000 },
      { name: 'แรงงาน', value: 18000 },
      { name: 'โฆษณา', value: 22000 },
    ];
  }
}

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Inventory, StockMovement, MovementType } from './entities';

@Injectable()
export class InventoryRepository extends Repository<Inventory> {
  constructor(private dataSource: DataSource) {
    super(Inventory, dataSource.createEntityManager());
  }

  async findAllWithProducts() {
    return this.createQueryBuilder('inv')
      .leftJoinAndSelect('inv.product', 'product')
      .leftJoinAndSelect('inv.warehouse', 'warehouse')
      .getMany();
  }

  async findByProduct(productId: string) {
    return this.findOne({
      where: { product_id: productId },
      relations: ['product', 'warehouse'],
    });
  }

  async updateQuantity(productId: string, quantity: number, type: MovementType, referenceId?: string) {
    const inventory = await this.findByProduct(productId);
    if (!inventory) return null;

    const newQty = type === 'OUT' 
      ? inventory.quantity_on_hand - quantity 
      : inventory.quantity_on_hand + quantity;

    await this.update(inventory.id, {
      quantity_on_hand: Math.max(0, newQty),
      quantity_available: Math.max(0, newQty),
      last_movement_at: new Date(),
    });

    return this.findByProduct(productId);
  }

  async getTotalValue(): Promise<number> {
    const result = await this.createQueryBuilder('inv')
      .select('SUM(inv.quantity_on_hand * inv.weighted_average_cost_thb)', 'total')
      .getRawOne();
    return parseFloat(result?.total || '0');
  }
}

@Injectable()
export class StockMovementRepository extends Repository<StockMovement> {
  constructor(private dataSource: DataSource) {
    super(StockMovement, dataSource.createEntityManager());
  }

  async findByProduct(productId: string) {
    return this.find({
      where: { product_id: productId },
      relations: ['product'],
      order: { created_at: 'DESC' },
    });
  }

  async createMovement(
    productId: string, 
    warehouseId: string, 
    type: MovementType, 
    quantity: number,
    referenceType?: string,
    referenceId?: string,
    notes?: string,
    createdBy?: string
  ) {
    const movement = this.create({
      product_id: productId,
      warehouse_id: warehouseId,
      type,
      quantity,
      reference_type: referenceType,
      reference_id: referenceId,
      notes,
      created_by: createdBy,
    });
    return this.save(movement);
  }
}

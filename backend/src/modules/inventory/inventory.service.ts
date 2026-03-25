import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryRepository, StockMovementRepository } from './inventory.repository';
import { MovementType } from './entities';

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly stockMovementRepository: StockMovementRepository,
  ) {}

  async findAll() {
    return this.inventoryRepository.findAllWithProducts();
  }

  async findByProduct(productId: string) {
    const inventory = await this.inventoryRepository.findByProduct(productId);
    if (!inventory) {
      throw new NotFoundException(`Inventory for product ${productId} not found`);
    }
    return inventory;
  }

  async getMovements(productId: string) {
    return this.stockMovementRepository.findByProduct(productId);
  }

  async stockIn(
    productId: string, 
    warehouseId: string, 
    quantity: number,
    referenceType?: string,
    referenceId?: string,
    notes?: string,
    createdBy?: string
  ) {
    // Create movement record
    await this.stockMovementRepository.createMovement(
      productId, warehouseId, 'IN', quantity, referenceType, referenceId, notes, createdBy
    );

    // Update inventory
    return this.inventoryRepository.updateQuantity(productId, quantity, 'IN', referenceId);
  }

  async stockOut(
    productId: string, 
    warehouseId: string, 
    quantity: number,
    referenceType?: string,
    referenceId?: string,
    notes?: string,
    createdBy?: string
  ) {
    // Create movement record
    await this.stockMovementRepository.createMovement(
      productId, warehouseId, 'OUT', quantity, referenceType, referenceId, notes, createdBy
    );

    // Update inventory
    return this.inventoryRepository.updateQuantity(productId, quantity, 'OUT', referenceId);
  }

  async adjust(
    productId: string, 
    warehouseId: string, 
    newQuantity: number,
    notes?: string,
    createdBy?: string
  ) {
    const inventory = await this.inventoryRepository.findByProduct(productId);
    if (!inventory) {
      throw new NotFoundException(`Inventory for product ${productId} not found`);
    }

    const diff = newQuantity - inventory.quantity_on_hand;
    
    // Create movement record
    await this.stockMovementRepository.createMovement(
      productId, warehouseId, 'ADJUST', Math.abs(diff), undefined, undefined, notes, createdBy
    );

    // Update inventory directly
    await this.inventoryRepository.update(inventory.id, {
      quantity_on_hand: newQuantity,
      quantity_available: newQuantity,
      last_movement_at: new Date(),
    });

    return this.findByProduct(productId);
  }

  async getTotalValue() {
    return this.inventoryRepository.getTotalValue();
  }
}

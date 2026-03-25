import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    // di-prefer-constructor-injection
    private readonly productsRepository: ProductsRepository,
  ) {}

  async findAll(query: ProductQueryDto) {
    return this.productsRepository.findAllWithRelations(query);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ 
      where: { id },
      relations: ['images'],
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    // Check SKU uniqueness
    const existing = await this.productsRepository.findBySku(dto.sku);
    if (existing) {
      throw new ConflictException(`Product with SKU ${dto.sku} already exists`);
    }
    
    return this.productsRepository.createProduct(dto);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.findOne(id); // Verify exists
    return this.productsRepository.updateProduct(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Verify exists
    await this.productsRepository.deleteProduct(id);
  }

  // For inventory: get product cost
  async getProductCost(id: string): Promise<number> {
    const product = await this.findOne(id);
    // Return default cost or fetch from inventory
    return 0; // Will be integrated with inventory module
  }
}

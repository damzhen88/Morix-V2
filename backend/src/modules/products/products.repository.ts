import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from '../dto/product.dto';

@Injectable()
export class ProductsRepository extends Repository<Product> {
  constructor(private dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  // db-avoid-n-plus-one: Use relations properly
  async findAllWithRelations(query: ProductQueryDto) {
    const { search, category, status, page = 1, limit = 20 } = query;
    
    const qb = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .where('1=1');

    if (search) {
      qb.andWhere(
        '(product.name_th ILIKE :search OR product.name_en ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (category) {
      qb.andWhere('product.category = :category', { category });
    }

    if (status) {
      qb.andWhere('product.status = :status', { status });
    }

    const [data, total] = await qb
      .orderBy('product.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.findOne({ where: { sku } });
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const product = this.create(dto);
    return this.save(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.update(id, dto);
    return this.findOne({ where: { id } });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.delete(id);
  }
}

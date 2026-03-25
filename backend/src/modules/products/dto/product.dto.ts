import { IsString, IsEnum, IsOptional, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { ProductCategory, ProductUnit } from '../entities/product.entity';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsString()
  name_th: string;

  @IsOptional()
  @IsString()
  name_en?: string;

  @IsEnum(['ASA', 'WPC', 'SPC', 'ACCESSORIES'])
  category: ProductCategory;

  @IsOptional()
  @IsEnum(['piece', 'box', 'meter', 'sqm', 'set'])
  unit?: ProductUnit;

  @IsOptional()
  @IsString()
  spec_size?: string;

  @IsOptional()
  @IsString()
  spec_thickness?: string;

  @IsOptional()
  @IsString()
  spec_color?: string;

  @IsOptional()
  @IsString()
  default_supplier?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reorder_point?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  min_stock?: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name_th?: string;

  @IsOptional()
  @IsString()
  name_en?: string;

  @IsOptional()
  @IsEnum(['ASA', 'WPC', 'SPC', 'ACCESSORIES'])
  category?: ProductCategory;

  @IsOptional()
  @IsEnum(['piece', 'box', 'meter', 'sqm', 'set'])
  unit?: ProductUnit;

  @IsOptional()
  @IsString()
  spec_size?: string;

  @IsOptional()
  @IsString()
  spec_thickness?: string;

  @IsOptional()
  @IsString()
  spec_color?: string;

  @IsOptional()
  @IsString()
  default_supplier?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reorder_point?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  min_stock?: number;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';
}

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['ASA', 'WPC', 'SPC', 'ACCESSORIES'])
  category?: ProductCategory;

  @IsOptional()
 (['active', 'inactive'])
  status?: ' @IsEnumactive' | 'inactive';

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

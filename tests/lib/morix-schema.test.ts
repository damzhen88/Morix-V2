import { describe, it, expect } from 'vitest';
import { hasRequiredFields, convertValue, validateDataset } from '@/lib/morix-validator';
import { MORIX_SCHEMA, TYPE_CONFIG, getRequiredFields, SchemaField } from '@/lib/morix-schema';

describe('MORIX Schema', () => {
  describe('TYPE_CONFIG', () => {
    it('should have valid import types', () => {
      expect(TYPE_CONFIG.products).toBeDefined();
      expect(TYPE_CONFIG.inventory).toBeDefined();
      expect(TYPE_CONFIG.stock_movement).toBeDefined();
      expect(TYPE_CONFIG.assumptions).toBeDefined();
    });

    it('should have correct sheet names', () => {
      expect(TYPE_CONFIG.products.sheet).toBe('Product List');
      expect(TYPE_CONFIG.inventory.sheet).toBe('Inventory');
      expect(TYPE_CONFIG.stock_movement.sheet).toBe('Stock Movement');
    });
  });

  describe('getRequiredFields', () => {
    it('should return required fields for products', () => {
      const required = getRequiredFields('products');
      expect(required).toContain('sku'); // SKU is the required identifier for products
    });

    it('should return required fields for stock_movement', () => {
      const required = getRequiredFields('stock_movement');
      expect(required).toContain('date');
      expect(required).toContain('type');
      expect(required).toContain('sku');
    });
  });

  describe('MORIX_SCHEMA', () => {
    it('should have products schema with required fields', () => {
      const productsSchema = MORIX_SCHEMA.products;
      expect(productsSchema.length).toBeGreaterThan(0);
      
      const skuField = productsSchema.find(f => f.systemField === 'sku');
      expect(skuField).toBeDefined();
      expect(skuField?.required).toBe(true);
    });

    it('should have inventory schema', () => {
      const inventorySchema = MORIX_SCHEMA.inventory;
      expect(inventorySchema.length).toBeGreaterThan(0);
    });
  });
});

describe('morix-validator', () => {
  describe('convertValue', () => {
    it('should convert numeric strings to numbers', () => {
      const field: SchemaField = { 
        excelHeaders: ['test'], 
        systemField: 'test', 
        dataType: 'NUMBER', 
        required: false 
      };
      expect(convertValue('123', field)).toBe(123);
      expect(convertValue('45.67', field)).toBe(45.67);
      expect(convertValue('$1,234.56', field)).toBe(1234.56); // Currency format
    });

    it('should handle empty strings with default value', () => {
      const field: SchemaField = { 
        excelHeaders: ['test'], 
        systemField: 'test', 
        dataType: 'STRING', 
        required: false,
        defaultValue: 'N/A'
      };
      expect(convertValue('', field)).toBe('N/A');
    });

    it('should convert date strings', () => {
      const field: SchemaField = { 
        excelHeaders: ['test'], 
        systemField: 'test', 
        dataType: 'DATE', 
        required: false 
      };
      const result = convertValue('2024-01-15', field);
      expect(result).toBe('2024-01-15');
    });

    it('should handle ENUM values', () => {
      const field: SchemaField = { 
        excelHeaders: ['test'], 
        systemField: 'test', 
        dataType: 'ENUM', 
        required: false,
        enumValues: ['IN', 'OUT']
      };
      expect(convertValue('IN', field)).toBe('IN');
      expect(convertValue('in', field)).toBe('IN'); // Case insensitive
    });
  });

  describe('hasRequiredFields', () => {
    it('should return true when required SKU field is present', () => {
      const row = { 'Product ID': 'SKU001', 'Category': 'Furniture' };
      const headers = ['Product ID', 'Category'];
      expect(hasRequiredFields(row, headers, 'products')).toBe(true);
    });

    it('should return false when required field missing', () => {
      const row = { 'Category': 'Furniture' };
      const headers = ['Product ID', 'Category'];
      expect(hasRequiredFields(row, headers, 'products')).toBe(false);
    });

    it('should match Thai headers', () => {
      const row = { 'รหัสสินค้า': 'SKU001' };
      const headers = ['รหัสสินค้า'];
      expect(hasRequiredFields(row, headers, 'products')).toBe(true);
    });
  });

  describe('validateDataset', () => {
    it('should validate products data', () => {
      const rawData = [
        { 'Product ID': 'SKU001', 'Category': 'Furniture' },
        { 'Product ID': 'SKU002', 'Category': 'Electronics' },
      ];
      const headers = ['Product ID', 'Category'];
      
      const result = validateDataset(rawData, headers, 'products');
      expect(result.stats.total).toBe(2);
      expect(result.stats.invalid).toBe(0);
    });

    it('should mark invalid rows', () => {
      const rawData = [
        { 'Category': 'Furniture' }, // Missing SKU
      ];
      const headers = ['Product ID', 'Category'];
      
      const result = validateDataset(rawData, headers, 'products');
      expect(result.stats.invalid).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { 
  formatCurrency, 
  formatDate, 
  cnyToThb, 
  calculateProfit,
  generateId 
} from '@/lib/utils';

describe('utils', () => {
  describe('formatCurrency', () => {
    it('formats THB correctly', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('1,000');
    });

    it('handles zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });
  });

  describe('cnyToThb', () => {
    it('converts CNY to THB correctly', () => {
      expect(cnyToThb(100, 5.12)).toBe(512);
    });

    it('handles zero rate', () => {
      expect(cnyToThb(100, 0)).toBe(0);
    });
  });

  describe('calculateProfit', () => {
    it('calculates profit correctly', () => {
      expect(calculateProfit(1000, 700)).toBe(300);
    });

    it('handles loss', () => {
      expect(calculateProfit(500, 800)).toBe(-300);
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('generates string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(10);
    });
  });
});

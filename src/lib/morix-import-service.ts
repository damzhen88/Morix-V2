/**
 * MORIX THAILAND - IMPORT SERVICE MODULE
 * 
 * Deterministic import service using LOCKED SCHEMA.
 * All operations are explicit - NO guessing.
 */

import { supabase } from './supabase';
import { ImportType, MORIX_SCHEMA, TYPE_CONFIG, findHeaderMatch } from './morix-schema';
import { convertValue, validateRow, hasRequiredFields } from './morix-validator';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  skipped: number;
  errors: ImportError[];
  duration: number;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  code: string;
}

export interface RawExcelRow {
  [key: string]: any;
}

// ============================================================================
// IMPORT SERVICE
// ============================================================================

export class MorixImportService {
  private type: ImportType;
  private headers: string[] = [];
  private rawData: RawExcelRow[] = [];
  private errors: ImportError[] = [];
  private startTime: number = 0;

  constructor(type: ImportType) {
    this.type = type;
  }

  /**
   * Load data from parsed Excel
   */
  loadData(headers: string[], data: RawExcelRow[]): void {
    this.headers = headers;
    this.rawData = data;
  }

  /**
   * Find header row index (deterministic)
   */
  static findHeaderRow(allRows: any[][], type: ImportType): number {
    const schema = MORIX_SCHEMA[type];
    if (!schema) return 0;

    for (let i = 0; i < Math.min(10, allRows.length); i++) {
      const row = allRows[i];
      let matchCount = 0;

      for (const cell of row) {
        const cellStr = String(cell || '').toLowerCase().replace(/\s+/g, ' ');
        
        for (const field of schema) {
          for (const header of field.excelHeaders) {
            const headerStr = header.toLowerCase().replace(/\s+/g, ' ');
            if (cellStr.includes(headerStr) || headerStr.includes(cellStr)) {
              matchCount++;
              break;
            }
          }
        }
      }

      // Header row should match at least 2 schema fields
      if (matchCount >= 2) {
        return i;
      }
    }

    return 0;
  }

  /**
   * Map raw Excel row to database record
   */
  private mapRow(rawRow: RawExcelRow): Record<string, any> | null {
    const schema = MORIX_SCHEMA[this.type];
    if (!schema) return null;

    const record: Record<string, any> = {};

    for (const field of schema) {
      // Find matching header
      const matchedHeader = this.headers.find(h => findHeaderMatch(h, field));

      if (matchedHeader && rawRow[matchedHeader] !== undefined) {
        const rawValue = rawRow[matchedHeader];
        record[field.systemField] = convertValue(rawValue, field);
      } else if (field.defaultValue !== undefined) {
        record[field.systemField] = field.defaultValue;
      }
    }

    return record;
  }

  /**
   * Check if row has all required fields
   */
  private isRowComplete(rawRow: RawExcelRow): boolean {
    return hasRequiredFields(rawRow, this.headers, this.type);
  }

  /**
   * Run import
   */
  async run(): Promise<ImportResult> {
    this.startTime = Date.now();
    this.errors = [];

    let imported = 0;
    let failed = 0;
    let skipped = 0;

    const config = TYPE_CONFIG[this.type];
    const tableName = config.table;

    for (let i = 0; i < this.rawData.length; i++) {
      const rawRow = this.rawData[i];
      const rowNumber = i + 2; // +1 for 1-indexed, +1 for header row

      // Check required fields
      if (!this.isRowComplete(rawRow)) {
        this.errors.push({
          row: rowNumber,
          message: 'Missing required fields',
          code: 'MISSING_REQUIRED',
        });
        skipped++;
        continue;
      }

      // Map row
      const record = this.mapRow(rawRow);
      if (!record) {
        this.errors.push({
          row: rowNumber,
          message: 'Failed to map row',
          code: 'MAPPING_ERROR',
        });
        failed++;
        continue;
      }

      // Validate row
      const { errors: validationErrors } = validateRow(rawRow, this.headers, this.type);
      if (validationErrors.length > 0) {
        for (const err of validationErrors) {
          this.errors.push({
            row: rowNumber,
            field: err.field,
            message: err.message,
            code: 'VALIDATION_ERROR',
          });
        }
        failed++;
        continue;
      }

      // Insert to database
      try {
        let result;

        if (this.type === 'assumptions') {
          // Upsert settings
          result = await supabase
            .from(tableName)
            .upsert([{ key: this.type, ...record }], { onConflict: 'key' });
        } else {
          // Regular insert
          result = await supabase.from(tableName).insert(record);
        }

        if (result.error) {
          this.errors.push({
            row: rowNumber,
            message: result.error.message,
            code: result.error.code || 'INSERT_ERROR',
          });
          failed++;
        } else {
          imported++;
        }
      } catch (err: any) {
        this.errors.push({
          row: rowNumber,
          message: err.message,
          code: 'EXCEPTION',
        });
        failed++;
      }
    }

    return {
      success: failed === 0,
      imported,
      failed,
      skipped,
      errors: this.errors.slice(0, 50), // Limit errors
      duration: Date.now() - this.startTime,
    };
  }

  /**
   * Get error summary
   */
  getErrorSummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    for (const err of this.errors) {
      summary[err.code] = (summary[err.code] || 0) + 1;
    }
    return summary;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Quick import function
 */
export async function importExcel(
  type: ImportType,
  headers: string[],
  data: RawExcelRow[]
): Promise<ImportResult> {
  const service = new MorixImportService(type);
  service.loadData(headers, data);
  return service.run();
}

/**
 * Get import status message
 */
export function getResultMessage(result: ImportResult): string {
  if (result.success) {
    return `✅ นำเข้าสำเร็จ ${result.imported} รายการ (${result.duration}ms)`;
  }

  const parts: string[] = [];
  if (result.imported > 0) {
    parts.push(`สำเร็จ: ${result.imported}`);
  }
  if (result.failed > 0) {
    parts.push(`ล้มเหลว: ${result.failed}`);
  }
  if (result.skipped > 0) {
    parts.push(`ข้าม: ${result.skipped}`);
  }

  return `⚠️ ${parts.join(', ')}`;
}

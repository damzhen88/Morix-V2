/**
 * MORIX THAILAND - VALIDATION MODULE
 * 
 * Deterministic validation based on LOCKED SCHEMA.
 * All validation rules are explicit - NO guessing.
 */

import { SchemaField, ImportType, MORIX_SCHEMA } from './morix-schema';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  stats: {
    total: number;
    valid: number;
    invalid: number;
    skipped: number;
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Convert Excel value to correct type based on schema
 */
export function convertValue(value: any, field: SchemaField): any {
  // Handle null/undefined/empty
  if (value === null || value === undefined || value === '') {
    return field.defaultValue ?? null;
  }

  switch (field.dataType) {
    case 'NUMBER':
      return convertToNumber(value);

    case 'DATE':
      return convertToDate(value);

    case 'ENUM':
      return convertToEnum(value, field.enumValues || []);

    case 'STRING':
    default:
      return String(value).trim();
  }
}

/**
 * Convert to number
 */
function convertToNumber(value: any): number {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    // Remove currency symbols, spaces, and thousand separators
    const cleaned = value
      .replace(/[$€£¥฿]/g, '')
      .replace(/,/g, '')
      .replace(/\s+/g, '')
      .trim();
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  
  return 0;
}

/**
 * Convert to date string (YYYY-MM-DD)
 */
function convertToDate(value: any): string | null {
  // Excel serial number
  if (typeof value === 'number' && value > 0) {
    // Excel date serial: days since 1900-01-01
    // Need to account for Excel's leap year bug
    const date = new Date((value - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  // String date
  if (typeof value === 'string') {
    // Try ISO format first
    const isoDate = new Date(value);
    if (!isNaN(isoDate.getTime())) {
      return isoDate.toISOString().split('T')[0];
    }

    // Try Thai date format (DD/MM/YYYY)
    const thaiMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (thaiMatch) {
      const [, day, month, year] = thaiMatch;
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }

    // Try DD-MM-YYYY
    const dashMatch = value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dashMatch) {
      const [, day, month, year] = dashMatch;
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
  }

  return null;
}

/**
 * Convert to enum value
 */
function convertToEnum(value: any, allowedValues: string[]): string {
  const normalized = String(value).toUpperCase().trim();

  // Direct match
  if (allowedValues.includes(normalized)) {
    return normalized;
  }

  // Contains match
  for (const allowed of allowedValues) {
    if (normalized.includes(allowed) || allowed.includes(normalized)) {
      return allowed;
    }
  }

  // Return as-is (will fail validation)
  return normalized;
}

/**
 * Validate a single field value
 */
export function validateField(
  value: any,
  field: SchemaField,
  row: number
): ValidationError | null {
  const { validation, required, dataType } = field;

  // Check required
  if (required && (value === null || value === undefined || value === '')) {
    return {
      row,
      field: field.systemField,
      value,
      message: `${field.systemField} is required`,
      severity: 'error',
    };
  }

  // Skip validation if empty and not required
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Type validation
  if (dataType === 'NUMBER' && typeof value !== 'number') {
    return {
      row,
      field: field.systemField,
      value,
      message: `${field.systemField} must be a number`,
      severity: 'error',
    };
  }

  // Validation rules
  if (validation) {
    // Min
    if (validation.min !== undefined && value < validation.min) {
      return {
        row,
        field: field.systemField,
        value,
        message: `${field.systemField} must be >= ${validation.min}`,
        severity: 'error',
      };
    }

    // Max
    if (validation.max !== undefined && value > validation.max) {
      return {
        row,
        field: field.systemField,
        value,
        message: `${field.systemField} must be <= ${validation.max}`,
        severity: 'error',
      };
    }

    // Pattern
    if (validation.pattern && typeof value === 'string') {
      if (!validation.pattern.test(value)) {
        return {
          row,
          field: field.systemField,
          value,
          message: `${field.systemField} format is invalid`,
          severity: 'error',
        };
      }
    }

    // Min length
    if (validation.minLength !== undefined && String(value).length < validation.minLength) {
      return {
        row,
        field: field.systemField,
        value,
        message: `${field.systemField} must be at least ${validation.minLength} characters`,
        severity: 'error',
      };
    }

    // Max length
    if (validation.maxLength !== undefined && String(value).length > validation.maxLength) {
      return {
        row,
        field: field.systemField,
        value,
        message: `${field.systemField} must be at most ${validation.maxLength} characters`,
        severity: 'error',
      };
    }
  }

  // Enum validation
  if (dataType === 'ENUM' && field.enumValues) {
    if (!field.enumValues.includes(value)) {
      return {
        row,
        field: field.systemField,
        value,
        message: `${field.systemField} must be one of: ${field.enumValues.join(', ')}`,
        severity: 'error',
      };
    }
  }

  return null;
}

/**
 * Validate an entire row
 */
export function validateRow(
  rawData: Record<string, any>,
  headers: string[],
  type: ImportType
): { record: Record<string, any>; errors: ValidationError[]; warnings: ValidationError[] } {
  const schema = MORIX_SCHEMA[type] || [];
  const record: Record<string, any> = {};
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  for (const field of schema) {
    // Find matching header
    const matchedHeader = headers.find(h => {
      const normalized = h.toLowerCase().replace(/\s+/g, ' ').trim();
      return field.excelHeaders.some(sh => 
        normalized === sh.toLowerCase().replace(/\s+/g, ' ').trim() ||
        normalized.includes(sh.toLowerCase()) ||
        sh.toLowerCase().includes(normalized)
      );
    });

    if (matchedHeader) {
      const rawValue = rawData[matchedHeader];
      const convertedValue = convertValue(rawValue, field);
      
      record[field.systemField] = convertedValue;

      // Validate
      const error = validateField(convertedValue, field, 0);
      if (error) {
        errors.push(error);
      }
    } else if (field.required) {
      errors.push({
        row: 0,
        field: field.systemField,
        value: null,
        message: `Missing required field: ${field.systemField}`,
        severity: 'error',
      });
    } else if (field.defaultValue !== undefined) {
      record[field.systemField] = field.defaultValue;
    }
  }

  return { record, errors, warnings };
}

/**
 * Validate entire dataset
 */
export function validateDataset(
  rawData: Record<string, any>[],
  headers: string[],
  type: ImportType
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let valid = 0;
  let invalid = 0;
  let skipped = 0;

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    const { errors: rowErrors, warnings: rowWarnings } = validateRow(row, headers, type);

    if (rowErrors.length > 0) {
      invalid++;
      errors.push(...rowErrors.map(e => ({ ...e, row: i + 2 }))); // +2 for 1-indexed + header
    } else {
      valid++;
    }

    warnings.push(...rowWarnings.map(w => ({ ...w, row: i + 2 })));
  }

  return {
    valid: invalid === 0,
    errors,
    warnings,
    stats: {
      total: rawData.length,
      valid,
      invalid,
      skipped,
    },
  };
}

/**
 * Quick check if row has required fields
 */
export function hasRequiredFields(
  rawData: Record<string, any>,
  headers: string[],
  type: ImportType
): boolean {
  const schema = MORIX_SCHEMA[type] || [];
  const requiredFields = schema.filter(f => f.required);

  for (const field of requiredFields) {
    const matched = headers.find(h => 
      field.excelHeaders.some(sh => 
        h.toLowerCase().includes(sh.toLowerCase()) ||
        sh.toLowerCase().includes(h.toLowerCase())
      )
    );

    if (!matched || !rawData[matched]) {
      return false;
    }
  }

  return true;
}

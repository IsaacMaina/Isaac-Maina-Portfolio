import { z } from 'zod';

// SQL injection prevention utilities
export class DatabaseValidator {
  // Sanitize input to prevent SQL injection
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove potentially dangerous characters for SQL queries
    return input
      .replace(/;/g, '')  // Remove semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comment start
      .replace(/\*\//g, '') // Remove block comment end
      .replace(/\b(OR|AND)\b/gi, '') // Remove potential OR/AND injections
      .trim();
  }

  // Validate that an ID is properly formatted (for use with database IDs)
  static validateId(id: string): boolean {
    // For cuid() or similar IDs, they should be alphanumeric with potential special chars
    return /^[a-zA-Z0-9_-]+$/.test(id);
  }

  // Validate email format to prevent injection
  static validateEmail(email: string): boolean {
    const emailSchema = z.string().email();
    try {
      emailSchema.parse(email);
      return true;
    } catch {
      return false;
    }
  }

  // Validate that a string doesn't contain SQL injection patterns
  static hasSQLInjection(input: string): boolean {
    const injectionPatterns = [
      /(\b(OR|AND)\b\s+.*\s*=\s*)/gi,  // OR/AND injections
      /(\bEXEC\b|\bEXECUTE\b)/gi,      // EXEC/EXECUTE commands
      /(\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/gi, // DML/DDL commands
      /(\bWAITFOR\b|\bSLEEP\b)/gi,     // Timing attacks
      /('%\s*(OR|AND)\s*'|'?\s*=)/gi,  // Basic equality checks
      /(\bUNION\b\s+\bSELECT\b)/gi,    // UNION SELECT attacks
      /(\bSELECT\b\s+\bBENCHMARK\b)/gi, // MySQL specific
      /(\bSELECT\b\s+\bPG_SLEEP\b)/gi, // PostgreSQL specific
    ];

    return injectionPatterns.some(pattern => pattern.test(input));
  }

  // Validate user input against SQL injection
  static validateSafeInput(input: string): { isValid: boolean; message?: string } {
    if (this.hasSQLInjection(input)) {
      return {
        isValid: false,
        message: 'Input contains potential SQL injection patterns'
      };
    }

    if (input.includes('\'') && input.includes('--')) {
      return {
        isValid: false,
        message: 'Input contains dangerous SQL characters'
      };
    }

    return { isValid: true };
  }
}

// Validate and sanitize common query parameters
export const validateQueryParams = {
  id: (id: string) => DatabaseValidator.validateSafeInput(id),
  email: (email: string) => DatabaseValidator.validateEmail(email),
  name: (name: string) => DatabaseValidator.validateSafeInput(name),
  text: (text: string) => DatabaseValidator.validateSafeInput(text),
  number: (num: string) => !isNaN(parseFloat(num)) && isFinite(parseFloat(num))
};
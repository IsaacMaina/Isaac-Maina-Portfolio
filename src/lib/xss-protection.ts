// XSS Protection Utilities
export class XSSProtection {
  // Sanitize HTML content to prevent XSS
  static sanitizeHTML(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove script tags and other potentially dangerous HTML elements
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '') // Remove form tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick, onload, etc.
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/file:/gi, '') // Remove file: protocol
      .replace(/expression\(/gi, '') // Remove CSS expression
      .trim();
  }

  // Escape HTML entities to prevent XSS
  static escapeHTML(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    const htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return input.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char as keyof typeof htmlEscapes] || char);
  }

  // Sanitize user input for use in HTML contexts
  static sanitizeUserInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // First escape HTML, then remove potential XSS vectors
    return this.sanitizeHTML(this.escapeHTML(input));
  }

  // Sanitize URL to prevent XSS
  static sanitizeURL(url: string): string {
    if (typeof url !== 'string') {
      return '';
    }

    // Only allow valid protocols and basic URL characters
    if (url.startsWith('javascript:') || 
        url.startsWith('vbscript:') || 
        url.startsWith('data:') || 
        url.startsWith('file:')) {
      return '#'; // Return safe fallback URL
    }

    return url;
  }

  // Check if input contains potential XSS patterns
  static hasXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /data:/gi,
      /file:/gi,
      /expression\(/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Validate and sanitize text content
  static validateAndSanitizeText(input: string): { isValid: boolean; sanitized: string; message?: string } {
    if (this.hasXSS(input)) {
      return {
        isValid: false,
        sanitized: '',
        message: 'Input contains potential XSS attack patterns'
      };
    }

    const sanitized = this.sanitizeUserInput(input);
    return {
      isValid: true,
      sanitized
    };
  }
}

// Utility functions for different content types
export const sanitize = {
  html: (input: string) => XSSProtection.sanitizeHTML(input),
  text: (input: string) => XSSProtection.sanitizeUserInput(input),
  url: (input: string) => XSSProtection.sanitizeURL(input),
  validate: (input: string) => XSSProtection.validateAndSanitizeText(input)
};
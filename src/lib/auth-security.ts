import bcrypt from 'bcryptjs';
import { authRateLimiter } from './rateLimit';

// Authentication security utilities
export class AuthSecurity {
  // Rate limit login attempts by IP address or user identifier
  static checkRateLimit(identifier: string): { allowed: boolean; message?: string } {
    const result = authRateLimiter.checkAuthLimit(identifier);
    return {
      allowed: result.allowed,
      message: result.message
    };
  }

  // Validate password strength
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common passwords
    const commonPasswords = [
      'password', 'admin', 'letmein', 'welcome', 'monkey', '123456', 'password123',
      'qwerty', 'abc123', 'welcome123'
    ];

    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Password is too common');
    }

    // Check for sequences
    if (/(.)\1{2,}/.test(password)) { // More than 2 repeating characters
      errors.push('Password should not contain repeated characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Hash password securely
  static async hashPassword(password: string): Promise<string> {
    // Generate salt with 12 rounds (recommended for bcrypt)
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password securely
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Check if password is compromised (this is a simplified version)
  static isPasswordCompromised(password: string): boolean {
    // This would typically integrate with a service like Have I Been Pwned API
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'letmein', 'welcome'
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  // Sanitize user input for authentication
  static sanitizeAuthInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/['"]/g, '') // Remove quotes
      .trim();
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check for suspicious login patterns
  static isSuspiciousLogin(ipAddress: string, userAgent: string): boolean {
    // Check for known malicious user agents
    const maliciousUserAgents = [
      'sqlmap', 'nmap', 'nessus', 'nikto', 'dirb', 'w3af', 'acunetix'
    ];

    const lowerUserAgent = userAgent.toLowerCase();
    return maliciousUserAgents.some(ua => lowerUserAgent.includes(ua));
  }
}
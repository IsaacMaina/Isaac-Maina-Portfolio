// src/lib/rateLimit.ts
// Simple in-memory rate limiter for demo purposes
// In production, use Redis or a database for distributed rate limiting

interface RateLimitStorage {
  count: number;
  resetTime: number; // Unix timestamp in milliseconds
}

class InMemoryRateLimiter {
  private storage: Map<string, RateLimitStorage> = new Map();
  private readonly windowMs: number;
  private readonly maxAttempts: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxAttempts: number = 5) { // 15 minutes, 5 attempts by default
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
  }

  check(key: string): { allowed: boolean; remaining: number; resetTime: number; message?: string } {
    const now = Date.now();
    const record = this.storage.get(key);

    if (!record || now > record.resetTime) {
      // New window, reset the counter
      this.storage.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });

      return {
        allowed: true,
        remaining: this.maxAttempts - 1,
        resetTime: now + this.windowMs
      };
    }

    // Check if limit exceeded
    if (record.count >= this.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        message: `Rate limit exceeded. Try again in ${Math.ceil((record.resetTime - now) / 1000)} seconds.`
      };
    }

    // Increment count
    this.storage.set(key, {
      count: record.count + 1,
      resetTime: record.resetTime
    });

    return {
      allowed: true,
      remaining: this.maxAttempts - (record.count + 1),
      resetTime: record.resetTime
    };
  }

  reset(key: string): void {
    this.storage.delete(key);
  }
}

// Authentication-specific rate limiter
export class AuthRateLimiter {
  private limiter: InMemoryRateLimiter;

  constructor() {
    // Limit to 5 attempts per 15 minutes for authentication
    this.limiter = new InMemoryRateLimiter(15 * 60 * 1000, 5);
  }

  checkAuthLimit(key: string): { allowed: boolean; message?: string } {
    const result = this.limiter.check(key);
    
    if (!result.allowed) {
      return {
        allowed: false,
        message: result.message
      };
    }

    return {
      allowed: true
    };
  }

  // Reset rate limit for successful authentication
  resetAuthLimit(key: string): void {
    this.limiter.reset(key);
  }
}

export const authRateLimiter = new AuthRateLimiter();

// Generic rate limiter for other purposes
export const genericRateLimiter = new InMemoryRateLimiter();
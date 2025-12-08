import { randomBytes } from 'crypto';

// CSRF Protection Utilities
export class CSRFProtection {
  private static tokens = new Map<string, string[]>(); // session ID -> tokens
  private static readonly TOKEN_LENGTH = 32;
  private static readonly MAX_TOKENS_PER_SESSION = 10; // Limit tokens per session to prevent memory issues

  // Generate a secure CSRF token
  static generateToken(sessionId: string): string {
    const token = randomBytes(this.TOKEN_LENGTH).toString('hex');
    
    // Store the token for the session
    let sessionTokens = this.tokens.get(sessionId) || [];
    
    // Limit number of tokens per session to prevent memory issues
    if (sessionTokens.length >= this.MAX_TOKENS_PER_SESSION) {
      sessionTokens.shift(); // Remove oldest token
    }
    
    sessionTokens.push(token);
    this.tokens.set(sessionId, sessionTokens);
    
    return token;
  }

  // Validate a CSRF token against a session
  static validateToken(sessionId: string, token: string): boolean {
    if (!sessionId || !token) {
      return false;
    }

    const sessionTokens = this.tokens.get(sessionId);
    if (!sessionTokens) {
      return false;
    }

    const isValid = sessionTokens.includes(token);
    
    // Remove token after use for double-submit prevention
    if (isValid) {
      const updatedTokens = sessionTokens.filter(t => t !== token);
      this.tokens.set(sessionId, updatedTokens);
    }
    
    return isValid;
  }

  // Clear all tokens for a session (e.g., on logout)
  static clearTokens(sessionId: string): void {
    this.tokens.delete(sessionId);
  }
}

// Middleware-like function to check CSRF for API routes
export async function checkCSRF(request: Request): Promise<{ isValid: boolean; error?: string }> {
  try {
    // For Next.js App Router, we can extract session info from cookies
    const cookies = request.headers.get('Cookie') || request.headers.get('cookie') || '';
    
    // Extract session token from cookies (this would depend on your auth system)
    const sessionMatch = cookies.match(/(next-auth.session-token|authjs.session-token|sessionId)=([^;]+)/);
    if (!sessionMatch) {
      return { isValid: false, error: 'No session found' };
    }
    
    const sessionId = sessionMatch[2];
    const token = request.headers.get('X-CSRF-Token') || 
                  (request.headers.get('Content-Type')?.includes('application/json') 
                   ? (await request.json())._csrf
                   : null);
    
    if (!token) {
      return { isValid: false, error: 'No CSRF token provided' };
    }
    
    if (!CSRFProtection.validateToken(sessionId, token)) {
      return { isValid: false, error: 'Invalid CSRF token' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'CSRF validation failed' };
  }
}

// Function to provide CSRF token to frontend
export async function getCSRFToken(sessionId: string): Promise<string> {
  return CSRFProtection.generateToken(sessionId);
}
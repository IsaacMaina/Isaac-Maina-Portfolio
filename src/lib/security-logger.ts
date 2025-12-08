// Security logging and monitoring utilities
export class SecurityLogger {
  // Log security events
  static logSecurityEvent(eventType: string, details: any, userId?: string, ipAddress?: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      userId: userId || 'anonymous',
      ipAddress: ipAddress || 'unknown',
      details: typeof details === 'string' ? { message: details } : details,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
    };

    // In production, you would send this to a centralized logging service
    console.log('[SECURITY EVENT]', JSON.stringify(logEntry, null, 2));

    // For server-side logging
    if (typeof window === 'undefined') {
      // Server-side logging - could integrate with Winston, Bunyan, etc.
      console.log('[SERVER SECURITY LOG]', logEntry);
    }
  }

  // Log authentication events
  static logAuthEvent(eventType: 'login_success' | 'login_failure' | 'logout' | 'password_reset', 
                     userId: string, 
                     ipAddress: string, 
                     details?: any): void {
    this.logSecurityEvent(`auth_${eventType}`, {
      userId,
      result: eventType.includes('success') ? 'success' : eventType.includes('failure') ? 'failure' : 'other',
      details
    }, userId, ipAddress);
  }

  // Log suspicious activity
  static logSuspiciousActivity(activityType: string, userId: string, ipAddress: string, details: any): void {
    this.logSecurityEvent('suspicious_activity', {
      activityType,
      userId,
      details
    }, userId, ipAddress);
  }

  // Log access control violations
  static logAccessViolation(userId: string, requestedPath: string, role: string, ipAddress: string): void {
    this.logSecurityEvent('access_violation', {
      requestedPath,
      userRole: role,
      details: 'User attempted to access unauthorized resource'
    }, userId, ipAddress);
  }

  // Log data access/modification
  static logDataAccess(userId: string, action: string, resourceType: string, resourceId?: string, ipAddress?: string): void {
    this.logSecurityEvent('data_access', {
      action,
      resourceType,
      resourceId: resourceId || 'unknown',
    }, userId, ipAddress);
  }
}

// Security monitoring utilities
export class SecurityMonitor {
  // Track failed login attempts
  private static failedLoginAttempts = new Map<string, { count: number; timestamp: number[] }>();

  static recordFailedLogin(identifier: string, ipAddress: string): void {
    let attempts = this.failedLoginAttempts.get(identifier);
    const now = Date.now();

    if (!attempts) {
      attempts = { count: 0, timestamp: [] };
    }

    attempts.count++;
    attempts.timestamp.push(now);

    // Clean up old attempts (older than 15 minutes)
    attempts.timestamp = attempts.timestamp.filter(time => now - time < 15 * 60 * 1000);

    this.failedLoginAttempts.set(identifier, attempts);

    // Log if threshold is exceeded
    if (attempts.count >= 5) {
      SecurityLogger.logSuspiciousActivity(
        'multiple_failed_logins', 
        identifier, 
        ipAddress, 
        { attempts: attempts.count, window: '15 minutes' }
      );
    }
  }

  static getFailedAttempts(identifier: string): number {
    const attempts = this.failedLoginAttempts.get(identifier);
    const now = Date.now();

    // Clean up old attempts
    if (attempts) {
      attempts.timestamp = attempts.timestamp.filter(time => now - time < 15 * 60 * 1000);
      return attempts.timestamp.length;
    }

    return 0;
  }

  // Track file upload attempts
  static trackFileUpload(userId: string, fileName: string, fileSize: number, mimeType: string, ipAddress: string): void {
    SecurityLogger.logDataAccess(userId, 'file_upload', 'document', fileName, ipAddress);
  }

  // Monitor for potential DoS attempts
  static trackRequest(ipAddress: string, endpoint: string): void {
    // In a real implementation, you'd track requests per IP and endpoint
    // to identify potential DoS patterns
  }
}
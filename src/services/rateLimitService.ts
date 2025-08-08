// Rate limiting service for sensitive operations
// This implements client-side rate limiting and tracks security events

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimitService {
  private store: RateLimitStore = {};
  
  private defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5
  };

  /**
   * Check if a request should be rate limited
   */
  checkRateLimit(
    key: string, 
    config?: Partial<RateLimitConfig>
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const finalConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();
    
    // Clean up expired entries
    this.cleanup();
    
    const entry = this.store[key];
    
    if (!entry || now >= entry.resetTime) {
      // First request or window expired
      this.store[key] = {
        count: 1,
        resetTime: now + finalConfig.windowMs
      };
      
      return {
        allowed: true,
        remaining: finalConfig.maxRequests - 1,
        resetTime: this.store[key].resetTime
      };
    }
    
    if (entry.count >= finalConfig.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }
    
    // Increment count
    entry.count++;
    
    return {
      allowed: true,
      remaining: finalConfig.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Get rate limit info without incrementing
   */
  getRateLimitInfo(key: string): { remaining: number; resetTime: number | null } {
    const entry = this.store[key];
    const now = Date.now();
    
    if (!entry || now >= entry.resetTime) {
      return {
        remaining: this.defaultConfig.maxRequests,
        resetTime: null
      };
    }
    
    return {
      remaining: Math.max(0, this.defaultConfig.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }

  /**
   * Clear rate limit for a specific key
   */
  clearRateLimit(key: string): void {
    delete this.store[key];
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }

  /**
   * Rate limit configurations for different operations
   */
  static configs = {
    login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
    passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
    twoFactorSetup: { windowMs: 30 * 60 * 1000, maxRequests: 3 }, // 3 attempts per 30 minutes
    fileUpload: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 uploads per minute
    applicationSubmit: { windowMs: 5 * 60 * 1000, maxRequests: 20 }, // 20 submissions per 5 minutes
  };
}

// Create singleton instance
export const rateLimitService = new RateLimitService();

/**
 * Rate limit decorator for async functions
 */
export function rateLimit(
  operation: keyof typeof RateLimitService.configs,
  getUserKey: () => string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const userKey = getUserKey();
      const key = `${operation}:${userKey}`;
      const config = RateLimitService.configs[operation];
      
      const result = rateLimitService.checkRateLimit(key, config);
      
      if (!result.allowed) {
        const resetTimeMinutes = Math.ceil((result.resetTime - Date.now()) / (1000 * 60));
        throw new Error(`Rate limit exceeded. Try again in ${resetTimeMinutes} minutes.`);
      }
      
      return method.apply(this, args);
    };
  };
}

/**
 * Security event tracking
 */
export interface SecurityEvent {
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'password_reset' | 'two_factor_setup' | 'suspicious_activity';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  metadata?: Record<string, any>;
}

class SecurityEventService {
  /**
   * Log a security event (localStorage for now, database when migrations are applied)
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Store in localStorage for now, move to database when security_events table is available
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      events.push({
        ...event,
        timestamp: new Date().toISOString(),
        id: Math.random().toString(36).substring(2)
      });
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('security_events', JSON.stringify(events));
      
      console.log('Security event logged:', event);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  async checkSuspiciousActivity(userId: string): Promise<{
    suspicious: boolean;
    reason?: string;
    recommendation?: string;
  }> {
    try {
      // Check localStorage events for now
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      const userEvents = events.filter((event: any) => event.userId === userId);
      
      // Check recent failed login attempts (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentFailures = userEvents.filter((event: any) => 
        event.type === 'login_failure' && 
        new Date(event.timestamp) > twentyFourHoursAgo
      );

      // More than 10 failed logins in 24 hours
      if (recentFailures.length > 10) {
        return {
          suspicious: true,
          reason: 'Multiple failed login attempts',
          recommendation: 'Consider enabling 2FA or changing password'
        };
      }

      // Check for logins from multiple IP addresses
      const uniqueIPs = new Set(recentFailures.map((event: any) => event.ipAddress));
      if (uniqueIPs.size > 5) {
        return {
          suspicious: true,
          reason: 'Login attempts from multiple IP addresses',
          recommendation: 'Review recent account activity'
        };
      }

      return { suspicious: false };
    } catch (error) {
      console.error('Failed to check suspicious activity:', error);
      return { suspicious: false };
    }
  }
}

export const securityEventService = new SecurityEventService();

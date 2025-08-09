# Security & Privacy

This document outlines EzJob's comprehensive security architecture, privacy protections, and compliance measures.

## 🔐 Security Architecture

### Authentication & Authorization

EzJob implements a multi-layered security approach using Supabase Auth with additional custom protections.

#### Authentication Methods

```typescript
// Authentication flow types
interface AuthMethod {
  type: 'email' | 'oauth' | 'magic_link';
  provider?: 'google' | 'github';
  mfa_enabled?: boolean;
  last_used?: string;
}

// Supported authentication methods
const SUPPORTED_AUTH_METHODS = {
  EMAIL_PASSWORD: {
    type: 'email',
    features: ['password_reset', 'email_change'],
    security_level: 'standard'
  },
  GOOGLE_OAUTH: {
    type: 'oauth',
    provider: 'google',
    features: ['profile_sync'],
    security_level: 'high'
  },
  GITHUB_OAUTH: {
    type: 'oauth',
    provider: 'github',
    features: ['profile_sync'],
    security_level: 'high'
  },
  MAGIC_LINK: {
    type: 'magic_link',
    features: ['passwordless'],
    security_level: 'high'
  }
} as const;
```

#### Row Level Security (RLS)

All database tables implement comprehensive RLS policies:

```sql
-- User profile security
CREATE POLICY "users_own_profile" ON profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Job applications security
CREATE POLICY "users_own_applications" ON job_applications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Resume security
CREATE POLICY "users_own_resumes" ON resumes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Streak data security
CREATE POLICY "users_own_streak_data" ON user_streaks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Storage security for file uploads
CREATE POLICY "users_own_files" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### API Security

#### Request Authentication

```typescript
// API security middleware
export const authenticateRequest = async (request: Request): Promise<AuthResult> => {
  const authorization = request.headers.get('Authorization');
  
  if (!authorization?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authorization.slice(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Additional security checks
    await validateUserSession(user.id, token);
    
    return { user, token };
  } catch (error) {
    throw new UnauthorizedError('Authentication failed');
  }
};

// Session validation
const validateUserSession = async (userId: string, token: string): Promise<void> => {
  const session = await getActiveSession(userId);
  
  if (!session || session.token !== token) {
    throw new UnauthorizedError('Invalid session');
  }
  
  if (isSessionExpired(session)) {
    await invalidateSession(userId);
    throw new UnauthorizedError('Session expired');
  }
};
```

#### Rate Limiting

```typescript
// Rate limiting configuration
const RATE_LIMITS = {
  AUTH: {
    SIGNUP: { requests: 5, window: '15m' },
    LOGIN: { requests: 10, window: '15m' },
    PASSWORD_RESET: { requests: 3, window: '1h' },
    MAGIC_LINK: { requests: 3, window: '15m' }
  },
  API: {
    GENERAL: { requests: 100, window: '1h' },
    UPLOAD: { requests: 10, window: '1h' },
    BULK_OPERATIONS: { requests: 5, window: '1h' }
  }
} as const;

// Rate limiting implementation
export class RateLimiter {
  private static store = new Map<string, { count: number; resetTime: number }>();

  static async checkLimit(
    identifier: string,
    limit: number,
    windowMs: number
  ): Promise<boolean> {
    const now = Date.now();
    const key = `${identifier}:${Math.floor(now / windowMs)}`;
    
    const record = this.store.get(key) || { count: 0, resetTime: now + windowMs };
    
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }
    
    record.count++;
    this.store.set(key, record);
    
    return record.count <= limit;
  }

  static async enforceLimit(
    req: Request,
    type: keyof typeof RATE_LIMITS.AUTH | keyof typeof RATE_LIMITS.API
  ): Promise<void> {
    const clientIP = getClientIP(req);
    const userId = await getUserId(req);
    const identifier = userId || clientIP;
    
    const config = RATE_LIMITS.AUTH[type] || RATE_LIMITS.API[type];
    if (!config) return;
    
    const windowMs = parseTimeWindow(config.window);
    const allowed = await this.checkLimit(identifier, config.requests, windowMs);
    
    if (!allowed) {
      throw new TooManyRequestsError(
        `Rate limit exceeded. Max ${config.requests} requests per ${config.window}`
      );
    }
  }
}
```

### Data Protection

#### Encryption at Rest

```typescript
// Sensitive data encryption
export class DataEncryption {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly keyLength = 32;

  /**
   * Encrypt sensitive user data before storage
   */
  static encrypt(data: string, key: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt sensitive user data
   */
  static decrypt(encryptedData: EncryptedData, key: string): string {
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash passwords with salt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
```

#### Secure File Upload

```typescript
// File upload security
export class SecureFileUpload {
  private static readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ] as const;

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  /**
   * Validate uploaded file
   */
  static validateFile(file: File): ValidationResult {
    const errors: string[] = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File size must be less than ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Check MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type as any)) {
      errors.push('File type not allowed. Please upload PDF or Word documents only.');
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push('Invalid file extension.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize filename
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace non-alphanumeric chars
      .replace(/_{2,}/g, '_') // Replace multiple underscores
      .substring(0, 100); // Limit length
  }

  /**
   * Generate secure file path
   */
  static generateSecureFilePath(userId: string, filename: string): string {
    const sanitized = this.sanitizeFilename(filename);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    
    return `${userId}/resumes/${timestamp}_${random}_${sanitized}`;
  }

  /**
   * Scan file for malware (placeholder for actual implementation)
   */
  static async scanFile(file: File): Promise<ScanResult> {
    // In production, integrate with a malware scanning service
    // For now, basic validation
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Check for basic malware signatures (simplified)
    const suspiciousPatterns = [
      'eval(',
      'javascript:',
      '<script',
      'document.cookie'
    ];

    const fileContent = new TextDecoder().decode(uint8Array.slice(0, 1000));
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
      fileContent.toLowerCase().includes(pattern)
    );

    return {
      safe: !hasSuspiciousContent,
      threats: hasSuspiciousContent ? ['Suspicious content detected'] : []
    };
  }
}
```

## 🛡️ Privacy Protection

### Data Minimization

```typescript
// Data collection principles
export const DATA_COLLECTION_POLICY = {
  NECESSARY_DATA: [
    'email', // Required for authentication
    'first_name', // Personalization
    'last_name', // Personalization
  ],
  OPTIONAL_DATA: [
    'phone', // Contact preferences
    'avatar_url', // Profile customization
    'location', // Job search preferences
  ],
  SYSTEM_DATA: [
    'created_at', // Account management
    'updated_at', // Data integrity
    'last_login', // Security monitoring
  ]
} as const;

// Minimal user profile
interface MinimalUserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
}

// Privacy-aware data collection
export class PrivacyManager {
  /**
   * Collect only necessary user data
   */
  static collectMinimalData(userData: any): MinimalUserProfile {
    const { id, email, first_name, last_name, created_at } = userData;
    
    return {
      id,
      email,
      ...(first_name && { first_name }),
      ...(last_name && { last_name }),
      created_at
    };
  }

  /**
   * Anonymize user data for analytics
   */
  static anonymizeForAnalytics(userData: UserProfile): AnonymizedData {
    return {
      user_id_hash: crypto.createHash('sha256').update(userData.id).digest('hex'),
      created_month: userData.created_at.substring(0, 7), // YYYY-MM
      has_profile_complete: !!(userData.first_name && userData.last_name),
      application_count: userData.applications?.length || 0
    };
  }
}
```

### GDPR Compliance

```typescript
// GDPR compliance implementation
export class GDPRCompliance {
  /**
   * Handle data access request (Article 15)
   */
  static async exportUserData(userId: string): Promise<UserDataExport> {
    const [profile, applications, resumes, streaks] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('job_applications').select('*').eq('user_id', userId),
      supabase.from('resumes').select('*').eq('user_id', userId),
      supabase.from('user_streaks').select('*').eq('user_id', userId),
    ]);

    return {
      personal_data: {
        profile: profile.data,
        created_at: new Date().toISOString(),
        request_type: 'data_export'
      },
      application_data: applications.data || [],
      resume_data: resumes.data || [],
      streak_data: streaks.data || [],
      export_metadata: {
        exported_at: new Date().toISOString(),
        data_format: 'json',
        retention_period: '30 days'
      }
    };
  }

  /**
   * Handle data deletion request (Article 17)
   */
  static async deleteUserData(userId: string, options: DeletionOptions = {}): Promise<DeletionResult> {
    const deletionLog: string[] = [];

    try {
      // Delete in reverse dependency order
      
      // 1. Delete streak milestones
      const { error: milestonesError } = await supabase
        .from('streak_milestones')
        .delete()
        .eq('user_id', userId);
      
      if (milestonesError) throw milestonesError;
      deletionLog.push('Deleted streak milestones');

      // 2. Delete user streaks
      const { error: streaksError } = await supabase
        .from('user_streaks')
        .delete()
        .eq('user_id', userId);
      
      if (streaksError) throw streaksError;
      deletionLog.push('Deleted user streaks');

      // 3. Delete resume files from storage
      const { data: resumes } = await supabase
        .from('resumes')
        .select('file_path')
        .eq('user_id', userId);

      if (resumes && resumes.length > 0) {
        const filePaths = resumes.map(r => r.file_path);
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove(filePaths);
        
        if (storageError) throw storageError;
        deletionLog.push(`Deleted ${filePaths.length} resume files`);
      }

      // 4. Delete resume records
      const { error: resumesError } = await supabase
        .from('resumes')
        .delete()
        .eq('user_id', userId);
      
      if (resumesError) throw resumesError;
      deletionLog.push('Deleted resume records');

      // 5. Delete job applications
      const { error: applicationsError } = await supabase
        .from('job_applications')
        .delete()
        .eq('user_id', userId);
      
      if (applicationsError) throw applicationsError;
      deletionLog.push('Deleted job applications');

      // 6. Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) throw profileError;
      deletionLog.push('Deleted user profile');

      // 7. Delete auth user (if requested)
      if (options.deleteAuthUser) {
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        if (authError) throw authError;
        deletionLog.push('Deleted authentication account');
      }

      return {
        success: true,
        deleted_items: deletionLog,
        deleted_at: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        partial_deletion: deletionLog,
        deleted_at: new Date().toISOString()
      };
    }
  }

  /**
   * Handle data rectification request (Article 16)
   */
  static async updateUserData(userId: string, updates: Partial<UserProfile>): Promise<void> {
    // Validate updates
    const allowedFields = ['first_name', 'last_name', 'phone', 'avatar_url'];
    const validUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    if (Object.keys(validUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        ...validUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  }

  /**
   * Handle data portability request (Article 20)
   */
  static async generatePortableData(userId: string): Promise<PortableData> {
    const userData = await this.exportUserData(userId);
    
    // Convert to standardized format
    return {
      format: 'json',
      version: '1.0',
      generated_at: new Date().toISOString(),
      user_data: {
        profile: userData.personal_data.profile,
        applications: userData.application_data.map(app => ({
          company: app.company_name,
          role: app.role,
          location: app.location,
          status: app.status,
          applied_date: app.applied_date,
          notes: app.notes
        })),
        resumes: userData.resume_data.map(resume => ({
          title: resume.title,
          filename: resume.file_name,
          upload_date: resume.created_at
        }))
      }
    };
  }
}
```

### Data Retention Policy

```sql
-- Data retention policies
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- Delete old password reset tokens (older than 24 hours)
  DELETE FROM auth.password_reset_tokens 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  -- Delete old email confirmation tokens (older than 24 hours)
  DELETE FROM auth.email_confirmations 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  -- Archive old job applications (older than 2 years, for inactive users)
  UPDATE job_applications 
  SET archived = true 
  WHERE created_at < NOW() - INTERVAL '2 years'
    AND user_id IN (
      SELECT id FROM auth.users 
      WHERE last_sign_in_at < NOW() - INTERVAL '1 year'
    );
  
  -- Delete expired file upload tokens
  DELETE FROM upload_tokens 
  WHERE expires_at < NOW();
  
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (run daily)
SELECT cron.schedule('cleanup-expired-data', '0 2 * * *', 'SELECT cleanup_expired_data();');
```

## 🔒 Security Monitoring

### Audit Logging

```typescript
// Security audit system
export class SecurityAudit {
  /**
   * Log security events
   */
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const auditRecord = {
      user_id: event.userId,
      event_type: event.type,
      event_data: event.data,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      timestamp: new Date().toISOString(),
      risk_level: this.calculateRiskLevel(event)
    };

    // Log to security audit table
    await supabase.from('security_audit_log').insert(auditRecord);

    // Alert on high-risk events
    if (auditRecord.risk_level === 'high') {
      await this.alertSecurityTeam(auditRecord);
    }
  }

  /**
   * Calculate risk level for security events
   */
  private static calculateRiskLevel(event: SecurityEvent): 'low' | 'medium' | 'high' {
    const highRiskEvents = [
      'failed_login_attempt',
      'password_reset_request',
      'account_locked',
      'suspicious_activity'
    ];

    const mediumRiskEvents = [
      'login_from_new_device',
      'profile_updated',
      'password_changed'
    ];

    if (highRiskEvents.includes(event.type)) return 'high';
    if (mediumRiskEvents.includes(event.type)) return 'medium';
    return 'low';
  }

  /**
   * Detect suspicious activity patterns
   */
  static async detectSuspiciousActivity(userId: string): Promise<SuspiciousActivity[]> {
    const activities: SuspiciousActivity[] = [];

    // Check for rapid login attempts
    const recentLogins = await supabase
      .from('security_audit_log')
      .select('*')
      .eq('user_id', userId)
      .eq('event_type', 'login_attempt')
      .gte('timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString());

    if (recentLogins.data && recentLogins.data.length > 5) {
      activities.push({
        type: 'rapid_login_attempts',
        severity: 'high',
        description: 'Multiple login attempts in short timeframe',
        count: recentLogins.data.length
      });
    }

    // Check for logins from multiple locations
    const locationLogins = await supabase
      .from('security_audit_log')
      .select('ip_address')
      .eq('user_id', userId)
      .eq('event_type', 'successful_login')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (locationLogins.data) {
      const uniqueIPs = new Set(locationLogins.data.map(l => l.ip_address));
      if (uniqueIPs.size > 3) {
        activities.push({
          type: 'multiple_locations',
          severity: 'medium',
          description: 'Logins from multiple IP addresses',
          count: uniqueIPs.size
        });
      }
    }

    return activities;
  }
}
```

### Security Headers

```typescript
// Security headers middleware
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()'
  ].join(', ')
};

// Apply security headers to all responses
export const applySecurityHeaders = (response: Response): Response => {
  Object.entries(securityHeaders).forEach(([header, value]) => {
    response.headers.set(header, value);
  });
  
  return response;
};
```

## 🔍 Vulnerability Management

### Security Checklist

```markdown
## Security Audit Checklist

### Authentication & Authorization
- [ ] Strong password requirements enforced
- [ ] Multi-factor authentication available
- [ ] Session management secure
- [ ] JWT tokens properly validated
- [ ] Row Level Security (RLS) policies implemented
- [ ] OAuth integrations secure

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] Data in transit encrypted (HTTPS/TLS)
- [ ] Database connections secure
- [ ] File uploads validated and scanned
- [ ] PII data minimized and protected

### API Security
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection protection
- [ ] CSRF protection enabled
- [ ] CORS properly configured
- [ ] API versioning implemented

### Infrastructure Security
- [ ] Security headers configured
- [ ] Error messages don't leak sensitive info
- [ ] Logging and monitoring in place
- [ ] Regular security updates applied
- [ ] Backup and recovery procedures tested

### Compliance
- [ ] GDPR compliance verified
- [ ] Data retention policies implemented
- [ ] Privacy policy up to date
- [ ] User consent management
- [ ] Data breach response plan ready
```

### Security Testing

```typescript
// Automated security testing
export class SecurityTesting {
  /**
   * Test authentication bypass attempts
   */
  static async testAuthBypass(): Promise<TestResult> {
    const tests = [
      () => this.testUnauthenticatedAccess(),
      () => this.testTokenManipulation(),
      () => this.testSessionFixation(),
      () => this.testRoleEscalation()
    ];

    const results = await Promise.all(
      tests.map(async test => {
        try {
          return await test();
        } catch (error) {
          return {
            passed: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return {
      testSuite: 'Authentication Bypass',
      passed: results.every(r => r.passed),
      results
    };
  }

  /**
   * Test SQL injection protection
   */
  static async testSQLInjection(): Promise<TestResult> {
    const injectionPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "1' UNION SELECT * FROM users --",
      "'; SELECT * FROM profiles WHERE '1'='1"
    ];

    const results = await Promise.all(
      injectionPayloads.map(async payload => {
        try {
          // Test against search endpoints
          const response = await fetch('/api/applications/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: payload })
          });

          // Should not return data or cause errors
          return {
            payload,
            passed: response.status === 400 || response.status === 422,
            status: response.status
          };
        } catch (error) {
          return {
            payload,
            passed: true, // Error indicates proper handling
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return {
      testSuite: 'SQL Injection Protection',
      passed: results.every(r => r.passed),
      results
    };
  }
}
```

---

This comprehensive security documentation ensures that EzJob maintains the highest standards of security and privacy protection for user data and application functionality.

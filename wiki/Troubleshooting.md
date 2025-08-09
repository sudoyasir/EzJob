# Troubleshooting Guide

This guide helps developers and users resolve common issues encountered in EzJob.

## 🚨 Common Issues & Solutions

### Authentication Problems

#### Issue: "Invalid login credentials" error
```
Error: Invalid login credentials
```

**Possible Causes:**
- Email not confirmed
- Incorrect password
- Account locked due to multiple failed attempts
- Supabase configuration issues

**Solutions:**

1. **Check email confirmation:**
```typescript
// Verify if email is confirmed
const { data: user } = await supabase.auth.getUser();
if (user && !user.email_confirmed_at) {
  // Resend confirmation email
  await supabase.auth.resend({
    type: 'signup',
    email: user.email
  });
}
```

2. **Reset password:**
```typescript
// Send password reset email
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`
});
```

3. **Check environment variables:**
```bash
# Verify Supabase configuration
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### Issue: OAuth login not working (Google/GitHub)

**Symptoms:**
- Redirect loop after OAuth login
- "OAuth provider not configured" error
- Blank page after authentication

**Solutions:**

1. **Verify OAuth configuration in Supabase:**
   - Check redirect URLs are correctly set
   - Ensure OAuth app is properly configured
   - Verify client ID and secret

2. **Update redirect URLs:**
```typescript
// Ensure correct redirect URL format
const redirectTo = `${window.location.origin}/auth/callback`;

await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    }
  }
});
```

3. **Clear browser cache and cookies:**
```bash
# Clear application data
localStorage.clear();
sessionStorage.clear();
# Then refresh the page
```

### Database Connection Issues

#### Issue: "Failed to connect to database"

**Error Messages:**
```
Error: Connection timeout
Error: Too many connections
Error: Invalid database configuration
```

**Solutions:**

1. **Check Supabase connection:**
```typescript
// Test database connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('Database connection failed:', error);
      return false;
    }
    
    console.log('Database connection successful');
    return true;
  } catch (err) {
    console.error('Connection test failed:', err);
    return false;
  }
};
```

2. **Verify environment configuration:**
```typescript
// Check if environment variables are loaded
const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
};

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.error('Missing Supabase configuration');
}
```

3. **Handle connection retries:**
```typescript
// Implement connection retry logic
const retryConnection = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const connected = await testConnection();
      if (connected) return true;
    } catch (error) {
      console.warn(`Connection attempt ${i + 1} failed:`, error);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  return false;
};
```

### File Upload Problems

#### Issue: "File upload failed" or "File too large"

**Error Messages:**
```
Error: File size exceeds maximum limit
Error: Invalid file type
Error: Upload timeout
```

**Solutions:**

1. **Validate file before upload:**
```typescript
const validateFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (file.size > maxSize) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit (10MB)`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type '${file.type}' is not allowed. Please upload PDF or Word documents.`);
  }

  return true;
};
```

2. **Implement chunked upload for large files:**
```typescript
const uploadLargeFile = async (file: File, onProgress?: (progress: number) => void) => {
  const chunkSize = 1024 * 1024; // 1MB chunks
  const totalChunks = Math.ceil(file.size / chunkSize);
  
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    // Upload chunk
    await uploadChunk(chunk, chunkIndex, totalChunks);
    
    // Report progress
    onProgress?.((chunkIndex + 1) / totalChunks * 100);
  }
};
```

3. **Check storage bucket configuration:**
```sql
-- Verify storage bucket settings
SELECT * FROM storage.buckets WHERE id = 'documents';

-- Check bucket policies
SELECT * FROM storage.policies WHERE bucket_id = 'documents';
```

### UI/UX Issues

#### Issue: Loading states not showing properly

**Symptoms:**
- Blank screens during data loading
- Buttons remain clickable during operations
- No feedback for user actions

**Solutions:**

1. **Implement proper loading states:**
```tsx
const ApplicationList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setIsLoading(true);
        const data = await JobApplicationService.getAll(userId);
        setApplications(data);
      } catch (error) {
        console.error('Failed to load applications:', error);
        toast({
          title: "Error",
          description: "Failed to load applications. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [userId]);

  if (isLoading) {
    return <ApplicationCardSkeleton count={6} />;
  }

  return (
    <div className="space-y-4">
      {applications.map(app => (
        <ApplicationCard key={app.id} application={app} />
      ))}
    </div>
  );
};
```

2. **Add error boundaries:**
```tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            We've encountered an unexpected error. Please refresh the page.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### Issue: Mobile responsiveness problems

**Symptoms:**
- Layout breaks on mobile devices
- Text too small or too large
- Buttons/links not clickable
- Horizontal scrolling issues

**Solutions:**

1. **Check viewport meta tag:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

2. **Use proper Tailwind responsive classes:**
```tsx
const ResponsiveCard = () => (
  <div className="w-full max-w-md mx-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl">
    <div className="p-4 sm:p-6 md:p-8">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
        Job Application
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {/* Card content */}
      </div>
    </div>
  </div>
);
```

3. **Test mobile interactions:**
```css
/* Ensure touch targets are large enough */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Prevent zoom on input focus (iOS) */
input, select, textarea {
  font-size: 16px;
}
```

### Performance Issues

#### Issue: Slow page loading or laggy interactions

**Symptoms:**
- Pages take long to load
- UI feels unresponsive
- High memory usage
- Slow database queries

**Solutions:**

1. **Implement code splitting:**
```tsx
// Lazy load heavy components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Analytics = lazy(() => import('@/pages/Analytics'));

const App = () => (
  <Suspense fallback={<div className="loading-spinner" />}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  </Suspense>
);
```

2. **Optimize database queries:**
```typescript
// Use select to fetch only needed columns
const getApplications = async (userId: string) => {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      id,
      company_name,
      role,
      status,
      applied_date,
      resumes!inner(title)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20); // Pagination

  return data;
};
```

3. **Implement data caching:**
```typescript
// Simple cache implementation
class DataCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new DataCache();

// Use cache in API calls
const getCachedApplications = async (userId: string) => {
  const cacheKey = `applications:${userId}`;
  const cached = cache.get(cacheKey);
  
  if (cached) return cached;

  const data = await JobApplicationService.getAll(userId);
  cache.set(cacheKey, data);
  
  return data;
};
```

## 🔧 Development Environment Issues

### Build Errors

#### Issue: TypeScript compilation errors

**Common Errors:**
```
Property 'x' does not exist on type 'y'
Type 'undefined' is not assignable to type 'string'
Cannot find module '@/components/...'
```

**Solutions:**

1. **Check type definitions:**
```typescript
// Add proper type annotations
interface JobApplication {
  id: string;
  company_name: string;
  role: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  applied_date: string | null;
  user_id: string;
}

// Use proper null checks
const formatDate = (date: string | null) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};
```

2. **Update path mappings:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

3. **Install missing type packages:**
```bash
npm install --save-dev @types/react @types/react-dom
```

#### Issue: Vite build failures

**Error Messages:**
```
Build failed with errors
Module not found
Rollup failed to resolve import
```

**Solutions:**

1. **Clear build cache:**
```bash
rm -rf node_modules/.vite
rm -rf dist
npm run build
```

2. **Check import paths:**
```typescript
// Use relative imports for local files
import { Button } from '../ui/button';

// Use absolute imports for src files
import { supabase } from '@/integrations/supabase/client';
```

3. **Verify environment variables:**
```bash
# Check .env file exists and has correct format
cat .env

# Ensure variables are prefixed with VITE_
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Dependency Issues

#### Issue: Package version conflicts

**Error Messages:**
```
npm ERR! peer dep missing
npm ERR! conflicting peer dependency
ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. **Use exact versions:**
```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
```

3. **Resolve peer dependencies:**
```bash
npm install --legacy-peer-deps
# or
npm install --force
```

## 🐛 Debugging Tools

### Browser DevTools

1. **Network Tab Issues:**
   - Check for failed API requests
   - Verify request headers include authentication
   - Look for CORS errors

2. **Console Errors:**
   - Check for JavaScript errors
   - Look for unhandled promise rejections
   - Verify environment variables are loaded

3. **Application Tab:**
   - Check localStorage/sessionStorage
   - Verify service worker registration
   - Check for quota exceeded errors

### Supabase Dashboard

1. **Auth Tab:**
   - Check user creation and confirmation
   - Verify OAuth provider settings
   - Review auth policies

2. **Database Tab:**
   - Check RLS policies
   - Verify table schemas
   - Review query performance

3. **Storage Tab:**
   - Check bucket policies
   - Verify file uploads
   - Review storage usage

### Custom Debug Utils

```typescript
// Debug utility for development
export const debugUtils = {
  logUserState: () => {
    console.group('User State Debug');
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log('Current user:', user);
      console.log('Session:', supabase.auth.getSession());
    });
    console.groupEnd();
  },

  logDatabaseConnection: async () => {
    console.group('Database Connection Debug');
    try {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      console.log('Connection successful:', !error);
      console.log('Profile count:', data);
    } catch (err) {
      console.error('Connection failed:', err);
    }
    console.groupEnd();
  },

  logEnvironment: () => {
    console.group('Environment Debug');
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Mode:', import.meta.env.MODE);
    console.log('All env vars:', import.meta.env);
    console.groupEnd();
  }
};

// Use in development only
if (import.meta.env.DEV) {
  (window as any).debugUtils = debugUtils;
}
```

## 📞 Getting Help

### Error Reporting

When reporting issues, include:

1. **Error details:**
   - Complete error message
   - Stack trace (if available)
   - Steps to reproduce

2. **Environment info:**
   - Browser and version
   - Operating system
   - Node.js version
   - Package versions

3. **Code context:**
   - Relevant code snippets
   - Configuration files
   - Environment variables (without sensitive data)

### Support Channels

1. **GitHub Issues:**
   - Check existing issues first
   - Use issue templates
   - Provide minimal reproduction case

2. **Documentation:**
   - Check this wiki
   - Review Supabase documentation
   - Check framework-specific guides

3. **Community:**
   - Supabase Discord/Community
   - Stack Overflow (tag: supabase, react, typescript)
   - Reddit communities

---

This troubleshooting guide covers the most common issues you might encounter while developing or using EzJob. Keep it updated as new issues are discovered and resolved.

# Authentication System

EzJob implements a comprehensive authentication system using Supabase Auth with multiple sign-in methods, security features, and professional email templates.

## 🔐 Authentication Overview

### Supported Authentication Methods

| Method | Description | Use Case |
|--------|-------------|----------|
| **Email/Password** | Traditional account creation | Users preferring standard signup |
| **Google OAuth** | Sign in with Google account | Quick signup for Google users |
| **GitHub OAuth** | Sign in with GitHub account | Developer-friendly authentication |
| **Magic Links** | Passwordless email authentication | Secure, convenient access |

### Security Features

- ✅ **Email Verification**: Required for new accounts
- ✅ **Password Strength**: Enforced security requirements
- ✅ **Session Management**: Automatic token refresh
- ✅ **Rate Limiting**: Protection against brute force attacks
- ✅ **Secure Redirects**: Safe post-authentication routing
- ✅ **Row Level Security**: Database-level access control

## 🏗️ Authentication Architecture

### Component Structure

```
Authentication System
├── Frontend Components
│   ├── Login.tsx (Sign-in form)
│   ├── ForgotPassword.tsx (Password reset)
│   ├── ResetPassword.tsx (New password form)
│   └── ProtectedRoute.tsx (Route guard)
├── Context Providers
│   └── AuthContext.tsx (Global auth state)
├── Services
│   └── emailNotifications.ts (Welcome emails)
└── Backend (Supabase)
    ├── Authentication Service
    ├── Email Templates
    └── OAuth Providers
```

### Authentication Flow

```
User Registration/Login
├── User submits credentials
├── Frontend validation
├── Supabase Auth API call
├── Database user creation (if signup)
├── JWT token generation
├── Email verification (if required)
├── User redirected to dashboard
└── Session established
```

## 📧 Email Templates

EzJob includes professional, branded email templates for all authentication flows.

### Template Overview

| Template | Purpose | Design | Features |
|----------|---------|--------|----------|
| **Welcome Email** | Account confirmation | Blue gradient, welcoming | Feature highlights, clear CTA |
| **Password Reset** | Password recovery | Red accent, security-focused | Security warnings, expiration notice |
| **Magic Link** | Passwordless signin | Green accent, convenience | Quick access, security notice |

### Template Features

- 📱 **Mobile Responsive**: Optimized for all email clients
- 🎨 **Branded Design**: Consistent with EzJob visual identity
- 🔒 **Security Focused**: Clear security messaging and warnings
- ⚡ **Fast Loading**: Minimal external dependencies
- 🌐 **Wide Compatibility**: Works across major email providers

### Setting Up Email Templates

1. **Access Supabase Dashboard**
   ```
   Dashboard → Authentication → Email Templates
   ```

2. **Configure Each Template**
   ```html
   <!-- Copy HTML from email-templates/ folder -->
   <!-- Customize subject lines -->
   <!-- Test with real email addresses -->
   ```

3. **Subject Lines**
   ```
   Welcome: "Welcome to EzJob - Confirm Your Account"
   Reset: "Reset Your EzJob Password"
   Magic Link: "Sign in to EzJob - Magic Link"
   ```

## 🔧 Implementation Details

### AuthContext Implementation

```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Send welcome email for new users
        if (event === 'SIGNED_IN' && session) {
          const isNewUser = new Date(session.user.created_at!).getTime() > Date.now() - 5000;
          if (isNewUser) {
            try {
              await emailNotificationService.sendWelcomeEmail(
                session.user.email!, 
                session.user.user_metadata?.full_name
              );
            } catch (error) {
              console.warn('Failed to send welcome email:', error);
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Authentication methods implementation...
};
```

### Email/Password Authentication

```typescript
const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
};

const signUpWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign up');
  }
};
```

### OAuth Authentication

```typescript
const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });

    if (error) throw error;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

const signInWithGithub = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });

    if (error) throw error;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in with GitHub');
  }
};
```

### Password Reset Flow

```typescript
const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send reset email');
  }
};
```

## 🛡️ Route Protection

### ProtectedRoute Component

```typescript
// src/components/auth/ProtectedRoute.tsx
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

### Usage in Routes

```typescript
// App.tsx routing
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<Login />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />
  
  {/* Protected routes */}
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />
  <Route path="/analytics" element={
    <ProtectedRoute>
      <Analytics />
    </ProtectedRoute>
  } />
  <Route path="/settings" element={
    <ProtectedRoute>
      <AccountSettings />
    </ProtectedRoute>
  } />
</Routes>
```

## 🔒 Password Security

### Password Requirements

EzJob enforces strong password requirements:

```typescript
const validatePassword = (password: string) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers
  };
};
```

### Visual Password Strength Indicator

```typescript
// Password strength component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const validation = validatePassword(password);
  
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">Password requirements:</div>
      <ul className="space-y-1 text-sm">
        <li className={validation.minLength ? "text-green-600" : "text-red-600"}>
          {validation.minLength ? "✓" : "✗"} At least 8 characters
        </li>
        <li className={validation.hasUpperCase ? "text-green-600" : "text-red-600"}>
          {validation.hasUpperCase ? "✓" : "✗"} One uppercase letter
        </li>
        <li className={validation.hasLowerCase ? "text-green-600" : "text-red-600"}>
          {validation.hasLowerCase ? "✓" : "✗"} One lowercase letter
        </li>
        <li className={validation.hasNumbers ? "text-green-600" : "text-red-600"}>
          {validation.hasNumbers ? "✓" : "✗"} One number
        </li>
      </ul>
    </div>
  );
};
```

## 📱 Login Component

### Complete Login Implementation

```typescript
// src/pages/Login.tsx
const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          toast.error("Password doesn't meet security requirements");
          return;
        }
        
        await signUpWithEmail(email, password);
        toast.success("Account created! Please check your email for verification.");
      } else {
        await signInWithEmail(email, password);
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            {isSignUp ? "Create Account" : "Sign In"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSignUp 
              ? "Start tracking your job applications today" 
              : "Welcome back to EzJob"
            }
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGithubSignIn}
          >
            <FaGithub className="w-5 h-5 mr-2" />
            Continue with GitHub
          </Button>
        </div>

        <Separator className="my-6" />

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>

          {isSignUp && password && (
            <PasswordStrengthIndicator password={password} />
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>

        {/* Toggle Sign Up/Sign In */}
        <div className="text-center mt-6">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp 
              ? "Already have an account? Sign in" 
              : "Don't have an account? Sign up"
            }
          </Button>
        </div>

        {/* Forgot Password Link */}
        {!isSignUp && (
          <div className="text-center mt-2">
            <Button variant="link" asChild>
              <Link to="/forgot-password">Forgot your password?</Link>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
```

## 🔄 Session Management

### Automatic Token Refresh

Supabase handles token refresh automatically:

```typescript
// Supabase client configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### Session Persistence

Sessions persist across browser tabs and page refreshes:

```typescript
useEffect(() => {
  // Check for existing session on app start
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      setUser(session.user);
      setSession(session);
    }
    setLoading(false);
  });
}, []);
```

## 🛠️ Database Integration

### User Profile Creation

Automatic profile creation on signup:

```sql
-- Database trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url)
  VALUES (
    new.id,
    split_part(new.raw_user_meta_data->>'full_name', ' ', 1),
    split_part(new.raw_user_meta_data->>'full_name', ' ', 2),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Row Level Security

Ensure users can only access their own data:

```sql
-- Enable RLS on all tables
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Example RLS policy
CREATE POLICY "Users can view own data" ON job_applications
  FOR SELECT USING (auth.uid() = user_id);
```

## 🎨 UI Components

### Professional Login Design

The login page features:

- **Clean, minimal design** with proper spacing
- **Brand consistency** with EzJob colors and typography
- **Mobile responsive** layout that works on all devices
- **Accessibility** with proper labels and keyboard navigation
- **Loading states** for better user feedback
- **Error handling** with helpful error messages

### Visual Design Elements

```css
/* Login page styling */
.login-container {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  min-height: 100vh;
}

.login-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

## 📊 Analytics Integration

### Authentication Events

Track authentication events for analytics:

```typescript
// Track signup events
const handleSignUp = async (email: string, password: string) => {
  try {
    await signUpWithEmail(email, password);
    
    // Track successful signup
    analytics.track('User Signed Up', {
      method: 'email',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Track failed signup
    analytics.track('Signup Failed', {
      method: 'email',
      error: error.message
    });
  }
};
```

## 🔍 Testing Authentication

### Unit Tests

```typescript
// Example authentication tests
describe('AuthContext', () => {
  test('provides authentication state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  test('handles sign in correctly', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });
    
    await act(async () => {
      await result.current.signInWithEmail('test@example.com', 'password123');
    });
    
    expect(result.current.user).toBeTruthy();
  });
});
```

### E2E Tests

```typescript
// Example Playwright test
test('user can sign up and sign in', async ({ page }) => {
  await page.goto('/login');
  
  // Sign up
  await page.click('text=Don\'t have an account? Sign up');
  await page.fill('[placeholder="Enter your email"]', 'test@example.com');
  await page.fill('[placeholder="Enter your password"]', 'TestPassword123!');
  await page.click('button:has-text("Create Account")');
  
  // Check for success message
  await expect(page.locator('text=Please check your email')).toBeVisible();
});
```

---

This authentication system provides a secure, user-friendly foundation for EzJob while maintaining flexibility for future enhancements and integrations.

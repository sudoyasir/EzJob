# Architecture Guide

This document provides a comprehensive overview of EzJob's technical architecture, design decisions, and implementation patterns.

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Storage       │
│   (React SPA)   │◄──►│   (Supabase)    │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Hosting   │    │   Auth/API      │    │   File Storage  │
│   (Netlify)     │    │   (Supabase)    │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

```
Frontend (React + TypeScript)
├── Presentation Layer
│   ├── Pages (Route Components)
│   ├── Components (UI Components)
│   └── UI Library (shadcn/ui)
├── Business Logic Layer
│   ├── Contexts (State Management)
│   ├── Hooks (Custom Logic)
│   └── Services (API Calls)
├── Data Layer
│   ├── Supabase Client
│   └── Type Definitions
└── Infrastructure
    ├── Routing (React Router)
    ├── Build Tools (Vite)
    └── Styling (Tailwind)
```

## 🔧 Frontend Architecture

### Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.3.1 |
| TypeScript | Type Safety | 5.8.3 |
| Vite | Build Tool | 5.4.19 |
| Tailwind CSS | Styling | 3.4.17 |
| React Router | Routing | 6.30.1 |
| React Query | Server State | 5.83.0 |

### Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── applications/        # Job application features
│   │   ├── ApplicationCard.tsx
│   │   ├── ApplicationFilters.tsx
│   │   ├── JobApplicationForm.tsx
│   │   └── JobApplicationView.tsx
│   ├── auth/               # Authentication components
│   │   └── ProtectedRoute.tsx
│   ├── charts/             # Analytics visualizations
│   │   └── DashboardCharts.tsx
│   ├── landing/            # Landing page components
│   │   └── LandingPage.tsx
│   ├── resumes/            # Resume management
│   │   ├── ResumeManager.tsx
│   │   └── ResumeSelector.tsx
│   ├── skeletons/          # Loading states
│   │   ├── ApplicationCardSkeleton.tsx
│   │   └── StatsCardSkeleton.tsx
│   └── ui/                 # Base UI components (shadcn/ui)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (40+ components)
├── contexts/               # React Context providers
│   ├── AuthContext.tsx     # Authentication state
│   ├── ThemeContext.tsx    # Theme management
│   └── StreakContext.tsx   # Streak tracking
├── hooks/                  # Custom React hooks
│   ├── use-mobile.tsx      # Mobile detection
│   ├── use-toast.ts        # Toast notifications
│   └── useStreak.ts        # Streak management
├── integrations/           # External services
│   └── supabase/
│       ├── client.ts       # Supabase client configuration
│       └── types.ts        # Generated TypeScript types
├── lib/                    # Utility libraries
│   ├── utils.ts            # Helper functions
│   └── fileUpload.ts       # File upload utilities
├── pages/                  # Route components
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Login.tsx           # Authentication
│   ├── AccountSettings.tsx # User settings
│   ├── Analytics.tsx       # Analytics dashboard
│   └── ... (more pages)
├── services/               # API service layer
│   ├── jobApplications.ts  # Job application CRUD
│   ├── accountManagement.ts # Data export/deletion
│   ├── streakService.ts    # Streak calculations
│   └── emailNotifications.ts # Email services
└── styles/                 # Global styles
    ├── accessibility.css   # Accessibility enhancements
    └── color-palette.css   # Custom CSS variables
```

### State Management

EzJob uses a hybrid state management approach:

#### React Context for Global State

```typescript
// AuthContext.tsx
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
```

#### React Query for Server State

```typescript
// Example query hook
const useJobApplications = () => {
  return useQuery({
    queryKey: ['jobApplications', user?.id],
    queryFn: () => jobApplicationService.getAll(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

#### Local State for Component State

```typescript
// Component-level state
const [filters, setFilters] = useState<FilterState>({
  status: 'all',
  dateRange: 'all',
  location: 'all',
  resume: 'all',
  sortBy: 'newest'
});
```

### Component Patterns

#### Compound Components

```typescript
// ApplicationFilters component with sub-components
<ApplicationFilters value={filters} onChange={setFilters}>
  <ApplicationFilters.Status />
  <ApplicationFilters.DateRange />
  <ApplicationFilters.Location />
  <ApplicationFilters.Resume />
  <ApplicationFilters.Sort />
</ApplicationFilters>
```

#### Render Props Pattern

```typescript
// Data fetching with render props
<DataLoader<JobApplication[]>
  queryKey={['applications']}
  queryFn={fetchApplications}
>
  {({ data, loading, error }) => (
    loading ? <LoadingSkeleton /> :
    error ? <ErrorMessage /> :
    <ApplicationList applications={data} />
  )}
</DataLoader>
```

#### Higher-Order Components

```typescript
// Authentication wrapper
const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { user, loading } = useAuth();
    
    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/login" />;
    
    return <Component {...props} />;
  };
};
```

## 🗄️ Backend Architecture

### Supabase Stack

```
Supabase Platform
├── PostgreSQL Database
│   ├── Tables (job_applications, resumes, profiles, etc.)
│   ├── Row Level Security (RLS)
│   ├── Functions (custom SQL functions)
│   └── Triggers (automated actions)
├── Authentication
│   ├── Email/Password
│   ├── OAuth Providers (Google, GitHub)
│   ├── Magic Links
│   └── Session Management
├── Storage
│   ├── Avatars Bucket (public)
│   ├── Documents Bucket (private)
│   └── File Upload Policies
├── Real-time
│   ├── Database Changes
│   ├── Presence
│   └── Broadcast
└── Edge Functions (optional)
    ├── Data Processing
    └── Third-party Integrations
```

### Database Schema

#### Core Tables

```sql
-- Users (managed by Supabase Auth)
auth.users
├── id (uuid, primary key)
├── email (text)
├── created_at (timestamptz)
└── user_metadata (jsonb)

-- Extended user profiles
profiles
├── id (uuid, references auth.users)
├── first_name (text)
├── last_name (text)
├── avatar_url (text)
├── phone (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)

-- Job applications
job_applications
├── id (uuid, primary key)
├── user_id (uuid, references auth.users)
├── company_name (text, not null)
├── role (text, not null)
├── location (text)
├── status (text)
├── applied_date (date)
├── response_date (date)
├── resume_id (uuid, references resumes)
├── resume_url (text)
├── notes (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)

-- Resume management
resumes
├── id (uuid, primary key)
├── user_id (uuid, references auth.users)
├── title (text, not null)
├── file_name (text, not null)
├── file_path (text, not null)
├── file_size (bigint)
├── is_default (boolean)
├── created_at (timestamptz)
└── updated_at (timestamptz)

-- Streak tracking
user_streaks
├── id (uuid, primary key)
├── user_id (uuid, references auth.users)
├── current_streak (integer)
├── longest_streak (integer)
├── last_activity_date (date)
├── streak_start_date (date)
├── total_applications (integer)
├── created_at (timestamptz)
└── updated_at (timestamptz)

-- Milestone achievements
streak_milestones
├── id (uuid, primary key)
├── user_id (uuid, references auth.users)
├── milestone_type (text)
├── milestone_value (integer)
├── achieved_date (date)
└── created_at (timestamptz)
```

#### Row Level Security (RLS)

```sql
-- Example RLS policies
CREATE POLICY "Users can view own applications" ON job_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON job_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications" ON job_applications
  FOR DELETE USING (auth.uid() = user_id);
```

### API Layer

#### Service Pattern

```typescript
// jobApplications.ts
export class JobApplicationService {
  static async getAll(userId: string): Promise<JobApplication[]> {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        resumes (
          id,
          title,
          file_name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async create(application: CreateJobApplication): Promise<JobApplication> {
    const { data, error } = await supabase
      .from('job_applications')
      .insert(application)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ... more methods
}
```

#### Type Safety

```typescript
// Generated types from Supabase
export interface Database {
  public: {
    Tables: {
      job_applications: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          role: string;
          location: string | null;
          status: string | null;
          applied_date: string | null;
          response_date: string | null;
          resume_id: string | null;
          resume_url: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          // ... insert type
        };
        Update: {
          // ... update type
        };
      };
    };
  };
}

// Usage
export type JobApplication = Database['public']['Tables']['job_applications']['Row'];
export type CreateJobApplication = Database['public']['Tables']['job_applications']['Insert'];
```

## 🎨 Design System

### Component Library

EzJob uses [shadcn/ui](https://ui.shadcn.com/) as the foundation:

#### Base Components

```typescript
// Example component structure
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'hero';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

#### Styling System

```typescript
// Tailwind + CVA (Class Variance Authority)
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
        hero: "bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl"
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)
```

### Theme System

#### CSS Custom Properties

```css
/* styles/color-palette.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme variables */
}
```

#### Theme Context

```typescript
// ThemeContext.tsx
type Theme = "dark" | "light" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ezjob-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
```

## 🔐 Security Architecture

### Authentication Flow

```
User Registration/Login
├── Frontend validates input
├── Supabase Auth handles authentication
├── JWT tokens issued (access + refresh)
├── User redirected to dashboard
└── Subsequent requests include JWT

Row Level Security (RLS)
├── All queries filtered by user_id
├── PostgreSQL enforces access control
├── No server-side authorization code needed
└── Database-level security guarantees
```

### Data Protection

#### Client-Side Security

```typescript
// Route protection
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

#### Server-Side Security

```sql
-- RLS ensures data isolation
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own data" ON job_applications
  FOR ALL USING (auth.uid() = user_id);

-- Storage security
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

## 📊 Performance Architecture

### Frontend Optimization

#### Code Splitting

```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Settings = lazy(() => import('@/pages/AccountSettings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

#### React Query Optimization

```typescript
// Optimistic updates
const addApplicationMutation = useMutation({
  mutationFn: JobApplicationService.create,
  onMutate: async (newApplication) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['applications'] });
    
    // Snapshot previous value
    const previousApplications = queryClient.getQueryData(['applications']);
    
    // Optimistically update
    queryClient.setQueryData(['applications'], (old: JobApplication[]) => [
      { ...newApplication, id: 'temp-id' },
      ...old
    ]);
    
    return { previousApplications };
  },
  onError: (err, newApplication, context) => {
    // Rollback on error
    queryClient.setQueryData(['applications'], context?.previousApplications);
  },
  onSettled: () => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries({ queryKey: ['applications'] });
  },
});
```

### Backend Optimization

#### Database Indexing

```sql
-- Performance indexes
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_applied_date ON job_applications(applied_date);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);

-- Composite indexes for common queries
CREATE INDEX idx_job_applications_user_status ON job_applications(user_id, status);
CREATE INDEX idx_job_applications_user_date ON job_applications(user_id, applied_date);
```

#### Query Optimization

```typescript
// Efficient data fetching with selected fields
const { data } = await supabase
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
  .order('applied_date', { ascending: false })
  .limit(50); // Pagination
```

## 🚀 Deployment Architecture

### Build Process

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk
          vendor: ['react', 'react-dom'],
          // UI chunk
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-popover'],
          // Charts chunk
          charts: ['recharts'],
        },
      },
    },
    // Performance optimizations
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
    minify: 'terser',
  },
  // Development optimizations
  server: {
    host: true,
    port: 8080,
  },
});
```

### Production Environment

```
CDN (Netlify/Vercel)
├── Static Assets (HTML, CSS, JS)
├── Edge Caching
├── Gzip Compression
└── HTTPS Termination

Supabase
├── PostgreSQL (Multi-region)
├── Authentication Service
├── File Storage (Global CDN)
└── Real-time Engine
```

## 🔄 Data Flow Architecture

### Application State Flow

```
User Action
├── Component Event Handler
├── Service Layer Call
├── Supabase API Request
├── Database Operation (with RLS)
├── Response with Updated Data
├── React Query Cache Update
├── Component Re-render
└── UI Update
```

### Real-time Updates

```typescript
// Real-time subscription
useEffect(() => {
  const subscription = supabase
    .channel('job_applications')
    .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'job_applications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          // Update React Query cache
          queryClient.invalidateQueries(['applications']);
        }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [user.id]);
```

---

This architecture provides a solid foundation for EzJob's scalability, maintainability, and performance. The modular design allows for easy feature additions and modifications while maintaining code quality and user experience.

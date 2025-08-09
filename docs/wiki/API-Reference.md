# API Reference

This document provides comprehensive documentation for EzJob's API, database schema, and service interfaces.

## 🗄️ Database Schema

### Tables Overview

| Table | Purpose | Relationships |
|-------|---------|---------------|
| `auth.users` | User authentication (Supabase managed) | → profiles, job_applications, resumes |
| `profiles` | Extended user information | ← auth.users |
| `job_applications` | Job application tracking | ← auth.users, → resumes |
| `resumes` | Resume file management | ← auth.users, ← job_applications |
| `user_streaks` | Application streak tracking | ← auth.users |
| `streak_milestones` | Achievement milestones | ← auth.users |

### Detailed Schema

#### auth.users (Supabase Managed)

```sql
-- System table managed by Supabase Auth
TABLE auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid,
  aud varchar(255),
  role varchar(255),
  email varchar(255) UNIQUE,
  encrypted_password varchar(255),
  email_confirmed_at timestamptz,
  invited_at timestamptz,
  confirmation_token varchar(255),
  confirmation_sent_at timestamptz,
  recovery_token varchar(255),
  recovery_sent_at timestamptz,
  email_change_token_new varchar(255),
  email_change varchar(255),
  email_change_sent_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### profiles

```sql
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Indexes
CREATE INDEX profiles_id_idx ON profiles(id);
```

#### job_applications

```sql
CREATE TABLE job_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  role text NOT NULL,
  location text,
  status text CHECK (status IN ('applied', 'interview', 'offer', 'rejected')),
  applied_date date,
  response_date date,
  resume_id uuid REFERENCES resumes(id) ON DELETE SET NULL,
  resume_url text, -- Legacy field for backward compatibility
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Row Level Security
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON job_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON job_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications" ON job_applications
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX job_applications_user_id_idx ON job_applications(user_id);
CREATE INDEX job_applications_status_idx ON job_applications(status);
CREATE INDEX job_applications_applied_date_idx ON job_applications(applied_date);
CREATE INDEX job_applications_user_status_idx ON job_applications(user_id, status);
CREATE INDEX job_applications_user_date_idx ON job_applications(user_id, applied_date);

-- Triggers
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### resumes

```sql
CREATE TABLE resumes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes" ON resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX resumes_user_id_idx ON resumes(user_id);
CREATE INDEX resumes_is_default_idx ON resumes(user_id, is_default);

-- Triggers
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### user_streaks

```sql
CREATE TABLE user_streaks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  streak_start_date date,
  total_applications integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Row Level Security
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE UNIQUE INDEX user_streaks_user_id_idx ON user_streaks(user_id);

-- Triggers
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### streak_milestones

```sql
CREATE TABLE streak_milestones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_type text NOT NULL, -- 'streak' or 'applications'
  milestone_value integer NOT NULL,
  achieved_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Row Level Security
ALTER TABLE streak_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones" ON streak_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones" ON streak_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX streak_milestones_user_id_idx ON streak_milestones(user_id);
CREATE INDEX streak_milestones_type_value_idx ON streak_milestones(milestone_type, milestone_value);
```

## 🔧 Database Functions

### Utility Functions

```sql
-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Initialize user streak on first application
CREATE OR REPLACE FUNCTION initialize_user_streak(user_uuid uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO user_streaks (user_id, current_streak, longest_streak, total_applications)
  VALUES (user_uuid, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check and award streak milestones
CREATE OR REPLACE FUNCTION check_streak_milestones(
  user_uuid uuid,
  current_streak_val integer,
  total_apps integer
)
RETURNS void AS $$
DECLARE
  milestone_values integer[] := ARRAY[7, 14, 30, 60, 100];
  app_milestones integer[] := ARRAY[10, 25, 50, 100, 250, 500];
  milestone_val integer;
BEGIN
  -- Check streak milestones
  FOREACH milestone_val IN ARRAY milestone_values
  LOOP
    IF current_streak_val >= milestone_val THEN
      INSERT INTO streak_milestones (user_id, milestone_type, milestone_value)
      VALUES (user_uuid, 'streak', milestone_val)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
    END IF;
  END LOOP;

  -- Check application count milestones
  FOREACH milestone_val IN ARRAY app_milestones
  LOOP
    IF total_apps >= milestone_val THEN
      INSERT INTO streak_milestones (user_id, milestone_type, milestone_value)
      VALUES (user_uuid, 'applications', milestone_val)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get weekly activity for analytics
CREATE OR REPLACE FUNCTION get_weekly_activity(user_uuid uuid)
RETURNS TABLE(
  activity_date date,
  applications_count integer,
  streak_maintained boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    date_series.date AS activity_date,
    COALESCE(daily_apps.app_count, 0) AS applications_count,
    COALESCE(daily_apps.app_count, 0) > 0 AS streak_maintained
  FROM (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '6 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date AS date
  ) date_series
  LEFT JOIN (
    SELECT 
      applied_date,
      COUNT(*) AS app_count
    FROM job_applications
    WHERE user_id = user_uuid
      AND applied_date >= CURRENT_DATE - INTERVAL '6 days'
      AND applied_date <= CURRENT_DATE
    GROUP BY applied_date
  ) daily_apps ON date_series.date = daily_apps.applied_date
  ORDER BY activity_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset broken streaks (run daily via cron)
CREATE OR REPLACE FUNCTION reset_broken_streaks()
RETURNS void AS $$
BEGIN
  UPDATE user_streaks
  SET 
    current_streak = 0,
    streak_start_date = NULL
  WHERE 
    last_activity_date < CURRENT_DATE - INTERVAL '1 day'
    AND current_streak > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📡 API Endpoints (Supabase REST)

### Authentication Endpoints

```typescript
// Authentication is handled by Supabase Auth
// Base URL: https://your-project.supabase.co/auth/v1

// Sign up with email
POST /signup
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Sign in with email
POST /token?grant_type=password
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "securepassword"
}

// OAuth sign in
POST /authorize?provider=google
POST /authorize?provider=github

// Reset password
POST /recover
Content-Type: application/json
{
  "email": "user@example.com"
}

// Sign out
POST /logout
Authorization: Bearer <access_token>
```

### REST API Endpoints

Base URL: `https://your-project.supabase.co/rest/v1`

#### Job Applications

```typescript
// Get all applications for authenticated user
GET /job_applications
Authorization: Bearer <access_token>
// RLS automatically filters by user_id

// Get applications with resume details
GET /job_applications?select=*,resumes(id,title,file_name)
Authorization: Bearer <access_token>

// Create new application
POST /job_applications
Authorization: Bearer <access_token>
Content-Type: application/json
{
  "company_name": "Google",
  "role": "Software Engineer",
  "location": "Mountain View, CA",
  "status": "applied",
  "applied_date": "2024-01-15",
  "resume_id": "uuid-here",
  "notes": "Applied through company website"
}

// Update application
PATCH /job_applications?id=eq.<application_id>
Authorization: Bearer <access_token>
Content-Type: application/json
{
  "status": "interview",
  "response_date": "2024-01-20",
  "notes": "First round interview scheduled"
}

// Delete application
DELETE /job_applications?id=eq.<application_id>
Authorization: Bearer <access_token>

// Filter applications
GET /job_applications?status=eq.interview
GET /job_applications?applied_date=gte.2024-01-01
GET /job_applications?company_name=ilike.*google*
GET /job_applications?order=applied_date.desc

// Complex filtering
GET /job_applications?and=(status.eq.applied,applied_date.gte.2024-01-01)
```

#### Resumes

```typescript
// Get all resumes
GET /resumes
Authorization: Bearer <access_token>

// Create resume record (after file upload)
POST /resumes
Authorization: Bearer <access_token>
Content-Type: application/json
{
  "title": "Software Engineer Resume",
  "file_name": "resume_2024.pdf",
  "file_path": "user_id/resumes/resume_2024.pdf",
  "file_size": 245760,
  "is_default": true
}

// Update resume
PATCH /resumes?id=eq.<resume_id>
Authorization: Bearer <access_token>
Content-Type: application/json
{
  "title": "Updated Resume Title",
  "is_default": false
}

// Delete resume
DELETE /resumes?id=eq.<resume_id>
Authorization: Bearer <access_token>

// Get default resume
GET /resumes?is_default=eq.true&limit=1
Authorization: Bearer <access_token>
```

#### User Profiles

```typescript
// Get user profile
GET /profiles?id=eq.<user_id>
Authorization: Bearer <access_token>

// Create/Update profile
POST /profiles
Authorization: Bearer <access_token>
Content-Type: application/json
{
  "id": "<user_id>",
  "first_name": "John",
  "last_name": "Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "phone": "+1234567890",
  "email": "john@example.com"
}

// Update profile
PATCH /profiles?id=eq.<user_id>
Authorization: Bearer <access_token>
Content-Type: application/json
{
  "first_name": "John",
  "last_name": "Smith"
}
```

#### Streak Data

```typescript
// Get user streak
GET /user_streaks?user_id=eq.<user_id>
Authorization: Bearer <access_token>

// Get milestones
GET /streak_milestones?user_id=eq.<user_id>&order=achieved_date.desc
Authorization: Bearer <access_token>

// Call functions
POST /rpc/initialize_user_streak
Authorization: Bearer <access_token>
Content-Type: application/json
{
  "user_uuid": "<user_id>"
}

POST /rpc/get_weekly_activity
Authorization: Bearer <access_token>
Content-Type: application/json
{
  "user_uuid": "<user_id>"
}
```

## 🔧 Service Layer

### JobApplicationService

```typescript
// src/services/jobApplications.ts
import { supabase } from "@/integrations/supabase/client";
import type { JobApplication, CreateJobApplication, UpdateJobApplication } from "@/integrations/supabase/types";

export class JobApplicationService {
  /**
   * Get all job applications for the authenticated user
   */
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

  /**
   * Get applications with filtering
   */
  static async getFiltered(
    userId: string,
    filters: {
      status?: string;
      dateRange?: { start: string; end: string };
      location?: string;
      resumeId?: string;
    }
  ): Promise<JobApplication[]> {
    let query = supabase
      .from('job_applications')
      .select(`
        *,
        resumes (
          id,
          title,
          file_name
        )
      `)
      .eq('user_id', userId);

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.dateRange) {
      query = query
        .gte('applied_date', filters.dateRange.start)
        .lte('applied_date', filters.dateRange.end);
    }

    if (filters.location && filters.location !== 'all') {
      if (filters.location === 'remote') {
        query = query.ilike('location', '%remote%');
      } else {
        query = query.eq('location', filters.location);
      }
    }

    if (filters.resumeId && filters.resumeId !== 'all') {
      if (filters.resumeId === 'none') {
        query = query.is('resume_id', null);
      } else {
        query = query.eq('resume_id', filters.resumeId);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create new job application
   */
  static async create(application: CreateJobApplication): Promise<JobApplication> {
    const { data, error } = await supabase
      .from('job_applications')
      .insert(application)
      .select(`
        *,
        resumes (
          id,
          title,
          file_name
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update existing job application
   */
  static async update(id: string, updates: UpdateJobApplication): Promise<JobApplication> {
    const { data, error } = await supabase
      .from('job_applications')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        resumes (
          id,
          title,
          file_name
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete job application
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get application statistics
   */
  static async getStats(userId: string): Promise<{
    total: number;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
    responseRate: number;
  }> {
    const { data, error } = await supabase
      .from('job_applications')
      .select('status')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = data.reduce(
      (acc, app) => {
        acc.total++;
        const status = app.status?.toLowerCase();
        if (status === 'applied') acc.applied++;
        else if (status === 'interview') acc.interview++;
        else if (status === 'offer') acc.offer++;
        else if (status === 'rejected') acc.rejected++;
        return acc;
      },
      { total: 0, applied: 0, interview: 0, offer: 0, rejected: 0 }
    );

    const responseRate = stats.total > 0 
      ? ((stats.interview + stats.offer + stats.rejected) / stats.total) * 100 
      : 0;

    return { ...stats, responseRate };
  }

  /**
   * Get applications by date range for charts
   */
  static async getByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ date: string; count: number }[]> {
    const { data, error } = await supabase
      .from('job_applications')
      .select('applied_date')
      .eq('user_id', userId)
      .gte('applied_date', startDate)
      .lte('applied_date', endDate)
      .not('applied_date', 'is', null);

    if (error) throw error;

    // Group by date
    const dateGroups = data.reduce((acc, app) => {
      const date = app.applied_date!;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dateGroups).map(([date, count]) => ({
      date,
      count
    }));
  }
}
```

### ResumeService

```typescript
// src/services/resumeService.ts
export class ResumeService {
  /**
   * Upload resume file to storage
   */
  static async uploadFile(
    userId: string,
    file: File,
    title: string
  ): Promise<{ path: string; url: string }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/resumes/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: data.publicUrl
    };
  }

  /**
   * Create resume record in database
   */
  static async create(resumeData: {
    user_id: string;
    title: string;
    file_name: string;
    file_path: string;
    file_size: number;
    is_default?: boolean;
  }): Promise<Resume> {
    const { data, error } = await supabase
      .from('resumes')
      .insert(resumeData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all resumes for user
   */
  static async getAll(userId: string): Promise<Resume[]> {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Update resume
   */
  static async update(id: string, updates: Partial<Resume>): Promise<Resume> {
    const { data, error } = await supabase
      .from('resumes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete resume and file
   */
  static async delete(id: string): Promise<void> {
    // First get the resume to find the file path
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([resume.file_path]);

    if (storageError) throw storageError;

    // Delete the database record
    const { error: dbError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;
  }

  /**
   * Set default resume
   */
  static async setDefault(userId: string, resumeId: string): Promise<void> {
    // First, unset all default flags for the user
    await supabase
      .from('resumes')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Then set the selected resume as default
    const { error } = await supabase
      .from('resumes')
      .update({ is_default: true })
      .eq('id', resumeId);

    if (error) throw error;
  }

  /**
   * Get download URL for resume
   */
  static async getDownloadUrl(filePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  }
}
```

## 📊 Analytics Queries

### Common Analytics Patterns

```sql
-- Application success rate by month
SELECT 
  DATE_TRUNC('month', applied_date) as month,
  COUNT(*) as total_applications,
  COUNT(CASE WHEN status IN ('interview', 'offer') THEN 1 END) as positive_responses,
  ROUND(
    COUNT(CASE WHEN status IN ('interview', 'offer') THEN 1 END)::numeric / 
    COUNT(*)::numeric * 100, 2
  ) as success_rate
FROM job_applications
WHERE user_id = $1
  AND applied_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', applied_date)
ORDER BY month;

-- Top performing companies (by response rate)
SELECT 
  company_name,
  COUNT(*) as applications,
  COUNT(CASE WHEN status IN ('interview', 'offer') THEN 1 END) as responses,
  ROUND(
    COUNT(CASE WHEN status IN ('interview', 'offer') THEN 1 END)::numeric / 
    COUNT(*)::numeric * 100, 2
  ) as response_rate
FROM job_applications
WHERE user_id = $1
GROUP BY company_name
HAVING COUNT(*) >= 2 -- Only companies with 2+ applications
ORDER BY response_rate DESC, applications DESC;

-- Application velocity (applications per week)
SELECT 
  DATE_TRUNC('week', applied_date) as week,
  COUNT(*) as applications
FROM job_applications
WHERE user_id = $1
  AND applied_date >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', applied_date)
ORDER BY week;

-- Average response time
SELECT 
  AVG(response_date - applied_date) as avg_response_time,
  MIN(response_date - applied_date) as fastest_response,
  MAX(response_date - applied_date) as slowest_response
FROM job_applications
WHERE user_id = $1
  AND response_date IS NOT NULL
  AND applied_date IS NOT NULL;
```

## 🔐 Security Considerations

### Row Level Security Examples

```sql
-- Comprehensive RLS for job_applications
CREATE POLICY "job_applications_policy" ON job_applications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Storage security for resume files
CREATE POLICY "resume_upload_policy" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "resume_download_policy" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### API Security Headers

```typescript
// Example secure API call
const makeSecureRequest = async (endpoint: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Authentication required');
  }

  return fetch(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers,
    },
  });
};
```

## 📈 Performance Optimization

### Database Optimization

```sql
-- Optimize common queries with indexes
CREATE INDEX CONCURRENTLY job_applications_user_status_date_idx 
ON job_applications(user_id, status, applied_date DESC);

CREATE INDEX CONCURRENTLY job_applications_search_idx 
ON job_applications USING gin(
  to_tsvector('english', company_name || ' ' || role || ' ' || COALESCE(location, ''))
);

-- Partitioning for large datasets (if needed)
CREATE TABLE job_applications_partitioned (
  LIKE job_applications INCLUDING ALL
) PARTITION BY RANGE (applied_date);

CREATE TABLE job_applications_2024 PARTITION OF job_applications_partitioned
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Query Optimization

```typescript
// Efficient pagination
const getApplicationsPaginated = async (
  userId: string, 
  page: number = 1, 
  limit: number = 20
) => {
  const offset = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from('job_applications')
    .select(`
      *,
      resumes!inner(title)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit)
    }
  };
};
```

---

This API reference provides comprehensive documentation for working with EzJob's database and services, enabling efficient development and maintenance of the application.

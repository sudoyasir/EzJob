# Getting Started with EzJob

This guide will help you set up EzJob for local development or deployment.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

- **Node.js 16+** (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- **npm** (comes with Node.js)
- **Supabase Account** - [Create one here](https://supabase.com)
- **Git** (for cloning the repository)

### 1. Clone the Repository

```bash
git clone https://github.com/sudoyasir/EzJob.git
cd EzJob
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create your environment file:

```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Navigate to **Settings** → **API**
4. Copy the **Project URL** and **anon/public key**

### 4. Database Setup

#### Option A: Using Supabase CLI (Recommended)

If you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed:

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

#### Option B: Manual Setup

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the migration files in order:
   - `supabase/migrations/001_create_job_applications.sql`
   - `supabase/migrations/002_create_storage_and_profiles.sql`
   - `supabase/migrations/003_add_documents_to_applications.sql`
   - Continue with remaining migrations...

### 5. Authentication Setup

Configure authentication providers in your Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. Enable desired providers:
   - **Email** (enabled by default)
   - **Google OAuth** (optional)
   - **GitHub OAuth** (optional)

For OAuth providers, you'll need to:
- Create OAuth apps with Google/GitHub
- Add redirect URLs: `https://your-project.supabase.co/auth/v1/callback`
- Configure client IDs and secrets in Supabase

### 6. Email Templates (Optional)

For professional branded emails, set up custom templates:

1. Go to **Authentication** → **Email Templates**
2. Follow the [Email Templates Guide](Email-Templates.md)
3. Copy HTML from `/email-templates/` folder

### 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) to view the application.

## 🏗️ Project Structure Overview

```
EzJob/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── applications/    # Job application components
│   │   ├── auth/           # Authentication components
│   │   ├── charts/         # Analytics charts
│   │   ├── landing/        # Landing page
│   │   ├── resumes/        # Resume management
│   │   └── ui/             # Base UI components (shadcn/ui)
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Main application pages
│   ├── services/           # API service layers
│   └── integrations/       # External service integrations
├── supabase/               # Database migrations
├── email-templates/        # Custom email templates
├── public/                 # Static assets
└── docs/                   # Additional documentation
```

## 🧪 Testing Your Setup

### 1. Authentication Test

1. Navigate to the login page
2. Try creating a new account
3. Check your email for confirmation
4. Verify you can sign in successfully

### 2. Database Test

1. Sign in to your account
2. Try adding a job application
3. Verify it appears in your dashboard
4. Test editing and deleting applications

### 3. Feature Test

- **Resume Upload**: Try uploading a PDF resume
- **Analytics**: Add several applications to see chart data
- **Filtering**: Use the application filters
- **Theme Toggle**: Switch between light/dark modes

## 📱 Mobile Testing

Test the responsive design:

1. Open browser developer tools
2. Toggle device simulation
3. Test various screen sizes
4. Verify touch interactions work correctly

## 🚀 Deployment Options

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Vercel

1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect Vite configuration
3. Add environment variables in Vercel dashboard

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy the 'dist' folder to your hosting provider
```

## 🔧 Common Setup Issues

### Supabase Connection Errors

**Problem**: Can't connect to Supabase
**Solution**:
- Verify your `.env` file has correct credentials
- Check that your Supabase project is active
- Ensure no typos in environment variable names

### Database Migration Issues

**Problem**: Tables not created
**Solution**:
- Run migrations manually in Supabase SQL editor
- Check for syntax errors in migration files
- Verify you have proper permissions

### OAuth Provider Issues

**Problem**: OAuth login not working
**Solution**:
- Verify redirect URLs are correctly configured
- Check client ID/secret in Supabase settings
- Ensure OAuth apps are approved and active

### Build Errors

**Problem**: Build fails with TypeScript errors
**Solution**:
- Run `npm run lint` to identify issues
- Check for missing dependencies: `npm install`
- Verify all imports are correct

## 📚 Next Steps

Once your setup is complete:

1. **[User Guide](User-Guide.md)** - Learn all features
2. **[Architecture](Architecture.md)** - Understand the codebase
3. **[Contributing](Contributing.md)** - Start contributing
4. **[Deployment](Deployment.md)** - Deploy to production

## 💡 Pro Tips

- **Environment Variables**: Never commit `.env` files to git
- **Database Backups**: Regularly backup your Supabase database
- **Testing**: Test authentication flows in incognito mode
- **Performance**: Use browser dev tools to monitor performance
- **Security**: Keep dependencies updated with `npm audit`

---

**Need help?** Check our [Troubleshooting Guide](Troubleshooting.md) or [open an issue](https://github.com/sudoyasir/EzJob/issues).

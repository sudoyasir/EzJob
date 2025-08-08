# EzJob - Job Application Tracker

> **Less mess, more success** - Streamline your job search with intelligent tracking and analytics

<div align="center">

![EzJob Banner](https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop&crop=center)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

## 🚀 Overview

EzJob is a modern, full-stack job application tracking platform designed to help job seekers organize their applications, track progress, and gain insights into their job search performance. Built with React, TypeScript, and Supabase, it offers a clean, intuitive interface with powerful analytics.

### ✨ Key Features

- **📊 Application Management** - Track job applications with detailed information (company, role, status, notes)
- **📈 Analytics Dashboard** - Visual insights into application success rates, response times, and trends
- **🔥 Streak Tracking** - Gamified daily application streaks to maintain momentum
- **🎯 Smart Status Updates** - Track applications through Applied → Interview → Offer pipeline
- **🌓 Dark/Light Mode** - Beautiful theming that adapts to user preferences
- **🔐 Secure Authentication** - Multiple sign-in options (Google, GitHub, Email)
- **📱 Responsive Design** - Seamless experience across desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development experience
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible component library
- **Recharts** - Powerful charting library for analytics
- **React Router** - Client-side routing and navigation
- **React Query** - Server state management and caching

### Backend & Database
- **Supabase** - Open-source Firebase alternative
  - PostgreSQL database with real-time capabilities
  - Row Level Security (RLS) for data protection
  - Built-in authentication with OAuth providers
  - RESTful API with automatic OpenAPI documentation

### Development Tools
- **ESLint** - Code linting and style enforcement
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - Automatic CSS vendor prefixing

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── applications/     # Job application related components
│   ├── auth/            # Authentication components
│   ├── charts/          # Analytics and chart components
│   ├── landing/         # Landing page components
│   ├── skeletons/       # Loading skeleton components
│   └── ui/              # shadcn/ui component library
├── contexts/            # React context providers
│   ├── AuthContext.tsx  # Authentication state management
│   └── ThemeContext.tsx # Theme/dark mode management
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and types
├── lib/                 # Utility libraries
├── pages/               # Application pages/routes
├── routes/              # Route configurations
└── services/            # API service layers

supabase/
├── config.toml          # Supabase project configuration
└── migrations/          # Database migration files
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** 16+ and npm (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- **Supabase Account** - [Create one here](https://supabase.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd EzJob
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   ```

4. **Configure Supabase**
   
   Get your credentials from [Supabase Dashboard](https://supabase.com/dashboard):
   - Create a new project or select existing one
   - Go to Settings → API
   - Copy Project URL and anon/public key
   
   Update your `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Database Setup**
   
   Run the database migration to create required tables:
   ```bash
   # If you have Supabase CLI installed
   supabase db push
   
   # Or manually run the SQL from supabase/migrations/001_create_job_applications.sql
   # in your Supabase dashboard SQL editor
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:8080](http://localhost:8080) to view the application.

## 📊 Database Schema

### Job Applications Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Foreign key to auth.users |
| `company_name` | TEXT | Company name |
| `role` | TEXT | Job position/title |
| `location` | TEXT | Job location (optional) |
| `status` | ENUM | Application status (Applied/Interview/Offer/Rejected) |
| `applied_date` | DATE | Date application was submitted |
| `notes` | TEXT | Additional notes (optional) |
| `resume_url` | TEXT | Link to resume used (optional) |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Authentication Required** - All operations require valid user session
- **Automatic Timestamps** - Created/updated timestamps managed by database triggers

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production-ready application |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |

## 🎨 Design System

EzJob uses a modern design system built on:

- **Inter Font Family** - Clean, professional typography
- **CSS Custom Properties** - Consistent theming across light/dark modes
- **Tailwind CSS** - Utility-first styling approach
- **shadcn/ui Components** - Accessible, customizable UI primitives
- **Responsive Design** - Mobile-first approach with fluid layouts

### Color Palette

- **Primary**: Deep blue/purple for key actions and branding
- **Secondary**: Light blue for secondary elements
- **Accent**: Gradient combinations for call-to-action elements
- **Semantic Colors**: Status-specific colors for applications (blue=applied, green=interview/offer, red=rejected)

## 🔐 Authentication

EzJob supports multiple authentication methods:

- **Email/Password** - Traditional account creation
- **Google OAuth** - Sign in with Google account
- **GitHub OAuth** - Sign in with GitHub account

All authentication is handled securely by Supabase with:
- Email verification for new accounts
- Password reset functionality
- Session management with automatic refresh
- Secure redirect handling

## 📈 Analytics Features

The analytics dashboard provides insights into:

- **Application Metrics**: Total applications, interviews secured, offers received
- **Success Rates**: Interview conversion rate, offer acceptance rate
- **Response Patterns**: Average response times, peak application periods
- **Visual Charts**: Interactive charts showing trends over time
- **Status Distribution**: Breakdown of applications by current status

## 🛡️ Security Considerations

- **Environment Variables**: Sensitive credentials stored in `.env` (excluded from version control)
- **Row Level Security**: Database-level access control
- **Input Validation**: Client and server-side validation
- **HTTPS Only**: All production traffic encrypted
- **CORS Configuration**: Restricted cross-origin requests

## 🚢 Deployment

### Quick Deploy Options

1. **Vercel** (Recommended)
   ```bash
   npm run build
   # Deploy to Vercel via GitHub integration
   ```

2. **Netlify**
   ```bash
   npm run build
   # Deploy dist/ folder to Netlify
   ```

3. **Supabase Hosting**
   ```bash
   # Use Supabase's built-in hosting features
   ```

### Environment Variables for Production

Ensure these are set in your production environment:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_key
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Add tests for new features
- Ensure responsive design works on all devices
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & FAQ

### Common Issues

**Q: I'm getting Supabase connection errors**
A: Ensure your `.env` file has the correct Supabase URL and anon key, and that your Supabase project is active.

**Q: Database migrations aren't working**
A: Check that you have the Supabase CLI installed and are logged in, or manually run the SQL from the migrations folder.

**Q: Authentication redirects aren't working**
A: Verify your Supabase authentication settings include the correct redirect URLs for your domain.

### Getting Help

- 📧 [Create an Issue](https://github.com/sudoyasir/EzJob/issues)
- 💬 [Discussions](https://github.com/sudoyasir/EzJob/discussions)
- 📖 [Supabase Documentation](https://supabase.com/docs)

---

<div align="center">

**Built with ❤️ by Yasir**

[Demo](https://your-demo-link.com) • [Documentation](https://github.com/sudoyasir/EzJob/wiki) • [Report Bug](https://github.com/sudoyasir/EzJob/issues)

</div>

# Development Setup

This guide provides detailed instructions for setting up a complete development environment for EzJob.

## 🔧 Prerequisites

### Required Software

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Node.js** | 16+ | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| **npm** | 8+ | Package manager | Included with Node.js |
| **Git** | 2.0+ | Version control | [git-scm.com](https://git-scm.com/) |
| **VSCode** | Latest | Code editor (recommended) | [code.visualstudio.com](https://code.visualstudio.com/) |

### Optional Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| **Supabase CLI** | Database management | [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli) |
| **Docker** | Local Supabase instance | [docker.com](https://docker.com/) |
| **PostgreSQL** | Database client | [postgresql.org](https://postgresql.org/) |

## 🚀 Environment Setup

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/sudoyasir/EzJob.git
cd EzJob

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Node.js Version Management

For consistent Node.js versions across team members:

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Using fnm (alternative)
curl -fsSL https://fnm.vercel.app/install | bash
fnm install 18
fnm use 18
```

### 3. IDE Configuration

#### VSCode Extensions

Install these recommended extensions:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-typescript.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-typescript-next",
    "supabase.supabase"
  ]
}
```

#### VSCode Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 🗄️ Database Setup

### Option A: Cloud Supabase (Recommended)

1. **Create Supabase Project**
   ```bash
   # Visit https://supabase.com/dashboard
   # Click "New Project"
   # Note your project URL and anon key
   ```

2. **Configure Environment**
   ```bash
   # Update .env file
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run Migrations**
   ```bash
   # Option 1: Using Supabase CLI
   supabase link --project-ref your-project-ref
   supabase db push

   # Option 2: Manual SQL execution
   # Run each file in supabase/migrations/ in order
   ```

### Option B: Local Supabase

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Start Local Instance**
   ```bash
   supabase start
   ```

3. **Configure Environment**
   ```bash
   # Update .env for local development
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=your-local-anon-key
   ```

### Database Schema Verification

Verify your setup by checking tables exist:

```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- job_applications
-- profiles  
-- resumes
-- user_streaks
-- streak_milestones
```

## 🔐 Authentication Setup

### Email Authentication

Email authentication works out-of-the-box with Supabase.

### OAuth Provider Setup

#### Google OAuth

1. **Create Google OAuth App**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials

2. **Configure Redirect URLs**
   ```
   https://your-project.supabase.co/auth/v1/callback
   http://localhost:54321/auth/v1/callback (for local development)
   ```

3. **Add to Supabase**
   - Go to Authentication → Providers
   - Enable Google provider
   - Add Client ID and Client Secret

#### GitHub OAuth

1. **Create GitHub OAuth App**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Fill in application details

2. **Configure Redirect URLs**
   ```
   https://your-project.supabase.co/auth/v1/callback
   http://localhost:54321/auth/v1/callback (for local development)
   ```

3. **Add to Supabase**
   - Go to Authentication → Providers
   - Enable GitHub provider
   - Add Client ID and Client Secret

## 🎨 Email Template Setup

### Custom Email Templates

1. **Access Supabase Dashboard**
   - Go to Authentication → Email Templates

2. **Configure Templates**
   ```bash
   # Copy templates from email-templates/ folder
   # Follow instructions in email-templates/README.md
   ```

3. **Test Email Flow**
   ```bash
   # Create test account to verify emails
   npm run dev
   # Navigate to signup page
   # Create account with your email
   # Check email for proper branding
   ```

## 📦 Development Scripts

### Available Commands

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Development build (with source maps)
npm run build:dev

# Preview production build locally
npm run preview

# Lint code for errors
npm run lint

# Type checking
npx tsc --noEmit
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

## 🧪 Testing Setup

### Unit Testing

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### E2E Testing

```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npx playwright test

# Run tests in headed mode
npx playwright test --headed

# Generate test report
npx playwright show-report
```

## 🔧 Development Tools

### TypeScript Configuration

EzJob uses strict TypeScript settings for maximum type safety:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### ESLint Configuration

```javascript
// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

## 🎯 Development Workflow

### Git Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   ```bash
   # Edit files
   # Run tests
   npm run lint
   npm run type-check
   ```

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

### Commit Message Convention

```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding tests
- chore: Build process or auxiliary tool changes

Examples:
feat(auth): add Google OAuth integration
fix(dashboard): resolve application filtering issue
docs(readme): update installation instructions
```

## 🚀 Local Development

### Starting Development Server

```bash
# Terminal 1: Start main application
npm run dev

# Terminal 2: Watch for TypeScript errors
npx tsc --noEmit --watch

# Terminal 3: Run tests in watch mode (optional)
npm run test:watch
```

### Environment Variables

Create `.env.local` for local overrides:

```bash
# .env.local (git-ignored)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-key
VITE_DEBUG=true
```

### Hot Module Replacement

Vite provides instant feedback for most changes:

- **React Components**: Instant updates with state preservation
- **CSS Changes**: Live style updates
- **TypeScript**: Fast compilation and error reporting
- **Environment Variables**: Require server restart

## 🔍 Debugging

### Browser DevTools

1. **React Developer Tools**
   - Install React DevTools extension
   - Inspect component tree and state
   - Profile component performance

2. **Redux DevTools** (for complex state)
   - Monitor React Query cache
   - Inspect context state changes

### VSCode Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:8080",
      "webRoot": "${workspaceFolder}/src",
      "breakOnLoad": true,
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ]
}
```

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run type-check
```

#### Supabase Connection Issues
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
curl $VITE_SUPABASE_URL/rest/v1/
```

## 📚 Learning Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

### EzJob-Specific
- [Architecture Guide](Architecture.md)
- [Component Library](Components.md)
- [API Reference](API-Reference.md)
- [User Guide](User-Guide.md)

## 🆘 Getting Help

### Common Solutions
1. **Clear node_modules**: `rm -rf node_modules && npm install`
2. **Restart dev server**: `Ctrl+C` then `npm run dev`
3. **Check environment**: Verify `.env` file exists and has correct values
4. **Update dependencies**: `npm update`

### Support Channels
- **GitHub Issues**: Technical problems and bugs
- **GitHub Discussions**: Questions and community help
- **Documentation**: Check this wiki first

---

**Ready to start developing?** Run `npm run dev` and begin building amazing features for EzJob!

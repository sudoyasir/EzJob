# Components Library

EzJob's component library is built on top of [shadcn/ui](https://ui.shadcn.com/) with custom extensions and domain-specific components for job application tracking.

## 🏗️ Component Architecture

### Component Hierarchy

```
Components
├── UI Components (shadcn/ui)
│   ├── Base Components (Button, Input, Card, etc.)
│   ├── Layout Components (Dialog, Popover, Sheet, etc.)
│   └── Form Components (Form, Label, Select, etc.)
├── Application Components
│   ├── ApplicationCard
│   ├── ApplicationFilters
│   ├── JobApplicationForm
│   └── JobApplicationView
├── Feature Components
│   ├── Authentication (Login, ProtectedRoute)
│   ├── Charts (DashboardCharts)
│   ├── Resumes (ResumeManager, ResumeSelector)
│   └── Landing (LandingPage)
└── Layout Components
    ├── Navigation
    ├── Sidebar
    └── Header
```

### Design System

| Category | Purpose | Examples |
|----------|---------|----------|
| **Primitives** | Basic building blocks | Button, Input, Card, Badge |
| **Patterns** | Common UI patterns | Dialog, Popover, Dropdown, Tabs |
| **Compositions** | Feature-specific components | ApplicationCard, DashboardCharts |
| **Layouts** | Page structure | Navigation, Sidebar, Main content |

## 🎨 UI Components (shadcn/ui)

### Base Components

#### Button Component

```typescript
// src/components/ui/button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'hero';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

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

// Usage Examples
<Button variant="default">Primary Action</Button>
<Button variant="outline" size="sm">Secondary</Button>
<Button variant="hero" size="lg">Call to Action</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
```

#### Input Component

```typescript
// src/components/ui/input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

// Usage Examples
<Input type="email" placeholder="Enter email" />
<Input type="password" placeholder="Password" />
<Input type="search" placeholder="Search applications..." />
```

#### Card Component

```typescript
// src/components/ui/card.tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
)

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)

// Usage Example
<Card>
  <CardHeader>
    <CardTitle>Application Status</CardTitle>
    <CardDescription>Track your job applications</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
</Card>
```

### Form Components

#### Select Component

```typescript
// src/components/ui/select.tsx
// Built on Radix UI Select primitive
const Select = SelectPrimitive.Root
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))

// Usage Example
<Select value={status} onValueChange={setStatus}>
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="applied">Applied</SelectItem>
    <SelectItem value="interview">Interview</SelectItem>
    <SelectItem value="offer">Offer</SelectItem>
    <SelectItem value="rejected">Rejected</SelectItem>
  </SelectContent>
</Select>
```

## 📋 Application Components

### ApplicationCard Component

```typescript
// src/components/applications/ApplicationCard.tsx
interface ApplicationCardProps {
  application: JobApplication & {
    resumes?: { title: string } | null;
  };
  onEdit?: (application: JobApplication) => void;
  onDelete?: (id: string) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onEdit,
  onDelete
}) => {
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'interview':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'offer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {/* Company Logo */}
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {application.company_name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* Application Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground truncate">
                {application.role}
              </h3>
              <p className="text-muted-foreground truncate">
                {application.company_name}
                {application.location && ` • ${application.location}`}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Applied: {formatDate(application.applied_date)}</span>
                {application.resumes?.title && (
                  <span>Resume: {application.resumes.title}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Status and Actions */}
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(application.status)}>
              {application.status || 'Unknown'}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(application)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(application.id)}
                  className="text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Notes Preview */}
        {application.notes && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {application.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

### ApplicationFilters Component

```typescript
// src/components/applications/ApplicationFilters.tsx
interface FilterState {
  status: string;
  dateRange: string;
  location: string;
  resume: string;
  sortBy: string;
}

interface ApplicationFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resumes: Resume[];
  applications: JobApplication[];
}

export const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
  filters,
  onFiltersChange,
  resumes,
  applications
}) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      dateRange: 'all',
      location: 'all',
      resume: 'all',
      sortBy: 'newest'
    });
  };

  const getUniqueLocations = () => {
    const locations = applications
      .map(app => app.location)
      .filter(Boolean)
      .filter((location, index, self) => self.indexOf(location) === index);
    return ['Remote', ...locations.filter(loc => loc !== 'Remote')];
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="outline" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div>
          <Label htmlFor="status-filter">Status</Label>
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div>
          <Label htmlFor="date-filter">Date Range</Label>
          <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div>
          <Label htmlFor="location-filter">Location</Label>
          <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {getUniqueLocations().map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resume Filter */}
        <div>
          <Label htmlFor="resume-filter">Resume</Label>
          <Select value={filters.resume} onValueChange={(value) => updateFilter('resume', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Resumes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resumes</SelectItem>
              <SelectItem value="none">No Resume</SelectItem>
              {resumes.map(resume => (
                <SelectItem key={resume.id} value={resume.id}>
                  {resume.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div>
          <Label htmlFor="sort-filter">Sort By</Label>
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Newest First" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="company">Company A-Z</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
```

### JobApplicationForm Component

```typescript
// src/components/applications/JobApplicationForm.tsx
interface JobApplicationFormProps {
  initialData?: JobApplication;
  onSubmit: (data: CreateJobApplication) => Promise<void>;
  onCancel: () => void;
  resumes: Resume[];
}

export const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  resumes
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: initialData?.company_name || '',
    role: initialData?.role || '',
    location: initialData?.location || '',
    status: initialData?.status || 'applied',
    applied_date: initialData?.applied_date || new Date().toISOString().split('T')[0],
    response_date: initialData?.response_date || '',
    resume_id: initialData?.resume_id || '',
    notes: initialData?.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        applied_date: formData.applied_date || null,
        response_date: formData.response_date || null,
        resume_id: formData.resume_id || null,
        location: formData.location || null,
        notes: formData.notes || null
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Name */}
        <div>
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => updateField('company_name', e.target.value)}
            placeholder="e.g., Google, Microsoft"
            required
          />
        </div>

        {/* Job Role */}
        <div>
          <Label htmlFor="role">Job Role *</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => updateField('role', e.target.value)}
            placeholder="e.g., Software Engineer, Product Manager"
            required
          />
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="e.g., San Francisco, Remote"
          />
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applied Date */}
        <div>
          <Label htmlFor="applied_date">Applied Date</Label>
          <Input
            id="applied_date"
            type="date"
            value={formData.applied_date}
            onChange={(e) => updateField('applied_date', e.target.value)}
          />
        </div>

        {/* Response Date */}
        <div>
          <Label htmlFor="response_date">Response Date</Label>
          <Input
            id="response_date"
            type="date"
            value={formData.response_date}
            onChange={(e) => updateField('response_date', e.target.value)}
          />
        </div>
      </div>

      {/* Resume Selection */}
      <div>
        <Label htmlFor="resume_id">Resume Used</Label>
        <Select value={formData.resume_id} onValueChange={(value) => updateField('resume_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select resume (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No resume selected</SelectItem>
            {resumes.map(resume => (
              <SelectItem key={resume.id} value={resume.id}>
                {resume.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Add any additional notes, interview details, or follow-up information..."
          rows={4}
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center space-x-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData ? 'Update Application' : 'Add Application'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
```

## 📊 Chart Components

### DashboardCharts Component

```typescript
// src/components/charts/DashboardCharts.tsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface ChartData {
  applications: JobApplication[];
}

export const DashboardCharts: React.FC<ChartData> = ({ applications }) => {
  const getApplicationsOverTime = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      applications: applications.filter(app => app.applied_date === date).length
    }));
  };

  const getStatusDistribution = () => {
    const statusCounts = applications.reduce((acc, app) => {
      const status = app.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: getStatusColor(status)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return '#3b82f6';
      case 'interview': return '#f59e0b';
      case 'offer': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Applications Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Applications Over Time</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getApplicationsOverTime()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="applications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>Current application statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getStatusDistribution()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getStatusDistribution().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
```

## 📄 Resume Components

### ResumeSelector Component

```typescript
// src/components/resumes/ResumeSelector.tsx
interface ResumeSelectorProps {
  resumes: Resume[];
  selectedResumeId: string | null;
  onResumeSelect: (resumeId: string | null) => void;
  showUpload?: boolean;
  onUpload?: () => void;
}

export const ResumeSelector: React.FC<ResumeSelectorProps> = ({
  resumes,
  selectedResumeId,
  onResumeSelect,
  showUpload = false,
  onUpload
}) => {
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Select Resume</Label>
        {showUpload && (
          <Button variant="outline" size="sm" onClick={onUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Upload New
          </Button>
        )}
      </div>

      <Select 
        value={selectedResumeId || ''} 
        onValueChange={(value) => onResumeSelect(value || null)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choose a resume (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">No resume selected</SelectItem>
          {resumes.map((resume) => (
            <SelectItem key={resume.id} value={resume.id}>
              <div className="flex items-center justify-between w-full">
                <span>{resume.title}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatFileSize(resume.file_size)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedResumeId && (
        <div className="p-3 bg-muted/50 rounded-md">
          {(() => {
            const selectedResume = resumes.find(r => r.id === selectedResumeId);
            return selectedResume ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedResume.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedResume.file_name} • {formatFileSize(selectedResume.file_size)}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`/api/resumes/${selectedResume.id}/download`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};
```

## 🎭 Loading States

### Skeleton Components

```typescript
// src/components/skeletons/ApplicationCardSkeleton.tsx
export const ApplicationCardSkeleton: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex space-x-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Usage in lists
const ApplicationsList = ({ loading, applications }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <ApplicationCardSkeleton key={i} />
        ))}
      </div>
    );
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

## 🎨 Theme System

### Theme Provider

```typescript
// src/components/theme-provider.tsx
type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ezjob-ui-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
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

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// Theme Toggle Component
export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## 📱 Responsive Design

### Mobile-First Approach

```typescript
// Example responsive component
const ResponsiveCard = ({ children, ...props }) => {
  return (
    <Card 
      className={cn(
        // Mobile (default)
        "p-4",
        // Tablet
        "sm:p-6",
        // Desktop
        "lg:p-8",
        // Large desktop
        "xl:p-10"
      )}
      {...props}
    >
      {children}
    </Card>
  );
};

// Mobile navigation
const MobileNav = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="flex flex-col space-y-4">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/resumes">Resumes</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
```

## 🧪 Component Testing

### Testing Patterns

```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import { ApplicationCard } from '../ApplicationCard';

const mockApplication = {
  id: '1',
  company_name: 'Test Company',
  role: 'Software Engineer',
  status: 'applied',
  applied_date: '2024-01-01',
  user_id: 'user-1',
  // ... other fields
};

describe('ApplicationCard', () => {
  test('renders application information', () => {
    render(<ApplicationCard application={mockApplication} />);
    
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<ApplicationCard application={mockApplication} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByTestId('edit-button'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockApplication);
  });
});
```

---

This component library provides a robust foundation for building consistent, accessible, and maintainable UI components across the EzJob application.

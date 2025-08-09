import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  MapPin, 
  FileText, 
  RotateCcw,
  SortAsc,
  SortDesc,
  ArrowUpDown
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { JobApplication } from "@/services/jobApplications";

export interface FilterOptions {
  status: string[];
  dateRange: {
    appliedFrom?: Date;
    appliedTo?: Date;
    responseFrom?: Date;
    responseTo?: Date;
  };
  location: string;
  resumeId: string;
  sortBy: 'applied_date' | 'company_name' | 'status' | 'response_date' | 'created_at';
  sortOrder: 'asc' | 'desc';
  showResponseOnly: boolean;
}

interface ApplicationFiltersProps {
  applications: JobApplication[];
  onFiltersChange: (filteredApplications: JobApplication[], activeFilters: FilterOptions) => void;
  resumeOptions: Array<{ id: string; title: string; is_default: boolean }>;
  className?: string;
}

const defaultFilters: FilterOptions = {
  status: [],
  dateRange: {},
  location: 'all-locations',
  resumeId: 'all-resumes',
  sortBy: 'created_at',
  sortOrder: 'desc',
  showResponseOnly: false,
};

const statusOptions = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'interview', label: 'Interview', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { value: 'offer', label: 'Offer', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
];

const sortOptions = [
  { value: 'created_at', label: 'Date Added' },
  { value: 'applied_date', label: 'Application Date' },
  { value: 'company_name', label: 'Company Name' },
  { value: 'status', label: 'Status' },
  { value: 'response_date', label: 'Response Date' },
];

export const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
  applications,
  onFiltersChange,
  resumeOptions,
  className
}) => {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [isOpen, setIsOpen] = useState(false);

  // Get unique locations from applications for filter options
  const locationOptions = Array.from(
    new Set(applications.filter(app => app.location).map(app => app.location!))
  ).sort();

  // Apply filters and sorting whenever filters or applications change
  useEffect(() => {
    let filtered = [...applications];

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(app => 
        filters.status.includes(app.status || 'applied')
      );
    }

    // Location filter
    if (filters.location && filters.location !== 'all-locations') {
      filtered = filtered.filter(app => 
        app.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Resume filter
    if (filters.resumeId && filters.resumeId !== 'all-resumes') {
      filtered = filtered.filter(app => app.resume_id === filters.resumeId);
    }

    // Date range filters
    if (filters.dateRange.appliedFrom || filters.dateRange.appliedTo) {
      filtered = filtered.filter(app => {
        if (!app.applied_date) return false;
        const appliedDate = new Date(app.applied_date);
        
        if (filters.dateRange.appliedFrom && appliedDate < filters.dateRange.appliedFrom) {
          return false;
        }
        if (filters.dateRange.appliedTo && appliedDate > filters.dateRange.appliedTo) {
          return false;
        }
        return true;
      });
    }

    if (filters.dateRange.responseFrom || filters.dateRange.responseTo) {
      filtered = filtered.filter(app => {
        if (!app.response_date) return false;
        const responseDate = new Date(app.response_date);
        
        if (filters.dateRange.responseFrom && responseDate < filters.dateRange.responseFrom) {
          return false;
        }
        if (filters.dateRange.responseTo && responseDate > filters.dateRange.responseTo) {
          return false;
        }
        return true;
      });
    }

    // Show only applications with responses
    if (filters.showResponseOnly) {
      filtered = filtered.filter(app => app.response_date);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'company_name':
          aValue = a.company_name?.toLowerCase() || '';
          bValue = b.company_name?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status || 'applied';
          bValue = b.status || 'applied';
          break;
        case 'applied_date':
          aValue = a.applied_date ? new Date(a.applied_date).getTime() : 0;
          bValue = b.applied_date ? new Date(b.applied_date).getTime() : 0;
          break;
        case 'response_date':
          aValue = a.response_date ? new Date(a.response_date).getTime() : 0;
          bValue = b.response_date ? new Date(b.response_date).getTime() : 0;
          break;
        default:
          aValue = a.created_at ? new Date(a.created_at).getTime() : 0;
          bValue = b.created_at ? new Date(b.created_at).getTime() : 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    onFiltersChange(filtered, filters);
  }, [filters, applications, onFiltersChange]);

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilters({ status: newStatus });
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.location && filters.location !== 'all-locations') count++;
    if (filters.resumeId && filters.resumeId !== 'all-resumes') count++;
    if (filters.dateRange.appliedFrom || filters.dateRange.appliedTo) count++;
    if (filters.dateRange.responseFrom || filters.dateRange.responseTo) count++;
    if (filters.showResponseOnly) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3 sm:gap-4", className)}>
      {/* Sort Options - Always visible */}
      <div className="flex gap-2 items-center">
        <Select 
          value={filters.sortBy} 
          onValueChange={(value: any) => updateFilters({ sortBy: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateFilters({ 
            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
          })}
          className="px-2"
        >
          {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>
      </div>

      {/* Filter Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <Card className="border-0 shadow-lg">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filters</h4>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(status => (
                    <Badge
                      key={status.value}
                      variant={filters.status.includes(status.value) ? "default" : "secondary"}
                      className={cn(
                        "cursor-pointer transition-all hover:scale-105",
                        filters.status.includes(status.value) 
                          ? "bg-primary text-primary-foreground" 
                          : status.color
                      )}
                      onClick={() => toggleStatus(status.value)}
                    >
                      {status.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Location Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Location</Label>
                <Select value={filters.location} onValueChange={(value) => updateFilters({ location: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-locations">All locations</SelectItem>
                    {locationOptions.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Resume Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Resume Used</Label>
                <Select value={filters.resumeId} onValueChange={(value) => updateFilters({ resumeId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All resumes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-resumes">All resumes</SelectItem>
                    {resumeOptions.map(resume => (
                      <SelectItem key={resume.id} value={resume.id}>
                        <div className="flex items-center gap-2">
                          {resume.title}
                          {resume.is_default && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Date Range Filters */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Application Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.appliedFrom ? format(filters.dateRange.appliedFrom, "PPP") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.appliedFrom}
                        onSelect={(date) => updateFilters({ 
                          dateRange: { ...filters.dateRange, appliedFrom: date } 
                        })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.appliedTo ? format(filters.dateRange.appliedTo, "PPP") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.appliedTo}
                        onSelect={(date) => updateFilters({ 
                          dateRange: { ...filters.dateRange, appliedTo: date } 
                        })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Separator />

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Show only with responses</Label>
                  <Switch
                    checked={filters.showResponseOnly}
                    onCheckedChange={(checked) => updateFilters({ showResponseOnly: checked })}
                  />
                </div>
              </div>
            </div>
          </Card>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {filters.status.map(status => (
            <Badge key={status} variant="secondary" className="gap-1">
              {status}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleStatus(status)}
              />
            </Badge>
          ))}
          {filters.location && filters.location !== 'all-locations' && (
            <Badge variant="secondary" className="gap-1">
              <MapPin className="h-3 w-3" />
              {filters.location}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ location: 'all-locations' })}
              />
            </Badge>
          )}
          {filters.showResponseOnly && (
            <Badge variant="secondary" className="gap-1">
              Has Response
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ showResponseOnly: false })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

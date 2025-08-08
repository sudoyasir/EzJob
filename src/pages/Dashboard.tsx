import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Plus, Search, Filter, BarChart3, Settings, LogOut, User, Edit, Trash2, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { JobApplication, JobApplicationService } from "@/services/jobApplications";
import { JobApplicationForm } from "@/components/applications/JobApplicationForm";
import { JobApplicationView } from "@/components/applications/JobApplicationView";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ApplicationCardSkeleton } from "@/components/skeletons/ApplicationCardSkeleton";
import { StatsCardSkeleton } from "@/components/skeletons/StatsCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    interviews: 0,
    offers: 0,
    responseRate: 0,
  });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const loadApplications = async () => {
    try {
      setLoading(true);
      const [applicationsData, statsData] = await Promise.all([
        JobApplicationService.getApplications(),
        JobApplicationService.getApplicationStats(),
      ]);
      setApplications(applicationsData);
      setStats(statsData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      await JobApplicationService.deleteApplication(id);
      toast.success("Application deleted successfully");
      loadApplications();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete application");
    }
  };

  const filteredApplications = applications.filter(app =>
    app.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.location && app.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "Interview":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "Offer":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg"></div>
                <span className="text-2xl font-bold text-primary">
                  EzJob
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent hover:text-accent-foreground bg-accent/50">Dashboard</Button>
                <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔥</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Streak</span>
                    <span className="text-sm font-bold text-foreground">7 Days</span>
                  </div>
                </div>
              </div>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:outline-none hover:bg-accent [&:focus]:outline-none [&:focus-visible]:outline-none [&:focus]:ring-0 [&:focus-visible]:ring-0 outline-none border-none shadow-none"
                    style={{ boxShadow: 'none', outline: 'none' }}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={user?.user_metadata?.avatar_url} 
                        alt={user?.user_metadata?.full_name || user?.email || "User"} 
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.user_metadata?.full_name 
                          ? user.user_metadata.full_name.charAt(0).toUpperCase()
                          : user?.email?.charAt(0).toUpperCase() || "U"
                        }
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm text-popover-foreground">
                        {user?.user_metadata?.full_name || "User"}
                      </p>
                      <p className="w-[200px] truncate text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem asChild>
                    <button className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem asChild>
                    <button 
                      className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer text-destructive hover:text-destructive-foreground hover:bg-destructive focus:text-destructive-foreground focus:bg-destructive focus:outline-none transition-colors"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your Applications
            </h1>
            <p className="text-muted-foreground">
              Track and manage your job applications with powerful insights
            </p>
          </div>
          <JobApplicationForm 
            onSuccess={loadApplications}
            trigger={
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </Button>
            }
          />
        </div>

        {/* Stats Cards */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Quick Stats</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/analytics")}
              className="text-primary hover:bg-primary/10"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))
            ) : (
              <>
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Total Applications</div>
                    </div>
                    <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-full">
                      <BarChart3 className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.interviews}</div>
                      <div className="text-sm text-emerald-600 dark:text-emerald-400">Interviews</div>
                    </div>
                    <div className="p-3 bg-emerald-200 dark:bg-emerald-800 rounded-full">
                      <User className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.offers}</div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">Offers</div>
                    </div>
                    <div className="p-3 bg-purple-200 dark:bg-purple-800 rounded-full">
                      <TrendingUp className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.responseRate}%</div>
                      <div className="text-sm text-amber-600 dark:text-amber-400">Response Rate</div>
                    </div>
                    <div className="p-3 bg-amber-200 dark:bg-amber-800 rounded-full">
                      <BarChart3 className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            )}
          </div>
          {loading ? (
            <Skeleton className="h-10 w-24" />
          ) : (
            <Button variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          )}
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <ApplicationCardSkeleton key={i} />
            ))
          ) : (
            filteredApplications.map((app) => (
              <Card key={app.id} className="p-6 bg-card border-border hover:shadow-lg dark:hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-card-foreground">{app.role}</h3>
                        <p className="text-muted-foreground">{app.company_name}</p>
                        <p className="text-sm text-muted-foreground">{app.location}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Applied: {format(new Date(app.applied_date), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>
                    {app.notes && (
                      <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
                        {app.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-4 md:mt-0">
                    <JobApplicationForm
                      application={app}
                      onSuccess={loadApplications}
                      trigger={
                        <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      }
                    />
                    <JobApplicationView
                      application={app}
                      trigger={
                        <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                          View
                        </Button>
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-border text-destructive hover:bg-destructive hover:text-destructive-foreground">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Application</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the application for {app.role} at {app.company_name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteApplication(app.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Empty State */}
        {!loading && applications.length === 0 && (
          <Card className="p-12 text-center bg-card border-border">
            <div className="text-muted-foreground mb-4">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-card-foreground">No applications yet</h3>
              <p className="text-sm">Start by adding your first job application</p>
            </div>
            <JobApplicationForm 
              onSuccess={loadApplications}
              trigger={
                <Button className="mt-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Application
                </Button>
              }
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
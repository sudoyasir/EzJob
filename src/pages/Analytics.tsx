import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TrendingUp, Users, Target, Calendar, Settings, LogOut, User, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { JobApplication, JobApplicationService } from "@/services/jobApplications";
import { DashboardCharts } from "@/components/charts/DashboardCharts";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Analytics = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    interviews: 0,
    offers: 0,
    responseRate: 0,
  });
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const loadData = async () => {
    try {
      setLoading(true);
      const [applicationsData, statsData] = await Promise.all([
        JobApplicationService.getApplications(),
        JobApplicationService.getApplicationStats(),
      ]);
      setApplications(applicationsData);
      setStats(statsData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate additional metrics
  const conversionRate = stats.total > 0 ? ((stats.interviews / stats.total) * 100).toFixed(1) : 0;
  const offerRate = stats.interviews > 0 ? ((stats.offers / stats.interviews) * 100).toFixed(1) : 0;
  const averageTimeToInterview = applications.length > 0 ? "5.2 days" : "N/A"; // This could be calculated based on actual data

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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>
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
                    <button 
                      className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                      onClick={() => navigate('/settings/profile')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button 
                      className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                      onClick={() => navigate('/settings/account')}
                    >
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Analytics & Insights
          </h1>
          <p className="text-muted-foreground">
            Deep insights into your job application performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </Card>
            ))
          ) : (
            <>
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{conversionRate}%</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Interview Rate</div>
                  </div>
                  <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-full">
                    <TrendingUp className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{offerRate}%</div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">Offer Rate</div>
                  </div>
                  <div className="p-3 bg-emerald-200 dark:bg-emerald-800 rounded-full">
                    <Target className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.responseRate}%</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Response Rate</div>
                  </div>
                  <div className="p-3 bg-purple-200 dark:bg-purple-800 rounded-full">
                    <Users className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{averageTimeToInterview}</div>
                    <div className="text-sm text-amber-600 dark:text-amber-400">Avg. Response Time</div>
                  </div>
                  <div className="p-3 bg-amber-200 dark:bg-amber-800 rounded-full">
                    <Calendar className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Charts */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64 mb-4" />
              <Skeleton className="h-[300px] w-full" />
            </Card>
            <Card className="p-6">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64 mb-4" />
              <Skeleton className="h-[300px] w-full" />
            </Card>
          </div>
        ) : applications.length > 0 ? (
          <DashboardCharts applications={applications} />
        ) : (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-card-foreground">No Data Available</h3>
              <p className="text-sm">Add some job applications to see analytics</p>
            </div>
            <Button 
              onClick={() => navigate("/dashboard")}
              className="mt-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Go to Dashboard
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { TrendingUp, Users, Target, Calendar, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { JobApplication, JobApplicationService } from "@/services/jobApplications";
import { DashboardCharts } from "@/components/charts/DashboardCharts";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Analytics = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    interviews: 0,
    offers: 0,
    responseRate: 0,
    averageResponseTime: "No data",
  });
  const navigate = useNavigate();

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

  useEffect(() => {
    loadData();
  }, []);

  // Calculate additional metrics
  const conversionRate = stats.total > 0 ? ((stats.interviews / stats.total) * 100).toFixed(1) : 0;
  const offerRate = stats.interviews > 0 ? ((stats.offers / stats.interviews) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentStreak={7} longestStreak={12} />

      <div className="container mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track your job application performance and identify trends
            </p>
          </div>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Application
          </Button>
        </div>

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </Card>
            ))
          ) : (
            <>
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1">{conversionRate}%</div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Interview Rate</div>
                    <div className="text-xs text-blue-500 dark:text-blue-400 mt-1 opacity-75">
                      {stats.interviews} of {stats.total} applications
                    </div>
                  </div>
                  <div className="p-4 bg-blue-200 dark:bg-blue-800 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <TrendingUp className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200 dark:border-emerald-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mb-1">{offerRate}%</div>
                    <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Offer Rate</div>
                    <div className="text-xs text-emerald-500 dark:text-emerald-400 mt-1 opacity-75">
                      {stats.offers} of {stats.interviews} interviews
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-200 dark:bg-emerald-800 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Target className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1">{stats.responseRate}%</div>
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Response Rate</div>
                    <div className="text-xs text-purple-500 dark:text-purple-400 mt-1 opacity-75">
                      Overall application responses
                    </div>
                  </div>
                  <div className="p-4 bg-purple-200 dark:bg-purple-800 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200 dark:border-amber-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-amber-700 dark:text-amber-300 mb-1">{stats.averageResponseTime}</div>
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400">Avg. Response Time</div>
                    <div className="text-xs text-amber-500 dark:text-amber-400 mt-1 opacity-75">
                      Based on actual response data
                    </div>
                  </div>
                  <div className="p-4 bg-amber-200 dark:bg-amber-800 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Calendar className="h-6 w-6 text-amber-700 dark:text-amber-300" />
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Charts */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="p-4 sm:p-6">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64 mb-4" />
              <Skeleton className="h-[200px] sm:h-[250px] lg:h-[300px] w-full" />
            </Card>
            <Card className="p-4 sm:p-6">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64 mb-4" />
              <Skeleton className="h-[200px] sm:h-[250px] lg:h-[300px] w-full" />
            </Card>
          </div>
        ) : applications.length > 0 ? (
          <div className="w-full overflow-hidden">
            <DashboardCharts applications={applications} />
          </div>
        ) : (
          <Card className="p-12 text-center bg-gradient-to-br from-muted/30 to-muted/10 border-dashed border-2">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-10 w-10 text-primary opacity-60" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-3">No Analytics Data Yet</h3>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Start adding job applications to see detailed analytics and insights about your job search performance.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate("/dashboard")}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Application
                </Button>
                <p className="text-sm text-muted-foreground">
                  Analytics will appear here once you have application data
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;

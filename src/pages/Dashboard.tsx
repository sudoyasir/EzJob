import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/ui/navbar";
import { Plus, Search, Filter, Edit, Trash2, TrendingUp, FileText, Star, BarChart3, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { JobApplication, JobApplicationService } from "@/services/jobApplications";
import { JobApplicationForm } from "@/components/applications/JobApplicationForm";
import { JobApplicationView } from "@/components/applications/JobApplicationView";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ApplicationCardSkeleton } from "@/components/skeletons/ApplicationCardSkeleton";
import { StatsCardSkeleton } from "@/components/skeletons/StatsCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeInfoCache, setResumeInfoCache] = useState<Record<string, {name: string, is_default: boolean}>>({});
  const [stats, setStats] = useState({
    total: 0,
    interviews: 0,
    offers: 0,
    responseRate: 0,
  });
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
      
      // Fetch resume info for applications that have resume_id
      const resumeIds = applicationsData
        .filter(app => app.resume_id && !resumeInfoCache[app.resume_id])
        .map(app => app.resume_id!)
        .filter(Boolean);
      
      if (resumeIds.length > 0) {
        fetchResumeInfo(resumeIds);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchResumeInfo = async (resumeIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('id, name, is_default')
        .in('id', resumeIds);

      if (error) throw error;
      
      const newResumeInfo = (data || []).reduce((acc: any, resume: any) => {
        acc[resume.id] = { name: resume.name, is_default: resume.is_default };
        return acc;
      }, {} as Record<string, {name: string, is_default: boolean}>);
      
      setResumeInfoCache(prev => ({ ...prev, ...newResumeInfo }));
    } catch (error) {
      console.error('Error fetching resume info:', error);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <Navbar currentStreak={7} longestStreak={12} />

      <div className="container mx-auto px-6 py-12">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Your Job Search Command Center
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Track applications, analyze performance, and accelerate your career journey with intelligent insights
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <JobApplicationForm 
              onSuccess={loadApplications}
              trigger={
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 text-base font-semibold">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Application
                </Button>
              }
            />
            <Button variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground px-6 py-3 text-base font-medium" onClick={() => navigate("/analytics")}>
              <TrendingUp className="h-5 w-5 mr-2" />
              View Analytics
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Performance Overview</h2>
              <p className="text-muted-foreground">Your job search metrics at a glance</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/resumes")}
                className="text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-medium"
              >
                <FileText className="h-4 w-4 mr-2" />
                Manage Resumes
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/analytics")}
                className="text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-medium"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Detailed Analytics
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))
            ) : (
              <>
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1">{stats.total}</div>
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Applications</div>
                    </div>
                    <div className="p-4 bg-blue-200 dark:bg-blue-800 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200 dark:border-emerald-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mb-1">{stats.interviews}</div>
                      <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Interviews Secured</div>
                    </div>
                    <div className="p-4 bg-emerald-200 dark:bg-emerald-800 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <User className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1">{stats.offers}</div>
                      <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Job Offers</div>
                    </div>
                    <div className="p-4 bg-purple-200 dark:bg-purple-800 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200 dark:border-amber-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-amber-700 dark:text-amber-300 mb-1">{stats.responseRate}%</div>
                      <div className="text-sm font-medium text-amber-600 dark:text-amber-400">Response Rate</div>
                    </div>
                    <div className="p-4 bg-amber-200 dark:bg-amber-800 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="h-6 w-6 text-amber-700 dark:text-amber-300" />
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
                    {app.resume_id && resumeInfoCache[app.resume_id] && (
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                          <FileText className="h-3 w-3" />
                          <span>{resumeInfoCache[app.resume_id].name}</span>
                          {resumeInfoCache[app.resume_id].is_default && (
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                          )}
                        </div>
                      </div>
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
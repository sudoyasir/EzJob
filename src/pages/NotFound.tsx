import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Home, ArrowLeft, Search, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-2xl relative z-10">
        <Card className="p-8 lg:p-12 bg-card/80 backdrop-blur-lg border-border shadow-2xl rounded-2xl text-center">
          {/* Brand Header */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <img 
              src="/logo.png" 
              className="w-12 h-12 object-contain" 
              alt="EzJob Logo"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              EzJob
            </span>
          </div>

          {/* 404 Icon */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                404
              </h1>
              <h2 className="text-2xl font-semibold text-card-foreground">
                Page Not Found
              </h2>
            </div>
          </div>

          {/* Message */}
          <div className="mb-8 space-y-3">
            <p className="text-lg text-muted-foreground">
              Oops! The page you're looking for doesn't exist.
            </p>
            <p className="text-sm text-muted-foreground">
              The URL <code className="px-2 py-1 bg-muted rounded text-xs font-mono">{location.pathname}</code> might have been moved, deleted, or entered incorrectly.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button 
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 px-6"
                    size="lg"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto border-border hover:bg-accent hover:text-accent-foreground px-6"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </>
            ) : (
              <>
                <Link to="/">
                  <Button 
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 px-6"
                    size="lg"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full sm:w-auto border-border hover:bg-accent hover:text-accent-foreground px-6"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Help Links */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Need help? Here are some helpful links:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/" className="text-primary hover:text-primary/80 transition-colors">
                Home
              </Link>
              {user && (
                <>
                  <Link to="/dashboard" className="text-primary hover:text-primary/80 transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/resumes" className="text-primary hover:text-primary/80 transition-colors">
                    Resumes
                  </Link>
                  <Link to="/analytics" className="text-primary hover:text-primary/80 transition-colors">
                    Analytics
                  </Link>
                </>
              )}
              <Link to="/support" className="text-primary hover:text-primary/80 transition-colors">
                Support
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;

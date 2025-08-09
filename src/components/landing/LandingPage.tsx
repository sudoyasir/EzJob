import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, BarChart3, Target, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const LandingPage = () => {
  const { user, loading } = useAuth();
  const features = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Smart Application Tracking",
      description: "Centralize all your job applications with intelligent status tracking and automated reminders",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Powerful Analytics & Insights",
      description: "Gain deep insights into your job search performance with comprehensive analytics and success metrics",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Motivation & Streak Building",
      description: "Stay motivated with daily application streaks, achievement badges, and progress milestones",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Resume Management",
      description: "Organize multiple resumes, track which ones perform best, and optimize for different roles",
      color: "from-amber-500 to-amber-600"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Interview Scheduling",
      description: "Never miss an interview with smart calendar integration and automated reminder notifications",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Company Research Hub",
      description: "Access comprehensive company insights, salary data, and culture information in one place",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container mx-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-6 sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="EzJob Logo" 
              className="w-10 h-10 object-contain" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              EzJob
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground md:hover:text-primary transition-all duration-300 font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground md:hover:text-primary transition-all duration-300 font-medium">
              How it Works
            </a>
            <a href="#testimonials" className="text-muted-foreground md:hover:text-primary transition-all duration-300 font-medium">
              Testimonials
            </a>
            <a href="#contact" className="text-muted-foreground md:hover:text-primary transition-all duration-300 font-medium">
              Contact
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {/* Conditional navigation button based on authentication status */}
            {loading ? (
              <div className="w-24 h-10 bg-muted animate-pulse rounded-lg"></div>
            ) : user ? (
              <Link to="/dashboard">
                <Button variant="default" className="bg-gradient-to-r from-primary to-accent md:hover:from-primary/90 md:hover:to-accent/90 shadow-lg md:hover:shadow-xl transition-all duration-300">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-foreground md:hover:text-primary transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="bg-gradient-to-r from-primary to-accent md:hover:from-primary/90 md:hover:to-accent/90 shadow-lg md:hover:shadow-xl transition-all duration-300">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20 lg:py-32 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary ring-1 ring-primary/20 mb-8">
              🚀 Join 10,000+ successful job seekers
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 animate-fade-in leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Less mess,
            </span>
            <br />
            <span className="text-foreground">more success</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in leading-relaxed">
            Transform your job search with EzJob's intelligent tracking system. 
            Organize applications, build momentum, and land your dream role faster than ever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in">
            {user ? (
              <Link to="/dashboard">
                <Button variant="hero" size="lg" className="w-full sm:w-auto bg-gradient-hero text-white shadow-glow md:hover:shadow-brand transition-all duration-300 md:hover:scale-105 px-8 py-4 text-lg font-semibold">
                  Go to Dashboard
                  <span className="ml-2">→</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto bg-gradient-hero text-white shadow-glow md:hover:shadow-brand transition-all duration-300 md:hover:scale-105 px-8 py-4 text-lg font-semibold">
                    Start Free Today
                    <span className="ml-2">→</span>
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-border text-foreground md:hover:bg-accent md:hover:text-accent-foreground transition-all duration-300 px-8 py-4 text-lg font-medium">
                  <span className="mr-2">▶</span>
                  Watch Demo
                </Button>
              </>
            )}
          </div>

          {/* Hero Dashboard Preview */}
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="relative">
              {/* Main dashboard mockup */}
              <div className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-card p-4 sm:p-6 lg:p-12 animate-float relative overflow-hidden">
                {/* Header */}
                <div className="bg-background/90 dark:bg-card/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-border backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-primary rounded-lg shadow-sm"></div>
                      <span className="font-bold text-lg sm:text-xl text-foreground">EzJob Dashboard</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2">
                      <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 px-2 sm:px-3 py-1 rounded-full">🔥 7 Day Streak</div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 dark:text-blue-300">24</div>
                      <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">Applications</div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-700 dark:text-emerald-300">8</div>
                      <div className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">Interviews</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/30 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border border-purple-200 dark:border-purple-800">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-700 dark:text-purple-300">3</div>
                      <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">Offers</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-700 dark:text-amber-300">92%</div>
                      <div className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">Response Rate</div>
                    </div>
                  </div>
                  
                  {/* Application Cards */}
                  <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl border border-border/50 hover:bg-muted/50 transition-colors gap-2 sm:gap-0">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-lg shrink-0">T</div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm sm:text-base text-foreground truncate">Senior Software Engineer</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">TechCorp Inc. • San Francisco, CA</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3 w-full sm:w-auto">
                        <div className="px-2 sm:px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-xs sm:text-sm font-medium">
                          Final Interview
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">2 days ago</div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl border border-border/50 hover:bg-muted/50 transition-colors gap-2 sm:gap-0">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-lg shrink-0">S</div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm sm:text-base text-foreground truncate">Frontend Developer</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">StartupCo • Remote</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3 w-full sm:w-auto">
                        <div className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium">
                          Application Sent
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">1 week ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-accent rounded-full shadow-glow opacity-80 animate-pulse"></div>
              <div className="absolute -bottom-3 sm:-bottom-6 -left-3 sm:-left-6 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-accent to-primary rounded-full shadow-glow opacity-60 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-8 lg:px-12 py-20 lg:py-32 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 right-20 w-32 h-32 bg-accent/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="text-center mb-20">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent/10 text-accent ring-1 ring-accent/20">
              ✨ Everything you need to succeed
            </span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
            Powerful features for your
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> job search success</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our comprehensive suite of tools is designed to streamline every aspect of your job search journey, 
            from application tracking to interview preparation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="group p-8 text-center bg-card border-border shadow-card hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-card-foreground group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Feature highlight */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-primary/10 rounded-full">
            <span className="text-primary font-medium">🎯 Join 10,000+ successful job seekers</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-8 lg:px-12 py-20 lg:py-32 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-3xl"></div>
        </div>
        
        <div className="text-center bg-card border border-border rounded-3xl p-12 lg:p-16 shadow-card relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
          
          <div className="relative z-10">
            <div className="mb-6">
              <span className="inline-flex items-center px-2 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary ring-1 ring-primary/20">
                🚀 Ready to transform your career?
              </span>
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-card-foreground">
              Start landing interviews
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> today</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of job seekers who have transformed their careers with EzJob. 
              Our intelligent platform makes job searching effortless and more successful.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {user ? (
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto bg-gradient-hero text-white shadow-glow hover:shadow-brand transition-all duration-300 hover:scale-105 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold">
                    Continue to Dashboard
                    <span className="ml-2">→</span>
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button variant="hero" size="lg" className="w-full sm:w-auto bg-gradient-hero text-white shadow-glow hover:shadow-brand transition-all duration-300 hover:scale-105 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold">
                      Start Your Journey Free
                      <span className="ml-2">→</span>
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium">
                    Schedule a Demo
                  </Button>
                </>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-8 lg:px-12 py-16">
          <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src="/logo.png" 
                  className="w-10 h-10 object-contain" 
                  alt="EzJob Logo"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">EzJob</span>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed max-w-md">
                Transforming job searches with intelligent tracking, powerful analytics, 
                and seamless organization. Less mess, more success.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>10,000+ active users</span>
                </div>
              </div>
            </div>
            
            {/* Product Links */}
            <div>
              <h3 className="font-bold mb-6 text-foreground">Product</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-all duration-300 flex items-center group">
                  Features
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-all duration-300 flex items-center group">
                  How it Works
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a></li>
                <li><a href="#" className="hover:text-primary transition-all duration-300 flex items-center group">
                  Pricing
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a></li>
                <li><a href="#" className="hover:text-primary transition-all duration-300 flex items-center group">
                  Integrations
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a></li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h3 className="font-bold mb-6 text-foreground">Support</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-all duration-300 flex items-center group">
                  Help Center
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a></li>
                <li><a href="#contact" className="hover:text-primary transition-all duration-300 flex items-center group">
                  Contact Us
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a></li>
                <li><a href="#" className="hover:text-primary transition-all duration-300 flex items-center group">
                  Community
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a></li>
                <li><a href="#" className="hover:text-primary transition-all duration-300 flex items-center group">
                  API Docs
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a></li>
              </ul>
            </div>
            
            {/* Legal Links */}
            <div>
              <h3 className="font-bold mb-6 text-foreground">Legal</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-all duration-300 flex items-center group">
                  Privacy Policy
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a></li>
                <li><a href="#" className="hover:text-primary transition-all duration-300 flex items-center group">
                  Terms of Service
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a></li>
                <li><a href="#" className="hover:text-primary transition-all duration-300 flex items-center group">
                  Cookie Policy
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a></li>
                <li><a href="#" className="hover:text-primary transition-all duration-300 flex items-center group">
                  GDPR
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm text-center md:text-left">
              &copy; 2025 EzJob. All rights reserved. Built with ❤️ for job seekers worldwide.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
              <span className="text-center sm:text-left">Made with React & Supabase</span>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
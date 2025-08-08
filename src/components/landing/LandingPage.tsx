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
      title: "Track Applications",
      description: "Keep all your job applications organized in one place"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Insightful Analytics",
      description: "Understand your job search progress with detailed stats"
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Build Streaks",
      description: "Stay motivated with daily application streaks"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <span className="text-2xl font-bold text-primary">
              EzJob
            </span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {/* Conditional navigation button based on authentication status */}
            {loading ? (
              <div className="w-20 h-10 bg-muted animate-pulse rounded"></div>
            ) : user ? (
              <Link to="/dashboard">
                <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="text-primary">
              Less mess,
            </span>
            <br />
            <span className="text-foreground">more success</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            Take control of your job search with EzJob. Track applications, 
            build streaks, and land your dream job faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
            {user ? (
              <Link to="/dashboard">
                <Button variant="hero" size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="hero" size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started Free
                </Button>
              </Link>
            )}
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-border text-foreground hover:bg-accent hover:text-accent-foreground">
              Watch Demo
            </Button>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative mx-auto max-w-4xl">
            <div className="bg-card border border-border rounded-2xl shadow-lg p-8 animate-float">
              <div className="bg-background/80 dark:bg-card/80 rounded-lg p-6 shadow-sm border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-primary rounded"></div>
                    <span className="font-semibold text-foreground">EzJob Dashboard</span>
                  </div>
                  <div className="text-sm text-muted-foreground">🔥 Streak: 7 Days</div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">Software Engineer</div>
                      <div className="text-sm text-muted-foreground">TechCorp Inc.</div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-sm">
                      Interview
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">Frontend Developer</div>
                      <div className="text-sm text-muted-foreground">StartupCo</div>
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm">
                      Applied
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Everything you need to succeed</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to streamline your job search and boost your success rate.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 text-center bg-card border-border shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-primary mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center bg-card border border-border rounded-2xl p-12 shadow-lg">
          <h2 className="text-4xl font-bold mb-4 text-card-foreground">Ready to land your dream job?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who are already using EzJob to organize 
            their applications and track their progress.
          </p>
          {user ? (
            <Link to="/dashboard">
              <Button variant="hero" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Continue to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="hero" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Start Your Journey
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-primary rounded"></div>
                <span className="text-xl font-bold">EzJob</span>
              </div>
              <p className="text-muted-foreground">
                Less mess, more success in your job search.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Updates</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 EzJob. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
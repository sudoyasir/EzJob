import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Github, ArrowLeft } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGithub } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        toast.success("Welcome back!");
        navigate(from, { replace: true });
      } else {
        await signUpWithEmail(email, password);
        toast.success("Account created! Please check your email to verify your account.");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGithub();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

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
      
      <div className="w-full max-w-md relative z-10">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-all duration-300 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <Card className="p-8 lg:p-10 bg-card/80 backdrop-blur-lg border-border shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl shadow-brand"></div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EzJob
              </span>
            </div>
            <h1 className="text-3xl font-bold text-card-foreground mb-3">
              {isLogin ? "Welcome back!" : "Join EzJob today"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isLogin 
                ? "Sign in to continue your job search journey" 
                : "Start tracking your applications and land your dream job"
              }
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-4 mb-8">
            <Button 
              variant="outline" 
              className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 py-6 text-base font-medium" 
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <FaGoogle className="h-5 w-5 mr-3 text-red-500" />
              Continue with Google
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 py-6 text-base font-medium" 
              size="lg"
              onClick={handleGithubSignIn}
              disabled={loading}
            >
              <Github className="h-5 w-5 mr-3" />
              Continue with GitHub
            </Button>
          </div>

          <div className="relative mb-8">
            <Separator className="bg-border" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-card px-4 text-sm text-muted-foreground font-medium">or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-card-foreground font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-card-foreground font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 text-base"
              />
            </div>

            {isLogin && (
              <div className="text-right">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Forgot your password?
                </Link>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-12 text-base font-semibold" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                <span>{isLogin ? "Sign In" : "Create Account"}</span>
              )}
            </Button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="text-center mt-6 pt-6 border-t border-border">
            <p className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </Card>

        {/* Terms */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our{" "}
          <Link to="/terms" className="text-accent hover:text-accent/80 transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-accent hover:text-accent/80 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
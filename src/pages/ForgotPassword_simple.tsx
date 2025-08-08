import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <div className="absolute right-4 top-4 md:right-8 md:top-8">
          <ThemeToggle />
        </div>

        <div className="flex flex-col items-center space-y-2 text-center mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <img 
              src="/logo.png" 
              className="w-10 h-10 object-contain" 
              alt="EzJob Logo"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-3xl font-bold text-primary">EzJob</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Forgot your password?
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a reset link
          </p>
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
            {sent ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Check your email</h2>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>

                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Don't see the email? Check your spam folder or try again.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSent(false);
                      setEmail("");
                    }}
                    className="w-full"
                  >
                    Try different email
                  </Button>

                  <div className="text-center">
                    <Link 
                      to="/login" 
                      className="text-sm text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to login
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-card-foreground font-medium">
                    Email Address
                  </Label>
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

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    );
  };

  export default ForgotPassword;

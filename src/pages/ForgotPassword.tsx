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
import { rateLimitService, securityEventService } from "@/services/rateLimitService";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Rate limit check for password reset
      const rateLimitResult = rateLimitService.checkRateLimit(
        `password_reset:${email}`,
        { windowMs: 60 * 60 * 1000, maxRequests: 3 } // 3 attempts per hour
      );

      if (!rateLimitResult.allowed) {
        const resetTimeMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / (1000 * 60));
        await securityEventService.logSecurityEvent({
          type: 'password_reset',
          success: false,
          metadata: { email, reason: 'rate_limited' }
        });
        throw new Error(`Too many password reset attempts. Try again in ${resetTimeMinutes} minutes.`);
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        await securityEventService.logSecurityEvent({
          type: 'password_reset',
          success: false,
          metadata: { email, error: error.message }
        });
        throw error;
      }

      await securityEventService.logSecurityEvent({
        type: 'password_reset',
        success: true,
        metadata: { email }
      });

      setEmailSent(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Link>

        <Card className="p-8 bg-card border-border shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg"></div>
              <span className="text-2xl font-bold text-primary">
                EzJob
              </span>
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">
              {emailSent ? "Check your email" : "Reset your password"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {emailSent 
                ? "We've sent a password reset link to your email address" 
                : "Enter your email address and we'll send you a link to reset your password"
              }
            </p>
          </div>

          {emailSent ? (
            /* Email Sent Success State */
            <div className="space-y-6">
              <Alert className="border-success text-success">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Password reset email sent to <strong>{email}</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="w-full"
                >
                  Try different email
                </Button>

                <div className="pt-4 border-t border-border">
                  <Link 
                    to="/login" 
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Return to login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Reset Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Alert className="border-muted">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  You'll receive an email with a link to reset your password. 
                  The link will expire in 1 hour for security.
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
                size="lg"
                disabled={loading}
              >
                <Mail className="h-4 w-4 mr-2" />
                {loading ? "Sending..." : "Send Reset Email"}
              </Button>
            </form>
          )}

          {/* Back to Login Link */}
          {!emailSent && (
            <div className="text-center mt-6 pt-6 border-t border-border">
              <p className="text-muted-foreground">
                Remember your password?{" "}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;

import { ResumeManager } from "@/components/resumes/ResumeManager";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Resumes() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar currentStreak={7} longestStreak={12} />
      <div className="container mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 max-w-5xl">
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
        
        <ResumeManager />
      </div>
    </div>
  );
}

import { ResumeManager } from "@/components/resumes/ResumeManager";
import { Navbar } from "@/components/ui/navbar";

export default function Resumes() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar currentStreak={7} longestStreak={12} />
      <div className="container mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 max-w-5xl">
        <ResumeManager />
      </div>
    </div>
  );
}

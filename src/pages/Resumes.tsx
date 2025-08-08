import { ResumeManager } from "@/components/resumes/ResumeManager";

export default function Resumes() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <ResumeManager />
      </div>
    </div>
  );
}

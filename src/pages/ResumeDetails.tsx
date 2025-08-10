import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, User, Briefcase, GraduationCap, Code, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PersonalInfoSection } from '@/components/resume-form/PersonalInfoSection';
import { WorkExperienceSection } from '@/components/resume-form/WorkExperienceSection';
import { EducationSection } from '@/components/resume-form/EducationSection';
import { SkillsSection } from '@/components/resume-form/SkillsSection';
import { ProjectsSection } from '@/components/resume-form/ProjectsSection';
import { useResumeData } from '@/hooks/useResumeData';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/ui/navbar';

const sections = [
  { id: 'personal', title: 'Personal Information', icon: User, component: PersonalInfoSection },
  { id: 'experience', title: 'Work Experience', icon: Briefcase, component: WorkExperienceSection },
  { id: 'education', title: 'Education', icon: GraduationCap, component: EducationSection },
  { id: 'skills', title: 'Skills', icon: Code, component: SkillsSection },
  { id: 'projects', title: 'Projects', icon: FolderOpen, component: ProjectsSection }
];

const ResumeDetails = () => {
  const [activeSection, setActiveSection] = useState<string>('personal');
  const { resumeData } = useResumeData();
  const navigate = useNavigate();

  const calculateProgress = () => {
    const { personalInfo, workExperience, education, skills } = resumeData;
    let completed = 0;
    let total = 4;

    if (personalInfo.fullName && personalInfo.email) completed++;
    if (workExperience.length > 0) completed++;
    if (education.length > 0) completed++;
    if (skills.length > 0) completed++;

    return (completed / total) * 100;
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-builder-bg">
      <Navbar />
      <header className="bg-builder-panel border-b border-builder-border shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Resume Details</h1>
              <p className="text-muted-foreground">Fill in your information to create your resume</p>
            </div>
            <Button 
              onClick={() => navigate('/resume-builder')}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              Continue to Builder
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        <Card className="p-6 mb-8 bg-builder-panel shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Completion Progress</h2>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <motion.div
              className="bg-gradient-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-builder-panel shadow-soft">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeSection === section.id
                          ? 'bg-gradient-primary text-primary-foreground shadow-soft'
                          : 'hover:bg-secondary text-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {sections.map((section) => {
                if (section.id === activeSection) {
                  const Component = section.component;
                  return <Component key={section.id} />;
                }
                return null;
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDetails;
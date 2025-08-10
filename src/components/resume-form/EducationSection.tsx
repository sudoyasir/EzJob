import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GraduationCap } from 'lucide-react';
import { useResumeData } from '@/hooks/useResumeData';
import { Education } from '@/types/resume';

export const EducationSection = () => {
  const { resumeData, updateEducation } = useResumeData();

  const addEducation = () => {
    const newEducation: Education = {
      id: crypto.randomUUID(),
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    updateEducation([...resumeData.education, newEducation]);
  };

  const removeEducation = (id: string) => {
    updateEducation(resumeData.education.filter(edu => edu.id !== id));
  };

  const updateEducationItem = (id: string, field: keyof Education, value: string) => {
    const updated = resumeData.education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    updateEducation(updated);
  };

  return (
    <Card className="bg-builder-panel shadow-soft">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Education
        </CardTitle>
        <CardDescription>
          Add your educational background
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {resumeData.education.map((education, index) => (
            <motion.div
              key={education.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-6 border border-builder-border rounded-lg bg-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Education #{index + 1}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeEducation(education.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>School/University *</Label>
                  <Input
                    value={education.school}
                    onChange={(e) => updateEducationItem(education.id, 'school', e.target.value)}
                    placeholder="University of Example"
                    className="border-builder-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Degree *</Label>
                  <Input
                    value={education.degree}
                    onChange={(e) => updateEducationItem(education.id, 'degree', e.target.value)}
                    placeholder="Bachelor of Science"
                    className="border-builder-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Field of Study</Label>
                  <Input
                    value={education.field}
                    onChange={(e) => updateEducationItem(education.id, 'field', e.target.value)}
                    placeholder="Computer Science"
                    className="border-builder-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>GPA (Optional)</Label>
                  <Input
                    value={education.gpa}
                    onChange={(e) => updateEducationItem(education.id, 'gpa', e.target.value)}
                    placeholder="3.8/4.0"
                    className="border-builder-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="month"
                    value={education.startDate}
                    onChange={(e) => updateEducationItem(education.id, 'startDate', e.target.value)}
                    className="border-builder-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={education.endDate}
                    onChange={(e) => updateEducationItem(education.id, 'endDate', e.target.value)}
                    className="border-builder-border"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          onClick={addEducation}
          variant="outline"
          className="w-full border-dashed border-2 border-primary/30 text-primary hover:bg-primary/5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Education
        </Button>
      </CardContent>
    </Card>
  );
};
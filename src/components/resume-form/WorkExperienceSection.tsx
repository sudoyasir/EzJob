import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Briefcase } from 'lucide-react';
import { useResumeData } from '@/hooks/useResumeData';
import { WorkExperience } from '@/types/resume';

export const WorkExperienceSection = () => {
  const { resumeData, updateWorkExperience } = useResumeData();

  const addWorkExperience = () => {
    const newExperience: WorkExperience = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    updateWorkExperience([...resumeData.workExperience, newExperience]);
  };

  const removeWorkExperience = (id: string) => {
    updateWorkExperience(resumeData.workExperience.filter(exp => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: string | boolean) => {
    const updated = resumeData.workExperience.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    updateWorkExperience(updated);
  };

  return (
    <Card className="bg-builder-panel shadow-soft">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Work Experience
        </CardTitle>
        <CardDescription>
          Add your professional work experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {resumeData.workExperience.map((experience, index) => (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-6 border border-builder-border rounded-lg bg-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Experience #{index + 1}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeWorkExperience(experience.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    value={experience.company}
                    onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                    placeholder="Company Inc."
                    className="border-builder-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position *</Label>
                  <Input
                    value={experience.position}
                    onChange={(e) => updateExperience(experience.id, 'position', e.target.value)}
                    placeholder="Software Engineer"
                    className="border-builder-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="month"
                    value={experience.startDate}
                    onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                    className="border-builder-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={experience.endDate}
                    onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                    disabled={experience.current}
                    className="border-builder-border"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id={`current-${experience.id}`}
                  checked={!!experience.current}
                  onCheckedChange={(checked) => {
                    const isChecked = checked === true || checked === 'on';
                    updateExperience(experience.id, 'current', isChecked);
                    if (isChecked) {
                      updateExperience(experience.id, 'endDate', '');
                    }
                  }}
                  className='border-builder-border checked:bg-primary checked:border-primary'
                />
                <Label htmlFor={`current-${experience.id}`}>I currently work here</Label>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={experience.description}
                  onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
                  placeholder="Describe your responsibilities and achievements..."
                  className="border-builder-border min-h-[100px]"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          onClick={addWorkExperience}
          variant="outline"
          className="w-full border-dashed border-2 border-primary/30 text-primary hover:bg-primary/5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Work Experience
        </Button>
      </CardContent>
    </Card>
  );
};
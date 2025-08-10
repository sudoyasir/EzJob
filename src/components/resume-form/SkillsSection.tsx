import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Code } from 'lucide-react';
import { useResumeData } from '@/hooks/useResumeData';

export const SkillsSection = () => {
  const { resumeData, updateSkills } = useResumeData();
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      updateSkills([...resumeData.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateSkills(resumeData.skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const suggestedSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'AWS', 'Docker',
    'Git', 'HTML/CSS', 'Project Management', 'Agile', 'Communication', 'Leadership'
  ];

  const availableSuggestions = suggestedSkills.filter(skill => 
    !resumeData.skills.includes(skill)
  );

  return (
    <Card className="bg-builder-panel shadow-soft">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          Skills
        </CardTitle>
        <CardDescription>
          Add your technical and soft skills
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Skill Input */}
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a skill..."
            className="border-builder-border"
          />
          <Button 
            onClick={addSkill}
            disabled={!newSkill.trim()}
            className="bg-gradient-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Current Skills */}
        {resumeData.skills.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Your Skills</h3>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {resumeData.skills.map((skill) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge 
                      variant="secondary" 
                      className="text-sm py-1 px-3 bg-primary/10 text-primary border-primary/20"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Suggested Skills */}
        {availableSuggestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Suggested Skills</h3>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.slice(0, 10).map((skill) => (
                <Button
                  key={skill}
                  variant="outline"
                  size="sm"
                  onClick={() => updateSkills([...resumeData.skills, skill])}
                  className="text-sm border-builder-border hover:bg-primary/5 hover:border-primary"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {skill}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
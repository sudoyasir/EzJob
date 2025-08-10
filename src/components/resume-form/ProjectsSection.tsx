import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, FolderOpen, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useResumeData } from '@/hooks/useResumeData';
import { Project } from '@/types/resume';
import { useState } from 'react';

export const ProjectsSection = () => {
  const { resumeData, updateProjects } = useResumeData();

  const addProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      technologies: [],
      link: ''
    };
    updateProjects([...resumeData.projects, newProject]);
  };

  const removeProject = (id: string) => {
    updateProjects(resumeData.projects.filter(project => project.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    const updated = resumeData.projects.map(project =>
      project.id === id ? { ...project, [field]: value } : project
    );
    updateProjects(updated);
  };

  const TechnologyInput = ({ projectId, technologies }: { projectId: string; technologies: string[] }) => {
    const [newTech, setNewTech] = useState('');

    const addTechnology = () => {
      if (newTech.trim() && !technologies.includes(newTech.trim())) {
        updateProject(projectId, 'technologies', [...technologies, newTech.trim()]);
        setNewTech('');
      }
    };

    const removeTechnology = (tech: string) => {
      updateProject(projectId, 'technologies', technologies.filter(t => t !== tech));
    };

    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
            placeholder="Add technology..."
            className="border-builder-border"
          />
          <Button 
            type="button"
            onClick={addTechnology}
            disabled={!newTech.trim()}
            size="sm"
            className="bg-gradient-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <Badge 
                key={tech}
                variant="secondary" 
                className="text-sm py-1 px-3 bg-accent/10 text-accent border-accent/20"
              >
                {tech}
                <button
                  onClick={() => removeTechnology(tech)}
                  className="ml-2 hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-builder-panel shadow-soft">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          Projects
        </CardTitle>
        <CardDescription>
          Showcase your personal and professional projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {resumeData.projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-6 border border-builder-border rounded-lg bg-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Project #{index + 1}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeProject(project.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project Name *</Label>
                    <Input
                      value={project.name}
                      onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                      placeholder="My Awesome Project"
                      className="border-builder-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Project Link (Optional)</Label>
                    <Input
                      value={project.link}
                      onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                      placeholder="https://github.com/username/project"
                      className="border-builder-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={project.description}
                    onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                    placeholder="Describe your project, what it does, and your role..."
                    className="border-builder-border min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Technologies Used</Label>
                  <TechnologyInput projectId={project.id} technologies={project.technologies} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          onClick={addProject}
          variant="outline"
          className="w-full border-dashed border-2 border-primary/30 text-primary hover:bg-primary/5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </CardContent>
    </Card>
  );
};
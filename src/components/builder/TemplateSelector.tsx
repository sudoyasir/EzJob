import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

const templates = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, professional two-column layout',
    thumbnail: '/placeholder.svg'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional single-column format',
    thumbnail: '/placeholder.svg'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant design',
    thumbnail: '/placeholder.svg'
  }
];

export const TemplateSelector = ({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Choose Template</h3>
      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`p-4 cursor-pointer transition-all border-2 ${
                selectedTemplate === template.id
                  ? 'border-primary bg-primary/5 shadow-medium'
                  : 'border-builder-border hover:border-primary/50'
              }`}
              onClick={() => onTemplateSelect(template.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-20 bg-gradient-secondary rounded border border-builder-border flex items-center justify-center">
                  <div className="text-xs text-muted-foreground">Preview</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">{template.name}</h4>
                    {selectedTemplate === template.id && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
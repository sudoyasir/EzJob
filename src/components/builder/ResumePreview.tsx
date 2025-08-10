import { Card } from '@/components/ui/card';
import { ResumeData, ResumeCustomization } from '@/types/resume';
import { ModernTemplate } from '@/components/templates/ModernTemplate';
import { ClassicTemplate } from '@/components/templates/ClassicTemplate';
import { MinimalTemplate } from '@/components/templates/MinimalTemplate';

interface ResumePreviewProps {
  data: ResumeData;
  template: string;
  customization: ResumeCustomization;
}

export const ResumePreview = ({ data, template, customization }: ResumePreviewProps) => {
  const renderTemplate = () => {
    switch (template) {
      case 'classic':
        return <ClassicTemplate data={data} customization={customization} />;
      case 'minimal':
        return <MinimalTemplate data={data} customization={customization} />;
      default:
        return <ModernTemplate data={data} customization={customization} />;
    }
  };

  return (
    <Card className="bg-white shadow-large border-builder-border overflow-hidden">
      <div className="aspect-[8.5/11] w-full">
        <div 
          className="w-full h-full transform scale-90 origin-top-left"
          style={{ 
            fontFamily: customization.fontFamily === 'system-ui' ? 'system-ui' : customization.fontFamily,
            '--primary-color': customization.primaryColor 
          } as React.CSSProperties}
        >
          {renderTemplate()}
        </div>
      </div>
    </Card>
  );
};
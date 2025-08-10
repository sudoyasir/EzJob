import { Button } from '@/components/ui/button';
import { ResumeCustomization } from '@/types/resume';

interface FontCustomizerProps {
  customization: ResumeCustomization;
  onCustomizationChange: (customization: ResumeCustomization) => void;
}

const fontOptions = [
  { name: 'Inter', value: 'Inter', description: 'Modern and clean' },
  { name: 'Playfair Display', value: 'Playfair Display', description: 'Elegant serif' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro', description: 'Professional sans-serif' },
  { name: 'System Font', value: 'system-ui', description: 'Default system font' }
];

export const FontCustomizer = ({ customization, onCustomizationChange }: FontCustomizerProps) => {
  const updateFont = (fontFamily: string) => {
    onCustomizationChange({
      ...customization,
      fontFamily
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Typography</h3>
      <div className="space-y-3">
        {fontOptions.map((font) => (
          <Button
            key={font.value}
            variant={customization.fontFamily === font.value ? 'default' : 'outline'}
            className={`w-full h-auto p-4 flex flex-col items-start gap-1 ${
              customization.fontFamily === font.value
                ? 'bg-gradient-primary text-primary-foreground'
                : 'border-builder-border hover:border-primary/50'
            }`}
            onClick={() => updateFont(font.value)}
          >
            <div 
              className="font-medium text-left"
              style={{ fontFamily: font.value === 'system-ui' ? 'system-ui' : font.value }}
            >
              {font.name}
            </div>
            <div className="text-sm opacity-80 text-left">{font.description}</div>
            <div 
              className="text-sm opacity-60 text-left mt-1"
              style={{ fontFamily: font.value === 'system-ui' ? 'system-ui' : font.value }}
            >
              The quick brown fox jumps
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
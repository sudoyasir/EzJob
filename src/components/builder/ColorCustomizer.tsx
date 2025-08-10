import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ResumeCustomization } from '@/types/resume';

interface ColorCustomizerProps {
  customization: ResumeCustomization;
  onCustomizationChange: (customization: ResumeCustomization) => void;
}

const colorPresets = [
  { name: 'Professional Blue', value: '#3B82F6' },
  { name: 'Modern Purple', value: '#8B5CF6' },
  { name: 'Elegant Navy', value: '#1E40AF' },
  { name: 'Creative Teal', value: '#0D9488' },
  { name: 'Warm Orange', value: '#F97316' },
  { name: 'Classic Black', value: '#1F2937' }
];

export const ColorCustomizer = ({ customization, onCustomizationChange }: ColorCustomizerProps) => {
  const updateColor = (color: string) => {
    onCustomizationChange({
      ...customization,
      primaryColor: color
    });
  };

  const updateLayout = (layout: 'single-column' | 'two-column') => {
    onCustomizationChange({
      ...customization,
      layout
    });
  };

  const updateSpacing = (spacing: 'compact' | 'normal' | 'spacious') => {
    onCustomizationChange({
      ...customization,
      spacing
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Color Theme</h3>
        <div className="grid grid-cols-2 gap-3">
          {colorPresets.map((preset) => (
            <Button
              key={preset.value}
              variant={customization.primaryColor === preset.value ? 'default' : 'outline'}
              className={`h-auto p-3 flex items-center gap-2 ${
                customization.primaryColor === preset.value
                  ? 'bg-gradient-primary text-primary-foreground'
                  : 'border-builder-border hover:border-primary/50'
              }`}
              onClick={() => updateColor(preset.value)}
            >
              <div 
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: preset.value }}
              />
              <span className="text-sm">{preset.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Layout</h3>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant={customization.layout === 'single-column' ? 'default' : 'outline'}
            className={customization.layout === 'single-column' ? 'bg-gradient-primary text-primary-foreground' : 'border-builder-border'}
            onClick={() => updateLayout('single-column')}
          >
            Single Column
          </Button>
          <Button
            variant={customization.layout === 'two-column' ? 'default' : 'outline'}
            className={customization.layout === 'two-column' ? 'bg-gradient-primary text-primary-foreground' : 'border-builder-border'}
            onClick={() => updateLayout('two-column')}
          >
            Two Column
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Spacing</h3>
        <div className="grid grid-cols-1 gap-2">
          {(['compact', 'normal', 'spacious'] as const).map((spacingOption) => (
            <Button
              key={spacingOption}
              variant={customization.spacing === spacingOption ? 'default' : 'outline'}
              className={customization.spacing === spacingOption ? 'bg-gradient-primary text-primary-foreground' : 'border-builder-border'}
              onClick={() => updateSpacing(spacingOption)}
            >
              {spacingOption.charAt(0).toUpperCase() + spacingOption.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
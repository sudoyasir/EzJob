import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Download, Palette, Type, Layout, Settings, CloudUpload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useResumeData } from '@/hooks/useResumeData';
import { useNavigate } from 'react-router-dom';
import { TemplateSelector } from '@/components/builder/TemplateSelector';
import { ColorCustomizer } from '@/components/builder/ColorCustomizer';
import { FontCustomizer } from '@/components/builder/FontCustomizer';
import { ResumePreview } from '@/components/builder/ResumePreview';
import { ResumeCustomization } from '@/types/resume';
import { Navbar } from '@/components/ui/navbar';

const ResumeBuilder = () => {
  const { resumeData } = useResumeData();
  const navigate = useNavigate();
  
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [customization, setCustomization] = useState<ResumeCustomization>({
    fontFamily: 'Inter',
    primaryColor: '#3B82F6',
    layout: 'two-column',
    spacing: 'normal'
  });

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download logic
    console.log('Downloading PDF...');
  };

  return (
    <div className="min-h-screen bg-builder-bg">
        <Navbar />
      <header className="bg-builder-panel border-b border-builder-border shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/details')}
                className="border-builder-border"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Details
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Resume Builder</h1>
                <p className="text-muted-foreground">Customize and preview your resume</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleDownloadPDF}
                className="bg-gradient-to-r from-violet-600 to-blue-500 text-white font-semibold shadow-md hover:from-violet-700 hover:to-blue-600 transition-all px-5 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button
                onClick={() => {/* TODO: Implement save to resume manager */}}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-md hover:from-green-600 hover:to-emerald-700 transition-all px-5 py-2 rounded-lg flex items-center gap-2"
              >
                <CloudUpload className="mr-2 h-4 w-4" />
                Save to Resume Manager
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-4">
            <Card className="p-6 bg-builder-panel shadow-soft">
              <Tabs defaultValue="template" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="template" className="flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Templates
                  </TabsTrigger>
                  <TabsTrigger value="style" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Style
                  </TabsTrigger>
                  <TabsTrigger value="typography" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Typography
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="template" className="mt-6">
                  <TemplateSelector
                    selectedTemplate={selectedTemplate}
                    onTemplateSelect={setSelectedTemplate}
                  />
                </TabsContent>

                <TabsContent value="style" className="mt-6">
                  <ColorCustomizer
                    customization={customization}
                    onCustomizationChange={setCustomization}
                  />
                </TabsContent>

                <TabsContent value="typography" className="mt-6">
                  <FontCustomizer
                    customization={customization}
                    onCustomizationChange={setCustomization}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ResumePreview
                data={resumeData}
                template={selectedTemplate}
                customization={customization}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
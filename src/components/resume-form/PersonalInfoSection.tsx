import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResumeData } from '@/hooks/useResumeData';

export const PersonalInfoSection = () => {
  const { resumeData, updatePersonalInfo } = useResumeData();

  const handleInputChange = (field: string, value: string) => {
    updatePersonalInfo({ [field]: value });
  };

  return (
    <Card className="bg-builder-panel shadow-soft">
      <CardHeader>
        <CardTitle className="text-xl">Personal Information</CardTitle>
        <CardDescription>
          Add your contact details and basic information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={resumeData.personalInfo.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="John Doe"
              className="border-builder-border focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={resumeData.personalInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john.doe@email.com"
              className="border-builder-border focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={resumeData.personalInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="border-builder-border focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <Input
              id="linkedin"
              value={resumeData.personalInfo.linkedin}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              placeholder="linkedin.com/in/johndoe"
              className="border-builder-border focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio/Website</Label>
            <Input
              id="portfolio"
              value={resumeData.personalInfo.portfolio}
              onChange={(e) => handleInputChange('portfolio', e.target.value)}
              placeholder="www.johndoe.com"
              className="border-builder-border focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={resumeData.personalInfo.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="New York, NY"
              className="border-builder-border focus:ring-primary"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
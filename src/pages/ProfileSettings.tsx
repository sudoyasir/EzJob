import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Upload, User, Settings, LogOut, Save, Camera, Mail, MapPin, Calendar, Building, Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  phone?: string;
  preferred_job_title?: string;
  years_experience?: number;
  skills?: string[];
}

const ProfileSettings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    bio: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    phone: "",
    preferred_job_title: "",
    years_experience: 0,
    skills: [],
  });
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (user) {
      // Load existing profile data from Supabase
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          avatar_url: data.avatar_url || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
          linkedin: data.linkedin || "",
          github: data.github || "",
          phone: data.phone || "",
          preferred_job_title: data.preferred_job_title || "",
          years_experience: data.years_experience || 0,
          skills: data.skills || [],
        });
      } else {
        // Fallback to user metadata if no profile exists
        setProfile({
          full_name: user.user_metadata?.full_name || "",
          avatar_url: user.user_metadata?.avatar_url || "",
          bio: user.user_metadata?.bio || "",
          location: user.user_metadata?.location || "",
          website: user.user_metadata?.website || "",
          linkedin: user.user_metadata?.linkedin || "",
          github: user.user_metadata?.github || "",
          phone: user.user_metadata?.phone || "",
          preferred_job_title: user.user_metadata?.preferred_job_title || "",
          years_experience: user.user_metadata?.years_experience || 0,
          skills: user.user_metadata?.skills || [],
        });
      }
    } catch (error: any) {
      toast.error("Failed to load profile data");
      console.error("Profile load error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Save to user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          linkedin: profile.linkedin,
          github: profile.github,
          phone: profile.phone,
          preferred_job_title: profile.preferred_job_title,
          years_experience: profile.years_experience,
          skills: profile.skills,
        });

      if (profileError) throw profileError;

      // Also update auth user metadata for backwards compatibility
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          ...profile,
          full_name: profile.full_name,
        }
      });

      if (authError) throw authError;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  const handleAvatarChange = (newAvatarUrl: string) => {
    setProfile(prev => ({ ...prev, avatar_url: newAvatarUrl }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg"></div>
                <span className="text-2xl font-bold text-primary">EzJob</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={user?.user_metadata?.avatar_url} 
                        alt={user?.user_metadata?.full_name || user?.email || "User"} 
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.user_metadata?.full_name 
                          ? user.user_metadata.full_name.charAt(0).toUpperCase()
                          : user?.email?.charAt(0).toUpperCase() || "U"
                        }
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm text-popover-foreground">
                        {user?.user_metadata?.full_name || "User"}
                      </p>
                      <p className="w-[200px] truncate text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem asChild>
                    <button 
                      className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                      onClick={() => navigate('/settings/account')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem asChild>
                    <button 
                      className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer text-destructive hover:text-destructive-foreground hover:bg-destructive focus:text-destructive-foreground focus:bg-destructive focus:outline-none transition-colors"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your personal information and professional details
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Picture & Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your basic profile information visible to others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload Section */}
              <AvatarUpload
                currentAvatarUrl={profile.avatar_url}
                onAvatarChange={handleAvatarChange}
                userId={user?.id || ""}
                userName={profile.full_name || user?.email}
              />

              <Separator />

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here. Use Account Settings.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={profile.location || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, State, Country"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ""}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {profile.bio?.length || 0}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Professional Information
              </CardTitle>
              <CardDescription>
                Your career and professional details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="preferred_job_title">Preferred Job Title</Label>
                  <Input
                    id="preferred_job_title"
                    value={profile.preferred_job_title || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, preferred_job_title: e.target.value }))}
                    placeholder="e.g., Software Engineer, Product Manager"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    min="0"
                    max="50"
                    value={profile.years_experience || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Skills Section */}
              <div className="space-y-4">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.skills?.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a skill..."
                    className="flex-1"
                  />
                  <Button onClick={handleAddSkill} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links & Social */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Links & Social Media
              </CardTitle>
              <CardDescription>
                Your professional online presence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website">Personal Website</Label>
                  <Input
                    id="website"
                    value={profile.website || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={profile.linkedin || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={profile.github || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, github: e.target.value }))}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={loading} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;

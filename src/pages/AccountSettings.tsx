import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Navbar } from "@/components/ui/navbar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  User, 
  Settings,
  Lock, 
  Trash2, 
  Eye, 
  EyeOff, 
  Bell,
  Download,
  AlertTriangle,
  Save,
  BarChart3,
  FileText,
  Sun,
  Moon,
  Smartphone
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AccountManagementService } from "@/services/accountManagement";

interface UserProfile {
  full_name?: string;
  avatar_url?: string;
}

interface NotificationSettings {
  email_notifications: boolean;
}

interface UserPreferences {
  timezone: string;
  language: string;
  date_format: string;
  week_start: string;
}

const AccountSettings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dataSummary, setDataSummary] = useState<{
    applicationsCount: number;
    resumesCount: number;
    storageFilesCount: number;
  } | null>(null);
  const [exportProgress, setExportProgress] = useState<string>("");
  
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    timezone: "UTC",
    date_format: "MM/DD/YYYY",
    week_start: "Monday",
    language: "English",
  });

  useEffect(() => {
    // Load user preferences from metadata or localStorage
    const savedNotifications = localStorage.getItem('ezjob-notifications');
    const savedPreferences = localStorage.getItem('ezjob-preferences');

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }

    // Load profile data
    if (user) {
      setProfile({
        full_name: user.user_metadata?.full_name || "",
        avatar_url: user.user_metadata?.avatar_url || "",
      });
      
      // Load data summary for export preview
      loadDataSummary();
    }
  }, [user]);

  const loadDataSummary = async () => {
    if (!user) return;
    
    try {
      const summary = await AccountManagementService.getDataExportSummary(user.id);
      setDataSummary(summary);
    } catch (error) {
      console.error('Failed to load data summary:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update auth user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
        }
      });

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (newAvatarUrl: string) => {
    setProfile(prev => ({ ...prev, avatar_url: newAvatarUrl }));
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem('ezjob-notifications', JSON.stringify(updated));
    toast.success("Notification preferences updated");
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: string) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('ezjob-preferences', JSON.stringify(updated));
    toast.success("Preferences updated");
  };

  const handleExportData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setExportProgress("Preparing your data export...");

      await AccountManagementService.exportUserData(
        user, 
        preferences, 
        notifications,
        (step: string) => setExportProgress(step)
      );
      
      setExportProgress("Download completed!");
      toast.success("Data export downloaded successfully!");
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || "Failed to export data. Please try again.");
    } finally {
      setLoading(false);
      setExportProgress("");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      toast.info("Deleting your account and all data...");

      await AccountManagementService.deleteUserAccount(user);

      // Service already handles sign out, so just navigate
      toast.success("Account and all data deleted successfully");
      navigate("/");
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.message || "Failed to delete account. Please contact support for assistance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentStreak={7} longestStreak={12} />

      <div className="container mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground md:hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your profile, account, security, and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your basic account information
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
                    Email cannot be changed after account creation
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={loading} variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <Button onClick={handlePasswordChange} disabled={loading} className="w-full md:w-auto">
                <Lock className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive general notifications via email
                  </p>
                </div>
                <Switch
                  checked={notifications.email_notifications}
                  onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
              <CardDescription>
                Customize your app experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={preferences.timezone} onValueChange={(value) => handlePreferenceChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select value={preferences.date_format} onValueChange={(value) => handlePreferenceChange('date_format', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Week Starts On</Label>
                  <Select value={preferences.week_start} onValueChange={(value) => handlePreferenceChange('week_start', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                      <SelectItem value="Monday">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Data & Privacy
              </CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download a comprehensive copy of all your data
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleExportData} disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? (exportProgress || "Exporting...") : "Export"}
                  </Button>
                </div>
                {dataSummary && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                        Data Export Summary
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 group hover:bg-blue-100/50 dark:hover:bg-blue-900/20 rounded-md p-2 -m-2 transition-colors">
                        <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-blue-800 dark:text-blue-200">
                          <span className="font-semibold">{dataSummary.applicationsCount}</span> Applications
                        </span>
                      </div>
                      <div className="flex items-center gap-2 group hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 rounded-md p-2 -m-2 transition-colors">
                        <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="text-emerald-800 dark:text-emerald-200">
                          <span className="font-semibold">{dataSummary.resumesCount}</span> Resumes
                        </span>
                      </div>
                      <div className="flex items-center gap-2 group hover:bg-purple-100/50 dark:hover:bg-purple-900/20 rounded-md p-2 -m-2 transition-colors">
                        <Download className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="text-purple-800 dark:text-purple-200">
                          <span className="font-semibold">{dataSummary.storageFilesCount}</span> Files
                        </span>
                      </div>
                      <div className="flex items-center gap-2 group hover:bg-amber-100/50 dark:hover:bg-amber-900/20 rounded-md p-2 -m-2 transition-colors">
                        <User className="h-4 w-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="text-amber-800 dark:text-amber-200">
                          <span className="font-semibold">Profile</span> & Settings
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Export includes: Account details, job applications, resumes, uploaded documents, preferences, and notification settings
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="font-medium text-destructive">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and remove all data
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={loading}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Delete Account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all your data from our servers and sign you out.
                          {dataSummary && (
                            <>
                              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlertTriangle className="h-4 w-4 text-destructive" />
                                  <span className="font-medium text-destructive text-sm">
                                    The following will be permanently deleted:
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-red-600" />
                                    <span className="text-destructive/80">
                                      {dataSummary.applicationsCount} job applications and documents
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-red-600" />
                                    <span className="text-destructive/80">
                                      {dataSummary.resumesCount} resumes and files
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Download className="h-4 w-4 text-red-600" />
                                    <span className="text-destructive/80">
                                      {dataSummary.storageFilesCount} uploaded files
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-red-600" />
                                    <span className="text-destructive/80">
                                      Profile, preferences, and account access
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={loading}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {loading ? "Deleting..." : "Delete Account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                {dataSummary && (
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-red-300 dark:hover:border-red-700">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 animate-pulse" />
                      <span className="font-medium text-red-900 dark:text-red-100 text-sm">
                        Warning: This action is irreversible
                      </span>
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Consider exporting your data first. Once deleted, all your data will be permanently removed and cannot be recovered.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;

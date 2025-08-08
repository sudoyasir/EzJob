import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { StreakDisplay } from "@/components/ui/streak-display";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Settings, LogOut, User, FileText, BarChart3, Flame, TrendingUp, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

interface NavbarProps {
  currentStreak?: number;
  longestStreak?: number;
  showStreak?: boolean;
}

export const Navbar = ({ 
  currentStreak = 7, 
  longestStreak = 12, 
  showStreak = true 
}: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    }
  };

  const isCurrentPage = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-8 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 lg:space-x-6">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain" 
                alt="EzJob Logo"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xl sm:text-2xl font-bold text-primary">
                EzJob
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-foreground hover:bg-accent hover:text-accent-foreground ${
                  isCurrentPage("/dashboard") ? "bg-accent text-accent-foreground" : ""
                }`}
                onClick={() => handleNavigation("/dashboard")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-foreground hover:bg-accent hover:text-accent-foreground ${
                  isCurrentPage("/resumes") ? "bg-accent text-accent-foreground" : ""
                }`}
                onClick={() => handleNavigation("/resumes")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Resumes
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-foreground hover:bg-accent hover:text-accent-foreground ${
                  isCurrentPage("/analytics") ? "bg-accent text-accent-foreground" : ""
                }`}
                onClick={() => handleNavigation("/analytics")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden p-2"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  <Button
                    variant={isCurrentPage("/dashboard") ? "default" : "ghost"}
                    className="justify-start w-full"
                    onClick={() => handleNavigation("/dashboard")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant={isCurrentPage("/resumes") ? "default" : "ghost"}
                    className="justify-start w-full"
                    onClick={() => handleNavigation("/resumes")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Resumes
                  </Button>
                  <Button
                    variant={isCurrentPage("/analytics") ? "default" : "ghost"}
                    className="justify-start w-full"
                    onClick={() => handleNavigation("/analytics")}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start w-full"
                    onClick={() => handleNavigation("/settings")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Streak Display - Hidden on small screens */}
            {showStreak && (
              <div className="hidden sm:block">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center space-x-1.5 px-2 py-1.5 hover:bg-accent/30 transition-all duration-200 group border-0 bg-transparent"
                    >
                      <Flame className="h-4 w-4 text-orange-500 group-hover:text-orange-400 transition-colors" />
                      <span className="text-sm font-semibold text-foreground group-hover:text-accent-foreground">
                        {currentStreak}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end" side="bottom">
                    <StreakDisplay 
                      currentStreak={currentStreak} 
                      longestStreak={longestStreak} 
                      variant="full"
                      showWeekly={true}
                      className="border-0 shadow-none"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:outline-none hover:bg-accent [&:focus]:outline-none [&:focus-visible]:outline-none [&:focus]:ring-0 [&:focus-visible]:ring-0 outline-none border-none shadow-none"
                  style={{ boxShadow: 'none', outline: 'none' }}
                >
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage 
                      src={user?.user_metadata?.avatar_url} 
                      alt={user?.user_metadata?.full_name || user?.email || "User"} 
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
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
                    onClick={() => handleNavigation('/settings')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Settings
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
  );
};

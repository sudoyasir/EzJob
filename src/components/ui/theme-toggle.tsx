import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'light') {
      return <Sun className="h-4 w-4" />;
    } else {
      return <Moon className="h-4 w-4" />;
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-9 w-9 px-0" 
      onClick={toggleTheme}
      title={`Current theme: ${theme}. Click to toggle theme.`}
    >
      {getIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

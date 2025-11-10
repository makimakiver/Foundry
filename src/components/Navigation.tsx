import { Rocket, Moon, Sun } from "lucide-react";
import buidIcon from "../assets/buid_icon.png";
import foundryLogo from "../assets/foundry3.png";
import { WalletButton } from "./WalletButton";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./ui/button";

type Page = "projects" | "launch" | "stats" | "profile";

interface NavigationProps {
  onNavigate: (page: Page) => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => onNavigate("projects")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src={buidIcon}
              alt="BUID logo"
              className="w-10 h-10 md:w-15 md:h-15 lg:w-15 lg:h-15 rounded-md object-contain"
              style={{ filter: isDark ? 'invert(1)' : 'none' }}
            />
            <img
              src={foundryLogo}
              alt="Foundry³ logo"
              className="h-7 md:h-7 lg:h-8 w-auto object-contain"
              style={{ filter: isDark ? 'invert(1)' : 'none' }}
            />
          </button>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => onNavigate("projects")}
              className="text-[16px] font-semibold text-muted-foreground hover:text-foreground transition-colors tracking-[-0.3125px]"
            >
              Projects
            </button>
            <button 
              onClick={() => onNavigate("stats")}
              className="text-[16px] font-semibold text-muted-foreground hover:text-foreground transition-colors tracking-[-0.3125px]"
            >
              My Projects
            </button>
            <button 
              onClick={() => onNavigate("profile")}
              className="text-[16px] font-semibold text-muted-foreground hover:text-foreground transition-colors tracking-[-0.3125px]"
            >
              Profile
            </button>
            <button 
              onClick={() => onNavigate("launch")}
              className="text-[16px] font-semibold text-muted-foreground hover:text-foreground transition-colors tracking-[-0.3125px]"
            >
              Launch Project
            </button>
            <a 
              href="#about" 
              className="text-[16px] font-semibold text-muted-foreground hover:text-foreground transition-colors tracking-[-0.3125px]"
            >
              About
            </a>
          </div>
          
          {/* Theme Toggle & Wallet Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9 hover:bg-card transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </Button>
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

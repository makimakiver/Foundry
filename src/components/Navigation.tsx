import { Rocket, Moon, Sun } from "lucide-react";
import { WalletButton } from "./WalletButton";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./ui/button";

type Page = "projects" | "launch" | "stats";

interface NavigationProps {
  isConnected: boolean;
  walletAddress: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onNavigate: (page: Page) => void;
}

export function Navigation({ isConnected, walletAddress, onConnect, onDisconnect, onNavigate }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => onNavigate("projects")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-br from-[#00E0FF] via-[#C04BFF] to-[#FF6B00] p-2 rounded-lg">
              <Rocket className="w-5 h-5 text-white dark:text-[#0D0E10]" />
            </div>
            <span className="text-xl text-foreground">Foundry³</span>
          </button>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => onNavigate("projects")}
              className="text-[16px] text-muted-foreground hover:text-foreground transition-colors tracking-[-0.3125px]"
            >
              Projects
            </button>
            <button 
              onClick={() => onNavigate("stats")}
              className="text-[16px] text-muted-foreground hover:text-foreground transition-colors tracking-[-0.3125px]"
            >
              My Projects
            </button>
            <button 
              onClick={() => onNavigate("launch")}
              className="text-[16px] text-muted-foreground hover:text-foreground transition-colors tracking-[-0.3125px]"
            >
              Launch Project
            </button>
            <a 
              href="#about" 
              className="text-[16px] text-muted-foreground hover:text-foreground transition-colors tracking-[-0.3125px]"
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
            <WalletButton
              isConnected={isConnected}
              walletAddress={walletAddress}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

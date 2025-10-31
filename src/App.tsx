import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { ProjectsPage } from "./components/ProjectsPage";
import { LaunchProjectPage } from "./components/LaunchProjectPage";
import { StatsPage } from "./components/StatsPage";
import { ProjectDetailsPage } from "./components/ProjectDetailsPage";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import { WalletProvider, useWallet } from "./contexts/WalletContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { toast } from "sonner@2.0.3";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { alliance } from '../fonts';
type Page = "projects" | "launch" | "stats" | "project-details";

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  fundingGoal: number;
  currentFunding: number;
  backers: number;
  daysLeft: number;
  status: "live" | "upcoming" | "funded";
  detailsBlobId?: string;
  details?: any;
}

function AppContent() {
  const { isConnected, walletAddress, connect, disconnect } = useWallet();
  const [currentPage, setCurrentPage] = useState<Page>("projects");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const currentAccount = useCurrentAccount();
  const navigateToLaunch = () => {
    if (!currentAccount) {
      toast.error("Please connect your wallet to launch a project");
      return;
    }
    setCurrentPage("launch");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentPage("project-details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setCurrentPage("projects");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navigation 
        isConnected={isConnected}
        walletAddress={walletAddress}
        onConnect={connect}
        onDisconnect={disconnect}
        onNavigate={setCurrentPage}
      />
      
      <main>
        {currentPage === "projects" && (
          <ProjectsPage 
            onLaunchProject={navigateToLaunch}
            onViewProject={handleViewProject}
          />
        )}
        {currentPage === "stats" && (
          <StatsPage />
        )}
        {currentPage === "project-details" && selectedProject && (
          <ProjectDetailsPage 
            project={selectedProject}
            onBack={handleBackToProjects}
          />
        )}
        {currentPage === "launch" && (
          <LaunchProjectPage 
            onProjectSubmitted={() => {
              setCurrentPage("projects");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }} 
          />
        )}
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </ThemeProvider>
  );
}

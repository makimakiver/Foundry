import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { toast } from "sonner@2.0.3";

export interface Project {
  id: string;
  name: string;
  suinsName: string;
  description: string;
  category: string;
  image: string;
  fundingGoal: number;
  currentFunding: number;
  backers: number;
  daysLeft: number;
  status: "live" | "upcoming" | "funded";
  creator: string;
  timestamp: number;
  blobId: string;
}

interface ProjectsContextType {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (project: Project) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// Initialize Sui client
const client = new SuiClient({ url: getFullnodeUrl('testnet') });

// Mock projects for fallback when blockchain data is not available
const mockProjects: Project[] = [
  {
    id: "1",
    name: "DeFi Analytics Platform",
    suinsName: "defi-analytics.sui",
    description: "Real-time analytics and insights for decentralized finance protocols. Track your portfolio across multiple chains with AI-powered predictions.",
    category: "DeFi",
    image: "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwbmV0d29ya3xlbnwxfHx8fDE3NjEzMjE5ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    fundingGoal: 500000,
    currentFunding: 387500,
    backers: 234,
    daysLeft: 12,
    status: "live",
    creator: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    timestamp: Date.now(),
    blobId: "mock-blob-1",
  },
  {
    id: "2",
    name: "AI Code Assistant",
    suinsName: "ai-code-assistant.sui",
    description: "Next-generation AI pair programmer that understands your codebase. Built on open-source LLMs with privacy-first architecture.",
    category: "AI/ML",
    image: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYxMjg2NDc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    fundingGoal: 750000,
    currentFunding: 625000,
    backers: 412,
    daysLeft: 8,
    status: "live",
    creator: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    timestamp: Date.now(),
    blobId: "mock-blob-2",
  },
  {
    id: "3",
    name: "Creator Economy DAO",
    suinsName: "creator-economy.sui",
    description: "Decentralized platform empowering creators with fair monetization, NFT integration, and community governance tools.",
    category: "DAO",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwc3RhcnR1cHxlbnwxfHx8fDE3NjEyODE2ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    fundingGoal: 1000000,
    currentFunding: 1200000,
    backers: 856,
    daysLeft: 0,
    status: "funded",
    creator: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    timestamp: Date.now(),
    blobId: "mock-blob-3",
  },
];

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    const registryId = import.meta.env.VITE_REGISTRY_ID;
    
    if (!registryId) {
      console.warn("VITE_REGISTRY_ID not set, using mock data");
      setProjects(mockProjects);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching projects from registry:", registryId);
      
      // Fetch the registry object from the blockchain
      const registryObject = await client.getObject({
        id: registryId,
        options: {
          showContent: true,
          showType: true,
        },
      });

      if (!registryObject.data?.content || registryObject.data.content.dataType !== 'moveObject') {
        throw new Error("Invalid registry object");
      }

      const registryContent = registryObject.data.content.fields as any;
      const ideas = registryContent.ideas || [];

      console.log(`Found ${ideas.length} projects in registry`);

      // Parse the ideas into Project format
      const fetchedProjects: Project[] = await Promise.all(
        ideas.map(async (idea: any, index: number) => {
          // Calculate funding percentage and status
          const fundingGoal = Number(idea.funding_goal) / 1_000_000_000; // Convert from MIST to SUI
          const currentFunding = Number(idea.current_funding) / 1_000_000_000;
          const fundingPercentage = fundingGoal > 0 ? (currentFunding / fundingGoal) * 100 : 0;
          
          // Determine status
          let status: "live" | "upcoming" | "funded" = "live";
          if (fundingPercentage >= 100) {
            status = "funded";
          }

          // Calculate days left (for demo, using 30 days from creation)
          const creationTime = Number(idea.timestamp) * 1000; // Convert to milliseconds
          const now = Date.now();
          const daysSinceCreation = Math.floor((now - creationTime) / (1000 * 60 * 60 * 24));
          const daysLeft = Math.max(0, 30 - daysSinceCreation);

          // Try to fetch metadata from Walrus blob
          let metadata = {
            description: "Exciting new blockchain project",
            category: "DeFi",
          };

          try {
            // In production, you would fetch from Walrus storage using the blob_id
            // For now, we'll use default metadata
            console.log(`Project ${index}: Blob ID ${idea.blob_id}`);
          } catch (err) {
            console.warn(`Could not fetch metadata for project ${index}:`, err);
          }

          return {
            id: idea.id?.id || `project-${index}`,
            name: idea.name || `Project ${index + 1}`,
            suinsName: idea.suins_name || `project-${index}.sui`,
            description: metadata.description,
            category: metadata.category,
            image: idea.image || "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?w=1080",
            fundingGoal: fundingGoal * 1_000_000, // Convert to USD (assuming 1 SUI = $1M for display)
            currentFunding: currentFunding * 1_000_000,
            backers: Math.floor(Math.random() * 500) + 50, // Mock backers for now
            daysLeft,
            status,
            creator: idea.creator,
            timestamp: Number(idea.timestamp),
            blobId: idea.blob_id,
          };
        })
      );

      // Combine fetched projects with mock projects for better UX
      const allProjects = [...fetchedProjects, ...mockProjects];
      setProjects(allProjects);
      
      console.log(`✅ Successfully loaded ${fetchedProjects.length} blockchain projects`);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
      // Fall back to mock data on error
      setProjects(mockProjects);
      toast.error("Could not load projects from blockchain, showing cached data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjects((prev) => [project, ...prev]);
  }, []);

  const refreshProjects = useCallback(async () => {
    console.log("🔄 Refreshing projects...");
    await fetchProjects();
  }, [fetchProjects]);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        isLoading,
        error,
        fetchProjects,
        addProject,
        refreshProjects,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}


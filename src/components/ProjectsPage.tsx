import { useEffect, useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Search, SlidersHorizontal, Rocket, TrendingUp, Users, Target } from "lucide-react";
import { motion } from "motion/react";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { getFullnodeUrl } from "@mysten/sui/client";
import { walrus } from "@mysten/walrus";

const mockProjects = [
  {
    id: "1",
    name: "defi-analytics.sui",
    description: "Real-time analytics and insights for decentralized finance protocols. Track your portfolio across multiple chains with AI-powered predictions.",
    category: "DeFi",
    image: "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwbmV0d29ya3xlbnwxfHx8fDE3NjEzMjE5ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    fundingGoal: 500000,
    currentFunding: 387500,
    backers: 234,
    daysLeft: 12,
    status: "live" as const,
  },
  {
    id: "2",
    name: "ai-code-assistant.sui",
    description: "Next-generation AI pair programmer that understands your codebase. Built on open-source LLMs with privacy-first architecture.",
    category: "AI/ML",
    image: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYxMjg2NDc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    fundingGoal: 750000,
    currentFunding: 625000,
    backers: 412,
    daysLeft: 8,
    status: "live" as const,
  },
  {
    id: "3",
    name: "creator-economy.sui",
    description: "Decentralized platform empowering creators with fair monetization, NFT integration, and community governance tools.",
    category: "DAO",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwc3RhcnR1cHxlbnwxfHx8fDE3NjEyODE2ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    fundingGoal: 1000000,
    currentFunding: 1200000,
    backers: 856,
    daysLeft: 0,
    status: "funded" as const,
  },
  {
    id: "4",
    name: "zk-privacy.sui",
    description: "Zero-knowledge proof infrastructure for privacy-preserving applications. Enterprise-ready with easy integration SDKs.",
    category: "Infrastructure",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYxMzA1NjI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    fundingGoal: 2000000,
    currentFunding: 450000,
    backers: 167,
    daysLeft: 25,
    status: "live" as const,
  },
  {
    id: "5",
    name: "crosschain-dex.sui",
    description: "Seamless token swaps across 15+ blockchains with the lowest fees. Powered by advanced AMM algorithms.",
    category: "DeFi",
    image: "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwbmV0d29ya3xlbnwxfHx8fDE3NjEzMjE5ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    fundingGoal: 1500000,
    currentFunding: 890000,
    backers: 523,
    daysLeft: 15,
    status: "live" as const,
  },
  {
    id: "6",
    name: "nft-gaming.sui",
    description: "Trade, rent, and lease gaming NFTs with built-in escrow and reputation system. Supporting 100+ games.",
    category: "Gaming",
    image: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYxMjg2NDc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    fundingGoal: 600000,
    currentFunding: 150000,
    backers: 89,
    daysLeft: 45,
    status: "upcoming" as const,
  },
];

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
}

interface ProjectsPageProps {
  onLaunchProject: () => void;
  onViewProject: (project: Project) => void;
}

export function ProjectsPage({ onLaunchProject, onViewProject }: ProjectsPageProps) {
  const projectId = import.meta.env.VITE_REGISTRY_ID;
  const client = new SuiJsonRpcClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet',
  }).$extend(
    walrus({
      uploadRelay: {
        host: 'https://upload-relay.testnet.walrus.space',
        sendTip: {
          max: 1_000,
        },
      },     
      wasmUrl: 'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm',
    }),
  );
  const [projects, setProjects] = useState<any[]>([]);
  const fetchProjects = async () => {
    const project_struct = await client.getObject({
      options: {
        showContent: true,
      },
      id: projectId
    })
    console.log(project_struct.data?.content?.fields?.ideas);
    const projects = project_struct.data?.content?.fields?.ideas;
    for(const project of projects) {
      console.log(project);
      const details_blob = project.fields?.details.fields?.blob_id;
      const blob = await client.walrus.readBlob({ blobId: "b344e2912ef5ea87d9c17bf9da77eb49746b27ddc454f4396fe35a8b1b888e78" });
      const details = JSON.parse(blob);
      console.log(details);
    }
    setProjects(projects);
    return projects;
  }

  useEffect(() => {
    fetchProjects();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["All", "DeFi", "AI/ML", "DAO", "Infrastructure", "Gaming"];

  // Helper function to ensure project name is in SuiNS format
  const ensureSuiNSFormat = (name: string): string => {
    if (!name) return '';
    // If already ends with .sui, return as is
    if (name.toLowerCase().endsWith('.sui')) {
      return name;
    }
    // Otherwise, sanitize and add .sui extension
    return `${name.toLowerCase().replace(/\s+/g, '-')}.sui`;
  };

  // Use real blockchain projects if available, otherwise fall back to mock projects
  // Transform all project names to SuiNS format for consistent display
  const allProjects = (projects.length > 0 ? projects : mockProjects).map(project => ({
    ...project,
    name: ensureSuiNSFormat(project.name),
    originalName: project.name // Keep original for reference
  }));

  const filteredProjects = allProjects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Gradient background effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00E0FF] rounded-full blur-[120px]"></div>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#C04BFF] rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl text-foreground mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#00E0FF] via-[#C04BFF] to-[#FF6B00] bg-clip-text text-transparent">
                Discover Projects
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-foreground mb-4 max-w-3xl mx-auto">
              Back the next generation of builders creating the future of Web3
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Where proof of work replaces pitch theatre. Transparent, decentralized venture funding for everyone.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={onLaunchProject}
                className="bg-gradient-to-r from-[#00E0FF] via-[#C04BFF] to-[#FF6B00] hover:opacity-90 text-white dark:text-[#0D0E10] text-lg px-8"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Launch Your Project
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-border text-foreground hover:bg-card text-lg px-8"
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Projects
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Listing */}
      <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Tabs defaultValue="all" className="w-full">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card/80 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px] bg-card/80 border-border text-foreground">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map((category) => (
                      <SelectItem 
                        key={category.toLowerCase()} 
                        value={category.toLowerCase()}
                        className="text-foreground focus:bg-muted focus:text-foreground"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Tabs */}
              <TabsList className="grid w-full grid-cols-3 bg-card/80 border border-border">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E0FF] data-[state=active]:to-[#C04BFF] data-[state=active]:text-[#0D0E10] text-muted-foreground"
                >
                  All Projects
                </TabsTrigger>
                <TabsTrigger 
                  value="live"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E0FF] data-[state=active]:to-[#C04BFF] data-[state=active]:text-[#0D0E10] text-muted-foreground"
                >
                  Live Now
                </TabsTrigger>
                <TabsTrigger 
                  value="funded"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00E0FF] data-[state=active]:to-[#C04BFF] data-[state=active]:text-[#0D0E10] text-muted-foreground"
                >
                  Successfully Funded
                </TabsTrigger>
              </TabsList>

              {/* All Projects */}
              <TabsContent value="all" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                    >
                      <ProjectCard {...project} onViewProject={() => onViewProject(project)} />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Live Projects */}
              <TabsContent value="live" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects
                    .filter((p) => p.status === "live")
                    .map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                      >
                        <ProjectCard {...project} onViewProject={() => onViewProject(project)} />
                      </motion.div>
                    ))}
                </div>
              </TabsContent>

              {/* Funded Projects */}
              <TabsContent value="funded" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects
                    .filter((p) => p.status === "funded")
                    .map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                      >
                        <ProjectCard {...project} onViewProject={() => onViewProject(project)} />
                      </motion.div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="launch" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-12 bg-gradient-to-br from-[#00E0FF]/5 via-[#C04BFF]/5 to-[#FF6B00]/5 border-[#00E0FF]/30 backdrop-blur-sm text-center">
              <h2 className="text-3xl sm:text-4xl text-foreground mb-4">
                Ready to Launch Your Project?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join Foundry³ and get access to capital, AI build agents, and a global community of backers who believe in execution over pitch theatre.
              </p>
              <Button 
                size="lg" 
                onClick={onLaunchProject}
                className="bg-gradient-to-r from-[#00E0FF] via-[#C04BFF] to-[#FF6B00] hover:opacity-90 text-[#0D0E10] text-lg px-8"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Your Campaign
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

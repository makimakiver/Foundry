import { useEffect, useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Search, SlidersHorizontal, Rocket, TrendingUp, Users, Target } from "lucide-react";
import { motion } from "motion/react";
import bgImage from "../assets/background4.jpeg";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { getFullnodeUrl } from "@mysten/sui/client";
import { walrus } from "@mysten/walrus";

class Project {
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

  constructor({
    id,
    name,
    description,
    category,
    image,
    fundingGoal,
    currentFunding = 0,
    backers = 0,
    daysLeft = 30,
    status = "live",
    detailsBlobId,
    details,
  }: {
    id: string;
    name: string;
    description: string;
    category: string;
    image: string;
    fundingGoal: number;
    currentFunding?: number;
    backers?: number;
    daysLeft?: number;
    status?: "live" | "upcoming" | "funded";
    detailsBlobId?: string;
    details?: any;
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category = category;
    this.image = image;
    this.fundingGoal = fundingGoal;
    this.currentFunding = currentFunding;
    this.backers = backers;
    this.daysLeft = daysLeft;
    this.status = status;
    this.detailsBlobId = detailsBlobId;
    this.details = details;
  }
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
  
  const [projects, setProjects] = useState<Project[]>([]);
  const fetchProjects = async () => {
    try {
      const project_struct = await client.getObject({
        options: { showContent: true },
        id: projectId,
      });
      const ideas: any[] = (project_struct as any)?.data?.content?.fields?.ideas ?? [];
      const parsed: Project[] = [];
      if (Array.isArray(ideas)) {
        for (let i = 0; i < ideas.length; i++) {
          const idea = ideas[i];
          const idea_struct = await client.getObject({
            options: { showContent: true },
            id: idea,
          });
          const idea_struct_fields: any[] = (idea_struct as any)?.data?.content?.fields ?? idea_struct;
          console.log(idea_struct_fields);
          const f = idea_struct.data;
          // Try to fetch details blob (optional)
          console.log('project_id: ', f?.id);
          const p = new Project({
            id: String(f?.id?.id ?? f?.uid ?? `${projectId}-${i}`),
            name: String(f?.title ?? ''),
            description: String(''),
            category: String(f?.category ?? 'DeFi'),
            image: String(f?.image ?? ''),
            fundingGoal: Number(f?.fundingGoal ?? f?.funding_goal ?? 0),
            currentFunding: 0,
            backers: 0,
            daysLeft: 30,
            status: 'live',
            detailsBlobId: String(f?.blob_id ?? ''),
          });
          parsed.push(p);
        }
      }
      setProjects(parsed);
      return parsed;
    } catch (e) {
      console.error('Failed to fetch projects', e);
      setProjects([]);
      return [];
    }
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

  // Transform all project names to SuiNS format for consistent display
  const allProjects = projects.map(project => ({
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
        {/* Banner background image */}
        <img
          src={bgImage}
          alt="Banner background"
          className="absolute top-0 left-0 right-0 bottom-0 w-70 h-70 object-cover origin-center scale-80 sm:scale-90 lg:scale-90"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl text-foreground mb-6 leading-tight font-alliance-no2-bold">
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

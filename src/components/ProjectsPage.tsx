import { useState, useEffect } from "react";
import { ProjectCard } from "./ProjectCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Search, SlidersHorizontal, Rocket, TrendingUp, Users, Target, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useProjects } from "../contexts/ProjectsContext";

interface Project {
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
}

interface ProjectsPageProps {
  onLaunchProject: () => void;
  onViewProject: (project: Project) => void;
}

export function ProjectsPage({ onLaunchProject, onViewProject }: ProjectsPageProps) {
  const { projects, isLoading, fetchProjects } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const categories = ["All", "DeFi", "AI/ML", "DAO", "Infrastructure", "Gaming", "NFT", "Social", "Developer Tools"];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.suinsName.toLowerCase().includes(searchQuery.toLowerCase());
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#00E0FF] animate-spin" />
                    <span className="ml-3 text-muted-foreground">Loading projects from blockchain...</span>
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground text-lg">No projects found matching your criteria</p>
                    <Button 
                      onClick={onLaunchProject}
                      className="mt-6 bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Launch First Project
                    </Button>
                  </div>
                ) : (
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
                )}
              </TabsContent>

              {/* Live Projects */}
              <TabsContent value="live" className="mt-8">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#00E0FF] animate-spin" />
                    <span className="ml-3 text-muted-foreground">Loading projects...</span>
                  </div>
                ) : (
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
                )}
              </TabsContent>

              {/* Funded Projects */}
              <TabsContent value="funded" className="mt-8">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#00E0FF] animate-spin" />
                    <span className="ml-3 text-muted-foreground">Loading projects...</span>
                  </div>
                ) : (
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
                )}
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

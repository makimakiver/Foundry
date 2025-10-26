import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "motion/react";
import {
  Briefcase,
  DollarSign,
  Clock,
  Users,
  Filter,
  Plus,
  Code,
  Palette,
  FileText,
  Megaphone,
  Target,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Zap,
  Wallet,
  Search,
  TrendingUp,
  Twitter,
  Github,
  MessageCircle,
  Globe
} from "lucide-react";
import { toast } from "sonner@2.0.3";

// Mock data for job requests
const jobRequests = [
  {
    id: 1,
    title: "Smart Contract Audit for DeFi Protocol",
    description: "Need experienced Solidity developer to audit our lending protocol smart contracts. Looking for comprehensive security review and gas optimization suggestions.",
    project: "defi-analytics.sui",
    projectId: 1,
    category: "Development",
    budget: 5000,
    deadline: "2024-07-15",
    skills: ["Solidity", "Security", "Smart Contracts"],
    status: "Open",
    applicants: 12,
    postedBy: "Sarah Chen",
    postedDate: "2024-06-20",
    priority: "High"
  },
  {
    id: 2,
    title: "UI/UX Design for Mobile App",
    description: "Design a modern, intuitive interface for our AI code assistant mobile application. Need Figma files and design system documentation.",
    project: "ai-code-assistant.sui",
    projectId: 2,
    category: "Design",
    budget: 3500,
    deadline: "2024-07-10",
    skills: ["Figma", "UI/UX", "Mobile Design"],
    status: "Open",
    applicants: 8,
    postedBy: "Alex Kumar",
    postedDate: "2024-06-18",
    priority: "Medium"
  },
  {
    id: 3,
    title: "Technical Documentation Writer",
    description: "Create comprehensive documentation for our API including guides, tutorials, and reference materials. Experience with developer docs required.",
    project: "creator-economy.sui",
    projectId: 3,
    category: "Content",
    budget: 2000,
    deadline: "2024-07-20",
    skills: ["Technical Writing", "API Documentation", "Markdown"],
    status: "In Progress",
    applicants: 15,
    postedBy: "Maria Garcia",
    postedDate: "2024-06-15",
    priority: "Low"
  },
  {
    id: 4,
    title: "Community Manager for Discord",
    description: "Manage our Discord community, engage with members, organize events, and moderate discussions. Part-time position, 20 hours/week.",
    project: "zk-privacy.sui",
    projectId: 4,
    category: "Marketing",
    budget: 1500,
    deadline: "2024-07-05",
    skills: ["Community Management", "Discord", "Social Media"],
    status: "Open",
    applicants: 24,
    postedBy: "David Park",
    postedDate: "2024-06-22",
    priority: "High"
  },
  {
    id: 5,
    title: "Frontend Developer - React & Web3",
    description: "Build responsive frontend components with React and integrate Web3 wallet functionality. Experience with ethers.js or wagmi required.",
    project: "defi-analytics.sui",
    projectId: 1,
    category: "Development",
    budget: 4500,
    deadline: "2024-07-25",
    skills: ["React", "Web3", "TypeScript"],
    status: "Open",
    applicants: 18,
    postedBy: "Sarah Chen",
    postedDate: "2024-06-19",
    priority: "Medium"
  },
  {
    id: 6,
    title: "Marketing Video Production",
    description: "Create a 90-second promotional video showcasing our platform features. Need scriptwriting, animation, and voiceover.",
    project: "ai-code-assistant.sui",
    projectId: 2,
    category: "Marketing",
    budget: 2500,
    deadline: "2024-07-12",
    skills: ["Video Editing", "Animation", "Marketing"],
    status: "Completed",
    applicants: 6,
    postedBy: "Alex Kumar",
    postedDate: "2024-06-10",
    priority: "Low"
  }
];

const categories = [
  { value: "all", label: "All Categories", icon: Briefcase },
  { value: "Development", label: "Development", icon: Code },
  { value: "Design", label: "Design", icon: Palette },
  { value: "Content", label: "Content", icon: FileText },
  { value: "Marketing", label: "Marketing", icon: Megaphone }
];

interface JobRequest {
  title: string;
  description: string;
  category: string;
  budget: string;
  deadline: string;
  skills: string;
  project: string;
}

export function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isWalletConnected] = useState(true); // Mock wallet connection
  
  const [newRequest, setNewRequest] = useState<JobRequest>({
    title: "",
    description: "",
    category: "",
    budget: "",
    deadline: "",
    skills: "",
    project: ""
  });

  // Filter jobs
  const filteredJobs = jobRequests.filter(job => {
    const matchesCategory = selectedCategory === "all" || job.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || job.status === selectedStatus;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.project.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleCreateRequest = () => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet to create a job request");
      return;
    }

    if (!newRequest.title || !newRequest.description || !newRequest.category || !newRequest.budget) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.loading("Creating job request...");
    
    setTimeout(() => {
      toast.dismiss();
      toast.success("Job request created successfully!");
      setShowCreateDialog(false);
      setNewRequest({
        title: "",
        description: "",
        category: "",
        budget: "",
        deadline: "",
        skills: "",
        project: ""
      });
    }, 1500);
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    const IconComponent = categoryData?.icon || Briefcase;
    return <IconComponent className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3]/30";
      case "In Progress":
        return "bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30";
      case "Completed":
        return "bg-[#A0A2A8]/20 text-[#A0A2A8] border-[#A0A2A8]/30";
      default:
        return "bg-[#E8E9EB]/20 text-[#E8E9EB] border-[#E8E9EB]/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-[#FF6B00]";
      case "Medium":
        return "text-[#00E0FF]";
      case "Low":
        return "text-[#A0A2A8]";
      default:
        return "text-[#E8E9EB]";
    }
  };

  // Calculate stats
  const totalJobs = jobRequests.length;
  const openJobs = jobRequests.filter(j => j.status === "Open").length;
  const totalBudget = jobRequests.reduce((sum, j) => sum + j.budget, 0);
  const avgBudget = totalBudget / totalJobs;

  return (
    <div className="min-h-screen bg-[#0D0E10] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl sm:text-5xl text-[#E8E9EB] mb-4">
                Job Requests
              </h1>
              <p className="text-xl text-[#A0A2A8]">
                Browse opportunities from funded projects or post your own requests
              </p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
            >
              <Plus className="w-5 h-5 mr-2" />
              Post Request
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-6 bg-[#1E1F24]/80 border-[#E8E9EB]/10 backdrop-blur-sm hover:border-[#00E0FF]/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <Briefcase className="w-8 h-8 text-[#00E0FF]" />
              </div>
              <div className="text-3xl text-[#E8E9EB] mb-1">{totalJobs}</div>
              <div className="text-[#A0A2A8] text-sm">Total Requests</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 bg-[#1E1F24]/80 border-[#E8E9EB]/10 backdrop-blur-sm hover:border-[#00FFA3]/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-[#00FFA3]" />
              </div>
              <div className="text-3xl text-[#E8E9EB] mb-1">{openJobs}</div>
              <div className="text-[#A0A2A8] text-sm">Open Positions</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6 bg-[#1E1F24]/80 border-[#E8E9EB]/10 backdrop-blur-sm hover:border-[#C04BFF]/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-[#C04BFF]" />
              </div>
              <div className="text-3xl text-[#E8E9EB] mb-1">
                ${(totalBudget / 1000).toFixed(0)}k
              </div>
              <div className="text-[#A0A2A8] text-sm">Total Budget</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6 bg-[#1E1F24]/80 border-[#E8E9EB]/10 backdrop-blur-sm hover:border-[#FF6B00]/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-[#FF6B00]" />
              </div>
              <div className="text-3xl text-[#E8E9EB] mb-1">
                ${(avgBudget / 1000).toFixed(1)}k
              </div>
              <div className="text-[#A0A2A8] text-sm">Average Budget</div>
            </Card>
          </motion.div>
        </div>

        {/* Social Links Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <Card className="p-6 bg-[#1E1F24]/80 border-[#E8E9EB]/10 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl text-[#E8E9EB] mb-2">Need Help or Have Questions?</h3>
                <p className="text-[#A0A2A8]">Connect with our community across multiple platforms</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="https://twitter.com/foundry3"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg bg-[#0D0E10]/50 border border-[#E8E9EB]/10 hover:border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/5 transition-all group"
              >
                <div className="p-3 rounded-lg bg-[#1DA1F2]/10 group-hover:bg-[#1DA1F2]/20 transition-all">
                  <Twitter className="w-6 h-6 text-[#1DA1F2]" />
                </div>
                <div>
                  <p className="text-[#E8E9EB] mb-1">Twitter</p>
                  <p className="text-sm text-[#A0A2A8]">Latest updates</p>
                </div>
              </a>

              <a
                href="https://github.com/foundry3"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg bg-[#0D0E10]/50 border border-[#E8E9EB]/10 hover:border-[#C04BFF]/30 hover:bg-[#C04BFF]/5 transition-all group"
              >
                <div className="p-3 rounded-lg bg-[#C04BFF]/10 group-hover:bg-[#C04BFF]/20 transition-all">
                  <Github className="w-6 h-6 text-[#C04BFF]" />
                </div>
                <div>
                  <p className="text-[#E8E9EB] mb-1">GitHub</p>
                  <p className="text-sm text-[#A0A2A8]">Open source</p>
                </div>
              </a>

              <a
                href="https://discord.gg/foundry3"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg bg-[#0D0E10]/50 border border-[#E8E9EB]/10 hover:border-[#5865F2]/30 hover:bg-[#5865F2]/5 transition-all group"
              >
                <div className="p-3 rounded-lg bg-[#5865F2]/10 group-hover:bg-[#5865F2]/20 transition-all">
                  <MessageCircle className="w-6 h-6 text-[#5865F2]" />
                </div>
                <div>
                  <p className="text-[#E8E9EB] mb-1">Discord</p>
                  <p className="text-sm text-[#A0A2A8]">Community chat</p>
                </div>
              </a>

              <a
                href="https://foundry3.io/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg bg-[#0D0E10]/50 border border-[#E8E9EB]/10 hover:border-[#00E0FF]/30 hover:bg-[#00E0FF]/5 transition-all group"
              >
                <div className="p-3 rounded-lg bg-[#00E0FF]/10 group-hover:bg-[#00E0FF]/20 transition-all">
                  <Globe className="w-6 h-6 text-[#00E0FF]" />
                </div>
                <div>
                  <p className="text-[#E8E9EB] mb-1">Documentation</p>
                  <p className="text-sm text-[#A0A2A8]">Learn more</p>
                </div>
              </a>
            </div>
          </Card>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <Card className="p-6 bg-[#1E1F24]/80 border-[#E8E9EB]/10 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A2A8]" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8]"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1F24] border-[#E8E9EB]/20">
                  {categories.map((category) => (
                    <SelectItem 
                      key={category.value} 
                      value={category.value}
                      className="text-[#E8E9EB] focus:bg-[#00E0FF]/10 focus:text-[#00E0FF]"
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1F24] border-[#E8E9EB]/20">
                  <SelectItem value="all" className="text-[#E8E9EB] focus:bg-[#00E0FF]/10 focus:text-[#00E0FF]">
                    All Statuses
                  </SelectItem>
                  <SelectItem value="Open" className="text-[#E8E9EB] focus:bg-[#00E0FF]/10 focus:text-[#00E0FF]">
                    Open
                  </SelectItem>
                  <SelectItem value="In Progress" className="text-[#E8E9EB] focus:bg-[#00E0FF]/10 focus:text-[#00E0FF]">
                    In Progress
                  </SelectItem>
                  <SelectItem value="Completed" className="text-[#E8E9EB] focus:bg-[#00E0FF]/10 focus:text-[#00E0FF]">
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </motion.div>

        {/* Job Requests List */}
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="p-6 bg-[#1E1F24]/80 border-[#E8E9EB]/10 backdrop-blur-sm hover:border-[#00E0FF]/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl text-[#E8E9EB]">{job.title}</h3>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <Badge className="bg-[#C04BFF]/20 text-[#C04BFF] border-[#C04BFF]/30">
                        <span className="mr-1">{getCategoryIcon(job.category)}</span>
                        {job.category}
                      </Badge>
                    </div>
                    <p className="text-[#A0A2A8] mb-3 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[#A0A2A8]">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.project}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job.applicants} applicants
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Due {new Date(job.deadline).toLocaleDateString()}
                      </div>
                      <div className={`flex items-center gap-1 ${getPriorityColor(job.priority)}`}>
                        <Zap className="w-4 h-4" />
                        {job.priority} Priority
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {job.skills.map((skill, idx) => (
                        <Badge 
                          key={idx}
                          className="bg-[#0D0E10] text-[#E8E9EB] border-[#E8E9EB]/20"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-2xl text-[#00E0FF] mb-1">
                      ${job.budget.toLocaleString()}
                    </div>
                    <div className="text-sm text-[#A0A2A8] mb-4">Budget</div>
                    {job.status === "Open" && (
                      <Button className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]">
                        Apply Now
                      </Button>
                    )}
                    {job.status === "Completed" && (
                      <div className="flex items-center gap-2 text-[#00FFA3]">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-[#E8E9EB]/10 flex items-center justify-between text-sm">
                  <div className="text-[#A0A2A8]">
                    Posted by <span className="text-[#E8E9EB]">{job.postedBy}</span> on {new Date(job.postedDate).toLocaleDateString()}
                  </div>
                  <Button variant="outline" className="border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#0D0E10]">
                    View Details
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <Card className="p-12 bg-[#1E1F24]/80 border-[#E8E9EB]/10 backdrop-blur-sm text-center">
            <AlertCircle className="w-16 h-16 text-[#A0A2A8] mx-auto mb-4" />
            <h3 className="text-2xl text-[#E8E9EB] mb-2">No Requests Found</h3>
            <p className="text-[#A0A2A8] mb-6">
              Try adjusting your filters or create a new job request
            </p>
          </Card>
        )}

        {/* Create Request Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-[#1E1F24] border-[#E8E9EB]/10 text-[#E8E9EB] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#E8E9EB]">
                Create Job Request
              </DialogTitle>
              <DialogDescription className="text-[#A0A2A8]">
                Post a job request for your project and get help from the community
              </DialogDescription>
            </DialogHeader>

            {!isWalletConnected ? (
              <Card className="p-6 bg-[#FF6B00]/10 border-[#FF6B00]/30">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-[#FF6B00]" />
                  <div className="flex-1">
                    <p className="text-[#FF6B00] mb-1">Wallet not connected</p>
                    <p className="text-[#A0A2A8] text-sm">
                      Please connect your wallet to post job requests
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4 mt-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-[#E8E9EB] mb-2 block">
                    Job Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Smart Contract Developer Needed"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8]"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-[#E8E9EB] mb-2 block">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the job requirements, deliverables, and expectations..."
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8] min-h-[120px]"
                  />
                </div>

                {/* Category & Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-[#E8E9EB] mb-2 block">
                      Category *
                    </Label>
                    <Select 
                      value={newRequest.category} 
                      onValueChange={(value) => setNewRequest({ ...newRequest, category: value })}
                    >
                      <SelectTrigger className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E1F24] border-[#E8E9EB]/20">
                        {categories.filter(c => c.value !== "all").map((category) => (
                          <SelectItem 
                            key={category.value} 
                            value={category.value}
                            className="text-[#E8E9EB] focus:bg-[#00E0FF]/10 focus:text-[#00E0FF]"
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="budget" className="text-[#E8E9EB] mb-2 block">
                      Budget (USD) *
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A2A8]" />
                      <Input
                        id="budget"
                        type="number"
                        placeholder="5000"
                        value={newRequest.budget}
                        onChange={(e) => setNewRequest({ ...newRequest, budget: e.target.value })}
                        className="pl-10 bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8]"
                      />
                    </div>
                  </div>
                </div>

                {/* Deadline & Project */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deadline" className="text-[#E8E9EB] mb-2 block">
                      Deadline
                    </Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newRequest.deadline}
                      onChange={(e) => setNewRequest({ ...newRequest, deadline: e.target.value })}
                      className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="project" className="text-[#E8E9EB] mb-2 block">
                      Project
                    </Label>
                    <Input
                      id="project"
                      placeholder="Your project name"
                      value={newRequest.project}
                      onChange={(e) => setNewRequest({ ...newRequest, project: e.target.value })}
                      className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8]"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <Label htmlFor="skills" className="text-[#E8E9EB] mb-2 block">
                    Required Skills (comma separated)
                  </Label>
                  <Input
                    id="skills"
                    placeholder="e.g., Solidity, React, Web3"
                    value={newRequest.skills}
                    onChange={(e) => setNewRequest({ ...newRequest, skills: e.target.value })}
                    className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1 border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#0D0E10]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRequest}
                    className="flex-1 bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Request
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

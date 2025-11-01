import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { BackProjectDialog } from "./BackProjectDialog";
import { AddJobRequestDialog, type JobRequest } from "./AddJobRequestDialog";
import { JobApplicationDialog } from "./JobApplicationDialog";
import { useWallet } from "../contexts/WalletContext";
import { motion } from "motion/react";
import { toast } from "sonner@2.0.3";
import {
  ArrowLeft,
  Users,
  Clock,
  TrendingUp,
  Target,
  Calendar,
  Globe,
  Twitter,
  Github,
  MessageCircle,
  CheckCircle2,
  Circle,
  DollarSign,
  Share2,
  Heart,
  AlertCircle,
  Briefcase,
  Code,
  Palette,
  FileText,
  Megaphone,
  ExternalLink,
  Wallet,
  Lock,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { getFullnodeUrl } from "@mysten/sui/client";
import { blobIdFromInt, walrus } from "@mysten/walrus";
import { walrusImageUrl } from "../lib/walrus_utils";
// Note: We use parent-provided navigation instead of react-router.

interface ProjectDetailsPageProps {
  project: {
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
  };
  onBack: () => void;
}

export function ProjectDetailsPage({ project, onBack }: ProjectDetailsPageProps) {
  console.log('Project ID:', project.id);
  console.log('Project Name:', project.name);
  console.log('Project blob_id:', project.detailsBlobId);
  const currentAccount = useCurrentAccount();
  const walrusClient = useMemo(() => new SuiJsonRpcClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet',
  }).$extend(
    walrus({
      uploadRelay: {
        host: 'https://upload-relay.testnet.walrus.space',
        sendTip: { max: 1_000 },
      },
      wasmUrl: 'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm',
    })
  ), []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAddJobDialog, setShowAddJobDialog] = useState(false);
  const [showJobApplicationDialog, setShowJobApplicationDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);
  const [projectJobs, setProjectJobs] = useState<JobRequest[]>([]);
  const [details, setDetails] = useState<any | null>(project.details ?? null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadDetails() {
      console.log('Loading project details...');
      console.log('Project name:', project.name);
      console.log('Project blob_id:', project.detailsBlobId);
      
      if (!project.details && project.detailsBlobId) {
        try {
          setLoadingDetails(true);
          const blobId = blobIdFromInt(project.detailsBlobId);
          console.log('Converted blob_id:', blobId);
          
          const blob = await walrusClient.walrus.getBlob({ blobId });
          console.log('Blob:', blob);
          const files = await blob.files();
          console.log('Files:', files);
          console.log('Project name:', project.name);
          
          // Remove .sui extension from project name if present
          const project_name = project.name.toLowerCase().endsWith('.sui') 
            ? project.name.slice(0, -4) 
            : project.name;
          console.log('Project name without .sui:', project_name);
          
          // Get files by identifier (metadata.json file)
          const [readme] = await blob.files({ identifiers: [`${project_name}-metadata.json`] });
          const metadataJson = await readme.json();
          console.log('Metadata:', metadataJson);
          
          // Retrieve the actual image file from Walrus if it exists
          let imageUrl = project.image; // Default to original image
          let imageDirectUrl = project.image; // For shareable links
          
          console.log('Blob ID:', blobId);
          const imageUrls = await walrusImageUrl(blobId, metadataJson.imageFileType, metadataJson.imageFileName);
          console.log('Image URLs:', imageUrls.blobUrl);
          
          imageUrl = imageUrls.blobUrl;
          imageDirectUrl = imageUrls.directUrl;
          
          const parsed = {
            projectName: project.name,
            projectId: project.id,
            blobId: project.detailsBlobId,
            metadata: metadataJson,
            imageUrl: imageDirectUrl,              // Blob URL for display
            imageDirectUrl: imageDirectUrl,  // Direct Walrus URL for sharing
            readmeContent: metadataJson.description || '',
            files: files,
          };
          
          console.log('Loaded project details from blob:', parsed);
          if (mounted) setDetails(parsed);
        } catch (e) {
          console.warn('Failed to load project details blob for project:', project.name, e);
        } finally {
          if (mounted) setLoadingDetails(false);
        }
      }
    }
    loadDetails();
    return () => { mounted = false };
  }, [project.details, project.detailsBlobId, project.name, project.id, walrusClient]);
  const fundingPercentage = (project.currentFunding / project.fundingGoal) * 100;
  const mergedDescription = details?.readmeContent || project.description || details?.description || "";

  const statusConfig = {
    live: { color: "bg-[#00FFA3]", text: "Live Now" },
    upcoming: { color: "bg-[#00E0FF]", text: "Upcoming" },
    funded: { color: "bg-[#C04BFF]", text: "Funded" },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const account = useCurrentAccount();
  // Mock data for detailed information
  const teamMembers = [
    { name: "Sarah Chen", role: "Founder & CEO", avatar: "SC" },
    { name: "Michael Rodriguez", role: "CTO", avatar: "MR" },
    { name: "Emma Thompson", role: "Lead Designer", avatar: "ET" },
    { name: "David Kim", role: "Blockchain Engineer", avatar: "DK" },
  ];

  const milestones = [
    { title: "MVP Development", status: "completed", date: "Q1 2024" },
    { title: "Beta Launch", status: "completed", date: "Q2 2024" },
    { title: "Public Launch", status: "current", date: "Q3 2024" },
    { title: "Platform Expansion", status: "upcoming", date: "Q4 2024" },
    { title: "Ecosystem Growth", status: "upcoming", date: "Q1 2025" },
  ];

  const recentBackers = [
    { name: "Alex Morgan", amount: 5000, time: "2 hours ago" },
    { name: "Jordan Lee", amount: 2500, time: "5 hours ago" },
    { name: "Taylor Swift", amount: 10000, time: "8 hours ago" },
    { name: "Casey Johnson", amount: 1000, time: "12 hours ago" },
    { name: "River Phoenix", amount: 3500, time: "1 day ago" },
  ];

  const projectJobRequests = [
    {
      id: 1,
      title: "Smart Contract Audit",
      category: "Development",
      description: "We need an experienced smart contract auditor to review our DeFi protocol contracts. The audit should cover security vulnerabilities, gas optimization, and best practices. Deliverables include a comprehensive audit report with findings and recommendations.",
      skills: ["Solidity", "Smart Contract Security", "Ethereum", "DeFi", "Gas Optimization"],
      budget: 5000,
      deadline: "2024-07-15",
      applicants: 12,
      status: "Open",
      location: "Remote",
      commitment: "Full-time engagement for 2-3 weeks",
      projectName: project.name,
    },
    {
      id: 2,
      title: "UI/UX Design for Mobile App",
      category: "Design",
      description: "Looking for a talented UI/UX designer to create a mobile app design for our platform. You'll work on user flows, wireframes, high-fidelity mockups, and interactive prototypes. Experience with Web3 applications is a plus.",
      skills: ["Figma", "UI/UX Design", "Mobile Design", "Prototyping", "User Research"],
      budget: 3500,
      deadline: "2024-07-10",
      applicants: 8,
      status: "Open",
      location: "Remote",
      commitment: "Part-time, approximately 15-20 hours per week",
      projectName: project.name,
    },
    {
      id: 3,
      title: "Technical Documentation",
      category: "Content",
      description: "Create comprehensive technical documentation for our platform including API documentation, developer guides, and tutorials. Must be able to explain complex technical concepts in clear, accessible language.",
      skills: ["Technical Writing", "API Documentation", "Markdown", "Developer Documentation"],
      budget: 2000,
      deadline: "2024-07-20",
      applicants: 15,
      status: "In Progress",
      location: "Remote",
      commitment: "Contract basis, approximately 40 hours total",
      projectName: project.name,
    },
    {
      id: 4,
      title: "Community Manager",
      category: "Marketing",
      description: "Seeking an experienced community manager to grow and engage our community across Discord, Twitter, and Telegram. You'll be responsible for moderating discussions, creating content, organizing events, and building relationships with community members.",
      skills: ["Community Management", "Discord", "Twitter", "Content Creation", "Web3"],
      budget: 1500,
      deadline: "2024-07-05",
      applicants: 24,
      status: "Open",
      location: "Remote",
      commitment: "Part-time, ongoing position (10-15 hours per week)",
      projectName: project.name,
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Development":
        return <Code className="w-4 h-4" />;
      case "Design":
        return <Palette className="w-4 h-4" />;
      case "Content":
        return <FileText className="w-4 h-4" />;
      case "Marketing":
        return <Megaphone className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3]/30";
      case "In Progress":
        return "bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30";
      default:
        return "bg-[#A0A2A8]/20 text-[#A0A2A8] border-[#A0A2A8]/30";
    }
  };

  // Mock team member data - in production this would come from the blockchain
  const projectTeamMembers = [
    {
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      email: "team@project.com",
      role: "admin",
      permissions: ["Manage team", "Edit project", "Manage funds", "View analytics", "Post jobs"],
      addedDate: "2024-03-01T00:00:00Z",
    },
  ];

  const checkCanPostJobs = (): boolean => {
    if (!currentAccount) {
      return false;
    }
    
    // Check if the connected wallet is a team member with job posting permission
    const userMember = projectTeamMembers.find(m => 
      m.address.toLowerCase() === currentAccount.address.toLowerCase()
    );
    
    return userMember ? userMember.permissions.includes("Post jobs") : false;
  };

  const handleAddJob = () => {
    if (!currentAccount) {
      toast.error("Please connect your wallet to post a job");
      return;
    }
    
    if (!checkCanPostJobs()) {
      toast.error("You don't have permission to post jobs for this project");
      return;
    }
    
    setShowAddJobDialog(true);
  };

  const handleJobAdded = (job: JobRequest) => {
    setProjectJobs(prev => [...prev, job]);
  };

  const handleApplyClick = (job: JobRequest) => {
    if (!currentAccount) {
      toast.error("Please connect your wallet to apply for this job");
      return;
    }
    
    setSelectedJob(job);
    setShowJobApplicationDialog(true);
  };

  const handleApplicationSubmit = (applicationData: any) => {
    console.log("Application submitted:", applicationData);
    // In production, this would submit to backend/blockchain
  };

  // Combine existing jobs with newly added ones
  const allJobs = [...projectJobRequests, ...projectJobs];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-6 text-muted-foreground hover:text-foreground hover:bg-card"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </motion.div>

        {/* Wallet Connection Banner for Job Posting */}
        {!currentAccount && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <Card className="p-5 bg-gradient-to-r from-[#FF6B00]/20 to-[#C04BFF]/20 border-border backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#FF6B00]/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-[#FF6B00]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground mb-1">
                    Connect Wallet to Post Jobs & Apply
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to post job requests or apply for available positions.
                  </p>
                </div>
                <Button
                  onClick={() => toast.info("Please use the wallet button in the top navigation to connect")}
                  size="sm"
                  className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="overflow-hidden bg-card/80 border-border backdrop-blur-sm">
                <div className="relative h-96">
                  <img
                    src={details?.imageDirectUrl || project.image}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  
                  {/* Walrus Image Link Button */}
                  {details?.imageDirectUrl && (
                    <div className="absolute top-6 right-6">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-background/80 backdrop-blur-sm border-[#00E0FF]/30 hover:bg-[#00E0FF]/10"
                        onClick={() => {
                          if (details?.imageDirectUrl) {
                            navigator.clipboard.writeText(details.imageDirectUrl);
                            toast.success('Walrus image URL copied to clipboard! 🎉');
                          }
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Copy Walrus Image URL
                      </Button>
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-6 left-6 flex gap-3">
                    <Badge className={`${statusConfig[project.status].color} text-[#0D0E10] border-0`}>
                      {statusConfig[project.status].text}
                    </Badge>
                    <Badge className="bg-card/80 text-foreground border-border backdrop-blur-sm">
                      {project.category}
                    </Badge>
                  </div>

                  {/* Project Title */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="text-4xl text-foreground mb-2">{project.name}</h1>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Tabs Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-card/80 border border-border">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="milestones">Milestones</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="backers">Backers</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card className="p-6 bg-card/80 border-border backdrop-blur-sm">
                    <h2 className="text-2xl text-foreground mb-4">About This Project</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {loadingDetails && !mergedDescription ? 'Loading details…' : mergedDescription}
                    </p>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      This groundbreaking project represents the future of decentralized technology. 
                      By leveraging cutting-edge blockchain infrastructure and AI-powered tools, we're 
                      building a platform that will revolutionize how users interact with Web3 applications.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Our mission is to democratize access to advanced technology while maintaining the 
                      highest standards of security, privacy, and user experience. With your support, 
                      we'll bring this vision to life and create lasting impact in the ecosystem.
                    </p>
                  </Card>

                  {/* Social Links */}
                  <Card className="p-6 bg-card/80 border-border backdrop-blur-sm">
                    <h2 className="text-2xl text-foreground mb-4">Connect With Us</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <a
                        href="https://twitter.com/foundry3"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border hover:border-[#00E0FF]/30 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-[#1DA1F2]/10 group-hover:bg-[#1DA1F2]/20 transition-all">
                          <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Twitter</p>
                          <p className="text-foreground text-sm">@foundry3</p>
                        </div>
                      </a>

                      <a
                        href="https://github.com/foundry3"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border hover:border-[#C04BFF]/30 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-[#C04BFF]/10 group-hover:bg-[#C04BFF]/20 transition-all">
                          <Github className="w-5 h-5 text-[#C04BFF]" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">GitHub</p>
                          <p className="text-foreground text-sm">foundry3</p>
                        </div>
                      </a>

                      <a
                        href="https://discord.gg/foundry3"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border hover:border-[#5865F2]/30 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-[#5865F2]/10 group-hover:bg-[#5865F2]/20 transition-all">
                          <MessageCircle className="w-5 h-5 text-[#5865F2]" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Discord</p>
                          <p className="text-foreground text-sm">Join Us</p>
                        </div>
                      </a>

                      <a
                        href="https://foundry3.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border hover:border-[#00E0FF]/30 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-[#00E0FF]/10 group-hover:bg-[#00E0FF]/20 transition-all">
                          <Globe className="w-5 h-5 text-[#00E0FF]" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Website</p>
                          <p className="text-foreground text-sm">Visit Site</p>
                        </div>
                      </a>
                    </div>
                  </Card>

                  <Card className="p-6 bg-card/80 border-border backdrop-blur-sm">
                    <h2 className="text-2xl text-foreground mb-4">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        "Advanced analytics dashboard",
                        "Cross-chain compatibility",
                        "Real-time data processing",
                        "AI-powered insights",
                        "Enterprise-grade security",
                        "Open-source architecture",
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#00FFA3]" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 bg-card/80 border-border backdrop-blur-sm">
                    <h2 className="text-2xl text-foreground mb-4">Use of Funds</h2>
                    <div className="space-y-4">
                      {[
                        { category: "Development", percentage: 40, amount: project.fundingGoal * 0.4 },
                        { category: "Marketing & Growth", percentage: 25, amount: project.fundingGoal * 0.25 },
                        { category: "Operations", percentage: 20, amount: project.fundingGoal * 0.2 },
                        { category: "Security Audits", percentage: 15, amount: project.fundingGoal * 0.15 },
                      ].map((item, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-foreground">{item.category}</span>
                            <span className="text-muted-foreground">
                              {item.percentage}% · {formatCurrency(item.amount)}
                            </span>
                          </div>
                          <Progress value={item.percentage} className="h-2 bg-muted" />
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="milestones">
                  <Card className="p-6 bg-card/80 border-border backdrop-blur-sm">
                    <h2 className="text-2xl text-foreground mb-6">Project Roadmap</h2>
                    <div className="space-y-6">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            {milestone.status === "completed" ? (
                              <CheckCircle2 className="w-6 h-6 text-[#00FFA3]" />
                            ) : milestone.status === "current" ? (
                              <div className="w-6 h-6 rounded-full bg-[#00E0FF] flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-foreground" />
                              </div>
                            ) : (
                              <Circle className="w-6 h-6 text-muted-foreground" />
                            )}
                            {index < milestones.length - 1 && (
                              <div className="w-0.5 h-16 bg-border mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-foreground">{milestone.title}</h3>
                              <span className="text-muted-foreground text-sm">{milestone.date}</span>
                            </div>
                            {milestone.status === "completed" && (
                              <Badge className="bg-[#00FFA3]/20 text-[#00FFA3] border-0">
                                Completed
                              </Badge>
                            )}
                            {milestone.status === "current" && (
                              <Badge className="bg-[#00E0FF]/20 text-[#00E0FF] border-0">
                                In Progress
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="team">
                  <Card className="p-6 bg-card/80 border-border backdrop-blur-sm">
                    <h2 className="text-2xl text-foreground mb-6">Meet the Team</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {teamMembers.map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border"
                        >
                          <Avatar className="w-16 h-16 bg-gradient-to-br from-[#00E0FF] to-[#C04BFF]">
                            <AvatarFallback className="text-[#0D0E10]">
                              {member.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-foreground mb-1">{member.name}</h3>
                            <p className="text-muted-foreground text-sm">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="backers">
                  <Card className="p-6 bg-card/80 border-border backdrop-blur-sm">
                    <h2 className="text-2xl text-foreground mb-6">Recent Backers</h2>
                    <div className="space-y-4">
                      {recentBackers.map((backer, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 bg-gradient-to-br from-[#FF6B00] to-[#C04BFF]">
                              <AvatarFallback className="text-[#0D0E10]">
                                {backer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-foreground">{backer.name}</p>
                              <p className="text-muted-foreground text-sm">{backer.time}</p>
                            </div>
                          </div>
                          <div className="text-[#00E0FF]">
                            {formatCurrency(backer.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6 bg-card/80 border-border backdrop-blur-sm sticky top-24">
                <div className="space-y-6">
                  {/* Funding Progress */}
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl text-[#00E0FF]">
                        {formatCurrency(project.currentFunding)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      raised of {formatCurrency(project.fundingGoal)} goal
                    </p>
                    <Progress value={fundingPercentage} className="h-3 bg-muted mb-2" />
                    <p className="text-muted-foreground text-sm">{fundingPercentage.toFixed(1)}% funded</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-[#C04BFF]" />
                        <span className="text-2xl text-foreground">{project.backers}</span>
                      </div>
                      <p className="text-muted-foreground text-sm">Backers</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-[#FF6B00]" />
                        <span className="text-2xl text-foreground">{project.daysLeft}</span>
                      </div>
                      <p className="text-muted-foreground text-sm">Days Left</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setDialogOpen(true)}
                      className="w-full bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Back This Project
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="border-border text-foreground hover:bg-card">
                        <Heart className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" className="border-border text-foreground hover:bg-card">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-muted-foreground text-sm mb-3">Connect with the project</p>
                    <div className="flex gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        className="border-border text-foreground hover:bg-card"
                      >
                        <Globe className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="border-border text-foreground hover:bg-card"
                      >
                        <Twitter className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="border-border text-foreground hover:bg-card"
                      >
                        <Github className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="border-border text-foreground hover:bg-card"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Job Requests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6 bg-card/80 border-border backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl text-foreground mb-1">Job Requests</h3>
                    {!currentAccount ? (
                      <p className="text-sm text-[#FF6B00]">Connect wallet to view & post jobs</p>
                    ) : checkCanPostJobs() ? (
                      <p className="text-sm text-[#00FFA3]">You can post jobs for this project</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">View-only access</p>
                    )}
                  </div>
                  {currentAccount && (
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30">
                        {allJobs.filter(j => j.status === "Open").length} Open
                      </Badge>
                      {checkCanPostJobs() && (
                        <Button
                          onClick={handleAddJob}
                          size="sm"
                          className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                        >
                          <Briefcase className="w-4 h-4 mr-2" />
                          Post Job
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {!currentAccount ? (
                    <div className="relative">
                      {/* Blurred Job Cards Background */}
                      <div className="absolute inset-0 blur-md opacity-40 pointer-events-none">
                        <div className="p-4 mb-3 rounded-lg border border-border bg-card/50">
                          <div className="h-4 bg-[#A0A2A8]/20 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-[#A0A2A8]/20 rounded w-1/2"></div>
                        </div>
                        <div className="p-4 mb-3 rounded-lg border border-border bg-card/50">
                          <div className="h-4 bg-[#A0A2A8]/20 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-[#A0A2A8]/20 rounded w-1/3"></div>
                        </div>
                      </div>
                      
                      {/* Lock Overlay */}
                      <div className="relative text-center py-16">
                        <div className="relative inline-block mb-6">
                          <div className="p-4 bg-gradient-to-br from-[#FF6B00]/20 to-[#C04BFF]/20 rounded-2xl border-2 border-[#FF6B00]/30">
                            <Lock className="w-12 h-12 text-[#FF6B00]" />
                          </div>
                        </div>
                        <h4 className="text-xl text-foreground mb-3">
                          Wallet Connection Required
                        </h4>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Connect your wallet to view available job requests, apply for positions, and post new opportunities.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                          <Button
                            onClick={() => toast.info("Please use the wallet button in the top navigation to connect")}
                            className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                          >
                            <Wallet className="w-4 h-4 mr-2" />
                            Connect Wallet
                          </Button>
                          <p className="text-sm text-muted-foreground">
                            Secure connection via top navigation
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : allJobs.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">No job requests yet</p>
                      {checkCanPostJobs() && (
                        <Button
                          onClick={handleAddJob}
                          variant="outline"
                          className="border-border text-foreground hover:bg-card"
                        >
                          <Briefcase className="w-4 h-4 mr-2" />
                          Post First Job
                        </Button>
                      )}
                    </div>
                  ) : (
                    allJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-lg border border-border hover:border-[#00E0FF]/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-foreground group-hover:text-[#00E0FF] transition-colors">
                              {job.title}
                            </h4>
                            <Badge className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(job.category)}
                              <span>{job.category}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{job.applicants} applicants</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div>
                          <div className="text-lg text-[#00E0FF]">
                            {formatCurrency(job.budget)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Due {new Date(job.deadline).toLocaleDateString()}
                          </div>
                        </div>
                        {job.status === "Open" && (
                          <Button 
                            size="sm"
                            onClick={() => handleApplyClick(job)}
                            className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10] h-8 text-xs"
                          >
                            Apply
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                    ))
                  )}
                </div>
                {allJobs.length > 0 && (
                  <Button 
                    variant="outline"
                    className="w-full mt-4 border-border text-foreground hover:bg-card"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    View All Jobs
                  </Button>
                )}
              </Card>
            </motion.div>

            {/* Risk Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="p-4 bg-[#FF6B00]/10 border-[#FF6B00]/30 backdrop-blur-sm">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[#FF6B00] mb-1">Investment Notice</h4>
                    <p className="text-muted-foreground text-sm">
                      All investments carry risk. Only invest what you can afford to lose. 
                      Do your own research before backing any project.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Back Project Dialog */}
      <BackProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projectName={project.name}
        projectId={project.id}
        isWalletConnected={currentAccount ? true : false}
      />

      {/* Add Job Request Dialog */}
      <AddJobRequestDialog
        open={showAddJobDialog}
        onOpenChange={setShowAddJobDialog}
        projectName={project.name}
        onJobAdded={handleJobAdded}
      />

      {/* Job Application Dialog */}
      <JobApplicationDialog
        open={showJobApplicationDialog}
        onOpenChange={setShowJobApplicationDialog}
        job={selectedJob}
        onSubmit={handleApplicationSubmit}
      />
    </div>
  );
}

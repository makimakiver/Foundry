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
// Removed custom wallet context in favor of dapp-kit hooks
import { motion, AnimatePresence } from "motion/react";
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
import { useCurrentAccount, useSignAndExecuteTransaction, useSignPersonalMessage, useSuiClient } from "@mysten/dapp-kit";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { blobIdFromInt, walrus } from "@mysten/walrus";
import { walrusImageUrl } from "../lib/walrus_utils";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex } from "@mysten/bcs";
import { SealClient, SessionKey } from "@mysten/seal";
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
  const MYSTEN_1 = "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75";
  const MYSTEN_2 = "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8";
  const RUBY = "0x6068c0acb197dddbacd4746a9de7f025b2ed5a5b6c1b1ab44dade4426d141da2";
  const NODE_INFRA = "0x5466b7df5c15b508678d51496ada8afab0d6f70a01c10613123382b1b8131007";
  const STUDIO_MIRAI = "0x164ac3d2b3b8694b8181c13f671950004765c23f270321a45fdd04d40cccf0f2";
  const OVER_CLOCK = "0x9c949e53c36ab7a9c484ed9e8b43267a77d4b8d70e79aa6b39042e3d4c434105";
  const H2O_NODE = "0x39cef09b24b667bc6ed54f7159d82352fe2d5dd97ca9a5beaa1d21aa774f25a2";
  const serverObjectIds = [
    "0x164ac3d2b3b8694b8181c13f671950004765c23f270321a45fdd04d40cccf0f2", 
    "0x5466b7df5c15b508678d51496ada8afab0d6f70a01c10613123382b1b8131007"
  ];
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
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
  const suiClient = useSuiClient();
  const sealClient = new SealClient({
    suiClient,
    serverConfigs: serverObjectIds.map((id) => ({
        objectId: id,
        weight: 1,
    })),
    verifyKeyServers: false,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAddJobDialog, setShowAddJobDialog] = useState(false);
  const [showJobApplicationDialog, setShowJobApplicationDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);
  const [projectJobs, setProjectJobs] = useState<JobRequest[]>([]);
  const [details, setDetails] = useState<any | null>(project.details ?? null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [encryptedJobs, setEncryptedJobs] = useState<any[]>([]);
  const [decryptingJobId, setDecryptingJobId] = useState<string | null>(null);
  const client = useSuiClient();
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
  
  // Fetch encrypted job requests from blockchain
  useEffect(() => {
    let mounted = true;
    async function fetchEncryptedJobs() {
      if (!project.id) {
        return;
      }
      
      try {
        setLoadingJobs(true);
        console.log('Fetching encrypted job requests for project:', project.id);
        
        const registry = import.meta.env.VITE_REGISTRY_ID;
        const project_struct = await client.getObject({
          id: registry,
          options: { showContent: true },
        });
        const projectContent: any = project_struct.data?.content;
        const parentId = projectContent?.fields?.project_jobs?.fields?.id?.id;
        const name = { type: '0x2::object::ID', value: project.id };
        const jobVault = await client.getDynamicFieldObject({ parentId, name });
        const jobVaultContent: any = jobVault.data?.content;
        const jobVaultId = jobVaultContent?.fields?.id?.id;
        const jobVaultObj = await client.getObject({
          id: jobVaultId,
          options: { showContent: true },
        });
        const jobVaultObjContent: any = jobVaultObj.data?.content;
        const jobs = jobVaultObjContent?.fields?.value?.fields?.jobs || [];
        
        console.log('Fetched encrypted jobs:', jobs.length);
        
        if (mounted) {
          setEncryptedJobs(jobs);
        }
      } catch (error) {
        console.error('Error fetching encrypted job requests:', error);
      } finally {
        if (mounted) setLoadingJobs(false);
      }
    }
    
    fetchEncryptedJobs();
    return () => { mounted = false };
  }, [project.id, client]);
  
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

  // Mock job requests are now replaced with real blockchain data
  // Keeping this commented for reference:
  // const projectJobRequests: JobRequest[] = [ ... ];

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
    if (!currentAccount?.address) {
      return false;
    }
    
    const acct = currentAccount.address.toLowerCase();
    // Check if the connected wallet is a team member with job posting permission
    const userMember = projectTeamMembers.find(
      (m) => m.address.toLowerCase() === acct
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

  const handleDecryptJob = async (encryptedJob: any) => {
    if (!currentAccount) {
      toast.error("Please connect your wallet first");
      return;
    }

    const jobId = encryptedJob.fields?.id?.id;
    setDecryptingJobId(jobId);
    toast.loading("Decrypting job...");

    try {
      const vendor = import.meta.env.VITE_PACKAGE_ID;
      const registry = import.meta.env.VITE_REGISTRY_ID;
      const account_ns_reg = import.meta.env.VITE_ACCOUNT_NS_REGISTRY_ID;
      console.log(encryptedJob.fields);
      const jobDetails = encryptedJob.fields?.details;
      console.log('Decrypting Job ID:', jobId);
      console.log('Job Details (raw):', jobDetails);
      
      // Create session key
      console.log("Creating session key...");
      const sessionKey = await SessionKey.create({
          address: currentAccount.address,
          packageId: vendor,
          ttlMin: 10,
          suiClient: suiClient,
      });

      console.log("Signing session key...");
      const message = sessionKey.getPersonalMessage();
      const { signature } = await signPersonalMessage({ message });
      sessionKey.setPersonalMessageSignature(signature);
      console.log("Session key created");
      
      // Create the Transaction for seal_approve
      const tx = new Transaction();
      const idBytes = fromHex("0x1");
      const moduleName = "ideation";
      tx.moveCall({
        target: `${vendor}::${moduleName}::seal_approve`,
        arguments: [
          tx.pure.vector("u8", idBytes),
          tx.object(registry),
          tx.object(project.id),
          tx.pure.id(jobId), 
          tx.object(account_ns_reg)
        ]
      });
      const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });
      
      // Convert jobDetails to Uint8Array
      let jobDetailsBytes: Uint8Array;
      if (jobDetails instanceof Uint8Array) {
        jobDetailsBytes = jobDetails;
      } else if (Array.isArray(jobDetails)) {
        jobDetailsBytes = new Uint8Array(jobDetails);
      } else if (typeof jobDetails === 'string') {
        const hexString = jobDetails.startsWith('0x') ? jobDetails.slice(2) : jobDetails;
        jobDetailsBytes = fromHex(hexString);
      } else {
        throw new Error("Invalid jobDetails format");
      }
      
      console.log("Decrypting job data...");
      const decryptedBytes = await sealClient.decrypt({ 
        data: jobDetailsBytes, 
        sessionKey, 
        txBytes 
      });
      
      const decryptedJobDetails = new TextDecoder().decode(decryptedBytes);
      console.log("Decrypted job details:", decryptedJobDetails);
      
      // Parse the decrypted job details
      const parsedJob = JSON.parse(decryptedJobDetails);
      console.log("Parsed job:", parsedJob);
      
      // Convert to JobRequest format
      const jobRequest: JobRequest = {
        id: parsedJob.id || Date.now(),
        title: parsedJob.title || '',
        category: parsedJob.category || 'Development',
        budget: parsedJob.budget || 0,
        deadline: parsedJob.deadline || '',
        description: parsedJob.description || '',
        location: parsedJob.location || 'Remote',
        requiredSkills: parsedJob.requiredSkills || [],
        organizationContributions: parsedJob.organizationContributions || [],
        applicants: parsedJob.applicants || 0,
        status: parsedJob.status || 'Open',
        postedDate: parsedJob.postedDate || new Date().toISOString(),
      };
      
      // Add the decrypted job to state
      setProjectJobs(prev => [...prev, jobRequest]);
      console.log("✓ Successfully decrypted job:", jobRequest.title);
      
      toast.dismiss();
      toast.success(`Job "${jobRequest.title}" decrypted! 🔓`);
      
    } catch (error) {
      console.error("Error decrypting job:", error);
      toast.dismiss();
      toast.error("Failed to decrypt job. Please try again.");
    } finally {
      setDecryptingJobId(null);
    }
  };

  // Use only the fetched jobs from blockchain
  const allJobs = projectJobs;

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
                    <p className="text-sm text-muted-foreground">
                      {encryptedJobs.length} total · {projectJobs.length} decrypted
                    </p>
                  </div>
                  {currentAccount && checkCanPostJobs() && (
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
                <div className="space-y-3">
                  {!currentAccount ? (
                    <div className="text-center py-12">
                      <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">Connect wallet to view job requests</p>
                      <Button
                        onClick={() => toast.info("Please use the wallet button in the top navigation to connect")}
                        className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Wallet
                      </Button>
                    </div>
                  ) : loadingJobs ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E0FF] mx-auto mb-3"></div>
                      <p className="text-muted-foreground">Loading job requests...</p>
                    </div>
                  ) : encryptedJobs.length === 0 && projectJobs.length === 0 ? (
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
                    <>
                      {/* Show decrypted jobs */}
                      {projectJobs.map((job) => (
                        <div
                          key={job.id}
                          className="p-4 rounded-lg border border-border hover:border-[#00E0FF]/30 transition-all group"
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
                                <Badge className="bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3]/30">
                                  Decrypted
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
                      ))}
                      
                      {/* Show encrypted jobs */}
                      {encryptedJobs.map((encJob, idx) => {
                        const jobId = encJob.fields?.id?.id;
                        const isDecrypted = projectJobs.some(j => j.id.toString().includes(jobId?.slice(-8) || ''));
                        const isDecrypting = decryptingJobId === jobId;
                        
                        // Skip if already decrypted
                        if (isDecrypted) return null;
                        
                        return (
                          <div
                            key={jobId || idx}
                            className="p-4 rounded-lg border border-[#FF6B00]/30 bg-card/50 backdrop-blur-sm relative"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-[#FF6B00]" />
                                <div>
                                  <h4 className="text-foreground mb-1">Encrypted Job Request #{idx + 1}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Click decrypt to view full details
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleDecryptJob(encJob)}
                                disabled={isDecrypting}
                                className="bg-gradient-to-r from-[#FF6B00] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                              >
                                {isDecrypting ? (
                                  <>
                                    <Lock className="w-4 h-4 mr-2 animate-pulse" />
                                    Decrypting...
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Decrypt
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
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
        projectId={project.id}
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

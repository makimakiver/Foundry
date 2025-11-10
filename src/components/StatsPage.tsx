import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { AddMemberDialog, type TeamMember } from "./AddMemberDialog";
import { AddJobRequestDialog, type JobRequest } from "./AddJobRequestDialog";
import { JobApplicationDialog } from "./JobApplicationDialog";
import { CompleteJobDialog } from "./CompleteJobDialog";
import { HireApplicantsDialog } from "./HireApplicantsDialog";
// Removed custom wallet context usage; relying on dapp-kit hooks elsewhere
import { motion } from "motion/react";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { getFullnodeUrl } from "@mysten/sui/client";
import { blobIdFromInt, walrus } from "@mysten/walrus";
import { walrusImageUrl } from "../lib/walrus_utils";
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Target, 
  DollarSign, 
  Wallet,
  BarChart3,
  PieChart,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  Percent,
  UserPlus,
  UserCheck,
  Mail,
  Shield,
  MoreVertical,
  Trash2,
  Briefcase,
  Code,
  Palette,
  FileText,
  Megaphone,
  Clock,
  CheckCircle2,
  Lock,
  Twitter,
  Linkedin,
  Github,
  MessageCircle,
  XCircle,
  User,
  AlertCircle,
  Play
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { toast } from "sonner@2.0.3";
import { useCurrentAccount, useSignPersonalMessage, useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex } from "@mysten/bcs";
import { SealClient, SessionKey } from "@mysten/seal";

// Project class matching the blockchain data structure
class Project {
  id: number;
  blockchainId: string; // The actual blockchain object ID
  name: string;
  category: string;
  status: "Live" | "Funded";
  image: string;
  investment: {
    amount: number;
    date: string;
    tokens: number;
    currentValue: number;
    roi: number;
    ownership: number;
  };
  projectStats: {
    totalRaised: number;
    fundingGoal: number;
    backers: number;
    fundingProgress: number;
    valuation: number;
  };
  performance: { month: string; value: number }[];
  detailsBlobId?: string;

  constructor(data: any) {
    this.id = data.id;
    this.blockchainId = data.blockchainId;
    this.name = data.name;
    this.category = data.category;
    this.status = data.status || "Live";
    this.image = data.image;
    this.investment = data.investment;
    this.projectStats = data.projectStats;
    this.performance = data.performance;
    this.detailsBlobId = data.detailsBlobId;
  }
}

// Mock data for user's backed projects (fallback)
const mockUserProjects = [
  {
    id: 1,
    name: "defi-analytics.sui",
    category: "DeFi",
    status: "Live",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400",
    investment: {
      amount: 5000,
      date: "2024-03-15",
      tokens: 5000,
      currentValue: 6500,
      roi: 30,
      ownership: 1.29
    },
    projectStats: {
      totalRaised: 387500,
      fundingGoal: 500000,
      backers: 234,
      fundingProgress: 77.5,
      valuation: 2000000
    },
    performance: [
      { month: "Mar", value: 5000 },
      { month: "Apr", value: 5300 },
      { month: "May", value: 5800 },
      { month: "Jun", value: 6500 }
    ]
  },
  {
    id: 2,
    name: "ai-code-assistant.sui",
    category: "AI/ML",
    status: "Live",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
    investment: {
      amount: 10000,
      date: "2024-02-20",
      tokens: 10000,
      currentValue: 13200,
      roi: 32,
      ownership: 1.6
    },
    projectStats: {
      totalRaised: 625000,
      fundingGoal: 750000,
      backers: 412,
      fundingProgress: 83.3,
      valuation: 3500000
    },
    performance: [
      { month: "Feb", value: 10000 },
      { month: "Mar", value: 10800 },
      { month: "Apr", value: 12100 },
      { month: "May", value: 12800 },
      { month: "Jun", value: 13200 }
    ]
  },
  {
    id: 3,
    name: "creator-economy.sui",
    category: "DAO",
    status: "Funded",
    image: "https://images.unsplash.com/photo-1618044733300-9472054094ee?w=400",
    investment: {
      amount: 2500,
      date: "2024-04-01",
      tokens: 2500,
      currentValue: 2350,
      roi: -6,
      ownership: 0.21
    },
    projectStats: {
      totalRaised: 1200000,
      fundingGoal: 1000000,
      backers: 856,
      fundingProgress: 120,
      valuation: 5000000
    },
    performance: [
      { month: "Apr", value: 2500 },
      { month: "May", value: 2450 },
      { month: "Jun", value: 2350 }
    ]
  },
  {
    id: 4,
    name: "zk-privacy.sui",
    category: "Infrastructure",
    status: "Live",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400",
    investment: {
      amount: 7500,
      date: "2024-01-10",
      tokens: 7500,
      currentValue: 11250,
      roi: 50,
      ownership: 1.67
    },
    projectStats: {
      totalRaised: 450000,
      fundingGoal: 600000,
      backers: 298,
      fundingProgress: 75,
      valuation: 2800000
    },
    performance: [
      { month: "Jan", value: 7500 },
      { month: "Feb", value: 8100 },
      { month: "Mar", value: 9200 },
      { month: "Apr", value: 10100 },
      { month: "May", value: 10800 },
      { month: "Jun", value: 11250 }
    ]
  }
];

export function StatsPage() {
  const currentAccount = useCurrentAccount();
  const walletAddress = currentAccount?.address;
  const isConnected = !!currentAccount;
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  
  // Server object IDs for SEAL
  const serverObjectIds = [
    "0x164ac3d2b3b8694b8181c13f671950004765c23f270321a45fdd04d40cccf0f2", 
    "0x5466b7df5c15b508678d51496ada8afab0d6f70a01c10613123382b1b8131007"
  ];
  
  const sealClient = new SealClient({
    suiClient,
    serverConfigs: serverObjectIds.map((id) => ({
        objectId: id,
        weight: 1,
    })),
    verifyKeyServers: false,
  });
  
  // Walrus client setup
  const registry = import.meta.env.VITE_REGISTRY_ID;
  const vendor = import.meta.env.VITE_PACKAGE_ID;
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
  
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"roi" | "amount" | "date">("roi");
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [selectedProjectForMember, setSelectedProjectForMember] = useState<number | null>(null);
  const [showAddJobDialog, setShowAddJobDialog] = useState(false);
  const [selectedProjectForJob, setSelectedProjectForJob] = useState<number | null>(null);
  const [showJobApplicationDialog, setShowJobApplicationDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);
  const [selectedProjectForApplication, setSelectedProjectForApplication] = useState<string | null>(null);
  const [showCompleteJobDialog, setShowCompleteJobDialog] = useState(false);
  const [selectedJobForCompletion, setSelectedJobForCompletion] = useState<JobRequest | null>(null);
  const [selectedProjectForCompletion, setSelectedProjectForCompletion] = useState<number | null>(null);
  const [selectedProjectBlockchainIdForCompletion, setSelectedProjectBlockchainIdForCompletion] = useState<string | null>(null);
  const [showHireDialog, setShowHireDialog] = useState(false);
  const [selectedJobForHiring, setSelectedJobForHiring] = useState<JobRequest | null>(null);
  const [selectedProjectForHiring, setSelectedProjectForHiring] = useState<number | null>(null);
  const [projectMembers, setProjectMembers] = useState<{ [projectId: number]: TeamMember[] }>({});
  const [encryptedJobs, setEncryptedJobs] = useState<{ [projectId: string]: any[] }>({});
  const [loadingProjectJobs, setLoadingProjectJobs] = useState<{ [projectId: string]: boolean }>({});
  const [decryptingJobId, setDecryptingJobId] = useState<string | null>(null);
  const [expandedEncryptedJobs, setExpandedEncryptedJobs] = useState<{ [jobId: string]: boolean }>({});
  
  const [projectJobs, setProjectJobs] = useState<{ [projectId: number]: JobRequest[] }>({
    1: [
      {
        id: 1,
        title: "Smart Contract Audit",
        category: "Development",
        budget: 5000,
        deadline: "2024-07-15",
        description: "We need a comprehensive security audit of our smart contracts before mainnet launch.",
        location: "Remote",
        numberOfPeopleToHire: 2,
        requiredSkills: ["Solidity", "Security Auditing", "Testing"],
        organizationContributions: ["Code Review Access", "Technical Documentation", "Testing Environment"],
        applicants: 12,
        status: "Open",
        postedDate: "2024-06-01T00:00:00Z",
      },
      {
        id: 2,
        title: "Brand Identity Design",
        category: "Design",
        budget: 3500,
        deadline: "2024-07-10",
        description: "Create a complete brand identity including logo, color palette, and design system.",
        location: "Remote",
        numberOfPeopleToHire: 1,
        requiredSkills: ["Branding", "UI/UX", "Figma"],
        organizationContributions: ["Brand Guidelines", "Design Assets", "Team Feedback"],
        applicants: 8,
        status: "In Progress",
        postedDate: "2024-05-20T00:00:00Z",
        hiredMembers: ["app-3"],
      },
      {
        id: 4,
        title: "Social Media Campaign",
        category: "Marketing",
        budget: 4000,
        deadline: "2024-08-01",
        description: "Plan and execute a comprehensive social media campaign for product launch.",
        location: "Hybrid",
        numberOfPeopleToHire: 3,
        requiredSkills: ["Social Media", "Content Strategy", "Analytics"],
        organizationContributions: ["Marketing Budget", "Content Calendar", "Analytics Access"],
        applicants: 10,
        status: "Hiring",
        postedDate: "2024-06-10T00:00:00Z",
        hiredMembers: ["app-5"],
      },
    ],
    2: [
      {
        id: 3,
        title: "Technical Documentation",
        category: "Content",
        budget: 2000,
        deadline: "2024-07-20",
        description: "Write comprehensive technical documentation for our API and SDK.",
        location: "Remote",
        numberOfPeopleToHire: 1,
        requiredSkills: ["Technical Writing", "API Documentation"],
        organizationContributions: ["API Access", "Code Examples", "Engineering Support"],
        applicants: 15,
        status: "Open",
        postedDate: "2024-05-25T00:00:00Z",
      },
    ],
  });

  // Job Applications by job ID
  const [jobApplications, setJobApplications] = useState<{ [jobId: number]: any[] }>({
    1: [
      {
        id: "app-1",
        name: "Sarah Chen",
        email: "sarah.chen@example.com",
        portfolio: "https://sarahchen.dev",
        coverLetter: "I am a senior blockchain developer with 5+ years of experience in Solidity and smart contract development. I've built and audited multiple DeFi protocols and am passionate about decentralized finance.",
        hourlyRate: "150",
        availability: "Full-time",
        walletAddress: "0x1234...5678",
        twitter: "https://twitter.com/sarahchen",
        linkedin: "https://linkedin.com/in/sarahchen",
        github: "https://github.com/sarahchen",
        discord: "sarahchen#1234",
        appliedAt: "2025-10-20T10:30:00Z",
        status: "pending",
      },
      {
        id: "app-2",
        name: "Alex Rodriguez",
        email: "alex.r@example.com",
        portfolio: "https://alexrodriguez.dev",
        coverLetter: "I bring extensive experience in building secure smart contracts and have contributed to several open-source blockchain projects. I'm excited about the opportunity to work on innovative solutions.",
        hourlyRate: "140",
        availability: "Full-time",
        walletAddress: "0x9876...4321",
        twitter: "https://twitter.com/alexdev",
        linkedin: "https://linkedin.com/in/alexrodriguez",
        appliedAt: "2025-10-22T09:45:00Z",
        status: "accepted",
      },
    ],
    2: [
      {
        id: "app-3",
        name: "Marcus Johnson",
        email: "marcus.j@example.com",
        portfolio: "https://marcusdesigns.io",
        coverLetter: "As a UI/UX designer with a focus on Web3 applications, I understand the unique challenges of designing intuitive interfaces for complex blockchain interactions. My portfolio includes work on several successful DeFi platforms.",
        hourlyRate: "120",
        availability: "Part-time",
        walletAddress: "0xabcd...efgh",
        twitter: "https://x.com/marcusdesigns",
        linkedin: "https://linkedin.com/in/marcusjohnson",
        github: "https://github.com/marcusj",
        appliedAt: "2025-10-21T14:15:00Z",
        status: "reviewing",
      },
    ],
    3: [
      {
        id: "app-4",
        name: "Emily Watson",
        email: "emily.watson@example.com",
        portfolio: "https://emilywatson.dev",
        coverLetter: "With 4 years of technical writing experience in blockchain and Web3, I specialize in creating clear, comprehensive documentation that makes complex technology accessible.",
        hourlyRate: "110",
        availability: "Full-time",
        walletAddress: "0x5555...9999",
        twitter: "https://x.com/emilywatson",
        linkedin: "https://linkedin.com/in/emilywatson",
        github: "https://github.com/emilywatson",
        discord: "emily#5678",
        appliedAt: "2025-10-23T11:20:00Z",
        status: "pending",
      },
      {
        id: "app-5",
        name: "David Kim",
        email: "david.kim@example.com",
        portfolio: "https://davidkim.tech",
        coverLetter: "I'm a technical writer who has worked on multiple Web3 projects. My writing focuses on making complex technical concepts accessible to developers of all skill levels.",
        hourlyRate: "95",
        availability: "Contract",
        walletAddress: "0x7777...3333",
        twitter: "https://twitter.com/davidkim",
        linkedin: "https://linkedin.com/in/davidkim",
        appliedAt: "2025-10-24T16:00:00Z",
        status: "rejected",
      },
    ],
    4: [
      {
        id: "app-5",
        name: "Jessica Martinez",
        email: "jessica.m@example.com",
        portfolio: "https://jessicamartinez.io",
        coverLetter: "Social media strategist with 6 years experience in Web3 and crypto marketing. I've launched successful campaigns for multiple DeFi protocols and NFT projects.",
        hourlyRate: "130",
        availability: "Full-time",
        walletAddress: "0xaaaa...bbbb",
        twitter: "https://x.com/jessicamarketing",
        linkedin: "https://linkedin.com/in/jessicamartinez",
        appliedAt: "2025-10-18T09:00:00Z",
        status: "accepted",
      },
      {
        id: "app-6",
        name: "Tom Chen",
        email: "tom.chen@example.com",
        portfolio: "https://tomchen.co",
        coverLetter: "Digital marketing specialist focusing on community growth and engagement. I've helped grow multiple Web3 communities from zero to thousands of active members.",
        hourlyRate: "115",
        availability: "Part-time",
        walletAddress: "0xcccc...dddd",
        twitter: "https://x.com/tomchen",
        linkedin: "https://linkedin.com/in/tomchen",
        github: "https://github.com/tomchen",
        appliedAt: "2025-10-19T14:30:00Z",
        status: "accepted",
      },
      {
        id: "app-7",
        name: "Nina Patel",
        email: "nina.patel@example.com",
        portfolio: "https://ninapatel.dev",
        coverLetter: "Content creator and social media manager with expertise in blockchain and DeFi. I create engaging content that educates and grows communities.",
        hourlyRate: "100",
        availability: "Full-time",
        walletAddress: "0xeeee...ffff",
        twitter: "https://x.com/ninapatel",
        linkedin: "https://linkedin.com/in/ninapatel",
        appliedAt: "2025-10-20T11:15:00Z",
        status: "pending",
      },
    ],
  });

  const [expandedJobApplications, setExpandedJobApplications] = useState<{ [jobId: number]: boolean }>({});

  // Fetch metadata from Walrus
  const fetchMetadataFromWalrus = async (blobId: string, projectName: string) => {
    try {
      const metadataFileName = `${projectName}-metadata.json`;
      const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';
      const metadataUrl = `${AGGREGATOR}/v1/blobs/by-quilt-id/${blobId}/${metadataFileName}`;
      
      console.log('Fetching metadata from:', metadataUrl);
      const response = await fetch(metadataUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: HTTP ${response.status}`);
      }
      
      const metadata = await response.json();
      console.log('Fetched metadata:', metadata);
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  };

  // Fetch projects from blockchain/Walrus
  const fetchProjects = async () => {
    try {
      if (!currentAccount) {
        toast.error("Please connect your wallet to fetch projects");
        return;
      }
      setIsLoadingProjects(true);
      console.log('Fetching projects from blockchain...');

      const project_struct = await client.getObject({
        id: registry,
        options: { showContent: true },
      });
      const projectContent: any = project_struct.data?.content;
      console.log('Project registry content:', projectContent);
      const parentId = projectContent?.fields?.accessible_project?.fields?.id?.id;
      console.log('Parent ID:', parentId);
      const name = { type: 'address', value: currentAccount.address };
      const obj = await client.getDynamicFieldObject({ parentId, name });
      console.log('Dynamic field object:', obj);
      const content: any = (obj as any).data?.content;
      const projectAddrs = content?.fields?.value;
      console.log('Project addresses:', projectAddrs);
      
      const projectObjects: any[] = [];
      if (Array.isArray(projectAddrs)) {
        for (const projectAddr of projectAddrs) {
          const projectObj = await client.getObject({
            id: projectAddr,
            options: { showContent: true },
          });
          console.log('Fetched project object:', projectObj);
          projectObjects.push(projectObj);
        }
      }
      
      console.log('All project objects:', projectObjects);
      
      const parsed: Project[] = [];
      const newProjectMembers: { [projectId: number]: TeamMember[] } = {};
      
      if (Array.isArray(projectObjects) && projectObjects.length > 0) {
        for (let i = 0; i < projectObjects.length; i++) {
          const projectObj = projectObjects[i];
          
          // Access the project data from the object
          const f = (projectObj as any)?.data?.content?.fields;
          console.log('Project fields:', f);
          
          if (!f) {
            console.warn('No fields found for project', i);
            continue;
          }
          
          // Get project name and strip .sui extension for image file name
          const project_name = f?.title?.toLowerCase().endsWith('.sui') 
            ? f?.title.slice(0, -4) 
            : f?.title;
          
          const blob_id = blobIdFromInt(f?.details.fields.blob_id).toString();
          
          // Fetch metadata from Walrus
          const metadata = await fetchMetadataFromWalrus(blob_id, project_name);
          
          // Extract team members from metadata
          if (metadata && metadata.teamMembers && Array.isArray(metadata.teamMembers)) {
            const teamMembers = metadata.teamMembers
              .filter((member: any) => member.name && member.role)
              .map((member: any) => ({
                address: member.name, // In the metadata, 'name' field contains the address
                email: `${member.role}@${project_name}.sui`, // Generate email from role and project
                role: member.role === 'co-founder' ? 'admin' : member.role,
                permissions: member.role === 'co-founder' 
                  ? ["Manage team", "Edit project", "Manage funds", "View analytics", "Post jobs"]
                  : ["View analytics"],
                addedDate: new Date().toISOString(),
              }));
            
            if (teamMembers.length > 0) {
              newProjectMembers[i + 1] = teamMembers;
              console.log(`Found ${teamMembers.length} team members for project ${i + 1}:`, teamMembers);
            }
          }
          
          // Fetch image from Walrus
          let imageUrl = '';
          let imageDirectUrl = '';
          try {
            const imageFileName = `${project_name}-image`;
            const imageUrls = await walrusImageUrl(blob_id, imageFileName);
            imageUrl = imageUrls.blobUrl;
            imageDirectUrl = imageUrls.directUrl;
          } catch (error) {
            console.error('Failed to fetch image for project:', project_name, error);
          }
          
          // Create project with mock investment data (in production, fetch actual user investment)
          const fundingGoal = Number(f?.fundingGoal ?? f?.funding_goal ?? 0);
          const mockInvestment = Math.floor(Math.random() * 10000) + 1000; // Random investment between 1k-11k
          const mockROI = Math.floor(Math.random() * 100) - 20; // Random ROI between -20% and 80%
          const currentValue = mockInvestment * (1 + mockROI / 100);
          
          // Get the blockchain object ID
          const blockchainId = (projectObj as any)?.data?.objectId || projectAddrs[i];
          
          const project = new Project({
            id: i + 1,
            blockchainId: blockchainId,
            name: String(f?.title ?? ''),
            category: String(f?.category ?? 'DeFi'),
            status: fundingGoal > 0 ? 'Live' : 'Funded',
            image: imageDirectUrl || imageUrl || 'https://via.placeholder.com/400',
            investment: {
              amount: mockInvestment,
              date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 90 days
              tokens: mockInvestment,
              currentValue: Math.round(currentValue),
              roi: mockROI,
              ownership: Number(((mockInvestment / fundingGoal) * 100).toFixed(2)),
            },
            projectStats: {
              totalRaised: Math.floor(fundingGoal * (Math.random() * 0.5 + 0.3)), // 30-80% of goal
              fundingGoal: fundingGoal,
              backers: Math.floor(Math.random() * 500) + 50,
              fundingProgress: Math.random() * 100,
              valuation: fundingGoal * (Math.random() * 3 + 2), // 2-5x of funding goal
            },
            performance: [
              { month: "Jan", value: mockInvestment },
              { month: "Feb", value: Math.round(mockInvestment * 1.05) },
              { month: "Mar", value: Math.round(mockInvestment * 1.1) },
              { month: "Apr", value: Math.round(mockInvestment * 1.15) },
              { month: "May", value: Math.round(mockInvestment * 1.2) },
              { month: "Jun", value: Math.round(currentValue) },
            ],
            detailsBlobId: String(f?.details.fields.blob_id ?? ''),
          });
          
          parsed.push(project);
        }
      }
      
      console.log('Fetched projects:', parsed);
      console.log('Fetched team members:', newProjectMembers);
      
      if (parsed.length === 0) {
        console.log('No projects found for this wallet');
        toast.info('No projects found. Launch a project to see it here!');
      }
      
      setUserProjects(parsed);
      
      // Update project members with fetched data
      setProjectMembers(prev => ({
        ...prev,
        ...newProjectMembers,
      }));
      
      setIsLoadingProjects(false);
      return parsed;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // Use mock data as fallback
      const fallbackProjects = mockUserProjects.map((p, i) => new Project({
        ...p,
        id: i + 1,
        blockchainId: `mock-project-${i + 1}`, // Mock blockchain ID for fallback
      }));
      setUserProjects(fallbackProjects);
      setIsLoadingProjects(false);
      return fallbackProjects;
    }
  };

  // Fetch encrypted jobs for a specific project
  const fetchEncryptedJobsForProject = async (projectBlockchainId: string) => {
    try {
      setLoadingProjectJobs(prev => ({ ...prev, [projectBlockchainId]: true }));
      console.log('Fetching encrypted job requests for project:', projectBlockchainId);
      
      const registry = import.meta.env.VITE_REGISTRY_ID;
      const project_struct = await client.getObject({
        id: registry,
        options: { showContent: true },
      });
      const projectContent: any = project_struct.data?.content;
      const parentId = projectContent?.fields?.project_jobs?.fields?.id?.id;
      const name = { type: '0x2::object::ID', value: projectBlockchainId };
      const jobVault = await client.getDynamicFieldObject({ parentId, name });
      const jobVaultContent: any = jobVault.data?.content;
      const jobVaultId = jobVaultContent?.fields?.id?.id;
      const jobVaultObj = await client.getObject({
        id: jobVaultId,
        options: { showContent: true },
      });
      const jobVaultObjContent: any = jobVaultObj.data?.content;
      const jobs = jobVaultObjContent?.fields?.value?.fields?.jobs || [];
      
      console.log(`Fetched ${jobs.length} encrypted jobs for project ${projectBlockchainId}`);
      
      setEncryptedJobs(prev => ({
        ...prev,
        [projectBlockchainId]: jobs
      }));
    } catch (error) {
      console.error(`Error fetching encrypted job requests for project ${projectBlockchainId}:`, error);
    } finally {
      setLoadingProjectJobs(prev => ({ ...prev, [projectBlockchainId]: false }));
    }
  };

  // Fetch projects when wallet is connected
  useEffect(() => {
    if (currentAccount) {
      fetchProjects();
    } else {
      setIsLoadingProjects(false);
      setUserProjects([]);
    }
  }, [currentAccount]);
  
  // Fetch encrypted jobs for all projects when projects are loaded
  useEffect(() => {
    if (userProjects.length > 0) {
      userProjects.forEach(project => {
        if (project.blockchainId) {
          fetchEncryptedJobsForProject(project.blockchainId);
        }
      });
    }
  }, [userProjects]);

  // Calculate portfolio totals
  const totalInvested = userProjects.reduce((sum, p) => sum + p.investment.amount, 0);
  const totalCurrentValue = userProjects.reduce((sum, p) => sum + p.investment.currentValue, 0);
  const totalROI = totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0;
  const totalProjects = userProjects.length;

  // Sort projects
  const sortedProjects = [...userProjects].sort((a, b) => {
    if (sortBy === "roi") return b.investment.roi - a.investment.roi;
    if (sortBy === "amount") return b.investment.amount - a.investment.amount;
    return new Date(b.investment.date).getTime() - new Date(a.investment.date).getTime();
  });

  const toggleProject = (projectId: number) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const handleAddMember = (projectId: number) => {
    setSelectedProjectForMember(projectId);
    setShowAddMemberDialog(true);
  };

  const handleMemberAdded = (member: TeamMember) => {
    if (selectedProjectForMember !== null) {
      setProjectMembers(prev => ({
        ...prev,
        [selectedProjectForMember]: [...(prev[selectedProjectForMember] || []), member],
      }));
    }
  };

  const handleRemoveMember = (projectId: number, memberAddress: string) => {
    setProjectMembers(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter(m => m.address !== memberAddress),
    }));
    toast.success("Team member removed successfully");
  };

  const handleAddJob = (projectId: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to post a job");
      return;
    }
    
    if (!checkCanPostJobs(projectId)) {
      toast.error("You don't have permission to post jobs for this project");
      return;
    }
    
    setSelectedProjectForJob(projectId);
    setShowAddJobDialog(true);
  };

  const handleJobAdded = (job: JobRequest) => {
    if (selectedProjectForJob !== null) {
      setProjectJobs(prev => ({
        ...prev,
        [selectedProjectForJob]: [...(prev[selectedProjectForJob] || []), job],
      }));
    }
  };

  const handleRemoveJob = (projectId: number, jobId: number) => {
    setProjectJobs(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter(j => j.id !== jobId),
    }));
    toast.success("Job request removed successfully");
  };

  const handleApplicationSubmit = (applicationData: any) => {
    console.log("Application submitted:", applicationData);
    toast.success("Application submitted successfully!");
    // In production, this would submit to backend/blockchain
  };

  const handleDecryptJob = async (encryptedJob: any, projectBlockchainId: string, projectId: number) => {
    if (!currentAccount) {
      toast.error("Please connect your wallet first");
      return;
    }

    const jobId = encryptedJob.fields?.id?.id;
    setDecryptingJobId(jobId);
    toast.loading("Decrypting job...");

    try {
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
          tx.object(projectBlockchainId),
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
      
      // Extract applicants from the blockchain encrypted job
      const blockchainApplicants = Array.isArray(encryptedJob.fields?.applicants) 
        ? encryptedJob.fields.applicants 
        : [];
      
      // Extract selected/hired members from blockchain
      const selectedMembers = Array.isArray(encryptedJob.fields?.selected) 
        ? encryptedJob.fields.selected 
        : [];
      
      // Extract and parse job state from blockchain (this is the source of truth)
      const stateVariant = encryptedJob.fields?.state?.variant || "Open";
      const statusMap: { [key: string]: string } = {
        "Open": "Open",
        "Hiring": "Hiring",
        "InProgress": "In Progress",
        "Completed": "Completed",
        "Closed": "Closed",
      };
      const blockchainStatus = statusMap[stateVariant] || "Open";
      
      console.log('Blockchain job state during decryption:', {
        stateVariant: stateVariant,
        mappedStatus: blockchainStatus,
        rawState: encryptedJob.fields?.state
      });
      
      // Create hired members list by finding indices of selected addresses in applicants list
      const hiredMembersList = selectedMembers.length > 0 
        ? selectedMembers
            .map((addr: string) => {
              const applicantIndex = blockchainApplicants.indexOf(addr);
              return applicantIndex !== -1 ? `blockchain-app-${jobId}-${applicantIndex}` : null;
            })
            .filter((id: string | null) => id !== null) as string[]
        : undefined;
      
      // Convert to JobRequest format
      const jobRequest: JobRequest = {
        id: parsedJob.id || Date.now(),
        title: parsedJob.title || '',
        category: parsedJob.category || 'Development',
        budget: parsedJob.budget || 0,
        deadline: parsedJob.deadline || '',
        description: parsedJob.description || '',
        location: parsedJob.location || 'Remote',
        numberOfPeopleToHire: parsedJob.numberOfPeopleToHire || 1,
        requiredSkills: parsedJob.requiredSkills || [],
        organizationContributions: parsedJob.organizationContributions || [],
        applicants: blockchainApplicants.length || 0,
        status: blockchainStatus as "Open" | "Hiring" | "In Progress" | "Completed" | "Closed", // Use blockchain state as source of truth
        postedDate: parsedJob.postedDate || new Date().toISOString(),
        projectId: projectBlockchainId, // Store the project ID
        blockchainJobId: jobId, // Store the blockchain job ID for filtering
        hiredMembers: hiredMembersList,
      };
      
      // Store blockchain applicants as minimal application records
      if (blockchainApplicants.length > 0) {
        const blockchainApplications = blockchainApplicants.map((walletAddress: string, idx: number) => {
          const appId = `blockchain-app-${jobId}-${idx}`;
          const isHired = selectedMembers.includes(walletAddress);
          
          return {
            id: appId,
            name: `Applicant ${idx + 1}`,
            email: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}@blockchain`,
            portfolio: '',
            coverLetter: 'Application submitted via blockchain. Full details encrypted.',
            hourlyRate: '0',
            availability: 'TBD',
            walletAddress: walletAddress,
            twitter: '',
            linkedin: '',
            appliedAt: new Date().toISOString(),
            status: isHired ? 'accepted' : 'pending', // Mark as accepted if hired on blockchain
          };
        });
        
        // Add blockchain applicants to the jobApplications state
        setJobApplications(prev => ({
          ...prev,
          [jobRequest.id]: blockchainApplications,
        }));
        
        console.log(`Added ${blockchainApplicants.length} blockchain applicants for job ${jobRequest.id}`);
        console.log(`${selectedMembers.length} applicants are already hired on blockchain`);
      }
      
      // Print all job details
      console.log('\n=== DECRYPTED JOB DETAILS ===');
      console.log('ID:', jobRequest.id);
      console.log('Title:', jobRequest.title);
      console.log('Category:', jobRequest.category);
      console.log('Budget:', jobRequest.budget);
      console.log('Deadline:', jobRequest.deadline);
      console.log('Description:', jobRequest.description);
      console.log('Location:', jobRequest.location);
      console.log('Required Skills:', jobRequest.requiredSkills);
      console.log('Organization Contributions:', jobRequest.organizationContributions);
      console.log('Applicants:', jobRequest.applicants);
      console.log('Applicant Wallet Addresses:', blockchainApplicants);
      console.log('Status (from blockchain):', jobRequest.status);
      console.log('State Variant:', stateVariant);
      console.log('Hired Members:', jobRequest.hiredMembers);
      console.log('Selected on Blockchain:', selectedMembers);
      console.log('Posted Date:', jobRequest.postedDate);
      console.log('============================\n');
      
      // Add the decrypted job to state
      setProjectJobs(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), jobRequest],
      }));
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

  const checkCanPostJobs = (projectId: number): boolean => {
    if (!isConnected || !walletAddress) {
      return false;
    }
    
    const members = projectMembers[projectId] || [];
    // Check if the connected wallet address is a member with "Post jobs" permission
    const userMember = members.find(m => 
      m.address.toLowerCase() === walletAddress.toLowerCase()
    );
    
    return userMember ? userMember.permissions.includes("Post jobs") : true;
  };

  const toggleJobApplications = (jobId: number) => {
    setExpandedJobApplications(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const toggleEncryptedJobApplicants = (jobId: string) => {
    setExpandedEncryptedJobs(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const handleApplicationStatusChange = async (projectBlockchainId: string, jobBlockchainId: string, jobId: number, appId: string, applicantAddress: string, newStatus: string) => {
    if (!currentAccount) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    console.log('Application status changed:', { 
      projectBlockchainId, 
      jobBlockchainId, 
      jobId, 
      appId, 
      applicantAddress,
      newStatus 
    });
    
    try {
      toast.loading('Updating application status on blockchain...');
      
      const tx = new Transaction();
      tx.moveCall({
        target: `${vendor}::ideation::add_member`,
        arguments: [
          tx.object(registry),
          tx.object(projectBlockchainId),
          tx.object(jobBlockchainId),
          tx.pure.address(applicantAddress) 

        ]
      });
      
      const result = await signAndExecuteTransaction({ transaction: tx });
      console.log('Application status updated on blockchain successfully:', result);
      
      setJobApplications(prev => ({
        ...prev,
        [jobId]: (prev[jobId] || []).map(app => 
          app.id === appId ? { ...app, status: newStatus } : app
        )
      }));
      
      toast.dismiss();
      toast.success(`Application ${newStatus}! 🎉`);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.dismiss();
      toast.error('Failed to update application status. Please try again.');
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30";
      case "reviewing":
        return "bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30";
      case "accepted":
        return "bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3]/30";
      case "rejected":
        return "bg-[#FF3366]/20 text-[#FF3366] border-[#FF3366]/30";
      default:
        return "bg-[#A0A2A8]/20 text-[#A0A2A8] border-[#A0A2A8]/30";
    }
  };

  const handleCompleteJobClick = (projectId: number, job: JobRequest) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to complete this job");
      return;
    }
    
    if (!checkCanPostJobs(projectId)) {
      toast.error("You don't have permission to complete jobs for this project");
      return;
    }

    // Get blockchain project ID from the job or from the userProjects
    const project = userProjects.find(p => p.id === projectId);
    const blockchainProjectId = job.projectId || project?.blockchainId || '';
    
    if (!blockchainProjectId) {
      toast.error("Could not find project blockchain ID");
      return;
    }

    console.log('CompleteJobClick:', {
      projectId,
      blockchainProjectId,
      jobId: job.blockchainJobId || job.id,
      jobTitle: job.title
    });

    setSelectedJobForCompletion(job);
    setSelectedProjectForCompletion(projectId);
    setSelectedProjectBlockchainIdForCompletion(blockchainProjectId);
    setShowCompleteJobDialog(true);
  };

  const handleJobComplete = (jobId: string, completionData: {
    selectedApplicantId?: string;
    completionNotes: string;
    finalStatus: "Completed" | "Closed";
  }) => {
    const projectId = selectedProjectForCompletion;
    console.log('Job completion callback:', {
      jobId,
      projectId,
      completionData
    });
    
    if (selectedProjectForCompletion !== null) {
      // Update job status - jobId here is the blockchain job ID (string)
      // We need to find the job by blockchainJobId
      setProjectJobs(prev => {
        const list = prev[projectId as number] ?? [];
        return {
          ...prev,
          [projectId]: list.map(job => {
            // Match by blockchain job ID first, then fallback to frontend ID
            const matches = (job.blockchainJobId === jobId) || 
                           (String(job.id) === String(jobId));
            
            if (matches) {
              return {
                ...job,
                status: completionData.finalStatus as JobRequest["status"],
                completedAt: new Date().toISOString(),
                completionNotes: completionData.completionNotes,
              };
            }
            return job;
          }),
        };
      });
      
      console.log("Job completed with data:", {
        jobId,
        projectId: selectedProjectForCompletion,
        completionData
      });
    }
  };

  const handleHireClick = (projectId: number, job: JobRequest) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to hire applicants");
      return;
    }
    
    if (!checkCanPostJobs(projectId)) {
      toast.error("You don't have permission to hire for this project");
      return;
    }

    setSelectedJobForHiring(job);
    setSelectedProjectForHiring(projectId);
    setShowHireDialog(true);
  };

  const handleHire = (jobId: string, selectedApplicantIds: string[], newStatus: "Hiring" | "In Progress") => {
    if (selectedProjectForHiring !== null) {
      setProjectJobs(prev => ({
        ...prev,
        [selectedProjectForHiring]: (prev[selectedProjectForHiring] || []).map(job => 
          job.id.toString() === jobId 
            ? { ...job, status: newStatus, hiredMembers: selectedApplicantIds }
            : job
        ),
      }));

      console.log("Hired applicants:", {
        jobId,
        projectId: selectedProjectForHiring,
        applicantIds: selectedApplicantIds,
        newStatus
      });
    }
  };

  const handleRemoveHiredMember = (projectId: number, jobId: number, applicantId: string) => {
    setProjectJobs(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(job => 
        job.id === jobId 
          ? { ...job, hiredMembers: (job.hiredMembers || []).filter(id => id !== applicantId) }
          : job
      ),
    }));
    toast.success("Member removed from job");
  };

  const getApplicationStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "reviewing":
        return <FileText className="w-3 h-3" />;
      case "accepted":
        return <CheckCircle2 className="w-3 h-3" />;
      case "rejected":
        return <XCircle className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30";
      case "developer":
        return "bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30";
      case "designer":
        return "bg-[#C04BFF]/20 text-[#C04BFF] border-[#C04BFF]/30";
      case "marketer":
        return "bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3]/30";
      default:
        return "bg-[#A0A2A8]/20 text-[#A0A2A8] border-[#A0A2A8]/30";
    }
  };

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

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3]/30";
      case "Hiring":
        return "bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30";
      case "In Progress":
        return "bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30";
      case "Completed":
        return "bg-[#A0A2A8]/20 text-[#A0A2A8] border-[#A0A2A8]/30";
      case "Closed":
        return "bg-[#FF3366]/20 text-[#FF3366] border-[#FF3366]/30";
      default:
        return "bg-[#A0A2A8]/20 text-[#A0A2A8] border-[#A0A2A8]/30";
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl text-foreground mb-4">
            My Projects
          </h1>
          <p className="text-xl text-muted-foreground">
            Track your investments and project performance
          </p>
          {isLoadingProjects && (
            <div className="flex items-center gap-2 text-[#00E0FF] mt-4">
              <div className="animate-spin h-4 w-4 border-2 border-[#00E0FF] border-t-transparent rounded-full" />
              <span className="text-sm">Loading projects from Walrus...</span>
            </div>
          )}
        </motion.div>


        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-6 bg-card/80 border-border backdrop-blur-sm hover:border-[#00E0FF]/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <Wallet className="w-8 h-8 text-[#00E0FF]" />
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl text-foreground mb-1">
                ${totalInvested.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-sm">Total Invested</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 bg-card/80 border-border backdrop-blur-sm hover:border-[#C04BFF]/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-[#C04BFF]" />
                <div className={`flex items-center gap-1 text-sm ${totalROI >= 0 ? 'text-[#00FFA3]' : 'text-[#FF6B00]'}`}>
                  {totalROI >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{totalROI >= 0 ? '+' : ''}{totalROI.toFixed(1)}%</span>
                </div>
              </div>
              <div className="text-3xl text-foreground mb-1">
                ${totalCurrentValue.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-sm">Current Value</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6 bg-card/80 border-border backdrop-blur-sm hover:border-[#FF6B00]/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-[#FF6B00]" />
                <div className="flex items-center gap-1 text-[#00FFA3] text-sm">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl text-foreground mb-1">
                {totalProjects}
              </div>
              <div className="text-muted-foreground text-sm">Backed Projects</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6 bg-card/80 border-border backdrop-blur-sm hover:border-[#00FFA3]/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <Percent className="w-8 h-8 text-[#00FFA3]" />
                <div className={`flex items-center gap-1 text-sm ${totalROI >= 0 ? 'text-[#00FFA3]' : 'text-[#FF6B00]'}`}>
                  {totalROI >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{totalROI >= 0 ? '+' : ''}{totalROI.toFixed(1)}%</span>
                </div>
              </div>
              <div className={`text-3xl mb-1 ${totalROI >= 0 ? 'text-[#00FFA3]' : 'text-[#FF6B00]'}`}>
                ${Math.abs(totalCurrentValue - totalInvested).toLocaleString()}
              </div>
              <div className="text-muted-foreground text-sm">{totalROI >= 0 ? 'Total Gain' : 'Total Loss'}</div>
            </Card>
          </motion.div>
        </div>

        {/* Sort Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-6 flex items-center justify-between"
        >
          <h2 className="text-2xl text-foreground">Your Backed Projects</h2>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "roi" ? "default" : "outline"}
              onClick={() => setSortBy("roi")}
              className={sortBy === "roi" 
                ? "bg-[#00E0FF] text-[#0D0E10] hover:bg-[#00E0FF]/90" 
                : "border-border text-foreground hover:bg-card"
              }
            >
              By ROI
            </Button>
            <Button
              variant={sortBy === "amount" ? "default" : "outline"}
              onClick={() => setSortBy("amount")}
              className={sortBy === "amount" 
                ? "bg-[#00E0FF] text-[#0D0E10] hover:bg-[#00E0FF]/90" 
                : "border-border text-foreground hover:bg-card"
              }
            >
              By Amount
            </Button>
            <Button
              variant={sortBy === "date" ? "default" : "outline"}
              onClick={() => setSortBy("date")}
              className={sortBy === "date" 
                ? "bg-[#00E0FF] text-[#0D0E10] hover:bg-[#00E0FF]/90" 
                : "border-border text-foreground hover:bg-card"
              }
            >
              By Date
            </Button>
          </div>
        </motion.div>

        {/* Projects List */}
        <div className="space-y-4">
          {sortedProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="bg-card/80 border-border backdrop-blur-sm overflow-hidden">
                {/* Project Header - Always Visible */}
                <div 
                  className="p-6 cursor-pointer hover:bg-card transition-all"
                  onClick={() => toggleProject(project.id)}
                >
                  <div className="flex items-start gap-6">
                    {/* Project Image */}
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />

                    {/* Project Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl text-foreground">{project.name}</h3>
                            <Badge 
                              className={`${
                                project.status === "Live" 
                                  ? "bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3]/30" 
                                  : "bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30"
                              }`}
                            >
                              {project.status}
                            </Badge>
                            <Badge className="bg-[#C04BFF]/20 text-[#C04BFF] border-[#C04BFF]/30">
                              {project.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Backed on {new Date(project.investment.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {project.projectStats.backers} backers
                            </div>
                          </div>
                        </div>
                        {expandedProject === project.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>

                      {/* Investment Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Your Investment</div>
                          <div className="text-lg text-foreground">
                            ${project.investment.amount.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Current Value</div>
                          <div className="text-lg text-foreground">
                            ${project.investment.currentValue.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">ROI</div>
                          <div className={`text-lg flex items-center gap-1 ${
                            project.investment.roi >= 0 ? 'text-[#00FFA3]' : 'text-[#FF6B00]'
                          }`}>
                            {project.investment.roi >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {project.investment.roi >= 0 ? '+' : ''}{project.investment.roi}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Ownership</div>
                          <div className="text-lg text-foreground">
                            {project.investment.ownership}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Tokens</div>
                          <div className="text-lg text-foreground">
                            {project.investment.tokens.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Project Details */}
                {expandedProject === project.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-border bg-muted/30"
                  >
                    <div className="p-6">
                      <Tabs defaultValue="performance" className="w-full">
                        <TabsList className="bg-card border border-border mb-6">
                          <TabsTrigger 
                            value="performance" 
                            className="data-[state=active]:bg-[#00E0FF]/10 data-[state=active]:text-[#00E0FF]"
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Performance
                          </TabsTrigger>
                          <TabsTrigger 
                            value="funding" 
                            className="data-[state=active]:bg-[#C04BFF]/10 data-[state=active]:text-[#C04BFF]"
                          >
                            <PieChart className="w-4 h-4 mr-2" />
                            Funding
                          </TabsTrigger>
                          <TabsTrigger 
                            value="team" 
                            className="data-[state=active]:bg-[#00FFA3]/10 data-[state=active]:text-[#00FFA3]"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Team
                          </TabsTrigger>
                          <TabsTrigger 
                            value="jobs" 
                            className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00]"
                          >
                            <Briefcase className="w-4 h-4 mr-2" />
                            Jobs
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="performance">
                          <div className="space-y-6">
                            {/* Performance Chart */}
                            <Card className="p-6 bg-card/50 border-border">
                              <h4 className="text-lg text-foreground mb-4">
                                Investment Value Over Time
                              </h4>
                              <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={project.performance}>
                                  <defs>
                                    <linearGradient id={`gradient-${project.id}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#00E0FF" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                                  <YAxis stroke="var(--color-muted-foreground)" />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: "var(--color-popover)", 
                                      border: "1px solid var(--color-border)",
                                      borderRadius: "8px",
                                      color: "var(--color-popover-foreground)"
                                    }} 
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#00E0FF" 
                                    strokeWidth={3}
                                    fill={`url(#gradient-${project.id})`}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </Card>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card className="p-4 bg-card/50 border-border">
                                <div className="text-sm text-muted-foreground mb-2">Project Valuation</div>
                                <div className="text-2xl text-foreground">
                                  ${(project.projectStats.valuation / 1000000).toFixed(1)}M
                                </div>
                              </Card>
                              <Card className="p-4 bg-card/50 border-border">
                                <div className="text-sm text-muted-foreground mb-2">Your Share Value</div>
                                <div className="text-2xl text-[#00E0FF]">
                                  ${((project.projectStats.valuation * project.investment.ownership) / 100).toLocaleString()}
                                </div>
                              </Card>
                              <Card className="p-4 bg-card/50 border-border">
                                <div className="text-sm text-muted-foreground mb-2">Unrealized Gain</div>
                                <div className={`text-2xl ${
                                  project.investment.roi >= 0 ? 'text-[#00FFA3]' : 'text-[#FF6B00]'
                                }`}>
                                  ${Math.abs(project.investment.currentValue - project.investment.amount).toLocaleString()}
                                </div>
                              </Card>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="funding">
                          <div className="space-y-6">
                            {/* Funding Progress */}
                            <Card className="p-6 bg-card/50 border-border">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg text-foreground">Funding Progress</h4>
                                <span className="text-[#00E0FF]">
                                  {project.projectStats.fundingProgress.toFixed(1)}%
                                </span>
                              </div>
                              <Progress 
                                value={project.projectStats.fundingProgress} 
                                className="h-3 mb-4"
                              />
                              <div className="flex items-center justify-between text-sm">
                                <div>
                                  <span className="text-muted-foreground">Raised: </span>
                                  <span className="text-foreground">
                                    ${project.projectStats.totalRaised.toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Goal: </span>
                                  <span className="text-foreground">
                                    ${project.projectStats.fundingGoal.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </Card>

                            {/* Backer Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card className="p-6 bg-card/50 border-border">
                                <div className="flex items-center gap-4 mb-4">
                                  <Users className="w-8 h-8 text-[#C04BFF]" />
                                  <div>
                                    <div className="text-sm text-muted-foreground">Total Backers</div>
                                    <div className="text-2xl text-foreground">
                                      {project.projectStats.backers}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Average backing: ${(project.projectStats.totalRaised / project.projectStats.backers).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                              </Card>

                              <Card className="p-6 bg-card/50 border-border">
                                <div className="flex items-center gap-4 mb-4">
                                  <Target className="w-8 h-8 text-[#FF6B00]" />
                                  <div>
                                    <div className="text-sm text-muted-foreground">Your Rank</div>
                                    <div className="text-2xl text-foreground">
                                      #{Math.floor(Math.random() * 20) + 1}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Among {project.projectStats.backers} backers
                                </div>
                              </Card>
                            </div>

                            {/* View Project Button */}
                            <Button 
                              className="w-full bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                            >
                              View Full Project Details
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="team">
                          <div className="space-y-6">
                            {/* Team Header */}
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-lg text-foreground mb-1">Team Members</h4>
                                <p className="text-sm text-muted-foreground">
                                  {(projectMembers[project.id] || []).length} member(s) with project access
                                </p>
                              </div>
                              <Button
                                onClick={() => handleAddMember(project.id)}
                                className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Member
                              </Button>
                            </div>

                            {/* Team Members List */}
                            <div className="space-y-3">
                              {(projectMembers[project.id] || []).length === 0 ? (
                                <Card className="p-8 bg-card/50 border-border text-center">
                                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                  <p className="text-muted-foreground mb-4">No team members yet</p>
                                  <Button
                                    onClick={() => handleAddMember(project.id)}
                                    variant="outline"
                                    className="border-border text-foreground hover:bg-card"
                                  >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add First Member
                                  </Button>
                                </Card>
                              ) : (
                                (projectMembers[project.id] || []).map((member, idx) => (
                                  <Card key={idx} className="p-4 bg-card/50 border-border hover:border-[#00E0FF]/30 transition-all">
                                    <div className="flex items-start gap-4">
                                      <Avatar className="w-12 h-12 bg-gradient-to-br from-[#00E0FF] to-[#C04BFF]">
                                        <AvatarFallback className="text-[#0D0E10]">
                                          {member.email.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      
                                      <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                          <div>
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-foreground">
                                                {member.address.substring(0, 6)}...{member.address.substring(member.address.length - 4)}
                                              </span>
                                              <Badge className={getRoleColor(member.role)}>
                                                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                              </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                              <Mail className="w-3 h-3" />
                                              <span>{member.email}</span>
                                            </div>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRemoveMember(project.id, member.address)}
                                            className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 h-8 px-3"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                          <Calendar className="w-3 h-3" />
                                          <span>Added {new Date(member.addedDate).toLocaleDateString()}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 flex-wrap">
                                          {member.permissions.slice(0, 3).map((permission, permIdx) => (
                                            <Badge
                                              key={permIdx}
                                              className="bg-card text-muted-foreground border-border text-xs"
                                            >
                                              {permission}
                                            </Badge>
                                          ))}
                                          {member.permissions.length > 3 && (
                                            <Badge className="bg-card text-muted-foreground border-border text-xs">
                                              +{member.permissions.length - 3} more
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                ))
                              )}
                            </div>

                            {/* Team Stats */}
                            {(projectMembers[project.id] || []).length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="p-4 bg-card/50 border-border">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Shield className="w-5 h-5 text-[#FF6B00]" />
                                    <div className="text-sm text-muted-foreground">Admins</div>
                                  </div>
                                  <div className="text-2xl text-foreground">
                                    {(projectMembers[project.id] || []).filter(m => m.role === "admin").length}
                                  </div>
                                </Card>
                                <Card className="p-4 bg-card/50 border-border">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Users className="w-5 h-5 text-[#00E0FF]" />
                                    <div className="text-sm text-muted-foreground">Total Members</div>
                                  </div>
                                  <div className="text-2xl text-foreground">
                                    {(projectMembers[project.id] || []).length}
                                  </div>
                                </Card>
                                <Card className="p-4 bg-card/50 border-border">
                                  <div className="flex items-center gap-3 mb-2">
                                    <BarChart3 className="w-5 h-5 text-[#C04BFF]" />
                                    <div className="text-sm text-muted-foreground">Active Roles</div>
                                  </div>
                                  <div className="text-2xl text-foreground">
                                    {new Set((projectMembers[project.id] || []).map(m => m.role)).size}
                                  </div>
                                </Card>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="jobs">
                          {!isConnected ? (
                            <div className="text-center py-12">
                              <div className="relative inline-block mb-6">
                                <div className="p-4 bg-gradient-to-br from-[#FF6B00]/20 to-[#C04BFF]/20 rounded-2xl border-2 border-[#FF6B00]/30">
                                  <Lock className="w-12 h-12 text-[#FF6B00]" />
                                </div>
                              </div>
                              <h4 className="text-xl text-foreground mb-3">
                                Wallet Connection Required
                              </h4>
                              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Connect your wallet to view job requests, post new opportunities, and manage your project positions.
                              </p>
                              <Button
                                onClick={() => toast.info("Please use the wallet button in the top navigation to connect")}
                                className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                              >
                                <Wallet className="w-4 h-4 mr-2" />
                                Connect Wallet to Continue
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {/* Jobs Header */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-lg text-foreground mb-1">Job Requests</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {(encryptedJobs[project.blockchainId] || []).length} total · {(projectJobs[project.id] || []).length} posted
                                  </p>
                                  {loadingProjectJobs[project.blockchainId] && (
                                    <p className="text-sm text-[#00E0FF] mt-1 flex items-center gap-2">
                                      <div className="animate-spin h-3 w-3 border-2 border-[#00E0FF] border-t-transparent rounded-full" />
                                      Loading jobs...
                                    </p>
                                  )}
                                  {!loadingProjectJobs[project.blockchainId] && checkCanPostJobs(project.id) && (
                                    <p className="text-sm text-[#00FFA3] mt-1">
                                      You can post jobs for this project
                                    </p>
                                  )}
                                  {!loadingProjectJobs[project.blockchainId] && !checkCanPostJobs(project.id) && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      View-only access
                                    </p>
                                  )}
                                </div>
                                {checkCanPostJobs(project.id) ? (
                                  <Button
                                    onClick={() => handleAddJob(project.id)}
                                    className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                                  >
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    Post Job
                                  </Button>
                                ) : (
                                  <Card className="p-3 bg-muted border-border">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Shield className="w-4 h-4" />
                                      <span>View Only</span>
                                    </div>
                                  </Card>
                                )}
                              </div>

                              {/* Jobs List */}
                            <div className="space-y-3">
                              {(projectJobs[project.id] || []).length === 0 && (encryptedJobs[project.blockchainId] || []).length === 0 && !loadingProjectJobs[project.blockchainId] ? (
                                <Card className="p-8 bg-card/50 border-border text-center">
                                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                  <p className="text-muted-foreground mb-4">No job requests yet</p>
                                  {!isConnected ? (
                                    <div className="space-y-3">
                                      <p className="text-sm text-[#FF6B00]">
                                        Connect your wallet to post jobs
                                      </p>
                                      <Card className="p-4 bg-[#FF6B00]/10 border-[#FF6B00]/30 max-w-md mx-auto">
                                        <div className="flex items-start gap-3">
                                          <Wallet className="w-5 h-5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                                          <div className="text-left">
                                            <p className="text-[#FF6B00] mb-1">Wallet Required</p>
                                            <p className="text-sm text-muted-foreground">
                                              You need to connect your wallet to post job requests for this project.
                                            </p>
                                          </div>
                                        </div>
                                      </Card>
                                    </div>
                                  ) : checkCanPostJobs(project.id) ? (
                                    <Button
                                      onClick={() => handleAddJob(project.id)}
                                      variant="outline"
                                      className="border-border text-foreground hover:bg-card"
                                    >
                                      <Briefcase className="w-4 h-4 mr-2" />
                                      Post First Job
                                    </Button>
                                  ) : (
                                    <Card className="p-4 bg-[#FF6B00]/10 border-[#FF6B00]/30 max-w-md mx-auto">
                                      <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                                        <div className="text-left">
                                          <p className="text-[#FF6B00] mb-1">No Permission</p>
                                          <p className="text-sm text-muted-foreground">
                                            You don't have permission to post jobs for this project. Contact the project admin.
                                          </p>
                                        </div>
                                      </div>
                                    </Card>
                                  )}
                                </Card>
                              ) : (
                                (projectJobs[project.id] || []).map((job) => {
                                  const applications = jobApplications[job.id] || [];
                                  const isExpanded = expandedJobApplications[job.id] || false;
                                  
                                  return (
                                  <Card key={job.id} className="overflow-hidden bg-card/50 border-border hover:border-[#00E0FF]/30 transition-all">
                                    <div className="p-5 space-y-4">
                                      {/* Job Header */}
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <h5 className="text-lg text-foreground">{job.title}</h5>
                                            <Badge className={getJobStatusColor(job.status)}>
                                              {job.status}
                                            </Badge>
                                          </div>
                                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                              {getCategoryIcon(job.category)}
                                              <span>{job.category}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Users className="w-3 h-3" />
                                              <span>{applications.length} applicant{applications.length !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                                            </div>
                                          </div>
                                        </div>
                                        {checkCanPostJobs(project.id) && (
                                          <div className="flex gap-2">
                                            {(job.status === "Open" || job.status === "Hiring") && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleHireClick(project.id, job)}
                                                className="border-[#00E0FF]/30 text-[#00E0FF] hover:bg-[#00E0FF]/10 h-8 px-3"
                                              >
                                                <UserPlus className="w-3 h-3 mr-1" />
                                                {job.status === "Hiring" ? "Manage Hiring" : "Hire Applicants"}
                                              </Button>
                                            )}
                                            {(job.status === "Hiring" || job.status === "In Progress") && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleCompleteJobClick(project.id, job)}
                                                className="border-[#00FFA3]/30 text-[#00FFA3] hover:bg-[#00FFA3]/10 h-8 px-3"
                                              >
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Complete
                                              </Button>
                                            )}
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleRemoveJob(project.id, job.id)}
                                              className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 h-8 px-3"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        )}
                                      </div>

                                      {/* Job Description */}
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {job.description}
                                      </p>

                                      {/* Required Skills */}
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-2">Required Skills:</p>
                                        <div className="flex gap-2 flex-wrap">
                                          {job.requiredSkills.map((skill, idx) => (
                                            <Badge
                                              key={idx}
                                              className="bg-card text-foreground border-border text-xs"
                                            >
                                              {skill}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Hired Members - Show for Hiring and In Progress jobs */}
                                      {(job.status === "Hiring" || job.status === "In Progress") && job.hiredMembers && job.hiredMembers.length > 0 && (
                                        <div className="p-4 bg-[#00E0FF]/5 border border-[#00E0FF]/20 rounded-lg">
                                          <div className="mb-3">
                                            <div className="flex items-center justify-between mb-2">
                                              <h6 className="text-sm text-foreground flex items-center gap-2">
                                                <UserCheck className="w-4 h-4 text-[#00E0FF]" />
                                                {job.status === "Hiring" ? "Marked for Hiring" : "Working on this Job"}
                                              </h6>
                                              <Badge className="bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30 text-xs">
                                                {job.hiredMembers.length} member{job.hiredMembers.length !== 1 ? 's' : ''}
                                              </Badge>
                                            </div>
                                            {job.status === "In Progress" && checkCanPostJobs(project.id) && (
                                              <p className="text-xs text-muted-foreground">
                                                Click "Complete" above when work is finished to mark this job as done
                                              </p>
                                            )}
                                          </div>
                                          <div className="space-y-2">
                                            {job.hiredMembers.map((memberId) => {
                                              const memberApp = applications.find(app => app.id === memberId);
                                              if (!memberApp) return null;
                                              
                                              return (
                                                <div key={memberId} className="flex items-center justify-between p-3 bg-card/50 border border-border rounded-lg">
                                                  <div className="flex items-center gap-3">
                                                    <Avatar className="w-8 h-8 border-2 border-[#00E0FF]/30">
                                                      <AvatarFallback className="bg-gradient-to-br from-[#00E0FF] to-[#C04BFF] text-[#0D0E10] text-xs">
                                                        {memberApp.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                                      </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                      <div className="text-sm text-foreground">{memberApp.name}</div>
                                                      <div className="text-xs text-muted-foreground">{memberApp.email}</div>
                                                    </div>
                                                  </div>
                                                  {checkCanPostJobs(project.id) && (
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      onClick={() => handleRemoveHiredMember(project.id, job.id, memberId)}
                                                      className="text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 h-7 px-2"
                                                    >
                                                      <XCircle className="w-3 h-3 mr-1" />
                                                      Remove
                                                    </Button>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}

                                      {/* Job Footer */}
                                            <div className="flex items-center justify-between pt-3 border-t border-border">
                                        <div className="flex items-center gap-6">
                                          <div>
                                            <div className="text-xs text-muted-foreground mb-1">Budget</div>
                                            <div className="text-lg text-[#00E0FF]">
                                              ${job.budget.toLocaleString()}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-muted-foreground mb-1">Deadline</div>
                                            <div className="text-sm text-foreground">
                                              {new Date(job.deadline).toLocaleDateString()}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                          {/* Status Helper Text */}
                                          {(job.status === "Hiring" || job.status === "In Progress") && applications.length > 0 && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00E0FF]/10 border border-[#00E0FF]/20 rounded text-xs text-[#00E0FF]">
                                              <AlertCircle className="w-3 h-3" />
                                              {job.status === "Hiring" ? "Review applications & start work" : "Job in progress - Manage team"}
                                            </div>
                                          )}
                                          
                                          <div className="flex gap-2 sm:ml-auto">
                                            {applications.length > 0 && isConnected && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => toggleJobApplications(job.id)}
                                                className={`border-border text-foreground hover:bg-card ${
                                                  (job.status === "Hiring" || job.status === "In Progress") 
                                                    ? "border-[#00E0FF]/30 text-[#00E0FF]" 
                                                    : ""
                                                }`}
                                              >
                                                {isExpanded ? (
                                                  <>
                                                    <ChevronUp className="w-3 h-3 mr-1" />
                                                    Hide Applications
                                                  </>
                                                ) : (
                                                  <>
                                                    <ChevronDown className="w-3 h-3 mr-1" />
                                                    View {applications.length} Application{applications.length !== 1 ? 's' : ''}
                                                  </>
                                                )}
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Wallet Connection Required Message */}
                                    {!isConnected && applications.length > 0 && (
                                      <div className="border-t border-border bg-[#FF6B00]/5 p-4">
                                        <div className="flex items-center gap-3">
                                          <div className="p-2 bg-[#FF6B00]/20 rounded-lg">
                                            <Wallet className="w-5 h-5 text-[#FF6B00]" />
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-foreground mb-1">Connect Wallet to View Applications</p>
                                            <p className="text-sm text-muted-foreground">
                                              This job has {applications.length} application{applications.length !== 1 ? 's' : ''}. Connect your wallet to view and manage them.
                                            </p>
                                          </div>
                                          <Button
                                            size="sm"
                                            onClick={() => toast.info("Please use the wallet button in the top navigation to connect")}
                                            className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                                          >
                                            <Wallet className="w-3 h-3 mr-2" />
                                            Connect
                                          </Button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Applications Section */}
                                    {isExpanded && applications.length > 0 && isConnected && (
                                      <div className="border-t border-border bg-card/50 p-5">
                                        <div className="mb-4">
                                          <div className="flex items-center justify-between mb-2">
                                            <h6 className="text-foreground flex items-center gap-2">
                                              <Users className="w-4 h-4 text-[#00E0FF]" />
                                              Applications ({applications.length})
                                            </h6>
                                            {applications.some(app => app.id.startsWith('blockchain-app-')) && (
                                              <Badge className="bg-[#00E0FF]/10 text-[#00E0FF] border-[#00E0FF]/30 text-xs">
                                                <Wallet className="w-3 h-3 mr-1" />
                                                Blockchain Data
                                              </Badge>
                                            )}
                                          </div>
                                          {job.status === "Hiring" && checkCanPostJobs(project.id) && (
                                            <p className="text-xs text-muted-foreground">
                                              Review applications and use "Manage Hiring" to add more members or start work
                                            </p>
                                          )}
                                          {job.status === "In Progress" && checkCanPostJobs(project.id) && (
                                            <p className="text-xs text-muted-foreground">
                                              Job in progress. You can still accept more applications or complete the job when ready.
                                            </p>
                                          )}
                                        </div>
                                        <div className="space-y-3">
                                          {applications.map((app) => (
                                            <Card key={app.id} className="p-4 bg-card/80 border-border">
                                              <div className="space-y-3">
                                                {/* Applicant Header */}
                                                <div className="flex items-start justify-between">
                                                  <div className="flex items-start gap-3 flex-1">
                                                    <Avatar className="w-10 h-10 border-2 border-[#00E0FF]/30">
                                                      <AvatarFallback className="bg-gradient-to-br from-[#00E0FF] to-[#C04BFF] text-[#0D0E10]">
                                                        {app.name.split(" ").map((n: string) => n[0]).join("")}
                                                      </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <h6 className="text-foreground">{app.name}</h6>
                                                        <Badge className={getApplicationStatusColor(app.status)}>
                                                          {getApplicationStatusIcon(app.status)}
                                                          <span className="ml-1 capitalize">{app.status}</span>
                                                        </Badge>
                                                        {app.id.startsWith('blockchain-app-') && (
                                                          <Badge className="bg-[#00E0FF]/10 text-[#00E0FF] border-[#00E0FF]/30 text-xs">
                                                            On-chain
                                                          </Badge>
                                                        )}
                                                      </div>
                                                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                          <Calendar className="w-3 h-3" />
                                                          {formatDate(app.appliedAt)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                          <DollarSign className="w-3 h-3" />
                                                          ${app.hourlyRate}/hr
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                          <Clock className="w-3 h-3" />
                                                          {app.availability}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                          <Wallet className="w-3 h-3" />
                                                          {app.walletAddress}
                                                        </span>
                                                      </div>
                                                      
                                                      {/* Required Social Links */}
                                                      <div className="flex gap-2 mt-2">
                                                        <a
                                                          href={app.twitter}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="text-[#1DA1F2] hover:underline text-xs flex items-center gap-1"
                                                        >
                                                          <Twitter className="w-3 h-3" />
                                                          Twitter
                                                        </a>
                                                        <a
                                                          href={app.linkedin}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="text-[#0A66C2] hover:underline text-xs flex items-center gap-1"
                                                        >
                                                          <Linkedin className="w-3 h-3" />
                                                          LinkedIn
                                                        </a>
                                                        {app.github && (
                                                          <a
                                                            href={app.github}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[#C04BFF] hover:underline text-xs flex items-center gap-1"
                                                          >
                                                            <Github className="w-3 h-3" />
                                                            GitHub
                                                          </a>
                                                        )}
                                                        {app.discord && (
                                                          <span className="text-[#5865F2] text-xs flex items-center gap-1">
                                                            <MessageCircle className="w-3 h-3" />
                                                            {app.discord}
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Cover Letter */}
                                                <div>
                                                  <p className="text-xs text-muted-foreground mb-1">Cover Letter:</p>
                                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {app.coverLetter}
                                                  </p>
                                                </div>

                                                {/* Contact Info */}
                                                <div className="flex gap-3 text-xs">
                                                  <a
                                                    href={`mailto:${app.email}`}
                                                    className="text-[#00E0FF] hover:underline flex items-center gap-1"
                                                  >
                                                    <Mail className="w-3 h-3" />
                                                    {app.email}
                                                  </a>
                                                  {app.portfolio && (
                                                    <a
                                                      href={app.portfolio}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-[#00E0FF] hover:underline flex items-center gap-1"
                                                    >
                                                      <ExternalLink className="w-3 h-3" />
                                                      Portfolio
                                                    </a>
                                                  )}
                                                </div>

                                                {/* Action Buttons */}
                                                {checkCanPostJobs(project.id) && app.status === "pending" && (job.status === "Open" || job.status === "Hiring" || job.status === "In Progress") && (
                                                  <div className="flex gap-2 pt-2">
                                                    <Button
                                                      size="sm"
                                                      onClick={() => handleApplicationStatusChange(
                                                        project.blockchainId,
                                                        job.blockchainJobId || '',
                                                        job.id,
                                                        app.id,
                                                        app.walletAddress,
                                                        "accepted"
                                                      )}
                                                      className="flex-1 bg-gradient-to-r from-[#00FFA3] to-[#00E0FF] hover:opacity-90 text-[#0D0E10]"
                                                    >
                                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                                      Accept
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      onClick={() => handleApplicationStatusChange(
                                                        project.blockchainId,
                                                        job.blockchainJobId || '',
                                                        job.id,
                                                        app.id,
                                                        app.walletAddress,
                                                        "rejected"
                                                      )}
                                                      variant="outline"
                                                      className="flex-1 border-[#FF3366]/30 text-[#FF3366] hover:bg-[#FF3366]/10"
                                                    >
                                                      <XCircle className="w-3 h-3 mr-1" />
                                                      Reject
                                                    </Button>
                                                  </div>
                                                )}
                                              </div>
                                            </Card>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </Card>
                                  );
                                })
                              )}
                              
                              {/* Show encrypted jobs */}
                              {(encryptedJobs[project.blockchainId] || []).map((encJob, idx) => {
                                const jobId = encJob.fields?.id?.id;
                                const isDecrypted = (projectJobs[project.id] || []).some(j => j.blockchainJobId === jobId);
                                const isDecrypting = decryptingJobId === jobId;
                                
                                // Skip if already decrypted
                                if (isDecrypted) return null;
                                
                                // Parse non-encrypted metadata
                                const fields = encJob.fields || {};
                                const budget = Number(fields.prize_pool || 0) / 1_000_000; // Convert from micro-USDC to USDC
                                const numWorkers = Number(fields.num_workers || 1);
                                const categoryNum = Number(fields.category || 0);
                                const categoryMap: { [key: number]: string } = {
                                  0: "Development",
                                  1: "Design",
                                  2: "Content",
                                  3: "Marketing",
                                };
                                const category = categoryMap[categoryNum] || "Development";
                                
                                // Parse job state from blockchain
                                const stateVariant = fields.state?.variant || "Open";
                                const statusMap: { [key: string]: string } = {
                                  "Open": "Open",
                                  "Hiring": "Hiring",
                                  "InProgress": "In Progress",
                                  "Completed": "Completed",
                                  "Closed": "Closed",
                                };
                                const status = statusMap[stateVariant] || "Open";
                                
                                console.log('Encrypted job state:', {
                                  jobId: jobId,
                                  stateVariant: stateVariant,
                                  mappedStatus: status,
                                  rawState: fields.state
                                });
                                
                                const applicantsList = Array.isArray(fields.applicants) ? fields.applicants : [];
                                const applicantsCount = applicantsList.length;
                                const selectedList = Array.isArray(fields.selected) ? fields.selected : [];
                                const selectedCount = selectedList.length;
                                const isExpanded = expandedEncryptedJobs[jobId] || false;
                                
                                return (
                                  <Card
                                    key={jobId || idx}
                                    className="overflow-hidden bg-card/50 border-[#FF6B00]/30 backdrop-blur-sm hover:border-[#FF6B00]/50 transition-all"
                                  >
                                    <div className="p-5 space-y-4">
                                      {/* Job Header */}
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Lock className="w-4 h-4 text-[#FF6B00]" />
                                            <h5 className="text-lg text-foreground">Encrypted Job Request #{idx + 1}</h5>
                                            <Badge className={getJobStatusColor(status)}>
                                              {status}
                                            </Badge>
                                            <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30">
                                              🔒 Locked
                                            </Badge>
                                          </div>
                                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                              {getCategoryIcon(category)}
                                              <span>{category}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Lock className="w-3 h-3" />
                                              <span>Details encrypted</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Encrypted Notice */}
                                      <div className="p-3 bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-lg">
                                        <p className="text-sm text-muted-foreground">
                                          🔒 Job title, description, and other details are encrypted. Click "Decrypt" to view full information.
                                        </p>
                                      </div>

                                      {/* Public Metadata and Action Buttons */}
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <div className="text-xs text-muted-foreground mb-1">Budget</div>
                                          <div className="text-lg text-[#00E0FF]">
                                            ${budget.toLocaleString()}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-xs text-muted-foreground mb-1">Workers Needed</div>
                                          <div className="text-lg text-foreground">
                                            {numWorkers} {numWorkers === 1 ? 'person' : 'people'}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => handleDecryptJob(encJob, project.blockchainId, project.id)}
                                          disabled={isDecrypting}
                                          className="w-full bg-gradient-to-r from-[#FF6B00] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
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
                                  </Card>
                                );
                              })}
                            </div>

                            {/* Jobs Stats */}
                            {((projectJobs[project.id] || []).length > 0 || (encryptedJobs[project.blockchainId] || []).length > 0) && (
                              <div className="space-y-4">
                                {/* Blockchain Jobs Summary */}
                                {(encryptedJobs[project.blockchainId] || []).length > 0 && (
                                  <Card className="p-4 bg-gradient-to-r from-[#00E0FF]/10 to-[#C04BFF]/10 border-[#00E0FF]/30">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#00E0FF]/20 rounded-lg">
                                          <Briefcase className="w-5 h-5 text-[#00E0FF]" />
                                        </div>
                                        <div>
                                          <p className="text-foreground font-medium">
                                            {(encryptedJobs[project.blockchainId] || []).length} Total Job{(encryptedJobs[project.blockchainId] || []).length !== 1 ? 's' : ''} on Blockchain
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            {(projectJobs[project.id] || []).length} posted by you
                                          </p>
                                        </div>
                                      </div>
                                      <Badge className="bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30">
                                        Live Data
                                      </Badge>
                                    </div>
                                  </Card>
                                )}
                                
                                {/* Your Jobs Stats */}
                                {(projectJobs[project.id] || []).length > 0 && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="p-4 bg-card/50 border-border">
                                      <div className="flex items-center gap-3 mb-2">
                                        <CheckCircle2 className="w-5 h-5 text-[#00FFA3]" />
                                        <div className="text-sm text-muted-foreground">Your Open Jobs</div>
                                      </div>
                                      <div className="text-2xl text-foreground">
                                        {(projectJobs[project.id] || []).filter(j => j.status === "Open").length}
                                      </div>
                                    </Card>
                                    <Card className="p-4 bg-card/50 border-border">
                                      <div className="flex items-center gap-3 mb-2">
                                        <DollarSign className="w-5 h-5 text-[#00E0FF]" />
                                        <div className="text-sm text-muted-foreground">Your Total Budget</div>
                                      </div>
                                      <div className="text-2xl text-foreground">
                                        ${(projectJobs[project.id] || []).reduce((sum, j) => sum + j.budget, 0).toLocaleString()}
                                      </div>
                                    </Card>
                                    <Card className="p-4 bg-card/50 border-border">
                                      <div className="flex items-center gap-3 mb-2">
                                        <Users className="w-5 h-5 text-[#C04BFF]" />
                                        <div className="text-sm text-muted-foreground">Total Applicants</div>
                                      </div>
                                      <div className="text-2xl text-foreground">
                                        {(projectJobs[project.id] || []).reduce((sum, j) => sum + (jobApplications[j.id] || []).length, 0)}
                                      </div>
                                    </Card>
                                  </div>
                                )}
                              </div>
                            )}
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {userProjects.length === 0 && (
          <Card className="p-12 bg-card/80 border-border backdrop-blur-sm text-center">
            <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl text-foreground mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start backing projects to see your portfolio here
            </p>
            <Button className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]">
              Explore Projects
            </Button>
          </Card>
        )}
      </div>

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={showAddMemberDialog}
        onOpenChange={setShowAddMemberDialog}
        projectName={
          selectedProjectForMember !== null
            ? userProjects.find(p => p.id === selectedProjectForMember)?.name || ""
            : ""
        }
        onMemberAdded={handleMemberAdded}
      />

      {/* Add Job Request Dialog */}
      <AddJobRequestDialog
        open={showAddJobDialog}
        onOpenChange={setShowAddJobDialog}
        projectName={
          selectedProjectForJob !== null
            ? userProjects.find(p => p.id === selectedProjectForJob)?.name || ""
            : ""
        }
        projectId={
          selectedProjectForJob !== null
            ? userProjects.find(p => p.id === selectedProjectForJob)?.blockchainId || ""
            : ""
        }
        onJobAdded={handleJobAdded}
      />

      {/* Job Application Dialog */}
      <JobApplicationDialog
        open={showJobApplicationDialog}
        onOpenChange={setShowJobApplicationDialog}
        job={selectedJob}
        projectId={selectedProjectForApplication || undefined}
        onSubmit={handleApplicationSubmit}
      />

      {/* Complete Job Dialog */}
      <CompleteJobDialog
        open={showCompleteJobDialog}
        onOpenChange={setShowCompleteJobDialog}
        job={selectedJobForCompletion}
        projectId={selectedProjectBlockchainIdForCompletion || selectedJobForCompletion?.projectId || ""}
        projectName={
          selectedProjectForCompletion !== null
            ? userProjects.find(p => p.id === selectedProjectForCompletion)?.name || ""
            : ""
        }
        applications={(selectedJobForCompletion ? jobApplications[selectedJobForCompletion.id] || [] : []).map(app => ({
          id: app.id,
          applicantName: app.name,
          email: app.email,
          status: app.status,
          appliedDate: app.appliedAt,
          walletAddress: app.walletAddress, // Pass wallet address for blockchain transaction
        }))}
        onComplete={handleJobComplete}
      />

      {/* Hire Applicants Dialog */}
      <HireApplicantsDialog
        open={showHireDialog}
        onOpenChange={setShowHireDialog}
        job={selectedJobForHiring}
        applications={(selectedJobForHiring ? jobApplications[selectedJobForHiring.id] || [] : []).map(app => ({
          id: app.id,
          applicantName: app.name,
          email: app.email,
          status: app.status,
          appliedDate: app.appliedAt,
          hourlyRate: app.hourlyRate,
          availability: app.availability,
        }))}
        onHire={handleHire}
      />
    </div>
  );
}

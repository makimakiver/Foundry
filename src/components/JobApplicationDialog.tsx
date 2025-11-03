import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import {
  Briefcase,
  DollarSign,
  Clock,
  MapPin,
  Code,
  Palette,
  FileText,
  Megaphone,
  Upload,
  CheckCircle2,
  Wallet,
  AlertCircle,
  Twitter,
  Linkedin,
  Github,
  MessageCircle,
  X,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { WalrusFile, walrus } from "@mysten/walrus";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

export interface JobRequest {
  id: number;
  title: string;
  category: "Development" | "Design" | "Content" | "Marketing" | string;
  description?: string;
  skills?: string[];
  budget: number;
  duration?: string;
  deadline?: string;
  status: "Open" | "In Progress" | "Completed" | string;
  applicants: number;
  postedDate?: string;
  projectName?: string;
  projectId?: string; // Blockchain project object ID
  blockchainJobId?: string; // Blockchain job object ID
  location?: string;
  commitment?: string;
}

interface JobApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobRequest | null;
  projectId?: string; // Blockchain project object ID
  onSubmit?: (application: ApplicationData) => void;
}

export interface ApplicationData {
  name: string;
  email: string;
  portfolio: string;
  coverLetter: string;
  hourlyRate: string;
  availability: string;
  walletAddress: string;
  twitter: string; // Required: X (Twitter) account
  linkedin: string; // Required: LinkedIn profile
  github?: string;
  discord?: string;
  resume?: File | null;
}

export function JobApplicationDialog({
  open,
  onOpenChange,
  job,
  projectId: propProjectId,
  onSubmit,
}: JobApplicationDialogProps) {
  const account = useCurrentAccount();
  const isConnected = !!account;
  const walletAddress = account?.address || "";
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const vendor = import.meta.env.VITE_PACKAGE_ID;
  const registry = import.meta.env.VITE_REGISTRY_ID;
  
  // Get project ID from job or from prop
  const projectId = job?.projectId || propProjectId;
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
  
  const [step, setStep] = useState<"details" | "application">("details");
  const [resume, setResume] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState<ApplicationData>({
    name: "",
    email: "",
    portfolio: "",
    coverLetter: "",
    hourlyRate: "",
    availability: "",
    walletAddress: walletAddress,
    twitter: "",
    linkedin: "",
    github: "",
    discord: "",
    resume: null,
  });

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
      case "Completed":
        return "bg-[#A0A2A8]/20 text-[#A0A2A8] border-[#A0A2A8]/30";
      default:
        return "bg-[#A0A2A8]/20 text-[#A0A2A8] border-[#A0A2A8]/30";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet to apply");
      return;
    }

    // Validate required social links
    if (!formData.twitter || !formData.linkedin) {
      toast.error("LinkedIn and X (Twitter) accounts are required");
      return;
    }

    // Basic URL validation for social links
    if (!formData.linkedin.includes('linkedin.com')) {
      toast.error("Please enter a valid LinkedIn profile URL");
      return;
    }

    if (!formData.twitter.includes('twitter.com') && !formData.twitter.includes('x.com')) {
      toast.error("Please enter a valid X (Twitter) profile URL");
      return;
    }

    try {
      let resumeBlobId: string | null = null;
      
      // Step 2: Prepare application metadata (without the actual resume file)
      const applicationMetadata = {
        ...formData,
        walletAddress: walletAddress,
      };
      // Step 3: Upload application metadata to Walrus
      toast.loading('Uploading application metadata to Walrus...');
      
      const metadataJson = JSON.stringify(applicationMetadata);
      console.log('Application metadata:', metadataJson);
      const metadataData = new TextEncoder().encode(metadataJson);
      
      const metadataFile = [
        WalrusFile.from({
          contents: new Uint8Array(metadataData),
          identifier: 'candidate-application-metadata.json',
        }),
      ];

      if (resume) {
        const resumeData = await resume.arrayBuffer();
        metadataFile.push(
          WalrusFile.from({
            contents: new Uint8Array(resumeData),
            identifier: `resume.pdf`,
          }),
        );
      }

      const metadataFlow = walrusClient.walrus.writeFilesFlow({
        files: metadataFile,
      });
      
      await metadataFlow.encode();
      
      const metadataRegisterTx = metadataFlow.register({
        epochs: 3,
        owner: account?.address || '',
        deletable: true,
      });
      
      const { digest: metadataDigest } = await signAndExecuteTransaction({ 
        transaction: metadataRegisterTx 
      });
      
      await metadataFlow.upload({ digest: metadataDigest });
      
      const metadataInfo = await suiClient.getTransactionBlock({
        digest: metadataDigest, 
        options: { showObjectChanges: true }
      });
      
      const metadataBlobChange = metadataInfo?.objectChanges?.find(
        (o: any) =>
          o.type === 'created' &&
          ((o.objectType ?? o.object_type) || '').toLowerCase().endsWith('::blob::blob')
      ) ?? null;
      
      const metadataBlobId = (metadataBlobChange as any)?.objectId;
      
      if (!metadataBlobId) {
        throw new Error('Failed to upload application metadata to Walrus');
      }
      
      console.log('Metadata uploaded successfully. Blob ID:', metadataBlobId);
      console.log('Job ID (frontend):', job?.id);
      console.log('Job ID (blockchain):', job?.blockchainJobId);
      console.log('Project ID:', projectId);
      console.log('Applicant Address:', account?.address);
      
      // Submit application to blockchain
      const blockchainJobId = job?.blockchainJobId;
      if (projectId && blockchainJobId) {
        try {
          toast.loading('Submitting application to blockchain...');
          const tx = new Transaction();
          tx.moveCall({
            target: `${vendor}::ideation::submit_application`,
            arguments: [
              tx.object(registry),
              tx.object(projectId),                     // Project object ID
              tx.object(blockchainJobId),               // Blockchain job object ID
              tx.object(metadataBlobId),                // Application metadata blob ID
              tx.object('0x6'),                         // Clock object
            ]
          });
          
          await signAndExecuteTransaction({ transaction: tx });
          console.log('Application submitted to blockchain successfully');
        } catch (blockchainError) {
          console.error('Error submitting to blockchain:', blockchainError);
          toast.dismiss();
          // Don't fail the whole submission if blockchain part fails
          toast.warning('Application uploaded but blockchain submission had issues');
        }
      } else {
        console.warn('Missing project ID or blockchain job ID, skipping blockchain submission');
        if (!blockchainJobId) {
          console.error('Job is missing blockchainJobId property. Make sure it is set when the job is created/fetched.');
        }
      }
      toast.dismiss();
      toast.success('Application submitted successfully! 🎉');
      
      // Notify parent component
      if (onSubmit) {
        onSubmit(applicationMetadata);
      }
      
      // Count social links added
      const socialLinksCount = [
        formData.twitter,
        formData.linkedin,
        formData.github,
        formData.discord,
      ].filter(Boolean).length;

      const successDetails = resume 
        ? `Application with resume and ${socialLinksCount} social profile${socialLinksCount > 1 ? "s" : ""} submitted!`
        : `Application with ${socialLinksCount} social profile${socialLinksCount > 1 ? "s" : ""} submitted!`;

      console.log(successDetails);
      console.log('Resume Blob ID:', resumeBlobId);
      console.log('Metadata Blob ID:', metadataBlobId);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        portfolio: "",
        coverLetter: "",
        hourlyRate: "",
        availability: "",
        walletAddress: walletAddress,
        twitter: "",
        linkedin: "",
        github: "",
        discord: "",
        resume: null,
      });
      setResume(null);
      setStep("details");
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.dismiss();
      toast.error('Failed to submit application. Please try again.');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, or DOCX file");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setResume(file);
      setFormData({ ...formData, resume: file });
      toast.success(`Resume "${file.name}" uploaded successfully`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setResume(file);
      setFormData({ ...formData, resume: file });
      toast.success(`Resume "${file.name}" uploaded successfully`);
    }
  };

  const handleRemoveResume = () => {
    setResume(null);
    setFormData({ ...formData, resume: null });
    toast.info("Resume removed");
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && step === "application") {
      // Check if user has filled any data
      const hasFilledData =
        formData.name ||
        formData.email ||
        formData.portfolio ||
        formData.coverLetter ||
        formData.hourlyRate ||
        formData.availability ||
        formData.twitter ||
        formData.linkedin ||
        formData.github ||
        formData.discord ||
        resume;

      if (hasFilledData) {
        const confirmed = window.confirm(
          "You have unsaved changes. Are you sure you want to close?"
        );
        if (!confirmed) return;
      }

      // Reset to initial state
      setStep("details");
      setFormData({
        name: "",
        email: "",
        portfolio: "",
        coverLetter: "",
        hourlyRate: "",
        availability: "",
        walletAddress: walletAddress,
        twitter: "",
        linkedin: "",
        github: "",
        discord: "",
        resume: null,
      });
      setResume(null);
    }
    onOpenChange(open);
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1E1F24] border-[#E8E9EB]/10 text-[#E8E9EB]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#E8E9EB] flex items-center gap-3">
            {getCategoryIcon(job.category)}
            {step === "details" ? "Job Details" : "Submit Application"}
          </DialogTitle>
        </DialogHeader>

        {step === "details" ? (
          <div className="space-y-6">
            {/* Job Header */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-2xl text-[#E8E9EB] mb-2">{job.title}</h3>
                  {job.projectName && (
                    <p className="text-[#A0A2A8]">Project: {job.projectName}</p>
                  )}
                </div>
                <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-[#A0A2A8]">
                <div className="flex items-center gap-1">
                  {getCategoryIcon(job.category)}
                  <span>{job.category}</span>
                </div>
                {job.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{job.duration}</span>
                  </div>
                )}
                {job.deadline && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Due {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>${job.budget.toLocaleString()}</span>
                </div>
                {job.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-[#E8E9EB]/10" />

            {/* Job Description */}
            {job.description && (
              <div>
                <h4 className="text-lg text-[#E8E9EB] mb-3">Description</h4>
                <p className="text-[#A0A2A8] leading-relaxed">{job.description}</p>
              </div>
            )}

            {/* Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h4 className="text-lg text-[#E8E9EB] mb-3">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-[#00E0FF]/30 text-[#00E0FF] bg-[#00E0FF]/5"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Job Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-[#0D0E10]/50 border-[#E8E9EB]/10">
                <div className="text-sm text-[#A0A2A8] mb-1">Budget</div>
                <div className="text-xl text-[#00E0FF]">
                  ${job.budget.toLocaleString()}
                </div>
              </Card>
              <Card className="p-4 bg-[#0D0E10]/50 border-[#E8E9EB]/10">
                <div className="text-sm text-[#A0A2A8] mb-1">
                  {job.duration ? "Duration" : "Deadline"}
                </div>
                <div className="text-xl text-[#E8E9EB]">
                  {job.duration || (job.deadline ? new Date(job.deadline).toLocaleDateString() : "TBD")}
                </div>
              </Card>
              <Card className="p-4 bg-[#0D0E10]/50 border-[#E8E9EB]/10">
                <div className="text-sm text-[#A0A2A8] mb-1">Applicants</div>
                <div className="text-xl text-[#C04BFF]">{job.applicants}</div>
              </Card>
            </div>

            {/* Commitment Level */}
            {job.commitment && (
              <div>
                <h4 className="text-lg text-[#E8E9EB] mb-3">Commitment</h4>
                <Card className="p-4 bg-[#0D0E10]/50 border-[#E8E9EB]/10">
                  <p className="text-[#A0A2A8]">{job.commitment}</p>
                </Card>
              </div>
            )}

            {/* Wallet Connection Check */}
            {!isConnected && (
              <Card className="p-4 bg-[#FF6B00]/10 border-[#FF6B00]/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#FF6B00] mb-1">Wallet Required</p>
                    <p className="text-sm text-[#A0A2A8]">
                      You need to connect your wallet to apply for this position.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Application Requirements */}
            {isConnected && (
              <Card className="p-4 bg-[#FF6B00]/10 border-[#FF6B00]/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#FF6B00] mb-1">Application Requirements</p>
                    <p className="text-sm text-[#A0A2A8] mb-2">
                      To apply for this position, you must provide:
                    </p>
                    <div className="space-y-1 text-sm text-[#E8E9EB] mb-3">
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-[#00FFA3]" />
                        Full Name
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-[#00FFA3]" />
                        Cover Letter (minimum 100 characters)
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-[#00FFA3]" />
                        LinkedIn Profile URL
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-[#00FFA3]" />
                        X (Twitter) Profile URL
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className="bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/30 text-xs">
                        <Twitter className="w-3 h-3 mr-1" />
                        X Required
                      </Badge>
                      <Badge className="bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/30 text-xs">
                        <Linkedin className="w-3 h-3 mr-1" />
                        LinkedIn Required
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => handleDialogClose(false)}
                variant="outline"
                className="flex-1 border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#0D0E10]"
              >
                Close
              </Button>
              {isConnected ? (
                <Button
                  onClick={() => setStep("application")}
                  className="flex-1 bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                >
                  Apply Now
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    toast.info("Please use the wallet button in the top navigation to connect")
                  }
                  className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet to Apply
                </Button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Application Header */}
            <Card className="p-4 bg-[#00E0FF]/5 border-[#00E0FF]/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00FFA3] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[#E8E9EB] mb-1">Applying for: {job.title}</p>
                  <p className="text-sm text-[#A0A2A8]">
                    Wallet: {walletAddress.substring(0, 6)}...
                    {walletAddress.substring(walletAddress.length - 4)}
                  </p>
                  <p className="text-xs text-[#FF6B00] mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Cover letter (100+ chars), LinkedIn and X (Twitter) required
                  </p>
                </div>
              </div>
            </Card>

            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-lg text-[#E8E9EB]">Personal Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-[#E8E9EB]">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                    className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-[#E8E9EB]">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                    className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="portfolio" className="text-[#E8E9EB]">
                  Portfolio/Website
                </Label>
                <Input
                  id="portfolio"
                  name="portfolio"
                  type="url"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  placeholder="https://yourportfolio.com"
                  className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] mt-2"
                />
              </div>
            </div>

            {/* Cover Letter */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg text-[#E8E9EB]">Cover Letter *</h4>
                  <p className="text-sm text-[#A0A2A8] mt-1">
                    Tell us why you're a great fit for this position (minimum 100 characters)
                  </p>
                </div>
                <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30 text-xs">
                  Required
                </Badge>
              </div>
              
              <div>
                <Textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="I am excited to apply for this position because..."
                  className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${
                    formData.coverLetter.length < 100 
                      ? 'text-[#FF6B00]' 
                      : 'text-[#00FFA3]'
                  }`}>
                    {formData.coverLetter.length < 100 
                      ? `${100 - formData.coverLetter.length} more characters needed`
                      : `✓ ${formData.coverLetter.length} characters`
                    }
                  </p>
                  <p className="text-xs text-[#A0A2A8]">
                    {formData.coverLetter.length} / 1000
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links - REQUIRED */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg text-[#E8E9EB]">Professional Profiles *</h4>
                  <p className="text-sm text-[#A0A2A8] mt-1">
                    LinkedIn and X (Twitter) are required for all applications
                  </p>
                </div>
                <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30 text-xs">
                  Required
                </Badge>
              </div>

              {/* Required Alert */}
              <Card className="p-3 bg-[#FF6B00]/5 border-[#FF6B00]/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#A0A2A8]">
                    <span className="text-[#FF6B00]">Required:</span> You must provide your LinkedIn and X (Twitter) profiles to submit this application.
                  </p>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twitter" className="text-[#E8E9EB] flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                    X (Twitter) *
                  </Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    type="url"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    required
                    placeholder="https://twitter.com/yourhandle or https://x.com/yourhandle"
                    className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] mt-2 focus:border-[#1DA1F2]/50"
                  />
                  <p className="text-xs text-[#A0A2A8] mt-1">
                    Enter your complete Twitter/X profile URL
                  </p>
                </div>

                <div>
                  <Label htmlFor="linkedin" className="text-[#E8E9EB] flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                    LinkedIn *
                  </Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    required
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] mt-2 focus:border-[#0A66C2]/50"
                  />
                  <p className="text-xs text-[#A0A2A8] mt-1">
                    Enter your complete LinkedIn profile URL
                  </p>
                </div>

              </div>

              {/* Optional Social Links */}
              <div className="pt-2">
                <Label className="text-[#A0A2A8] text-sm mb-3 block">
                  Additional Profiles (Optional)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="github" className="text-[#E8E9EB] flex items-center gap-2">
                      <Github className="w-4 h-4 text-[#C04BFF]" />
                      GitHub
                    </Label>
                    <Input
                      id="github"
                      name="github"
                      type="url"
                      value={formData.github}
                      onChange={handleInputChange}
                      placeholder="https://github.com/yourusername"
                      className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] mt-2 focus:border-[#C04BFF]/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="discord" className="text-[#E8E9EB] flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-[#5865F2]" />
                      Discord
                    </Label>
                    <Input
                      id="discord"
                      name="discord"
                      value={formData.discord}
                      onChange={handleInputChange}
                      placeholder="username#1234"
                      className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] mt-2 focus:border-[#5865F2]/50"
                    />
                  </div>
                </div>
              </div>
            </div>

  
            {/* Resume Upload (Optional) */}
            <div>
              <Label htmlFor="resume" className="text-[#E8E9EB]">
                Resume/CV (Optional)
              </Label>
              <input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
              />
              {!resume ? (
                <Card 
                  className={`p-6 bg-[#0D0E10]/50 border-dashed mt-2 cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-[#00E0FF] bg-[#00E0FF]/5' 
                      : 'border-[#E8E9EB]/10 hover:border-[#00E0FF]/30'
                  }`}
                  onClick={() => document.getElementById('resume')?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${
                      isDragging ? 'text-[#00E0FF]' : 'text-[#A0A2A8]'
                    }`} />
                    <p className={`text-sm ${
                      isDragging ? 'text-[#00E0FF]' : 'text-[#A0A2A8]'
                    }`}>
                      {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-[#A0A2A8] text-xs mt-1">
                      PDF, DOC, DOCX (Max 5MB)
                    </p>
                  </div>
                </Card>
              ) : (
                <Card className="p-4 bg-[#0D0E10]/50 border-[#00E0FF]/30 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#00E0FF]/10 rounded">
                        <FileText className="w-5 h-5 text-[#00E0FF]" />
                      </div>
                      <div>
                        <p className="text-[#E8E9EB] text-sm">{resume.name}</p>
                        <p className="text-[#A0A2A8] text-xs">
                          {(resume.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleRemoveResume}
                      className="text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Application Summary */}
            <Card className="p-4 bg-[#0D0E10]/50 border-[#E8E9EB]/10">
              <p className="text-sm text-[#A0A2A8] mb-3">Application Checklist:</p>
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  {formData.name ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00FFA3]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#FF6B00]" />
                  )}
                  <span className={formData.name ? "text-[#E8E9EB]" : "text-[#A0A2A8]"}>
                    Full Name {formData.name && `✓`}
                  </span>
                </div>
        
                <div className="flex items-center gap-2">
                  {formData.linkedin ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00FFA3]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#FF6B00]" />
                  )}
                  <span className={formData.linkedin ? "text-[#E8E9EB]" : "text-[#A0A2A8]"}>
                    LinkedIn Profile {formData.linkedin && `✓`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {formData.twitter ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00FFA3]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#FF6B00]" />
                  )}
                  <span className={formData.twitter ? "text-[#E8E9EB]" : "text-[#A0A2A8]"}>
                    X (Twitter) Profile {formData.twitter && `✓`}
                  </span>
                </div>
              </div>
              
              {(formData.github || formData.discord) && (
                <>
                  <Separator className="bg-[#E8E9EB]/10 my-3" />
                  <p className="text-sm text-[#A0A2A8] mb-2">Additional profiles:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.github && (
                      <Badge className="bg-[#C04BFF]/10 text-[#C04BFF] border-[#C04BFF]/30">
                        <Github className="w-3 h-3 mr-1" />
                        GitHub
                      </Badge>
                    )}
                    {formData.discord && (
                      <Badge className="bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/30">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Discord
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setStep("details")}
                variant="outline"
                className="flex-1 border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#0D0E10]"
              >
                Back to Details
              </Button>
              <Button
                type="submit"
                disabled={
                  !formData.twitter || 
                  !formData.linkedin
                }
                className="flex-1 bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10] disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Application
              </Button>
            </div>
            {(!formData.twitter || !formData.linkedin) && (
              <p className="text-sm text-[#FF6B00] text-center -mt-2">
                {formData.coverLetter.length < 100 
                  ? `Cover letter needs ${100 - formData.coverLetter.length} more characters`
                  : "Please provide your LinkedIn and X (Twitter) profiles to submit"
                }
              </p>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

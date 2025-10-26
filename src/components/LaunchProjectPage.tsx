import { useRef, useState } from "react";
import { useForm } from "react-hook-form@7.55.0";
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { getFullnodeUrl } from "@mysten/sui/client";
import { walrus, WalrusFile } from '@mysten/walrus';
import { SuinsClient, SuinsTransaction,  } from '@mysten/suins';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { 
  Rocket, 
  ChevronRight, 
  ChevronLeft, 
  Check,
  Plus,
  X,
  Upload,
  Calendar,
  DollarSign,
  FileText,
  Users,
  Target,
  Twitter,
  Github,
  MessageCircle,
  Globe,
  Send,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { handleSuiNameRegistration, registerTeamSubnames } from "../lib/suins-utils";

interface ProjectFormData {
  name: string;
  tagline: string;
  description: string;
  category: string;
  fundingGoal: string;
  duration: string;
  image: string;
  teamMembers: { name: string; role: string }[];
  milestones: { title: string; description: string; amount: string }[];
  socialLinks: { platform: string; url: string }[];
  investmentHistoryVisibility: "public" | "private";
}

interface LaunchProjectPageProps {
  onProjectSubmitted: () => void;
  onProjectCreated?: () => Promise<void>;
}

export function LaunchProjectPage({ onProjectSubmitted, onProjectCreated }: LaunchProjectPageProps) {
  const vendor = import.meta.env.VITE_PACKAGE_ID;
  const registry = import.meta.env.VITE_REGISTRY_ID;
  const foundry = import.meta.env.VITE_FOUNDRY_ID;
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [historyVisibility, setHistoryVisibility] = useState<"public" | "private">("private");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const totalSteps = 4;
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: {
      teamMembers: [{ name: "", role: "" }],
      milestones: [{ title: "", description: "", amount: "" }],
      socialLinks: [{ platform: "twitter", url: "" }],
    }
  });
  
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
  const suinsClient = new SuinsClient({
    client,
    network: 'testnet',
  });
  const watchedData = watch();

  const categories = [
    "DeFi",
    "AI/ML",
    "DAO",
    "Infrastructure",
    "Gaming",
    "NFT",
    "Social",
    "Developer Tools",
  ];
  const MIST_PER_SUI = BigInt(1_000_000_000);
  function formatSui(mist: bigint): string {
    const int = mist / MIST_PER_SUI;
    const frac = (mist % MIST_PER_SUI).toString().padStart(9, '0').replace(/0+$/, '');
    return frac ? `${int}.${frac}` : `${int}`;
  }

  const onSubmit = async(data: ProjectFormData) => {
    if(!currentAccount) {
      console.log('Did not connect!!');
      toast.error('Please connect your wallet to launch a project');
      return;
    }
    
    try {
      console.log('Starting project submission...');
      
      // Step 1: Prepare and upload project metadata to Walrus
      toast.loading('Preparing project metadata...');
      const json = JSON.stringify(data);
      const fileData = new TextEncoder().encode(json);
      
      const flow = client.walrus.writeFilesFlow({
        files: [
          WalrusFile.from({
            contents: new Uint8Array(fileData),
            identifier: `${data.name}-metadata.json`,
          }),
        ],
      });
      
      await flow.encode();
      
      const registerTx = flow.register({
        epochs: 3,
        owner: currentAccount.address,
        deletable: true,
      });
      
      const { digest } = await signAndExecuteTransaction({ transaction: registerTx });
      
      // Step 2: Upload the data to storage nodes
      toast.dismiss();
      toast.loading('Uploading metadata to Walrus...');
      await flow.upload({ digest });
      
      const info = await client.getTransactionBlock({
        digest, 
        options: { showObjectChanges: true }
      });
      
      const blobChange =
        info?.objectChanges?.find(
          (o: any) =>
            o.type === 'created' &&
            ((o.objectType ?? o.object_type) || '').toLowerCase().endsWith('::blob::blob')
        ) ?? null;
      const blob_objectId = blobChange?.objectId;
      
      toast.dismiss();
      toast.success('Metadata uploaded successfully!');
      
      // Step 3: Register primary SuiNS name for the project
      console.log('Registering SuiNS name for project:', data.name);
      const suinsResult = await handleSuiNameRegistration(
        data.name,
        currentAccount.address,
        suinsClient,
        signAndExecuteTransaction,
        client // Pass client to extract NFT object ID
      );
      
      if (!suinsResult.success) {
        console.warn('SuiNS registration failed, but continuing with project creation:', suinsResult.error);
        toast.warning('Project created but SuiNS registration failed. You can register the name later.');
      }
      
      // Step 3.5: Register team member subnames (if primary registration succeeded)
      if (suinsResult.success && suinsResult.nftObjectId && data.teamMembers && data.teamMembers.length > 0) {
        console.log('Registering team member subnames...');
        
        // Map team members from form data to the format expected by registerTeamSubnames
        const teamMembersForSubnames = data.teamMembers
          .filter(member => member.name && member.role)
          .map(member => ({
            role: member.role,
            address: member.name, // In the form, 'name' field contains the address
          }));
        
        if (teamMembersForSubnames.length > 0) {
          const teamSubnamesResult = await registerTeamSubnames(
            data.name,
            teamMembersForSubnames,
            suinsResult.nftObjectId,
            suinsClient,
            signAndExecuteTransaction
          );
          
          if (teamSubnamesResult.success) {
            console.log(`✅ Registered ${teamSubnamesResult.successCount} team member subname(s)`);
          } else {
            console.warn('Team subname registration had issues:', teamSubnamesResult);
          }
        }
      } else if (suinsResult.success && !suinsResult.nftObjectId) {
        console.warn('Could not register team subnames: NFT object ID not available');
      }
      
      // Step 4: Create subname for founder (optional, under foundry parent if available)
      if (foundry) {
        try {
          toast.loading('Creating founder subname...');
          const tx = new Transaction();
          const suinsTx = new SuinsTransaction(suinsClient, tx);
          
          const subNameNft = suinsTx.createSubName({
            parentNft: tx.object(foundry),
            name: data.name,
            expirationTimestampMs: 1735132800000,
            allowChildCreation: true,
            allowTimeExtension: true,
          });
          
          suinsTx.createLeafSubName({
            parentNft: subNameNft,
            name: "founder",
            targetAddress: currentAccount.address,
          });
          
          await signAndExecuteTransaction({
            transaction: tx,
            chain: 'sui:testnet',
          });
          
          toast.dismiss();
          toast.success('Founder subname created!');
        } catch (error) {
          console.warn('Subname creation failed:', error);
          toast.dismiss();
        }
      }
      
      // Step 5: Submit project to the Foundry smart contract
      toast.loading('Submitting project to Foundry...');
      const tx = new Transaction();
      
      // Split coins for funding goal
      const [coin] = tx.splitCoins(tx.gas, [data.fundingGoal]);
      
      // Generate SuiNS name from project name (sanitized)
      const suinsName = `${data.name.toLowerCase().replace(/\s+/g, '-')}.sui`;
      
      // Call the smart contract to register the project
      tx.moveCall({
        target: `${vendor}::ideation::suggest_idea`,
        arguments: [
          tx.object(registry),
          tx.pure.string(data.name),
          tx.pure.string(suinsName), // Add SuiNS name parameter
          tx.object(blob_objectId),
          tx.pure.string(data.image),
          coin
        ]
      });
      
      signAndExecuteTransaction(
        {
          transaction: tx,
          chain: 'sui:testnet',
        },
        {
          onSuccess: async (result) => {
            console.log('Project submitted successfully:', result);
            toast.dismiss();
            toast.success(
              `Project submitted for review! (${historyVisibility === "public" ? "Public" : "Private"} history)`
            );
            console.log("Investment history visibility:", historyVisibility);
            
            // Refresh projects list to show the new project
            if (onProjectCreated) {
              toast.loading('Loading your new project...');
              await onProjectCreated();
              toast.dismiss();
            }
            
            // Redirect to projects page
            onProjectSubmitted();
          },
          onError: (err) => {
            console.error('Project submission error:', err);
            toast.dismiss();
            toast.error('Failed to submit project. Please try again.');
          }
        },
      );
    } catch (error) {
      console.error('Error during project submission:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addTeamMember = () => {
    const current = watchedData.teamMembers || [];
    setValue("teamMembers", [...current, { name: "", role: "" }]);
  };

  const removeTeamMember = (index: number) => {
    const current = watchedData.teamMembers || [];
    setValue("teamMembers", current.filter((_, i) => i !== index));
  };

  const addMilestone = () => {
    const current = watchedData.milestones || [];
    setValue("milestones", [...current, { title: "", description: "", amount: "" }]);
  };

  const removeMilestone = (index: number) => {
    const current = watchedData.milestones || [];
    setValue("milestones", current.filter((_, i) => i !== index));
  };

  const addSocialLink = () => {
    const current = watchedData.socialLinks || [];
    setValue("socialLinks", [...current, { platform: "twitter", url: "" }]);
  };

  const removeSocialLink = (index: number) => {
    const current = watchedData.socialLinks || [];
    setValue("socialLinks", current.filter((_, i) => i !== index));
  };

  const handleImageFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    // Clean up any previous object URL
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(url);
    // Store preview URL in the form for consistency
    setValue("image", url);
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(url);
    setValue("image", url);
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = () => {
    setIsDragging(false);
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#00E0FF] to-[#C04BFF] mb-6">
            <Rocket className="w-8 h-8 text-[#0D0E10]" />
          </div>
          <h1 className="text-4xl sm:text-5xl text-foreground mb-4">
            Launch Your Project
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Submit your project to Foundry³ and get funded by the community
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-[#00E0FF]">{progressPercentage.toFixed(0)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-muted" />
          
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[
              { num: 1, label: "Basic Info", icon: FileText },
              { num: 2, label: "Funding", icon: DollarSign },
              { num: 3, label: "Team", icon: Users },
              { num: 4, label: "Milestones", icon: Target },
            ].map((step) => (
              <div
                key={step.num}
                className={`flex flex-col items-center gap-2 ${
                  currentStep >= step.num ? "text-[#00E0FF]" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.num
                      ? "bg-gradient-to-br from-[#00E0FF] to-[#C04BFF]"
                      : "bg-card border border-border"
                  }`}
                >
                  {currentStep > step.num ? (
                    <Check className="w-5 h-5 text-[#0D0E10]" />
                  ) : (
                    <step.icon className={`w-5 h-5 ${currentStep >= step.num ? "text-[#0D0E10]" : "text-muted-foreground"}`} />
                  )}
                </div>
                <span className="text-xs text-center">{step.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <form>
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 bg-card/80 border-border backdrop-blur-sm">
                  <h2 className="text-2xl text-foreground mb-6">Basic Information</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-foreground mb-2">
                        Project Name *
                      </Label>
                      <Input
                        id="name"
                        {...register("name", { required: true })}
                        placeholder="Enter your project name"
                        className=""
                      />
                      {errors.name && (
                        <span className="text-[#FF3366] text-sm">Project name is required</span>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="tagline" className="text-foreground mb-2">
                        Tagline *
                      </Label>
                      <Input
                        id="tagline"
                        {...register("tagline", { required: true })}
                        placeholder="A brief one-liner about your project"
                        className=""
                      />
                      {errors.tagline && (
                        <span className="text-[#FF3366] text-sm">Tagline is required</span>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-foreground mb-2">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        {...register("description", { required: true })}
                        placeholder="Describe your project in detail..."
                        rows={6}
                        className=""
                      />
                      {errors.description && (
                        <span className="text-[#FF3366] text-sm">Description is required</span>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-foreground mb-2">
                        Category *
                      </Label>
                      <Select
                        onValueChange={(value) => setValue("category", value)}
                      >
                        <SelectTrigger className="">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="">
                          {categories.map((cat) => (
                            <SelectItem
                              key={cat}
                              value={cat}
                              className=""
                            >
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="image" className="text-foreground mb-2">
                        Project Image
                      </Label>
                      <div
                        role="button"
                        aria-label="Upload project image"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`w-[320px] h-[180px] rounded-md border-2 border-dotted flex items-center justify-center text-center px-4 transition-colors cursor-pointer select-none overflow-hidden ${
                          isDragging
                            ? "border-[#00E0FF] bg-[#00E0FF]/10"
                            : "border-border hover:border-[#00E0FF] hover:bg-[#00E0FF]/5"
                        }`}
                      >
                        {imagePreview || watchedData.image ? (
                          <img
                            src={imagePreview || watchedData.image}
                            alt="Project preview"
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                            <span className="text-sm text-foreground">Click to upload or drag and drop</span>
                            <span className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</span>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFile}
                        className="hidden"
                      />
                      <p className="text-muted-foreground text-xs mt-1">
                        Upload a cover image (displayed at 320×180, 16:9)
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Funding Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 bg-card/80 border-border backdrop-blur-sm">
                  <h2 className="text-2xl text-foreground mb-6">Funding Details</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="fundingGoal" className="text-foreground mb-2">
                        Funding Goal (USD) *
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fundingGoal"
                          type="number"
                          {...register("fundingGoal", { required: true })}
                          placeholder="500000"
                          className="pl-10 dark:bg-[#0D0E10] dark:border-[#E8E9EB]/10 dark:text-[#E8E9EB] dark:placeholder:text-[#A0A2A8]"
                        />
                      </div>
                      {errors.fundingGoal && (
                        <span className="text-[#FF3366] text-sm">Funding goal is required</span>
                      )}
                    </div>

                    <div>
                      {/* <Label htmlFor="duration" className="text-foreground mb-2">
                        Campaign Duration (Days) *
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="duration"
                          type="number"
                          {...register("duration", { required: true })}
                          placeholder="30"
                          className="pl-10 dark:bg-[#0D0E10] dark:border-[#E8E9EB]/10 dark:text-[#E8E9EB] dark:placeholder:text-[#A0A2A8]"
                        />
                      </div> */}
                      {errors.duration && (
                        <span className="text-[#FF3366] text-sm">Duration is required</span>
                      )}
                      <p className="text-muted-foreground text-xs mt-1">
                        How long should the funding campaign run?
                      </p>
                    </div>

                    <Separator className="bg-border" />

                    <div className="bg-card rounded-lg p-6 border border-border">
                      <h3 className="text-[#00E0FF] mb-4">Funding Breakdown</h3>
                      <div className="space-y-3 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Your Goal:</span>
                          <span className="text-foreground">
                            ${watchedData.fundingGoal ? parseInt(watchedData.fundingGoal).toLocaleString() : "0"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Fee (2%):</span>
                          <span className="text-foreground">
                            ${watchedData.fundingGoal ? (parseInt(watchedData.fundingGoal) * 0.02).toLocaleString() : "0"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount (-2%):</span>
                          <span className="text-foreground">
                            ${watchedData.fundingGoal ? (-parseInt(watchedData.fundingGoal) * 0.02).toLocaleString() : "0"}
                          </span>
                        </div>
                        <Separator className="bg-border" />
                        <div className="flex justify-between">
                          <span>You Receive:</span>
                          <span className="text-[#00FFA3]">
                            ${watchedData.fundingGoal ? (parseInt(watchedData.fundingGoal) * 0.98).toLocaleString() : "0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#00E0FF]/5 border border-[#00E0FF]/20 rounded-lg p-4">
                      <p className="text-foreground text-sm">
                        💡 <strong>Tip:</strong> Projects with realistic funding goals and clear milestones have a 94% success rate on Foundry³
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Team */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 bg-card/80 border-border backdrop-blur-sm">
                  <h2 className="text-2xl text-foreground mb-6">Team & Social</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-foreground">Team Members</Label>
                        <Button
                          type="button"
                          onClick={addTeamMember}
                          variant="outline"
                          size="sm"
                          className="border-[#00E0FF]/20 text-[#00E0FF] hover:bg-[#00E0FF]/10"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Member
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {(watchedData.teamMembers || []).map((member, index) => (
                          <div key={index} className="flex gap-2">
                            <Input placeholder="Address" {...register(`teamMembers.${index}.name`)} className="" />
                            <Select
                              value={watchedData.teamMembers?.[index]?.role || undefined}
                              onValueChange={(value) => setValue(`teamMembers.${index}.role`, value)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="co-founder">Co-founder</SelectItem>
                                <SelectItem value="developer">Developer</SelectItem>
                                <SelectItem value="designer">Designer</SelectItem>
                              </SelectContent>
                            </Select>
                            {(watchedData.teamMembers || []).length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeTeamMember(index)}
                                className="border-[#FF3366]/20 text-[#FF3366] hover:bg-[#FF3366]/10"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-border" />

                    {/* Social Links Section */}
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Label className="text-foreground text-lg">Social Links</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Connect your project's social media profiles to build trust with backers
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={addSocialLink}
                          variant="outline"
                          size="sm"
                          className="border-[#00E0FF]/20 text-[#00E0FF] hover:bg-[#00E0FF]/10"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Link
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {(watchedData.socialLinks || []).map((link, index) => {
                          const getPlatformIcon = (platform: string) => {
                            switch (platform) {
                              case "twitter":
                                return <Twitter className="w-4 h-4 text-[#1DA1F2]" />;
                              case "github":
                                return <Github className="w-4 h-4 text-[#C04BFF]" />;
                              case "discord":
                                return <MessageCircle className="w-4 h-4 text-[#5865F2]" />;
                              case "telegram":
                                return <Send className="w-4 h-4 text-[#0088cc]" />;
                              case "website":
                                return <Globe className="w-4 h-4 text-[#00E0FF]" />;
                              default:
                                return <Globe className="w-4 h-4" />;
                            }
                          };

                          const getPlatformColor = (platform: string) => {
                            switch (platform) {
                              case "twitter":
                                return "focus:border-[#1DA1F2]/50";
                              case "github":
                                return "focus:border-[#C04BFF]/50";
                              case "discord":
                                return "focus:border-[#5865F2]/50";
                              case "telegram":
                                return "focus:border-[#0088cc]/50";
                              case "website":
                                return "focus:border-[#00E0FF]/50";
                              default:
                                return "";
                            }
                          };

                          return (
                            <div key={index} className="flex gap-2 items-start">
                              <div className="flex items-center gap-2 flex-1">
                                <div className="p-3 rounded-lg bg-card border border-border flex items-center justify-center">
                                  {getPlatformIcon(link.platform)}
                                </div>
                                <Select
                                  defaultValue={link.platform}
                                  onValueChange={(value) => setValue(`socialLinks.${index}.platform`, value)}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="">
                                    <SelectItem
                                      value="twitter"
                                      className=""
                                    >
                                      <div className="flex items-center gap-2">
                                        <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                                        Twitter
                                      </div>
                                    </SelectItem>
                                    <SelectItem
                                      value="github"
                                      className=""
                                    >
                                      <div className="flex items-center gap-2">
                                        <Github className="w-4 h-4 text-[#C04BFF]" />
                                        GitHub
                                      </div>
                                    </SelectItem>
                                    <SelectItem
                                      value="discord"
                                      className=""
                                    >
                                      <div className="flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4 text-[#5865F2]" />
                                        Discord
                                      </div>
                                    </SelectItem>
                                    <SelectItem
                                      value="telegram"
                                      className=""
                                    >
                                      <div className="flex items-center gap-2">
                                        <Send className="w-4 h-4 text-[#0088cc]" />
                                        Telegram
                                      </div>
                                    </SelectItem>
                                    <SelectItem
                                      value="website"
                                      className=""
                                    >
                                      <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-[#00E0FF]" />
                                        Website
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  placeholder={`https://${link.platform === "discord" ? "discord.gg/yourserver" : link.platform === "telegram" ? "t.me/yourchannel" : link.platform + ".com/yourprofile"}`}
                                  {...register(`socialLinks.${index}.url`)}
                                  className={`${getPlatformColor(link.platform)}`}
                                />
                              </div>
                              {(watchedData.socialLinks || []).length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeSocialLink(index)}
                                  className="border-[#FF3366]/20 text-[#FF3366] hover:bg-[#FF3366]/10 flex-shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                     
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Milestones */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 bg-card/80 border-border backdrop-blur-sm">
                  <h2 className="text-2xl text-foreground mb-6">Project Milestones</h2>
                  <p className="text-muted-foreground mb-6">
                    Define key milestones for your project. Funds will be released in tranches as you complete each milestone.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-foreground">Milestones *</Label>
                      <Button
                        type="button"
                        onClick={addMilestone}
                        variant="outline"
                        size="sm"
                        className="border-[#00E0FF]/20 text-[#00E0FF] hover:bg-[#00E0FF]/10"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Milestone
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {(watchedData.milestones || []).map((milestone, index) => (
                        <Card key={index} className="p-4 bg-card border-border">
                          <div className="flex items-start justify-between mb-3">
                            <Badge className="bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30">
                              Job Request {index + 1}
                            </Badge>
                            {(watchedData.milestones || []).length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMilestone(index)}
                                className="text-[#FF3366] hover:bg-[#FF3366]/10 h-6 w-6"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <div className="space-y-3">
                            <Input
                              placeholder="Milestone title"
                              {...register(`milestones.${index}.title`)}
                              className=""
                            />
                            <Textarea
                              placeholder="Describe what will be achieved..."
                              {...register(`milestones.${index}.description`)}
                              rows={3}
                              className=""
                            />
                            {/* <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="Funding amount"
                                {...register(`milestones.${index}.amount`)}
                                className="pl-10"
                              />
                            </div> */}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Investment History Visibility */}
                  <div className="mt-8 space-y-3">
                    <Label className="text-foreground">Investment History Visibility</Label>
                    <p className="text-muted-foreground text-sm">Choose if your investors’ activity appears publicly on your project page.</p>
                    <RadioGroup
                      value={historyVisibility}
                      onValueChange={(v) => setHistoryVisibility(v as "public" | "private")}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div>
                        <RadioGroupItem value="public" id="proj-visibility-public" className="peer sr-only" />
                        <Label
                          htmlFor="proj-visibility-public"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card p-4 hover:border-[#00E0FF]/50 cursor-pointer peer-data-[state=checked]:border-[#00E0FF] peer-data-[state=checked]:bg-[#00E0FF]/5"
                        >
                          <Globe className="w-5 h-5 text-[#00E0FF] mb-1" />
                          <span className="text-foreground">Show</span>
                          <span className="text-muted-foreground text-xs mt-0.5">Visible to everyone</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="private" id="proj-visibility-private" className="peer sr-only" />
                        <Label
                          htmlFor="proj-visibility-private"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card p-4 hover:border-[#00E0FF]/50 cursor-pointer peer-data-[state=checked]:border-[#00E0FF] peer-data-[state=checked]:bg-[#00E0FF]/5"
                        >
                          <Lock className="w-5 h-5 text-[#C04BFF] mb-1" />
                          <span className="text-foreground">Hidden</span>
                          <span className="text-muted-foreground text-xs mt-0.5">Only you can see</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="border-border text-foreground hover:bg-card disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10]"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="bg-gradient-to-r from-[#00E0FF] via-[#C04BFF] to-[#FF6B00] hover:opacity-90 text-[#0D0E10]"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Submit Project
              </Button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

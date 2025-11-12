import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { getFullnodeUrl } from "@mysten/sui/client";
import { walrus, WalrusFile } from '@mysten/walrus';
import { SuinsClient } from '@mysten/suins';
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
  DollarSign,
  FileText,
  Users,
  Target,
  Twitter,
  Github,
  MessageCircle,
  Globe,
  Send,
  Lock,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { uploadImageToPinata, isPinataConfigured } from "../lib/pinata";
import { calculateGasCosts } from "../lib/gas-calculation";

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
}

export function LaunchProjectPage({ onProjectSubmitted }: LaunchProjectPageProps) {
  const parentNftId   = import.meta.env.VITE_FOUNDRY_NS_ID;
  const subnamePkg    = import.meta.env.VITE_SUINS_SUBDOMAIN_PACKAGE_ID;
  const subname_proxyPkg = import.meta.env.VITE_SUINS_SUBDOMAIN_PROXY_PACKAGE_ID;
  const suinsShared   = import.meta.env.VITE_SUINS_SHARED_OBJECT_ID;
  const account_ns_reg = import.meta.env.VITE_ACCOUNT_NS_REGISTRY_ID;
  const clockId       = '0x6';
  const vendor = import.meta.env.VITE_PACKAGE_ID;
  const registry = import.meta.env.VITE_REGISTRY_ID;
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [historyVisibility, setHistoryVisibility] = useState<"public" | "private">("private");
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isFetchingUserData, setIsFetchingUserData] = useState(false);
  const [userWalletBalance, setUserWalletBalance] = useState<string | null>(null);
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
  const onSubmit = async(data: ProjectFormData) => {
    // CRITICAL DEBUGGING: Log the complete currentAccount object structure
    console.log('========================================');
    console.log('WALLET CONNECTION DEBUG');
    console.log('========================================');
    console.log('currentAccount object:', currentAccount);
    console.log('currentAccount type:', typeof currentAccount);
    console.log('currentAccount keys:', currentAccount ? Object.keys(currentAccount) : 'null');
    console.log('currentAccount.address:', currentAccount?.address);
    console.log('currentAccount.address type:', typeof currentAccount?.address);
    console.log('========================================');
    
    if(!currentAccount) {
      console.log('Did not connect!!');
      toast.error('Please connect your wallet to launch a project');
      return;
    }
    
    // Additional validation: Check if address property exists
    if (!currentAccount?.address) {
      console.error('❌ CRITICAL: currentAccount exists but address is missing!');
      console.error('   currentAccount structure:', JSON.stringify(currentAccount, null, 2));
      toast.error('Wallet address not available. Please reconnect your wallet.');
      return;
    }
    
    // Validate environment variables
    if (!vendor || !registry) {
      toast.error('Environment variables not configured. Please set VITE_PACKAGE_ID and VITE_REGISTRY_ID in your .env file');
      console.error('Missing environment variables:', { vendor, registry });
      return;
    }
    
    // Validate that an image file has been uploaded
    if (!uploadedImageFile) {
      toast.error('Please upload a project image before submitting');
      console.error('No image file selected');
      return;
    }
    
    const nameRecord = await suinsClient.getNameRecord(data.name + ".sui");
    console.log('Name Record:', nameRecord);
    if(nameRecord) {
      const owner = await client.getObject({
        id: nameRecord.nftId,
        options: {
          showOwner: true
        }
      });
      console.log('Owner:', owner);
      const ownerData = owner?.data?.owner;
      const address = typeof ownerData === 'object' && ownerData !== null && 'AddressOwner' in ownerData 
        ? (ownerData as any).AddressOwner 
        : typeof ownerData === 'string' ? ownerData : null;
      console.log('Address:', address);
      if (address == currentAccount.address) {
        toast.dismiss();
        toast.success('Scam test is passed successfully!');
      }
      else{
        toast.error('Scam test is failed!');
        return;
      }
    }
    
    try {
      console.log('Starting project submission...');
      
      // Step 1: Prepare and upload project metadata to Walrus
      toast.loading('Preparing project metadata...');
    
    // Include image file metadata in the JSON
    const metadataWithImageInfo = {
      ...data,
      imageFileName: uploadedImageFile ? `${data.name}-image` : null,
      imageFileSize: uploadedImageFile ? uploadedImageFile.size : null,
      imageFileType: uploadedImageFile ? uploadedImageFile.type : null,
    };
    
    const json = JSON.stringify(metadataWithImageInfo);
    console.log('JSON with image metadata:', json);
    const fileData = new TextEncoder().encode(json);
    
    // Prepare the files array for Walrus upload
    const filesToUpload = [
      WalrusFile.from({
        contents: new Uint8Array(fileData),
        identifier: `${data.name}-metadata.json`,
      }),
    ];
    
    // Add the actual image file to Walrus if it exists
    if (uploadedImageFile) {
      console.log('Adding image file to Walrus upload:', uploadedImageFile.name);
      const imageBuffer = await uploadedImageFile.arrayBuffer();
      filesToUpload.push(
        WalrusFile.from({
          contents: new Uint8Array(imageBuffer),
          identifier: `${data.name}-image`,
        })
      );
    } else {
      console.warn('No image file selected. Only metadata will be uploaded to Walrus.');
    }
    
    const flow = client.walrus.writeFilesFlow({
      files: filesToUpload,
    });
      
    await flow.encode();
      
    const registerTx = flow.register({
      epochs: 3,
      owner: currentAccount?.address || '',
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
    const blob_objectId = (blobChange as any)?.objectId;
      
      // Validate blob creation
      if (!blob_objectId) {
        throw new Error('Failed to create blob object. Please try again.');
      }
      
      toast.dismiss();
      toast.success('Metadata uploaded successfully!');
        // Step 1: Calculate gas costs for admin transactions (client-side)
        toast.loading('Calculating gas costs...');
        
        const gasEstimates = await calculateGasCosts(
          client,
          data.name
        );
        
        const offchainGas = gasEstimates.offchainGas;
        const projectSignerGas = gasEstimates.projectSignerGas;
        const holderGas = gasEstimates.holderGas;
        
        console.log('💰 Gas Estimates (Client-Side):');
        console.log('  Offchain:', offchainGas.toString(), 'MIST');
        console.log('  Project Signer:', projectSignerGas.toString(), 'MIST');
        console.log('  Holder:', holderGas.toString(), 'MIST');
        console.log('  Total:', gasEstimates.totalSui, 'SUI');
        
        // Step 2: Create project and distribute gas tokens (user transaction)
        toast.dismiss();
        toast.loading('Creating project and funding admin accounts...');
        
        const tx = new Transaction();
        const offchain_sender = import.meta.env.VITE_OFFCCHAIN_ACC || '0x39c26ec565ee7e77ef666c030b9201de0047fabc3a8301e43007a8e31e8036b2';
        const holder_address = import.meta.env.VITE_HOLDER_ACC || '0x7e3617928ec1ea5a316954e0f207fe27c6733513d65d21f366ae3ae907d877cb';
        
        // Generate temporary project signer address (will be generated server-side, but we need a placeholder)
        // The server will generate the actual keypair, we just need to allocate gas
        // We'll send gas to offchain which will then distribute to project_signer
        
        // Transfer gas to offchain account (will mint creation cap)
        console.log(`💸 Transferring ${offchainGas} MIST to offchain account...`);
        const [offchainCoin] = tx.splitCoins(tx.gas, [offchainGas]);
        tx.transferObjects([offchainCoin], offchain_sender);
        
        // Transfer gas to holder account (will create SuiNS NFTs)
        console.log(`💸 Transferring ${holderGas} MIST to holder account...`);
        const [holderCoin] = tx.splitCoins(tx.gas, [holderGas]);
        tx.transferObjects([holderCoin], holder_address);
        
        // Note: project_signer gas will be sent by server after generating the keypair
        // For now, we add extra to offchain to cover this
        const extraForProjectSigner = projectSignerGas;
        const [extraCoin] = tx.splitCoins(tx.gas, [extraForProjectSigner]);
        tx.transferObjects([extraCoin], offchain_sender);
        
        // Create the project
        const project = tx.moveCall({
          target: `${vendor}::ideation::create_project`,
          arguments: [
            tx.object(registry),
            tx.pure.string(data.name),
            tx.object(blob_objectId),
            tx.pure.string(data.image || ''),
            tx.pure.u64(data.fundingGoal),
            tx.pure.string(data.category || '')
          ]
        });
        
        tx.transferObjects([project], offchain_sender);
        
        const createResult = await signAndExecuteTransaction({ 
          transaction: tx
        });
        
        console.log('✅ Project created on-chain:', createResult.digest);
        
        // Wait for transaction and get full details
        const txDetails = await client.waitForTransaction({
          digest: createResult.digest,
          options: { showEffects: true, showObjectChanges: true }
        });
        
        // Extract project object ID from transaction result
        const createdObjects = txDetails.objectChanges?.filter(
          (change: any) => change.type === 'created'
        ) || [];
        
        const projectObject = createdObjects.find(
          (change: any) => {
            const objectType = change.objectType || '';
            // Get the first created object - adjust filter if needed
            return objectType.includes('::ideation::Project') && !objectType.includes('::ideation::ProjectCap');
          }
        );
        
        if (!projectObject || !('objectId' in projectObject)) {
          throw new Error('Failed to extract project object ID from transaction');
        }
        
        const projectObjectId = (projectObject as any).objectId;
        console.log('📦 Project Object ID:', projectObjectId);
        
        toast.dismiss();
        toast.loading('Processing admin transactions on server...');
        
        // Step 2: Call server to handle admin transactions (creation cap, seal, etc.)
        const serverResponse = await fetch('http://localhost:3001/api/create-project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectObjectId,
            subName: data.name + '.foundry.sui',
            expirationMs: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year from now
            userAddress: currentAccount.address,
            teamMembers: data.teamMembers || [], // Pass team members with roles
            projectSignerGasFund: projectSignerGas.toString() // Send gas amount for project_signer
          }),
        });
        
        if (!serverResponse.ok) {
          let errorMessage = `Server error: ${serverResponse.status} ${serverResponse.statusText}`;
          try {
            const errorData = await serverResponse.json();
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            console.error('Could not parse error response as JSON');
          }
          throw new Error(errorMessage);
        }
        
        const serverResult = await serverResponse.json();
        console.log('✅ Server processing complete:', serverResult);
        
        toast.dismiss();
        toast.success('🎉 Project submitted successfully!');
        console.log('========================================');
        console.log('✅ COMPLETE PROJECT CREATION SUCCESS');
        console.log('========================================');
        console.log('Project Object ID:', projectObjectId);
        console.log('Creation Cap ID:', serverResult.data?.creationCapId);
        console.log('Transaction Digests:', {
          projectCreation: createResult.digest,
          ...serverResult.data?.transactions
        });
        console.log('========================================');
        
        onProjectSubmitted();
      
    } catch (error) {
      console.error('Error during project submission:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const nextStep = () => {
    // Validate Step 1: Basic Information - require image upload
    if (currentStep === 1) {
      if (!uploadedImageFile) {
        toast.error('Please upload a project image before continuing');
        return;
      }
      if (!watchedData.name || !watchedData.tagline || !watchedData.description || !watchedData.category) {
        toast.error('Please fill in all required fields before continuing');
        return;
      }
    }
    
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
    setValue("teamMembers", current.filter((_: any, i: number) => i !== index));
  };

  const addMilestone = () => {
    const current = watchedData.milestones || [];
    setValue("milestones", [...current, { title: "", description: "", amount: "" }]);
  };

  const removeMilestone = (index: number) => {
    const current = watchedData.milestones || [];
    setValue("milestones", current.filter((_: any, i: number) => i !== index));
  };

  const addSocialLink = () => {
    const current = watchedData.socialLinks || [];
    setValue("socialLinks", [...current, { platform: "twitter", url: "" }]);
  };

  const removeSocialLink = (index: number) => {
    const current = watchedData.socialLinks || [];
    setValue("socialLinks", current.filter((_: any, i: number) => i !== index));
  };

  const handleImageFile = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }
    
    const url = URL.createObjectURL(file);
    // Clean up any previous object URL
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(url);
    setUploadedImageFile(file);
    // Don't set the form value yet - will be set after Pinata upload
    console.log('📷 Image selected:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }
    
    const url = URL.createObjectURL(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(url);
    setUploadedImageFile(file);
    console.log('📷 Image dropped:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  };

  const handleUploadToPinata = async () => {
    if (!uploadedImageFile) {
      toast.error('Please select an image first');
      return;
    }

    if (!isPinataConfigured()) {
      toast.error('Pinata is not configured. Please add VITE_PINATA_JWT and VITE_PINATA_GATEWAY to your environment variables.');
      return;
    }

    try {
      setIsUploadingImage(true);
      toast.loading('Uploading image to IPFS...');
      
      const ipfsUrl = await uploadImageToPinata(uploadedImageFile);
      
      // Store the IPFS URL in the form
      setValue("image", ipfsUrl);
      
      toast.dismiss();
      toast.success('Image uploaded to IPFS successfully! 🎉');
      console.log('✅ IPFS URL stored:', ipfsUrl);
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Failed to upload image to IPFS');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
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

        {/* Wallet Status Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-card border border-border rounded-lg">
            <h3 className="text-sm font-semibold text-foreground mb-2">🔍 Wallet Connection Debug</h3>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div>Connected: {currentAccount ? '✅ Yes' : '❌ No'}</div>
              <div>Address: {currentAccount?.address || '❌ Not available'}</div>
              <div>Address Type: {typeof currentAccount?.address}</div>
              {currentAccount && (
                <div className="mt-2">
                  <details>
                    <summary className="cursor-pointer text-[#00E0FF]">Show full account object</summary>
                    <pre className="mt-2 p-2 bg-background rounded text-[10px] overflow-auto">
                      {JSON.stringify(currentAccount, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        )}

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
                        onValueChange={(value: string) => setValue("category", value)}
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
                        Project Image <span className="text-[#FF3366]">*</span>
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
                            : uploadedImageFile
                            ? "border-[#00FFA3] hover:border-[#00E0FF] hover:bg-[#00E0FF]/5"
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
                      
               
                      
                      {/* Success message when uploaded */}
                      {watchedData.image?.startsWith('http') && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-[#00FFA3]">
                          <Check className="w-4 h-4" />
                          <span>Image uploaded to IPFS successfully!</span>
                        </div>
                      )}
                      
                      <p className="text-muted-foreground text-xs mt-2">
                        <span className="text-[#FF3366]">* Required:</span> Upload a cover image (displayed at 320×180, 16:9). Image will be stored on Walrus decentralized storage.
                      </p>
                      {!uploadedImageFile && (
                        <p className="text-[#FF6B00] text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Please upload an image to continue
                        </p>
                      )}
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
                        {(watchedData.teamMembers || []).map((_member: any, index: number) => (
                          <div key={index} className="flex gap-2">
                            <Input placeholder="Address" {...register(`teamMembers.${index}.name`)} className="" />
                            <Select
                              value={watchedData.teamMembers?.[index]?.role || undefined}
                              onValueChange={(value: string) => setValue(`teamMembers.${index}.role`, value)}
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
                        {(watchedData.socialLinks || []).map((link: any, index: number) => {
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
                                  onValueChange={(value: string) => setValue(`socialLinks.${index}.platform`, value)}
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
                      {(watchedData.milestones || []).map((_milestone: any, index: number) => (
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
                      onValueChange={(v: string) => setHistoryVisibility(v as "public" | "private")}
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

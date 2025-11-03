import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  Briefcase, 
  Code, 
  Palette, 
  FileText, 
  Megaphone,
  DollarSign,
  Calendar,
  Target,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  MapPin,
  Users
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useCurrentAccount, useSignAndExecuteTransaction, useSignPersonalMessage } from "@mysten/dapp-kit";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { EncryptedObject, SealClient, SessionKey } from "@mysten/seal";
interface AddJobRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  projectId: string;
  onJobAdded: (job: JobRequest) => void;
}

export interface JobRequest {
  id: number;
  title: string;
  category: string;
  budget: number;
  deadline: string;
  description: string;
  location: string;
  requiredSkills: string[];
  organizationContributions: string[];
  applicants: number;
  status: "Open" | "Hiring" | "In Progress" | "Completed" | "Closed";
  postedDate: string;
  numberOfPeopleToHire: number;
  hiredMembers?: string[]; // Array of applicant IDs
  projectId?: string; // Blockchain project object ID
  blockchainJobId?: string; // Blockchain job ID for filtering encrypted vs decrypted jobs
}

const categories = [
  { value: "Development", label: "Development", icon: Code, color: "#00E0FF" },
  { value: "Design", label: "Design", icon: Palette, color: "#C04BFF" },
  { value: "Content", label: "Content", icon: FileText, color: "#00FFA3" },
  { value: "Marketing", label: "Marketing", icon: Megaphone, color: "#FF6B00" },
];

const budgetPresets = [500, 1000, 2500, 5000, 10000, 25000];

export function AddJobRequestDialog({
  open,
  onOpenChange,
  projectName,
  projectId,
  onJobAdded,
}: AddJobRequestDialogProps) {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const currentAccount = useCurrentAccount();
  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [numberOfPeopleToHire, setNumberOfPeopleToHire] = useState("1");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [skillAmounts, setSkillAmounts] = useState<{ [skill: string]: number }>({});
  const [newSkill, setNewSkill] = useState("");
  const [organizationContributions, setOrganizationContributions] = useState<string[]>([]);
  const [orgAmounts, setOrgAmounts] = useState<{ [org: string]: number }>({});
  const [newContribution, setNewContribution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Non-hook initializations
  const client = new SuiJsonRpcClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet',
  });
  
  const packageId = '0xc58a26ab2751fbae42888dda3ed47637703018ec8969de8fae2b4aba6ba1bfd3';
  const whitelistedId = "0x18959ea37ee943aae83b0a40662d3b94cb4b78070be8c9275178da0966094553";
  const serverObjectIds = [
      "0x164ac3d2b3b8694b8181c13f671950004765c23f270321a45fdd04d40cccf0f2", 
      "0x5466b7df5c15b508678d51496ada8afab0d6f70a01c10613123382b1b8131007"
  ];
  const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
  const sealClient = new SealClient({
      suiClient,
      serverConfigs: serverObjectIds.map((id) => ({
          objectId: id,
          weight: 1,
      })),
      verifyKeyServers: false,
  });
  const vendor = import.meta.env.VITE_PACKAGE_ID;
  const registry = import.meta.env.VITE_REGISTRY_ID;
  const account_ns_reg = import.meta.env.VITE_ACCOUNT_NS_REGISTRY_ID;
  
  const handleAddSkill = (skill: string) => {
    if (skill && !requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill]);
      setSkillAmounts({ ...skillAmounts, [skill]: 0 });
      setNewSkill("");
    }
  };
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter(skill => skill !== skillToRemove));
    const newSkillAmounts = { ...skillAmounts };
    delete newSkillAmounts[skillToRemove];
    setSkillAmounts(newSkillAmounts);
  };
  
  const handleSkillAmountChange = (skill: string, amount: number) => {
    setSkillAmounts({ ...skillAmounts, [skill]: amount });
  };
  
  const handleAddContribution = (contribution: string) => {
    if (contribution && !organizationContributions.includes(contribution)) {
      setOrganizationContributions([...organizationContributions, contribution]);
      setOrgAmounts({ ...orgAmounts, [contribution]: 0 });
      setNewContribution("");
    }
  };
  
  const handleRemoveContribution = (contributionToRemove: string) => {
    setOrganizationContributions(organizationContributions.filter(c => c !== contributionToRemove));
    const newOrgAmounts = { ...orgAmounts };
    delete newOrgAmounts[contributionToRemove];
    setOrgAmounts(newOrgAmounts);
  };
  
  const handleOrgAmountChange = (org: string, amount: number) => {
    setOrgAmounts({ ...orgAmounts, [org]: amount });
  };
  
  const handleSubmit = async () => {
    // Check wallet connection first
    if (!currentAccount) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    // Validation
    if (!title.trim()) {
      toast.error("Please enter a job title");
      return;
    }
    
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    
    if (!budget || parseFloat(budget) <= 0) {
      toast.error("Please enter a valid budget");
      return;
    }
    
    if (!deadline) {
      toast.error("Please select a deadline");
      return;
    }
    
    if (!description.trim()) {
      toast.error("Please enter a job description");
      return;
    }
    
    if (!location.trim()) {
      toast.error("Please enter a location");
      return;
    }
    
    const numberOfPeopleNum = parseInt(numberOfPeopleToHire);
    if (!numberOfPeopleToHire || isNaN(numberOfPeopleNum) || numberOfPeopleNum <= 0) {
      toast.error("Please enter a valid number of people to hire");
      return;
    }
    
    // if (requiredSkills.length === 0) {
    //   toast.error("Please add at least one required skill");
    //   return;
    // }
    
    // if (organizationContributions.length === 0) {
    //   toast.error("Please add at least one organization contribution");
    //   return;
    // }
    
    
    setIsSubmitting(true);
    toast.loading("Posting job request...");
    
    // Map category string to number
    const categoryMap: { [key: string]: number } = {
      "Development": 0,
      "Design": 1,
      "Content": 2,
      "Marketing": 3,
    };
    const categoryNum = categoryMap[category] || 0;
    
    // Prepare role and org arrays with amounts
    const roleAmounts = requiredSkills.map(skill => skillAmounts[skill] || 0);
    const orgAmountsArray = organizationContributions.map(org => orgAmounts[org] || 0);
    
    const newJob: JobRequest = {
      id: Date.now(),
      title: title.trim(),
      category,
      budget: parseFloat(budget),
      deadline,
      description: description.trim(),
      location: location.trim(),
      numberOfPeopleToHire: numberOfPeopleNum,
      requiredSkills,
      organizationContributions,
      applicants: 0,
      status: "Open",
      postedDate: new Date().toISOString(),
    };
    
    // Log the size of the newJob data
    const jobDataString = JSON.stringify(newJob);
    const jobDataBytes = new TextEncoder().encode(jobDataString);
    console.log('=== New Job Request Data Size ===');
    console.log('Job Data (stringified):', jobDataString);
    console.log('String length:', jobDataString.length, 'characters');
    console.log('Byte size:', jobDataBytes.length, 'bytes');
    console.log('Size in KB:', (jobDataBytes.length / 1024).toFixed(2), 'KB');
    console.log('================================');
    
    try {
      if (!currentAccount?.address) {
        toast.dismiss();
        toast.error("Please connect your wallet first");
        setIsSubmitting(false);
        return;
      }
      const ownerAddress = currentAccount.address;
      // Fetch USDC coins from user's wallet
      const usdcCoinType = '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC';
      console.log('Fetching USDC coins from wallet...');
      
      const coinsResponse = await client.getCoins({
        owner: ownerAddress,
        coinType: usdcCoinType,
      });
      
      console.log('USDC Coins:', coinsResponse);
      
      if (!coinsResponse.data || coinsResponse.data.length === 0) {
        toast.dismiss();
        toast.error("No USDC coins found in your wallet. Please get some USDC first.");
        setIsSubmitting(false);
        return;
      }
      
      // Calculate total USDC balance
      const totalBalance = coinsResponse.data.reduce((sum, coin) => sum + BigInt(coin.balance), BigInt(0));
      const budgetAmount = BigInt(Math.floor(parseFloat(budget) * 1_000_000)); // Convert to USDC micro-units
      
      console.log(`Total USDC Balance: ${totalBalance}, Required: ${budgetAmount}`);
      
      if (totalBalance < budgetAmount) {
        toast.dismiss();
        toast.error(`Insufficient USDC balance. Required: ${parseFloat(budget)} USDC, Available: ${Number(totalBalance) / 1_000_000} USDC`);
        setIsSubmitting(false);
        return;
      }
      const encryptedBytes = await encryptJobDetails(newJob);
      if (!encryptedBytes) {
        toast.dismiss();
        toast.error("Failed to encrypt job details");
        setIsSubmitting(false);
        return;
      }
      const tx = new Transaction();
      
      // Merge all USDC coins if there are multiple
      const primaryCoin = coinsResponse.data[0].coinObjectId;
      if (coinsResponse.data.length > 1) {
        const coinObjectsToMerge = coinsResponse.data.slice(1).map(coin => coin.coinObjectId);
        tx.mergeCoins(
          tx.object(primaryCoin),
          coinObjectsToMerge.map(id => tx.object(id))
        );
      }
      
      // Split the required amount from the primary coin
      const [coin] = tx.splitCoins(tx.object(primaryCoin), [budgetAmount.toString()]);
      console.log(requiredSkills, roleAmounts, organizationContributions, orgAmountsArray, ownerAddress, categoryNum, encryptedBytes, coin);
      tx.moveCall({
        target: `${vendor}::ideation::create_job`,
        arguments: [
          tx.object(registry),
          tx.object(projectId),
          tx.pure.vector('u8', encryptedBytes),
          tx.pure.vector('string', requiredSkills),
          tx.pure.vector('u64', roleAmounts),
          tx.pure.vector('string', organizationContributions),
          tx.pure.vector('u64', orgAmountsArray),
          tx.pure.address(ownerAddress),
          tx.pure.u64(categoryNum),
          coin,
          tx.pure.u64(numberOfPeopleNum),
        ],
      });
      
      // Execute transaction
      console.log('Executing transaction...');
      const result = await signAndExecuteTransaction({ transaction: tx });
      console.log('Job request created:', result);
      
      onJobAdded(newJob);
      toast.dismiss();
      toast.success("Job request posted successfully!");
      
      // Reset form
      setTitle("");
      setCategory("");
      setBudget("");
      setDeadline("");
      setDescription("");
      setLocation("");
      setNumberOfPeopleToHire("1");
      setRequiredSkills([]);
      setSkillAmounts({});
      setNewSkill("");
      setOrganizationContributions([]);
      setOrgAmounts({});
      setNewContribution("");
      setIsSubmitting(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error posting job request:", error);
      toast.dismiss();
      toast.error("Failed to post job request. Please try again.");
      setIsSubmitting(false);
    }
  };
  async function encryptJobDetails(jobDetails: JobRequest) {
    if (!currentAccount) {
      toast.error("Please connect your wallet first");
      return;
    }
    try {
        const data = new TextEncoder().encode(JSON.stringify(jobDetails));
        console.log("Encrypting data...");
        const { encryptedObject: encryptedBytes, key: backupKey } = await sealClient.encrypt({
            threshold: 1,
            packageId: vendor,
            id: "0x1",
            data
        });
        console.log("Encrypted bytes:", encryptedBytes);
        const parsed = EncryptedObject.parse(encryptedBytes);
        const identityBytes = parsed.id; // vector<u8> used at encrypt time
        
        console.log("Identity bytes: ", identityBytes);
        console.log("Creating session key...");
        return encryptedBytes;
    } catch (error) {
        console.log("Error occured")
        console.log("Error:", error);
        console.log(error);
    }
  }

  const selectedCategoryData = categories.find(c => c.value === category);
  const Icon = selectedCategoryData?.icon || Briefcase;

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1E1F24] border-[#E8E9EB]/10 text-[#E8E9EB] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#E8E9EB] flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#00E0FF]" />
            Post Job Request
          </DialogTitle>
          <DialogDescription className="text-[#A0A2A8]">
            Add a new job request for <span className="text-[#00E0FF]">{projectName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">

          {/* Job Title */}
          <div>
            <Label htmlFor="title" className="text-[#E8E9EB] mb-2 block">
              Job Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Smart Contract Security Audit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8]"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category" className="text-[#E8E9EB] mb-2 block">
              Category *
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1E1F24] border-[#E8E9EB]/20">
                {categories.map((cat) => {
                  const CategoryIcon = cat.icon;
                  return (
                    <SelectItem 
                      key={cat.value} 
                      value={cat.value}
                      className="text-[#E8E9EB] focus:bg-[#00E0FF]/10 focus:text-[#00E0FF]"
                    >
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="w-4 h-4" style={{ color: cat.color }} />
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Budget & Deadline Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Budget */}
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
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="pl-10 bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8]"
                />
              </div>
            </div>

            {/* Deadline */}
            <div>
              <Label htmlFor="deadline" className="text-[#E8E9EB] mb-2 block">
                Deadline *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A2A8]" />
                <Input
                  id="deadline"
                  type="date"
                  min={today}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="pl-10 bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8]"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-[#E8E9EB] mb-2 block">
              Job Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the job requirements, deliverables, and expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8] resize-none"
            />
            <div className="text-sm text-[#A0A2A8] mt-1">
              {description.length}/500 characters
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-[#E8E9EB] mb-2 block">
              Location *
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A2A8]" />
              <Input
                id="location"
                placeholder="e.g., Remote, New York, Hybrid - San Francisco"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8]"
              />
            </div>
          </div>

          {/* Number of People to Hire */}
          <div>
            <Label htmlFor="numberOfPeopleToHire" className="text-[#E8E9EB] mb-2 block">
              Number of People to Hire *
            </Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A2A8]" />
              <Input
                id="numberOfPeopleToHire"
                type="text"
                placeholder="e.g., 1, 2, 5"
                value={numberOfPeopleToHire}
                onChange={(e) => setNumberOfPeopleToHire(e.target.value)}
                className="pl-10 bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8]"
              />
            </div>
            <p className="text-sm text-[#A0A2A8] mt-1">
              Specify how many people you want to hire for this position (numeric value)
            </p>
          </div>

          {/* Required Skills */}
          <div>
            <Label className="text-[#E8E9EB] mb-2 block">
              Required role contributions *
            </Label>
            
            {/* Suggested Skills for Category
            {category && suggestedSkills[category] && (
              <div className="mb-3">
                <p className="text-sm text-[#A0A2A8] mb-2">Suggested for {category}:</p>
                <div className="flex gap-2 flex-wrap">
                  {suggestedSkills[category].map((skill) => (
                    <Button
                      key={skill}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddSkill(skill)}
                      disabled={requiredSkills.includes(skill)}
                      className={`text-xs ${
                        requiredSkills.includes(skill)
                          ? "border-[#00FFA3]/30 text-[#00FFA3] cursor-not-allowed"
                          : "border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#0D0E10] hover:text-[#00E0FF] hover:border-[#00E0FF]/30"
                      }`}
                    >
                      {requiredSkills.includes(skill) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>
            )} */}

            {/* Custom Skill Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill(newSkill);
                  }
                }}
                className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8]"
              />
              <Button
                type="button"
                onClick={() => handleAddSkill(newSkill)}
                className="bg-[#00E0FF] text-[#0D0E10] hover:bg-[#00E0FF]/90"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected Skills */}
            {requiredSkills.length > 0 && (
              <Card className="p-4 bg-[#0D0E10]/50 border-[#E8E9EB]/10 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#E8E9EB]">Selected Skills</span>
                  <Badge className="bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30">
                    {requiredSkills.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {requiredSkills.map((skill) => (
                    <div key={skill} className="flex items-center gap-2">
                      <Badge className="bg-[#C04BFF]/20 text-[#C04BFF] border-[#C04BFF]/30 pr-1 flex-shrink-0">
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 hover:bg-[#C04BFF]/30 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                      <div className="flex items-center gap-2 flex-1">
                        <Label className="text-xs text-[#A0A2A8] whitespace-nowrap">Amount:</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={skillAmounts[skill] || ''}
                          onChange={(e) => handleSkillAmountChange(skill, parseInt(e.target.value) || 0)}
                          className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8] h-8 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
          <div>
            <Label className="text-[#E8E9EB] mb-2 block">
              Required Organization Contribution *
            </Label>
            
            {/* Custom Contribution Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add an organization contribution..."
                value={newContribution}
                onChange={(e) => setNewContribution(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddContribution(newContribution);
                  }
                }}
                className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8]"
              />
              <Button
                type="button"
                onClick={() => handleAddContribution(newContribution)}
                className="bg-[#00E0FF] text-[#0D0E10] hover:bg-[#00E0FF]/90"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected Contributions */}
            {organizationContributions.length > 0 && (
              <Card className="p-4 bg-[#0D0E10]/50 border-[#E8E9EB]/10 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#E8E9EB]">Selected Contributions</span>
                  <Badge className="bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3]/30">
                    {organizationContributions.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {organizationContributions.map((contribution) => (
                    <div key={contribution} className="flex items-center gap-2">
                      <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30 pr-1 flex-shrink-0">
                        {contribution}
                        <button
                          onClick={() => handleRemoveContribution(contribution)}
                          className="ml-2 hover:bg-[#FF6B00]/30 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                      <div className="flex items-center gap-2 flex-1">
                        <Label className="text-xs text-[#A0A2A8] whitespace-nowrap">Amount:</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={orgAmounts[contribution] || ''}
                          onChange={(e) => handleOrgAmountChange(contribution, parseInt(e.target.value) || 0)}
                          className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8] h-8 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        
          {/* Summary Preview */}
          {title && category && budget && deadline && (
            <Card className="p-4 bg-[#00FFA3]/10 border-[#00FFA3]/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00FFA3] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[#00FFA3] mb-2">Preview</p>
                  <div className="space-y-1 text-sm text-[#E8E9EB]">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: selectedCategoryData?.color }} />
                      <span>{title}</span>
                      <Badge className="bg-[#0D0E10] text-[#A0A2A8] border-[#E8E9EB]/10 text-xs">
                        {category}
                      </Badge>
                    </div>
                    <div className="text-[#A0A2A8]">
                      Budget: ${parseFloat(budget).toLocaleString()} • Deadline: {new Date(deadline).toLocaleDateString()}
                      {location && ` • ${location}`}
                      {numberOfPeopleToHire && !isNaN(parseInt(numberOfPeopleToHire)) && ` • Hiring: ${numberOfPeopleToHire} ${parseInt(numberOfPeopleToHire) === 1 ? 'person' : 'people'}`}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:border-[#FF6B00]/50"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !title || !category || !budget || !deadline || !description || !location || !numberOfPeopleToHire || isNaN(parseInt(numberOfPeopleToHire)) || parseInt(numberOfPeopleToHire) <= 0}
              className="flex-1 bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10] disabled:opacity-50"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Post Job Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

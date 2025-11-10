import { useState } from "react";
import { User, Mail, Linkedin, Twitter, FileText, Award, Trophy, Upload, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner@2.0.3";
import suinsImage from 'figma:asset/27d412f8166d0162cffba35644022cfc464e5b81.png';
import { useCurrentAccount } from "@mysten/dapp-kit";

interface SuiNSNFT {
  id: string;
  name: string;
  handle: string;
  issueDate: string;
  type: "role" | "contribution";
}

interface UserData {
  fullName: string;
  email: string;
  linkedin: string;
  twitter: string;
  walletAddress: string;
  resumeUrl: string;
}

export function ProfilePage() {
  const account = useCurrentAccount();
  // Track if user has registered/completed profile
  const [isProfileRegistered, setIsProfileRegistered] = useState(false);
  
  // Mock user data - in production, this would come from wallet/blockchain
  const [userData, setUserData] = useState<UserData>({
    fullName: "",
    email: "",
    linkedin: "",
    twitter: "",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    resumeUrl: "",
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<UserData>(userData);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Mock SuiNS NFTs - Multiple Role NFTs (More than 5 to showcase rotation)
  const initialRoleSuiNS: SuiNSNFT[] = [
    {
      id: "1",
      name: "Lead Developer",
      handle: "lead-dev@foundry",
      issueDate: "Oct 15, 2025",
      type: "role",
    },
    {
      id: "2",
      name: "Product Manager",
      handle: "product-mgr@foundry",
      issueDate: "Nov 02, 2025",
      type: "role",
    },
    {
      id: "3",
      name: "UI/UX Designer",
      handle: "ux-designer@foundry",
      issueDate: "Sep 20, 2025",
      type: "role",
    },
    {
      id: "4",
      name: "Smart Contract Auditor",
      handle: "sc-auditor@foundry",
      issueDate: "Oct 08, 2025",
      type: "role",
    },
    {
      id: "5",
      name: "Community Manager",
      handle: "comm-mgr@foundry",
      issueDate: "Aug 30, 2025",
      type: "role",
    },
    {
      id: "6",
      name: "Marketing Lead",
      handle: "marketing-lead@foundry",
      issueDate: "Sep 15, 2025",
      type: "role",
    },
    {
      id: "7",
      name: "DevOps Engineer",
      handle: "devops-eng@foundry",
      issueDate: "Jul 22, 2025",
      type: "role",
    },
  ];

  // State for rotating role NFTs
  const [roleSuiNS, setRoleSuiNS] = useState<SuiNSNFT[]>(initialRoleSuiNS);
  const maxVisibleCards = 3; // Show only 3 cards at a time

  const contributionSuiNS: SuiNSNFT[] = [
    {
      id: "c1",
      name: "First Project",
      handle: "first-project@foundry",
      issueDate: "Oct 25, 2025",
      type: "contribution",
    },
    {
      id: "c2",
      name: "DeFi Pioneer",
      handle: "defi-pioneer@foundry",
      issueDate: "Nov 12, 2025",
      type: "contribution",
    },
    {
      id: "c3",
      name: "Community Builder",
      handle: "community-builder@foundry",
      issueDate: "Dec 03, 2025",
      type: "contribution",
    },
  ];

  // Handle opening edit dialog
  const handleEditClick = () => {
    setEditForm(userData);
    setResumeFile(null);
    setIsEditDialogOpen(true);
  };

  // Handle form field changes
  const handleFormChange = (field: keyof UserData, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle resume file upload
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
        setResumeFile(file);
        toast.success("Resume uploaded successfully");
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  // Validate URL format
  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // Allow empty URLs
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle save changes
  const handleSaveChanges = () => {
    // Validation
    if (!editForm.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!editForm.email.trim() || !editForm.email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (editForm.linkedin && !isValidUrl(editForm.linkedin)) {
      toast.error("Please enter a valid LinkedIn URL");
      return;
    }

    if (editForm.twitter && !isValidUrl(editForm.twitter)) {
      toast.error("Please enter a valid Twitter/X URL");
      return;
    }

    // Update user data
    const updatedData = { ...editForm };
    
    // If a new resume was uploaded, update the URL
    if (resumeFile) {
      updatedData.resumeUrl = `/resume-${resumeFile.name}`;
    }

    setUserData(updatedData);
    setIsProfileRegistered(true);
    setIsEditDialogOpen(false);
    toast.success(isProfileRegistered ? "Profile updated successfully" : "Profile registered successfully! Welcome to Foundry³");
  };

  // Handle role NFT card rotation - move clicked card to back (next)
  const handleRoleNFTClick = (clickedId: string) => {
    setRoleSuiNS(prev => {
      // Find the clicked card
      const clickedIndex = prev.findIndex(nft => nft.id === clickedId);
      if (clickedIndex === -1) return prev;
      
      // Create new array with clicked card moved to the end
      const newOrder = [...prev];
      const [clickedCard] = newOrder.splice(clickedIndex, 1);
      newOrder.push(clickedCard);
      
      return newOrder;
    });
  };

  // Navigate to next NFT (move first to back)
  const handleNextRoleNFT = () => {
    setRoleSuiNS(prev => {
      const newOrder = [...prev];
      const [firstCard] = newOrder.splice(0, 1);
      newOrder.push(firstCard);
      return newOrder;
    });
  };

  // Navigate to previous NFT (move last to front)
  const handlePreviousRoleNFT = () => {
    setRoleSuiNS(prev => {
      const newOrder = [...prev];
      const lastCard = newOrder.pop();
      if (lastCard) {
        newOrder.unshift(lastCard);
      }
      return newOrder;
    });
  };
  
  if (!account) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-gradient-to-br from-[#00E0FF]/10 to-[#C04BFF]/10 rounded-2xl p-8 border border-[#E8E9EB]/10 backdrop-blur-sm">
              <User className="w-16 h-16 text-[#00E0FF] mx-auto mb-4" />
              <h2 className="text-center text-[#E8E9EB] mb-2">Connect Your Wallet</h2>
              <p className="text-center text-[#A0A2A8] max-w-md">
                Please connect your wallet to view your profile and SuiNS NFTs
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your account information and SuiNS NFTs
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information Card */}
            <Card className="bg-card/80 border-border backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground">Personal Information</h3>
                {isProfileRegistered && (
                  <Button 
                    variant="outline" 
                    className="border-[#00E0FF]/30 bg-transparent hover:bg-[#00E0FF]/10 text-[#00E0FF] text-sm h-8 px-3"
                    onClick={handleEditClick}
                  >
                    Edit
                  </Button>
                )}
              </div>

              {!isProfileRegistered ? (
                <div className="py-12 text-center">
                  <div className="bg-gradient-to-br from-[#00E0FF]/5 to-[#C04BFF]/5 rounded-xl p-8 border border-border">
                    <User className="w-12 h-12 text-[#00E0FF] mx-auto mb-4" />
                    <h3 className="text-foreground mb-2">Complete Your Profile</h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                      Set up your profile to participate in projects, apply for jobs, and earn SuiNS NFTs in the Foundry³ ecosystem.
                    </p>
                    <Button 
                      onClick={handleEditClick}
                      className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:from-[#00C8E6] hover:to-[#A840E6] text-[#0D0E10]"
                    >
                      Register Profile
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                {/* Full Name & Email in one row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="flex items-start gap-3">
                    <div className="bg-[#00E0FF]/10 p-2 rounded-lg">
                      <User className="w-4 h-4 text-[#00E0FF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground text-xs mb-0.5">Full Name</p>
                      <p className="text-foreground text-sm truncate">{userData.fullName}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="bg-[#C04BFF]/10 p-2 rounded-lg">
                      <Mail className="w-4 h-4 text-[#C04BFF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground text-xs mb-0.5">Email</p>
                      <p className="text-foreground text-sm truncate">{userData.email}</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* LinkedIn & Twitter in one row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* LinkedIn */}
                  <div className="flex items-start gap-3">
                    <div className="bg-[#FF6B00]/10 p-2 rounded-lg">
                      <Linkedin className="w-4 h-4 text-[#FF6B00]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground text-xs mb-0.5">LinkedIn</p>
                      {userData.linkedin ? (
                        <a 
                          href={userData.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#00E0FF] hover:underline text-sm truncate block"
                        >
                          {userData.linkedin.replace('https://www.linkedin.com/in/', 'linkedin.com/in/')}
                        </a>
                      ) : (
                        <p className="text-muted-foreground/60 text-sm">Not provided</p>
                      )}
                    </div>
                  </div>

                  {/* Twitter/X */}
                  <div className="flex items-start gap-3">
                    <div className="bg-[#00FFA3]/10 p-2 rounded-lg">
                      <Twitter className="w-4 h-4 text-[#00FFA3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground text-xs mb-0.5">X/Twitter</p>
                      {userData.twitter ? (
                        <a 
                          href={userData.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#00E0FF] hover:underline text-sm truncate block"
                        >
                          {userData.twitter.replace('https://twitter.com/', '@').replace('https://x.com/', '@')}
                        </a>
                      ) : (
                        <p className="text-muted-foreground/60 text-sm">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Resume */}
                <div className="flex items-start gap-3">
                  <div className="bg-[#00E0FF]/10 p-2 rounded-lg">
                    <FileText className="w-4 h-4 text-[#00E0FF]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs mb-0.5">Resume</p>
                    {userData.resumeUrl ? (
                      <Button
                        variant="link"
                        className="text-[#00E0FF] hover:underline p-0 h-auto text-sm"
                        onClick={() => window.open(userData.resumeUrl, '_blank')}
                      >
                        Download Resume
                      </Button>
                    ) : (
                      <p className="text-muted-foreground/60 text-sm">Not uploaded</p>
                    )}
                  </div>
                </div>
              </div>
              )}
            </Card>

            {/* Contribution SuiNS NFTs */}
            {isProfileRegistered && (
              <Card className="bg-card/80 border-border backdrop-blur-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-6 h-6 text-[#FF6B00]" />
                  <h2 className="text-foreground">Contribution SuiNS NFTs</h2>
                  <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30">
                    {contributionSuiNS.length}
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {contributionSuiNS.map((nft) => (
                    <SuiNSCard key={nft.id} nft={nft} />
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Role SuiNS */}
          <div className="lg:col-span-1">
            <Card className="bg-card/80 border-border backdrop-blur-sm p-6 sticky top-24">
              {isProfileRegistered ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-6 h-6 text-[#C04BFF]" />
                      <h2 className="text-foreground">Role SuiNS NFTs</h2>
                      <Badge className="bg-[#C04BFF]/20 text-[#C04BFF] border-[#C04BFF]/30">
                        {roleSuiNS.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  {roleSuiNS.length > maxVisibleCards && (
                    <div className="flex items-center justify-between mb-4 px-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePreviousRoleNFT}
                        className="h-8 px-3 text-[#00E0FF] hover:text-[#00E0FF] hover:bg-[#00E0FF]/10 border border-[#00E0FF]/20"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextRoleNFT}
                        className="h-8 px-3 text-[#00E0FF] hover:text-[#00E0FF] hover:bg-[#00E0FF]/10 border border-[#00E0FF]/20"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {roleSuiNS.slice(0, maxVisibleCards).map((nft, index) => (
                        <motion.div
                          key={nft.id}
                          layout
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.9 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            delay: index * 0.05,
                          }}
                          onClick={() => handleRoleNFTClick(nft.id)}
                          className={roleSuiNS.length > maxVisibleCards ? "cursor-pointer" : ""}
                        >
                          <SuiNSCard 
                            nft={nft} 
                            featured 
                            isClickable={roleSuiNS.length > maxVisibleCards}
                            cardIndex={index + 1}
                            totalCards={roleSuiNS.length}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {roleSuiNS.length > maxVisibleCards && (
                      <div className="flex items-center justify-center gap-1.5 pt-2">
                        {roleSuiNS.map((nft, idx) => (
                          <div
                            key={nft.id}
                            className={`transition-all duration-300 rounded-full ${
                              idx < maxVisibleCards
                                ? 'w-2 h-2 bg-[#C04BFF]/80'
                                : 'w-1.5 h-1.5 bg-border'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator className="bg-border my-6" />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="w-6 h-6 text-[#C04BFF]" />
                    <h2 className="text-foreground">Role & Achievements</h2>
                  </div>
                  
                  <div className="text-center py-8">
                    <div className="bg-[#C04BFF]/5 rounded-xl p-6 border border-[#C04BFF]/10">
                      <Award className="w-10 h-10 text-[#C04BFF] mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground text-sm mb-4">
                        Complete your profile to start earning Role and Contribution SuiNS NFTs
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-border my-6" />
                </>
              )}

              {/* Wallet Info */}
              <div>
                <p className="text-muted-foreground text-sm mb-2">Wallet Address</p>
                <div className="bg-[#0D0E10]/60 border border-border rounded-lg p-3">
                  <p className="text-foreground text-sm font-mono break-all">
                    {account?.address || userData.walletAddress}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {isProfileRegistered ? "Edit Profile" : "Complete Your Profile"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {isProfileRegistered 
                  ? "Update your personal information and social links"
                  : "Set up your profile to participate in the Foundry³ ecosystem"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Full Name & Email Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    value={editForm.fullName}
                    onChange={(e) => handleFormChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <Separator className="bg-border" />

              {/* LinkedIn */}
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-foreground flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-[#FF6B00]" />
                  LinkedIn Profile
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={editForm.linkedin}
                  onChange={(e) => handleFormChange("linkedin", e.target.value)}
                  placeholder="https://www.linkedin.com/in/yourprofile"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Twitter/X */}
              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-foreground flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-[#00FFA3]" />
                  X/Twitter Profile
                </Label>
                <Input
                  id="twitter"
                  type="url"
                  value={editForm.twitter}
                  onChange={(e) => handleFormChange("twitter", e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Separator className="bg-border" />

              {/* Resume Upload */}
              <div className="space-y-2">
                <Label htmlFor="resume" className="text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00E0FF]" />
                  Resume (PDF)
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleResumeUpload}
                    className="bg-background border-border text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#00E0FF]/10 file:text-[#00E0FF] hover:file:bg-[#00E0FF]/20"
                  />
                  {resumeFile && (
                    <Badge className="bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30">
                      {resumeFile.name}
                    </Badge>
                  )}
                </div>
                {userData.resumeUrl && (
                  <p className="text-xs text-muted-foreground">
                    Current: {userData.resumeUrl.split('/').pop()}
                  </p>
                )}
              </div>

              {/* Required Fields Note */}
              <div className="bg-[#00E0FF]/5 border border-[#00E0FF]/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  * Required fields
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-border bg-transparent hover:bg-muted text-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                className="bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:from-[#00C8E6] hover:to-[#A840E6] text-[#0D0E10]"
              >
                {isProfileRegistered ? "Save Changes" : "Register Profile"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// SuiNS NFT Card Component
interface SuiNSCardProps {
  nft: SuiNSNFT;
  featured?: boolean;
  isClickable?: boolean;
  cardIndex?: number;
  totalCards?: number;
}

function SuiNSCard({ nft, featured = false, isClickable = false, cardIndex, totalCards }: SuiNSCardProps) {
  return (
    <div className="relative group">
      {/* Card Index Badge */}
      {cardIndex && totalCards && (
        <div className="absolute -top-2 -right-2 z-20 bg-gradient-to-br from-[#00E0FF] to-[#C04BFF] text-[#0D0E10] px-3 py-1 rounded-full text-xs shadow-lg border-2 border-[#0D0E10]">
          <span className="font-mono">{cardIndex}/{totalCards}</span>
        </div>
      )}
      
      {/* Glassmorphic Card */}
      <div className={`
        relative overflow-hidden rounded-xl
        bg-gradient-to-br from-[#00E0FF]/5 via-[#C04BFF]/5 to-[#FF6B00]/5
        border border-border
        backdrop-blur-sm
        transition-all duration-300
        hover:border-[#00E0FF]/40
        hover:shadow-[0_0_20px_rgba(0,224,255,0.3)]
        ${featured ? 'p-6' : 'p-4'}
        ${isClickable ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
      `}>
        {/* Background Pattern (inspired by the sample image) */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pattern-${nft.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="15" fill="none" stroke="#00E0FF" strokeWidth="1" opacity="0.3"/>
                <circle cx="30" cy="30" r="15" fill="none" stroke="#C04BFF" strokeWidth="1" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#pattern-${nft.id})`} />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* NFT Name */}
          <h3 className={`text-foreground mb-3 ${featured ? 'text-xl' : ''}`}>
            {nft.name}
          </h3>

          {/* Handle - Gradient Text */}
          <div className="mb-4">
            <p className={`bg-gradient-to-r from-[#00E0FF] via-[#FF6B00] to-[#C04BFF] bg-clip-text text-transparent ${featured ? 'text-lg' : ''}`}>
              @{nft.handle.split('@')[0]}
            </p>
            <p className="text-muted-foreground text-sm">
              @foundry
            </p>
          </div>

          {/* SuiNS Logo and Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-[#00E0FF] to-[#C04BFF] p-1.5 rounded">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 6V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V6L12 2Z" fill="white" opacity="0.9"/>
                </svg>
              </div>
              <span className="text-foreground text-sm">NS</span>
            </div>
            <p className="text-muted-foreground text-sm">
              {nft.issueDate}
            </p>
          </div>

          {/* Type Badge */}
          <div className="mt-3 flex items-center justify-between">
            <Badge 
              className={`
                ${nft.type === 'role' 
                  ? 'bg-[#C04BFF]/20 text-[#C04BFF] border-[#C04BFF]/30'
                  : 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30'
                }
              `}
            >
              {nft.type === 'role' ? 'Role' : 'Contribution'}
            </Badge>
            
            {isClickable && (
              <div className="flex items-center gap-1 text-[#00E0FF]/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs">Rotate</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>

        {/* Shimmer Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.05)] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>
    </div>
  );
}

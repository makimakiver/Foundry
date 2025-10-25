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
  UserPlus, 
  Mail, 
  Wallet, 
  Shield, 
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onMemberAdded: (member: TeamMember) => void;
}

export interface TeamMember {
  address: string;
  email: string;
  role: string;
  permissions: string[];
  addedDate: string;
}

const roles = [
  { value: "admin", label: "Admin", description: "Full project access and control" },
  { value: "developer", label: "Developer", description: "Code and technical access" },
  { value: "designer", label: "Designer", description: "Design and creative access" },
  { value: "marketer", label: "Marketer", description: "Marketing and community access" },
  { value: "advisor", label: "Advisor", description: "Advisory and consulting role" },
];

const permissionsByRole = {
  admin: ["Manage team", "Edit project", "Manage funds", "View analytics", "Post jobs"],
  developer: ["Edit code", "Deploy contracts", "View analytics", "Post jobs"],
  designer: ["Edit design", "Upload assets", "View analytics"],
  marketer: ["Manage socials", "Post updates", "View analytics", "Post jobs"],
  advisor: ["View analytics", "Comment on decisions"],
};

export function AddMemberDialog({
  open,
  onOpenChange,
  projectName,
  onMemberAdded,
}: AddMemberDialogProps) {
  const [walletAddress, setWalletAddress] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const validateWalletAddress = (address: string) => {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddMember = () => {
    // Validation
    if (!walletAddress || !validateWalletAddress(walletAddress)) {
      toast.error("Please enter a valid wallet address");
      return;
    }

    if (!email || !validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setIsValidating(true);
    toast.loading("Adding team member...");

    // Simulate blockchain transaction
    setTimeout(() => {
      const newMember: TeamMember = {
        address: walletAddress,
        email: email,
        role: selectedRole,
        permissions: permissionsByRole[selectedRole as keyof typeof permissionsByRole] || [],
        addedDate: new Date().toISOString(),
      };

      onMemberAdded(newMember);
      toast.dismiss();
      toast.success(`Team member added successfully!`);
      
      // Reset form
      setWalletAddress("");
      setEmail("");
      setSelectedRole("");
      setIsValidating(false);
      onOpenChange(false);
    }, 2000);
  };

  const selectedRoleData = roles.find(r => r.value === selectedRole);
  const permissions = selectedRole ? permissionsByRole[selectedRole as keyof typeof permissionsByRole] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1E1F24] border-[#E8E9EB]/10 text-[#E8E9EB] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#E8E9EB] flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-[#00E0FF]" />
            Add Team Member
          </DialogTitle>
          <DialogDescription className="text-[#A0A2A8]">
            Add a new member to <span className="text-[#00E0FF]">{projectName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Info Card */}
          <Card className="p-4 bg-[#00E0FF]/10 border-[#00E0FF]/30">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#00E0FF] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[#00E0FF] mb-1">Secure Team Management</p>
                <p className="text-[#A0A2A8] text-sm">
                  Members are added via smart contract. They'll receive an invitation to confirm their role.
                </p>
              </div>
            </div>
          </Card>

          {/* Wallet Address */}
          <div>
            <Label htmlFor="wallet" className="text-[#E8E9EB] mb-2 block">
              Wallet Address *
            </Label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A2A8]" />
              <Input
                id="wallet"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="pl-10 bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8]"
              />
            </div>
            {walletAddress && !validateWalletAddress(walletAddress) && (
              <div className="flex items-center gap-2 mt-2 text-sm text-[#FF6B00]">
                <AlertCircle className="w-4 h-4" />
                <span>Invalid wallet address format</span>
              </div>
            )}
            {walletAddress && validateWalletAddress(walletAddress) && (
              <div className="flex items-center gap-2 mt-2 text-sm text-[#00FFA3]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Valid wallet address</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-[#E8E9EB] mb-2 block">
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A2A8]" />
              <Input
                id="email"
                type="email"
                placeholder="member@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8]"
              />
            </div>
            <p className="text-sm text-[#A0A2A8] mt-2">
              They'll receive an invitation email to join the project
            </p>
          </div>

          {/* Role Selection */}
          <div>
            <Label htmlFor="role" className="text-[#E8E9EB] mb-2 block">
              Team Role *
            </Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-[#1E1F24] border-[#E8E9EB]/20">
                {roles.map((role) => (
                  <SelectItem 
                    key={role.value} 
                    value={role.value}
                    className="text-[#E8E9EB] focus:bg-[#00E0FF]/10 focus:text-[#00E0FF]"
                  >
                    <div className="flex flex-col">
                      <span>{role.label}</span>
                      <span className="text-xs text-[#A0A2A8]">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permissions Preview */}
          {selectedRole && (
            <Card className="p-4 bg-[#0D0E10]/50 border-[#E8E9EB]/10">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[#E8E9EB]">
                  {selectedRoleData?.label} Permissions
                </h4>
                <Badge className="bg-[#C04BFF]/20 text-[#C04BFF] border-[#C04BFF]/30">
                  {permissions.length} permissions
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {permissions.map((permission, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-[#A0A2A8]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#00FFA3] flex-shrink-0" />
                    <span>{permission}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#0D0E10]"
              disabled={isValidating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={isValidating || !walletAddress || !email || !selectedRole}
              className="flex-1 bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10] disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

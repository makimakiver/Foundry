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
  X
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface AddJobRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onJobAdded: (job: JobRequest) => void;
}

export interface JobRequest {
  id: number;
  title: string;
  category: string;
  budget: number;
  deadline: string;
  description: string;
  requiredSkills: string[];
  applicants: number;
  status: "Open" | "Hiring" | "In Progress" | "Completed" | "Closed";
  postedDate: string;
  hiredMembers?: string[]; // Array of applicant IDs
}

const categories = [
  { value: "Development", label: "Development", icon: Code, color: "#00E0FF" },
  { value: "Design", label: "Design", icon: Palette, color: "#C04BFF" },
  { value: "Content", label: "Content", icon: FileText, color: "#00FFA3" },
  { value: "Marketing", label: "Marketing", icon: Megaphone, color: "#FF6B00" },
];

const suggestedSkills: { [key: string]: string[] } = {
  Development: ["Solidity", "React", "Node.js", "TypeScript", "Web3.js", "Smart Contracts", "Testing"],
  Design: ["Figma", "UI/UX", "Branding", "Motion Design", "Illustration", "Prototyping"],
  Content: ["Technical Writing", "Copywriting", "SEO", "Content Strategy", "Editing"],
  Marketing: ["Social Media", "Community Management", "Growth Hacking", "Analytics", "PR"],
};

const budgetPresets = [500, 1000, 2500, 5000, 10000, 25000];

export function AddJobRequestDialog({
  open,
  onOpenChange,
  projectName,
  onJobAdded,
}: AddJobRequestDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSkill = (skill: string) => {
    if (skill && !requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = () => {
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

    if (requiredSkills.length === 0) {
      toast.error("Please add at least one required skill");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Posting job request...");

    // Simulate posting to blockchain
    setTimeout(() => {
      const newJob: JobRequest = {
        id: Date.now(),
        title: title.trim(),
        category,
        budget: parseFloat(budget),
        deadline,
        description: description.trim(),
        requiredSkills,
        applicants: 0,
        status: "Open",
        postedDate: new Date().toISOString(),
      };

      onJobAdded(newJob);
      toast.dismiss();
      toast.success("Job request posted successfully!");
      
      // Reset form
      setTitle("");
      setCategory("");
      setBudget("");
      setDeadline("");
      setDescription("");
      setRequiredSkills([]);
      setNewSkill("");
      setIsSubmitting(false);
      onOpenChange(false);
    }, 2000);
  };

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
          {/* Info Card */}
          <Card className="p-4 bg-[#00E0FF]/10 border-[#00E0FF]/30">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-[#00E0FF] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[#00E0FF] mb-1">Find the Right Talent</p>
                <p className="text-[#A0A2A8] text-sm">
                  Post detailed job requests to attract qualified applicants from the Foundry³ community.
                </p>
              </div>
            </div>
          </Card>

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
              {/* Budget Presets */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {budgetPresets.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setBudget(preset.toString())}
                    className="text-xs border-[#E8E9EB]/20 text-[#A0A2A8] hover:bg-[#0D0E10] hover:text-[#00E0FF] hover:border-[#00E0FF]/30"
                  >
                    ${preset.toLocaleString()}
                  </Button>
                ))}
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

          {/* Required Skills */}
          <div>
            <Label className="text-[#E8E9EB] mb-2 block">
              Required Skills *
            </Label>
            
            {/* Suggested Skills for Category */}
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
            )}

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
                <div className="flex gap-2 flex-wrap">
                  {requiredSkills.map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-[#C04BFF]/20 text-[#C04BFF] border-[#C04BFF]/30 pr-1"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 hover:bg-[#C04BFF]/30 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
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
              className="flex-1 border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#0D0E10]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !title || !category || !budget || !deadline || !description || requiredSkills.length === 0}
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

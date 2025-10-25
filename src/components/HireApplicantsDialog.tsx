import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { 
  CheckCircle2, 
  UserCheck,
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  AlertCircle,
  Play
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Application {
  id: string;
  applicantName: string;
  email: string;
  status: "pending" | "accepted" | "rejected";
  appliedDate: string;
  hourlyRate?: string;
  availability?: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  status: "Open" | "Hiring" | "In Progress" | "Completed" | "Closed";
  requiredSkills: string[];
  postedDate: string;
}

interface HireApplicantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  applications: Application[];
  onHire: (jobId: string, selectedApplicantIds: string[], newStatus: "Hiring" | "In Progress") => void;
}

export function HireApplicantsDialog({
  open,
  onOpenChange,
  job,
  applications,
  onHire,
}: HireApplicantsDialogProps) {
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const acceptedApplications = applications.filter(app => app.status === "accepted");

  const toggleApplicant = (applicantId: string) => {
    setSelectedApplicants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(applicantId)) {
        newSet.delete(applicantId);
      } else {
        newSet.add(applicantId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (targetStatus: "Hiring" | "In Progress") => {
    if (!job) return;

    if (selectedApplicants.size === 0) {
      toast.error("Please select at least one applicant to hire");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onHire(job.id, Array.from(selectedApplicants), targetStatus);

      toast.success(
        targetStatus === "Hiring"
          ? `${selectedApplicants.size} applicant(s) marked for hiring`
          : `Job started with ${selectedApplicants.size} hired member(s)`
      );

      // Reset form
      setSelectedApplicants(new Set());
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to hire applicants. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedApplicants(new Set());
    onOpenChange(false);
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1E1F24] border-[#E8E9EB]/10">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#E8E9EB] flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#00E0FF]" />
            Hire Applicants
          </DialogTitle>
          <DialogDescription className="text-[#A0A2A8]">
            Select applicants to hire for this job
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Job Details Summary */}
          <div className="p-4 bg-[#0D0E10]/50 border border-[#E8E9EB]/10 rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg text-[#E8E9EB] mb-2">{job.title}</h4>
                <p className="text-sm text-[#A0A2A8] line-clamp-2">{job.description}</p>
              </div>
              <Badge className="bg-[#00E0FF]/10 text-[#00E0FF] border-[#00E0FF]/30">
                {job.category}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#E8E9EB]/5">
              <div>
                <div className="flex items-center gap-1 text-xs text-[#A0A2A8] mb-1">
                  <DollarSign className="w-3 h-3" />
                  Budget
                </div>
                <div className="text-[#00E0FF]">${job.budget.toLocaleString()}</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs text-[#A0A2A8] mb-1">
                  <Calendar className="w-3 h-3" />
                  Deadline
                </div>
                <div className="text-sm text-[#E8E9EB]">
                  {new Date(job.deadline).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs text-[#A0A2A8] mb-1">
                  <Users className="w-3 h-3" />
                  Accepted
                </div>
                <div className="text-sm text-[#E8E9EB]">
                  {acceptedApplications.length} applicants
                </div>
              </div>
            </div>
          </div>

          {/* Selection Info */}
          <div className="flex items-center justify-between p-3 bg-[#00E0FF]/5 border border-[#00E0FF]/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00E0FF]" />
              <span className="text-sm text-[#E8E9EB]">
                {selectedApplicants.size} of {acceptedApplications.length} selected
              </span>
            </div>
            {selectedApplicants.size > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedApplicants(new Set())}
                className="text-[#A0A2A8] hover:text-[#E8E9EB] h-auto p-0"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Accepted Applicants List */}
          {acceptedApplications.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-[#E8E9EB] flex items-center gap-2">
                <Users className="w-4 h-4" />
                Accepted Applicants
              </h4>
              <div className="space-y-2">
                {acceptedApplications.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => toggleApplicant(app.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedApplicants.has(app.id)
                        ? "border-[#00E0FF] bg-[#00E0FF]/10"
                        : "border-[#E8E9EB]/10 bg-[#0D0E10]/30 hover:border-[#E8E9EB]/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedApplicants.has(app.id)}
                        className="mt-1"
                      />
                      <Avatar className="w-10 h-10 border-2 border-[#00E0FF]/30">
                        <AvatarFallback className="bg-gradient-to-br from-[#00E0FF] to-[#C04BFF] text-[#0D0E10]">
                          {app.applicantName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-[#E8E9EB] mb-1">{app.applicantName}</div>
                        <div className="text-xs text-[#A0A2A8] mb-2">{app.email}</div>
                        {(app.hourlyRate || app.availability) && (
                          <div className="flex gap-3 text-xs">
                            {app.hourlyRate && (
                              <span className="text-[#00E0FF]">
                                ${app.hourlyRate}/hr
                              </span>
                            )}
                            {app.availability && (
                              <span className="text-[#A0A2A8]">
                                {app.availability}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 bg-[#0D0E10]/30 border border-[#E8E9EB]/10 rounded-lg text-center">
              <AlertCircle className="w-12 h-12 text-[#A0A2A8] mx-auto mb-3" />
              <p className="text-[#A0A2A8]">
                No accepted applicants yet. Accept some applications first.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#0D0E10] w-full sm:w-auto"
          >
            Cancel
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => handleSubmit("Hiring")}
              disabled={isSubmitting || selectedApplicants.size === 0}
              className="flex-1 sm:flex-initial bg-[#FF6B00]/80 hover:bg-[#FF6B00] text-white"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Mark as Hiring
                </>
              )}
            </Button>
            <Button
              onClick={() => handleSubmit("In Progress")}
              disabled={isSubmitting || selectedApplicants.size === 0}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-[#00FFA3] to-[#00E0FF] hover:opacity-90 text-[#0D0E10]"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Job
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

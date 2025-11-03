import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  CheckCircle2, 
  X, 
  Briefcase, 
  Calendar,
  DollarSign,
  Users,
  FileCheck,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

interface Application {
  id: string;
  applicantName: string;
  email: string;
  status: "pending" | "accepted" | "rejected";
  appliedDate: string;
  walletAddress?: string; // Wallet address of the applicant
}

interface Job {
  id: number | string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  status: "Open" | "Hiring" | "In Progress" | "Completed" | "Closed";
  requiredSkills: string[];
  postedDate: string;
  blockchainJobId?: string; // Blockchain job object ID
  projectId?: string; // Blockchain project object ID
}

interface CompleteJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  job: Job | null;
  applications: Application[];
  onComplete: (jobId: string, completionData: {
    selectedApplicantId?: string;
    completionNotes: string;
    finalStatus: "Completed" | "Closed";
  }) => void;
}

export function CompleteJobDialog({
  open,
  onOpenChange,
  job,
  applications,
  projectId,
  onComplete,
}: CompleteJobDialogProps) {
  const client = useSuiClient();
  const vendor = import.meta.env.VITE_PACKAGE_ID;
  const registry = import.meta.env.VITE_REGISTRY_ID;
  console.log('Project ID:', projectId);
  const account_ns_reg = import.meta.env.VITE_ACCOUNT_NS_REGISTRY_ID;
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | undefined>(undefined);
  const [completionNotes, setCompletionNotes] = useState("");
  const [finalStatus, setFinalStatus] = useState<"Completed" | "Closed">("Completed");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const acceptedApplications = applications.filter(app => app.status === "accepted");

  const handleComplete = async () => {
    if (!job) return;

    if (finalStatus === "Completed" && acceptedApplications.length > 0 && !selectedApplicantId) {
      toast.error("Please select who completed the job");
      return;
    }

    if (!projectId) {
      toast.error("Project ID is missing");
      return;
    }

    // Get blockchain job ID
    const blockchainJobId = job.blockchainJobId || job.id.toString();
    
    if (!blockchainJobId) {
      toast.error("Job blockchain ID is missing");
      return;
    }

    console.log('Completing job:', {
      projectId,
      blockchainJobId,
      jobId: job.id,
      selectedApplicantId,
      finalStatus
    });

    setIsSubmitting(true);

    try {
      // Build transaction
      const tx = new Transaction();
      
      // Find the applicant's wallet address from selectedApplicantId
      let applicantAddress: string | undefined;
      if (selectedApplicantId) {
        const selectedApp = applications.find(app => app.id === selectedApplicantId);
        if (selectedApp?.walletAddress) {
          applicantAddress = selectedApp.walletAddress;
        } else if (selectedApplicantId.startsWith('0x')) {
          // If the ID itself is a wallet address
          applicantAddress = selectedApplicantId;
        } else {
          console.warn('Could not find wallet address for applicant:', selectedApplicantId);
        }
      }

      if (finalStatus === "Completed" && selectedApplicantId && applicantAddress) {
        // Complete job with selected applicant
        tx.moveCall({
          target: `${vendor}::ideation::complete_job`,
          arguments: [
            tx.object(registry),
            tx.object(projectId),
            tx.object(blockchainJobId)
          ],
        });
      }

      toast.loading('Submitting job completion to blockchain...');
      const result = await signAndExecuteTransaction({ transaction: tx });
      console.log('Job completion transaction successful:', result);

      // Call the callback to update local state
      onComplete(blockchainJobId, {
        selectedApplicantId,
        completionNotes: completionNotes.trim(),
        finalStatus,
      }); 

      toast.dismiss();
      toast.success(
        finalStatus === "Completed" 
          ? "Job marked as completed successfully! 🎉" 
          : "Job closed successfully! ✅"
      );

      // Reset form
      setSelectedApplicantId(undefined);
      setCompletionNotes("");
      setFinalStatus("Completed");
      onOpenChange(false);
    } catch (error) {
      console.error('Error completing job:', error);
      toast.dismiss();
      toast.error("Failed to complete job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1E1F24] border-[#E8E9EB]/10">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#E8E9EB] flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-[#00E0FF]" />
            Complete Job Request
          </DialogTitle>
          <DialogDescription className="text-[#A0A2A8]">
            Finalize this job request and update its status
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
                  Applicants
                </div>
                <div className="text-sm text-[#E8E9EB]">
                  {applications.length} total
                </div>
              </div>
            </div>
          </div>

          {/* Completion Status Selection */}
          <div className="space-y-3">
            <Label className="text-[#E8E9EB]">Job Outcome</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFinalStatus("Completed")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  finalStatus === "Completed"
                    ? "border-[#00E0FF] bg-[#00E0FF]/10"
                    : "border-[#E8E9EB]/10 bg-[#0D0E10]/30 hover:border-[#E8E9EB]/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className={`w-5 h-5 ${finalStatus === "Completed" ? "text-[#00E0FF]" : "text-[#A0A2A8]"}`} />
                  <span className={`font-medium ${finalStatus === "Completed" ? "text-[#00E0FF]" : "text-[#E8E9EB]"}`}>
                    Completed
                  </span>
                </div>
                <p className="text-xs text-[#A0A2A8]">
                  Job was successfully finished
                </p>
              </button>

              <button
                onClick={() => setFinalStatus("Closed")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  finalStatus === "Closed"
                    ? "border-[#FF6B00] bg-[#FF6B00]/10"
                    : "border-[#E8E9EB]/10 bg-[#0D0E10]/30 hover:border-[#E8E9EB]/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <X className={`w-5 h-5 ${finalStatus === "Closed" ? "text-[#FF6B00]" : "text-[#A0A2A8]"}`} />
                  <span className={`font-medium ${finalStatus === "Closed" ? "text-[#FF6B00]" : "text-[#E8E9EB]"}`}>
                    Closed
                  </span>
                </div>
                <p className="text-xs text-[#A0A2A8]">
                  Job cancelled or no longer needed
                </p>
              </button>
            </div>
          </div>

          {/* Select Completed By (only if status is Completed and there are accepted applications) */}
          {finalStatus === "Completed" && acceptedApplications.length > 0 && (
            <div className="space-y-3">
              <Label className="text-[#E8E9EB] flex items-center gap-2">
                Who completed this job?
                <span className="text-[#FF6B00]">*</span>
              </Label>
              <div className="space-y-2">
                {acceptedApplications.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApplicantId(app.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedApplicantId === app.id
                        ? "border-[#00E0FF] bg-[#00E0FF]/10"
                        : "border-[#E8E9EB]/10 bg-[#0D0E10]/30 hover:border-[#E8E9EB]/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-[#00E0FF]/30">
                        <AvatarFallback className="bg-gradient-to-br from-[#00E0FF] to-[#C04BFF] text-[#0D0E10]">
                          {app.applicantName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-[#E8E9EB] mb-1">{app.applicantName}</div>
                        <div className="text-xs text-[#A0A2A8]">{app.email}</div>
                      </div>
                      {selectedApplicantId === app.id && (
                        <CheckCircle2 className="w-5 h-5 text-[#00E0FF]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Accepted Applications Warning */}
          {finalStatus === "Completed" && acceptedApplications.length === 0 && (
            <div className="p-4 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#FF6B00] mb-1">No Accepted Applicants</p>
                  <p className="text-sm text-[#A0A2A8]">
                    This job will be marked as completed without assigning it to a specific person.
                    {applications.length > 0 && " Consider accepting an applicant before completing the job."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Completion Notes */}
          <div className="space-y-3">
            <Label className="text-[#E8E9EB]">
              Completion Notes {finalStatus === "Completed" ? "(Optional)" : "(Optional)"}
            </Label>
            <Textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder={
                finalStatus === "Completed"
                  ? "Add any final notes about the completed work..."
                  : "Add a reason for closing this job..."
              }
              className="min-h-[120px] bg-[#0D0E10] border-[#E8E9EB]/10 text-[#E8E9EB] placeholder:text-[#A0A2A8]/50 focus:border-[#00E0FF]/30"
            />
            <p className="text-xs text-[#A0A2A8]">
              {completionNotes.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#0D0E10]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isSubmitting || (finalStatus === "Completed" && acceptedApplications.length > 0 && !selectedApplicantId)}
            className={`${
              finalStatus === "Completed"
                ? "bg-gradient-to-r from-[#00FFA3] to-[#00E0FF]"
                : "bg-gradient-to-r from-[#FF6B00] to-[#C04BFF]"
            } hover:opacity-90 text-[#0D0E10]`}
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                {finalStatus === "Completed" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Close Job
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

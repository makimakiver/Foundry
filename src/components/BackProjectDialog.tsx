import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { DollarSign, Wallet } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { getFullnodeUrl } from "@mysten/sui/client";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

interface BackProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  isWalletConnected: boolean;
  projectId: string;
}

export function BackProjectDialog({ open, onOpenChange, projectName, isWalletConnected, projectId }: BackProjectDialogProps) {
  const [amount, setAmount] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const client = new SuiJsonRpcClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet',
  });
  const vendor = import.meta.env.VITE_VENDOR;
  const registry = import.meta.env.VITE_REGISTRY;
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const handleSubmit = async () => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    const value = parseFloat(amount);
    if (!value || value <= 0) {
      toast.error("Please enter a valid investment amount");
      return;
    }

    // Simulate transaction processing
    setProcessing(true);
    toast.loading("Processing your investment...");
    const result = await submitTransaction(value);
    console.log(result);
    toast.dismiss();
    toast.success(`Successfully backed ${projectName} with $${value.toLocaleString()}!`);
    console.log('Investment submitted', { projectId, projectName, amount: value });
    onOpenChange(false);
    // Reset form
    setAmount("");
    setProcessing(false);
  };
  
  async function submitTransaction(value: number) {
    const vendor = import.meta.env.VITE_PACKAGE_ID;
    const registry = import.meta.env.VITE_REGISTRY_ID;
    console.log(value);
    console.log('Submitting transaction', { vendor, registry, projectId, value });
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [value]);
    tx.moveCall({
      target: `${vendor}::ideation::support_idea`,
      arguments: [
        tx.object(registry),
        tx.object(projectId),
        coin,
        tx.pure.u64(value),
      ]
    });
    const result = await signAndExecuteTransaction({ transaction: tx });
    return result;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1E1F24] border-[#E8E9EB]/10 text-[#E8E9EB] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#E8E9EB]">
            Back This Project
          </DialogTitle>
          <DialogDescription className="text-[#A0A2A8]">
            Support {projectName} and become part of the journey
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Wallet Connection Warning */}
          {!isWalletConnected ? (
            <Card className="p-6 bg-[#FF6B00]/10 border-[#FF6B00]/30">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-[#FF6B00]" />
                <div className="flex-1">
                  <p className="text-[#FF6B00] mb-1">Wallet not connected</p>
                  <p className="text-[#A0A2A8] text-sm">
                    Please connect your wallet to proceed with backing this project
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                <Label htmlFor="amount" className="text-[#E8E9EB]">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <DollarSign className="w-5 h-5 text-[#A0A2A8]" />
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 h-12 text-lg bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8] focus:border-[#00E0FF]"
                    min="100"
                  />
                  <p className="text-[#A0A2A8] text-xs mt-2">Enter a USD amount. Minimum $100.</p>
                </div>
                {/* Quick amounts for clarity */}
                <div className="flex gap-2">
                  {[100, 250, 500, 1000].map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant="outline"
                      onClick={() => setAmount(String(amt))}
                      className={`border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#00E0FF]/10 hover:border-[#00E0FF] ${parseFloat(amount || "0") === amt ? "bg-[#00E0FF]/10 border-[#00E0FF]" : ""}`}
                    >
                      ${amt.toLocaleString()}
                    </Button>
                  ))}
                </div>
                {/* Simple summary */}
                {amount && parseFloat(amount) > 0 && (
                  <Card className="p-4 bg-[#0D0E10]/50 border-[#E8E9EB]/10">
                    {(() => {
                      const value = parseFloat(amount) || 0;
                      const fee = value * 0.02;
                      const total = value + fee;
                      return (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[#A0A2A8]">Amount</span>
                            <span className="text-[#E8E9EB]">${value.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#A0A2A8]">Platform Fee (2%)</span>
                            <span className="text-[#E8E9EB]">${fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="pt-2 border-t border-[#E8E9EB]/10">
                            <div className="flex items-center justify-between">
                              <span className="text-[#E8E9EB]">Total</span>
                              <span className="text-[#00E0FF] font-medium">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </Card>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#0D0E10]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={processing || !amount }
                  className="flex-1 bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10] disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {processing ? 'Processing…' : 'Invest'}
                </Button>
              </div>
              <p className="text-[#A0A2A8] text-xs text-center">
                Investments carry risk. Only invest what you can afford to lose.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Slider } from "./ui/slider";
import { Card } from "./ui/card";
import { CheckCircle2, DollarSign, Wallet, TrendingUp, Globe, Lock } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface FundingTier {
  name: string;
  amount: number;
  backers: number;
  perks: string[];
}

interface BackProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  fundingTiers?: FundingTier[];
  isWalletConnected: boolean;
}

export function BackProjectDialog({
  open,
  onOpenChange,
  projectName,
  fundingTiers = [],
  isWalletConnected,
}: BackProjectDialogProps) {
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [customAmount, setCustomAmount] = useState("");
  const [sliderValue, setSliderValue] = useState([1000]);
  const [investmentType, setInvestmentType] = useState<"tier" | "custom">("custom");
  const [visibility, setVisibility] = useState<"public" | "private">("private");

  const handleSubmit = () => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    const amount = investmentType === "tier" 
      ? fundingTiers.find(t => t.name === selectedTier)?.amount || 0
      : parseFloat(customAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid investment amount");
      return;
    }

    if (investmentType === "custom" && amount < 100) {
      toast.error("Minimum investment amount is $100");
      return;
    }

    if (investmentType === "custom" && amount > 100000) {
      toast.error("Maximum investment amount is $100,000");
      return;
    }

    // Simulate transaction processing
    toast.loading("Processing your investment...");
    
    setTimeout(() => {
      toast.dismiss();
      toast.success(
        `Successfully backed ${projectName} with $${amount.toLocaleString()}! (${visibility === "public" ? "Public" : "Private"})`
      );
      onOpenChange(false);
      
      // Reset form
      setSelectedTier("");
      setCustomAmount("");
      setSliderValue([1000]);
      setInvestmentType("custom");
      setVisibility("private");
    }, 2000);
  };

  const getSelectedAmount = () => {
    if (investmentType === "tier" && selectedTier) {
      return fundingTiers.find(t => t.name === selectedTier)?.amount || 0;
    }
    return parseFloat(customAmount) || 0;
  };

  const selectedTierData = fundingTiers.find(t => t.name === selectedTier);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1E1F24] border-[#E8E9EB]/10 text-[#E8E9EB] max-w-2xl max-h-[90vh] overflow-y-auto">
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
              {/* Investment Type Selection */}
              <div className="space-y-4">
            <Label className="text-[#E8E9EB]">Choose Investment Method</Label>
            <RadioGroup
              value={investmentType}
              onValueChange={(value) => {
                setInvestmentType(value as "tier" | "custom");
                // Reset selections when switching
                if (value === "tier") {
                  setCustomAmount("");
                  setSliderValue([1000]);
                } else {
                  setSelectedTier("");
                }
              }}
              className="grid grid-cols-2 gap-3"
            >
              <div>
                <RadioGroupItem value="custom" id="custom" className="peer sr-only" />
                <Label
                  htmlFor="custom"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-[#E8E9EB]/10 bg-[#0D0E10] p-4 hover:border-[#00E0FF]/50 cursor-pointer peer-data-[state=checked]:border-[#00E0FF] peer-data-[state=checked]:bg-[#00E0FF]/5"
                >
                  <DollarSign className="w-6 h-6 text-[#00E0FF] mb-2" />
                  <span className="text-[#E8E9EB]">Custom Amount</span>
                  <span className="text-[#A0A2A8] text-xs mt-1">Set your own</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="tier" id="tier" className="peer sr-only" />
                <Label
                  htmlFor="tier"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-[#E8E9EB]/10 bg-[#0D0E10] p-4 hover:border-[#00E0FF]/50 cursor-pointer peer-data-[state=checked]:border-[#00E0FF] peer-data-[state=checked]:bg-[#00E0FF]/5"
                >
                  <TrendingUp className="w-6 h-6 text-[#C04BFF] mb-2" />
                  <span className="text-[#E8E9EB]">Support Tier</span>
                  <span className="text-[#A0A2A8] text-xs mt-1">Get perks</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Funding Tiers */}
          {investmentType === "tier" && (
            <div className="space-y-3">
              <Label className="text-[#E8E9EB]">Support Tiers</Label>
              <RadioGroup value={selectedTier} onValueChange={setSelectedTier}>
                <div className="space-y-3">
                  {fundingTiers.map((tier) => (
                    <div key={tier.name} className="relative">
                      <RadioGroupItem
                        value={tier.name}
                        id={tier.name}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={tier.name}
                        className="flex cursor-pointer"
                      >
                        <Card
                          className={`flex-1 p-4 border-2 transition-all cursor-pointer ${
                            selectedTier === tier.name
                              ? "border-[#00E0FF] bg-[#00E0FF]/5"
                              : "border-[#E8E9EB]/10 hover:border-[#E8E9EB]/20"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-[#E8E9EB] mb-1">{tier.name}</h4>
                              <p className="text-[#A0A2A8] text-sm">
                                {tier.backers} backers
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-[#00E0FF]" />
                              <span className="text-xl text-[#00E0FF]">
                                {tier.amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {tier.perks.map((perk, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 text-sm text-[#A0A2A8]"
                              >
                                <CheckCircle2 className="w-4 h-4 text-[#00FFA3] flex-shrink-0 mt-0.5" />
                                <span>{perk}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Custom Amount Input */}
          {investmentType === "custom" && (
            <div className="space-y-5">
              <div>
                <Label htmlFor="custom-amount" className="text-[#E8E9EB] mb-3 block">
                  Set Your Investment Amount
                </Label>
                <div className="relative mb-4">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A2A8]" />
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomAmount(value);
                      const numValue = parseFloat(value) || 0;
                      if (numValue >= 100 && numValue <= 100000) {
                        setSliderValue([numValue]);
                      }
                    }}
                    className="pl-10 h-12 text-xl bg-[#0D0E10] border-[#E8E9EB]/20 text-[#E8E9EB] placeholder:text-[#A0A2A8] focus:border-[#00E0FF]"
                    min="100"
                    step="50"
                  />
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A0A2A8]">Adjust with slider</span>
                  <span className="text-[#00E0FF]">
                    ${sliderValue[0].toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={sliderValue}
                  onValueChange={(value) => {
                    setSliderValue(value);
                    setCustomAmount(value[0].toString());
                  }}
                  min={100}
                  max={100000}
                  step={50}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-[#A0A2A8]">
                  <span>$100</span>
                  <span>$100,000</span>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <Label className="text-[#A0A2A8] text-sm mb-2 block">Quick amounts</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[500, 1000, 5000, 10000].map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCustomAmount(amount.toString());
                        setSliderValue([amount]);
                      }}
                      className={`border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#00E0FF]/10 hover:border-[#00E0FF] ${
                        parseFloat(customAmount) === amount
                          ? "bg-[#00E0FF]/10 border-[#00E0FF]"
                          : ""
                      }`}
                    >
                      ${(amount / 1000).toFixed(amount >= 1000 ? 0 : 1)}k
                    </Button>
                  ))}
                </div>
              </div>

              <p className="text-[#A0A2A8] text-sm">
                Minimum investment: $100 • Maximum: $100,000
              </p>
            </div>
          )}

          {/* Selected Tier Perks Preview */}
          {investmentType === "tier" && selectedTierData && (
            <Card className="p-4 bg-[#00E0FF]/5 border-[#00E0FF]/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-[#00E0FF] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-[#E8E9EB] mb-2">Your Benefits</h4>
                  <ul className="space-y-1">
                    {selectedTierData.perks.map((perk, index) => (
                      <li key={index} className="text-[#A0A2A8] text-sm flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00FFA3] flex-shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Investment Summary */}
          {((investmentType === "tier" && selectedTier) || 
            (investmentType === "custom" && customAmount)) && (
            <Card className="p-4 bg-[#0D0E10]/50 border-[#E8E9EB]/10">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A2A8]">Investment Amount</span>
                  <span className="text-[#E8E9EB]">
                    ${getSelectedAmount().toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A2A8]">Platform Fee (2%)</span>
                  <span className="text-[#E8E9EB]">
                    ${(getSelectedAmount() * 0.02).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E8E9EB]/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[#E8E9EB]">Total</span>
                    <span className="text-xl text-[#00E0FF]">
                      ${(getSelectedAmount() * 1.02).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Visibility Preference */}
          {((investmentType === "tier" && selectedTier) || 
            (investmentType === "custom" && customAmount)) && (
            <div className="space-y-3">
              <Label className="text-[#E8E9EB]">Investment History Visibility</Label>
              <p className="text-[#A0A2A8] text-xs">Choose if your investment appears on public pages.</p>
              <RadioGroup
                value={visibility}
                onValueChange={(v) => setVisibility(v as "public" | "private")}
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <RadioGroupItem value="public" id="visibility-public" className="peer sr-only" />
                  <Label
                    htmlFor="visibility-public"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-[#E8E9EB]/10 bg-[#0D0E10] p-4 hover:border-[#00E0FF]/50 cursor-pointer peer-data-[state=checked]:border-[#00E0FF] peer-data-[state=checked]:bg-[#00E0FF]/5"
                  >
                    <Globe className="w-5 h-5 text-[#00E0FF] mb-1" />
                    <span className="text-[#E8E9EB]">Public</span>
                    <span className="text-[#A0A2A8] text-xs mt-0.5">Visible to everyone</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="private" id="visibility-private" className="peer sr-only" />
                  <Label
                    htmlFor="visibility-private"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-[#E8E9EB]/10 bg-[#0D0E10] p-4 hover:border-[#00E0FF]/50 cursor-pointer peer-data-[state=checked]:border-[#00E0FF] peer-data-[state=checked]:bg-[#00E0FF]/5"
                  >
                    <Lock className="w-5 h-5 text-[#C04BFF] mb-1" />
                    <span className="text-[#E8E9EB]">Private</span>
                    <span className="text-[#A0A2A8] text-xs mt-0.5">Only you can see</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#0D0E10]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    (investmentType === "tier" && !selectedTier) ||
                    (investmentType === "custom" && (!customAmount || parseFloat(customAmount) < 100))
                  }
                  className="flex-1 bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-[#0D0E10] disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Confirm Investment
                </Button>
              </div>

              {/* Disclaimer */}
              <p className="text-[#A0A2A8] text-xs text-center">
                By backing this project, you agree to Foundry³'s terms and conditions. 
                All investments are subject to risk.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

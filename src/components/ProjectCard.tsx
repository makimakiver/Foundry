import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Users, Clock, TrendingUp, ExternalLink } from "lucide-react";

interface ProjectCardProps {
  id: string;
  name: string;
  suinsName?: string;
  description: string;
  category: string;
  image: string;
  fundingGoal: number;
  currentFunding: number;
  backers: number;
  daysLeft: number;
  status: "live" | "upcoming" | "funded";
  onViewProject?: () => void;
}

export function ProjectCard({
  name,
  suinsName,
  description,
  category,
  image,
  fundingGoal,
  currentFunding,
  backers,
  daysLeft,
  status,
  onViewProject,
}: ProjectCardProps) {
  const fundingPercentage = (currentFunding / fundingGoal) * 100;

  const statusConfig = {
    live: { color: "bg-[#00FFA3]", text: "Live Now" },
    upcoming: { color: "bg-[#00E0FF]", text: "Upcoming" },
    funded: { color: "bg-[#C04BFF]", text: "Funded" },
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  return (
    <Card className="bg-card/80 border-border backdrop-blur-sm overflow-hidden group hover:border-[#00E0FF]/30 transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`${statusConfig[status].color} text-white dark:text-[#0D0E10] border-0`}>
            {statusConfig[status].text}
          </Badge>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-card/80 text-foreground border-border backdrop-blur-sm">
            {category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-foreground mb-1">{name}</h3>
          {suinsName && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-[#00E0FF] bg-[#00E0FF]/10 px-2 py-1 rounded">
                {suinsName}
              </span>
            </div>
          )}
          <p className="text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        {/* Funding Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#00E0FF]">
              {formatCurrency(currentFunding)}
            </span>
            <span className="text-muted-foreground">
              of {formatCurrency(fundingGoal)}
            </span>
          </div>
          <Progress 
            value={fundingPercentage} 
            className="h-2 bg-muted"
          />
          <div className="text-muted-foreground">
            {fundingPercentage.toFixed(0)}% funded
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#C04BFF]" />
            <div>
              <div className="text-foreground">{backers}</div>
              <div className="text-muted-foreground text-xs">Backers</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF6B00]" />
            <div>
              <div className="text-foreground">{daysLeft}</div>
              <div className="text-muted-foreground text-xs">Days Left</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00FFA3]" />
            <div>
              <div className="text-foreground">{fundingPercentage.toFixed(0)}%</div>
              <div className="text-muted-foreground text-xs">Progress</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={onViewProject}
          className="w-full bg-gradient-to-r from-[#00E0FF] to-[#C04BFF] hover:opacity-90 text-white dark:text-[#0D0E10]"
        >
          View Project
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
}

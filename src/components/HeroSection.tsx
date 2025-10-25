import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onExploreProjects?: () => void;
}

export function HeroSection({ onExploreProjects }: HeroSectionProps) {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gradient background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00E0FF] rounded-full blur-[120px]"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#C04BFF] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-[#FF6B00] rounded-full blur-[120px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge className="mb-6 bg-[#00E0FF]/10 text-[#00E0FF] border-[#00E0FF]/20">
            <Zap className="w-3 h-3 mr-1" />
            Venture for the Internet Age
          </Badge>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl text-[#E8E9EB] mb-6 leading-tight">
            <span className="bg-gradient-to-r from-[#00E0FF] via-[#C04BFF] to-[#FF6B00] bg-clip-text text-transparent">
              Build. Back. Own.
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-[#E8E9EB] mb-4">
            A decentralised venture ecosystem that merges{" "}
            <span className="text-[#00E0FF]">AI-driven product creation</span> with{" "}
            <span className="text-[#C04BFF]">on-chain venture coordination</span>
          </p>
          
          <p className="text-lg text-[#A0A2A8] mb-10 max-w-2xl mx-auto">
            Venture capital shouldn't be a privilege — it should be a protocol.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-[#00E0FF] via-[#C04BFF] to-[#FF6B00] hover:opacity-90 text-[#0D0E10] text-lg px-8">
              Start Building
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#1E1F24] text-lg px-8"
              onClick={onExploreProjects}
            >
              Explore Projects
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl text-[#00E0FF] mb-2">$450B+</div>
              <div className="text-[#A0A2A8]">Global VC Market</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl text-[#FF6B00] mb-2">0.05%</div>
              <div className="text-[#A0A2A8]">Startups Funded</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <div className="text-4xl text-[#C04BFF] mb-2">400M+</div>
              <div className="text-[#A0A2A8]">Web3 Wallets</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

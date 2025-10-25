import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Sparkles, Globe, Zap, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function VisionSection() {
  const visionPoints = [
    {
      icon: Globe,
      text: "A global on-chain ecosystem where anyone can be a founder, backer, or builder",
      color: "#00E0FF",
    },
    {
      icon: Zap,
      text: "A transparent venture model where proof of work replaces pitch theatre",
      color: "#C04BFF",
    },
    {
      icon: Sparkles,
      text: "A funding infrastructure that values execution over connections",
      color: "#FF6B00",
    },
  ];

  return (
    <section id="vision" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00E0FF] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#C04BFF] rounded-full blur-[120px]"></div>
      </div>
      <div className="absolute inset-0 opacity-5">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1666816943035-15c29931e975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjEzMzU3MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Vision background"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-4xl sm:text-5xl text-[#E8E9EB] mb-6">Our Vision</h2>
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-2xl sm:text-3xl bg-gradient-to-r from-[#00E0FF] via-[#C04BFF] to-[#FF6B00] bg-clip-text text-transparent mb-6">
              "Build. Back. Own." — Venture for the Internet Age.
            </blockquote>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {visionPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 bg-[#1E1F24]/80 border-[#E8E9EB]/10 backdrop-blur-sm h-full hover:border-[#00E0FF]/30 transition-all">
                <point.icon className="w-10 h-10 mb-4" style={{ color: point.color }} />
                <p className="text-[#E8E9EB]">
                  {point.text}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <Card className="p-8 md:p-12 bg-gradient-to-br from-[#00E0FF]/5 via-[#C04BFF]/5 to-[#FF6B00]/5 border-[#E8E9EB]/10 backdrop-blur-sm text-center">
            <h3 className="text-2xl text-[#E8E9EB] mb-4">The Future: AI-Driven Foundry Network</h3>
            <p className="text-lg text-[#A0A2A8] max-w-3xl mx-auto mb-6">
              Over time, Foundry³ evolves into a self-governing system that births, funds, and scales real businesses autonomously. A protocol where innovation flows freely, meritocracy is encoded, and execution is rewarded.
            </p>
            <div className="inline-flex items-center gap-2 text-[#00E0FF]">
              <Sparkles className="w-5 h-5" />
              <span>Powered by AI, governed by the community</span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8 md:p-12 bg-[#1E1F24]/80 border-2 border-[#00E0FF]/30 backdrop-blur-sm">
            <div className="text-center">
              <h3 className="text-3xl text-[#E8E9EB] mb-4">Core Belief</h3>
              <blockquote className="text-2xl bg-gradient-to-r from-[#00E0FF] via-[#C04BFF] to-[#FF6B00] bg-clip-text text-transparent mb-8">
                "Venture capital shouldn't be a privilege — it should be a protocol."
              </blockquote>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-[#00E0FF] via-[#C04BFF] to-[#FF6B00] hover:opacity-90 text-[#0D0E10]">
                  Join the Revolution
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-[#E8E9EB]/20 text-[#E8E9EB] hover:bg-[#1E1F24]">
                  Read Whitepaper
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

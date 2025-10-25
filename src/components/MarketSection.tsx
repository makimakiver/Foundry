import { Card } from "./ui/card";
import { TrendingUp, Users, Target } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function MarketSection() {
  const marketData = [
    {
      icon: TrendingUp,
      title: "Addressable Market",
      value: "$450B+",
      subtitle: "Global VC Annually",
      description: "Only a few thousand startups access it; millions of projects exist without capital rails.",
      color: "#00E0FF",
    },
    {
      icon: Users,
      title: "Web3 Opportunity",
      value: "400M+",
      subtitle: "Web3 Wallets",
      description: "All potential micro-investors or contributors in the decentralized ecosystem.",
      color: "#C04BFF",
    },
    {
      icon: Target,
      title: "Initial Target",
      value: "Builder Communities",
      subtitle: "Hackathon Alumni & Dev Teams",
      description: "Unified space for small projects to secure pooled micro-funding and ship quickly.",
      color: "#FF6B00",
    },
  ];

  const comparisons = [
    { category: "DeFi", achievement: "Democratised yield" },
    { category: "DAO tooling", achievement: "Democratised governance" },
    { category: "Foundry³", achievement: "Democratises venture creation", highlight: true },
  ];

  return (
    <section id="market" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1E1F24]/30 relative">
      <div className="absolute inset-0 opacity-5">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1664526937033-fe2c11f1be25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZW50dXJlJTIwY2FwaXRhbCUyMG5ldHdvcmt8ZW58MXx8fHwxNzYxMzg2MTQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Market background"
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
            <span className="text-4xl">🌍</span>
          </div>
          <h2 className="text-4xl sm:text-5xl text-[#E8E9EB] mb-4">Market Opportunity</h2>
          <p className="text-xl text-[#A0A2A8] max-w-3xl mx-auto">
            A massive, underserved market waiting for democratized access to venture capital
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {marketData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`p-6 bg-[#1E1F24]/80 border-[#E8E9EB]/10 backdrop-blur-sm h-full hover:bg-[#1E1F24] transition-all`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4`} style={{ backgroundColor: `${item.color}20` }}>
                  <item.icon className={`w-6 h-6`} style={{ color: item.color }} />
                </div>
                <h3 className="text-[#E8E9EB] mb-2">{item.title}</h3>
                <div className="text-3xl mb-1" style={{ color: item.color }}>
                  {item.value}
                </div>
                <p className="text-[#A0A2A8] mb-3">
                  {item.subtitle}
                </p>
                <p className="text-[#A0A2A8]">
                  {item.description}
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
        >
          <Card className="p-8 bg-[#1E1F24]/80 border-[#E8E9EB]/10 backdrop-blur-sm">
            <h3 className="text-2xl text-[#E8E9EB] mb-6 text-center">Comparable Sectors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comparisons.map((comp, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl ${
                    comp.highlight
                      ? 'bg-gradient-to-br from-[#00E0FF]/10 via-[#C04BFF]/10 to-[#FF6B00]/10 border-2 border-[#00E0FF]/30'
                      : 'bg-[#0D0E10]/50'
                  }`}
                >
                  <div className={`mb-2 ${comp.highlight ? 'text-[#00E0FF]' : 'text-[#A0A2A8]'}`}>
                    {comp.category}
                  </div>
                  <div className="text-[#E8E9EB]">
                    {comp.achievement}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

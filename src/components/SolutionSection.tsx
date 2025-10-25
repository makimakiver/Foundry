import { Card } from "./ui/card";
import { Rocket, Vault, Coins, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export function SolutionSection() {
  const solutions = [
    {
      icon: Rocket,
      title: "Foundry³ Platform",
      subtitle: "The Builder Hub",
      features: [
        "Launchpad for proposals and projects",
        "AI build agents for rapid prototyping",
        "Collaborative tooling ecosystem",
        "Ideate, prototype, and launch MVPs rapidly",
      ],
      iconGradient: "from-[#00E0FF] to-[#C04BFF]",
      accentColor: "text-[#00E0FF]",
    },
    {
      icon: Vault,
      title: "Vault³",
      subtitle: "The Funding Layer",
      features: [
        "Smart-contract-governed treasury",
        "Pools community capital efficiently",
        "Automatic tranche releases on deliverables",
        "AI or peer-review verification system",
      ],
      iconGradient: "from-[#C04BFF] to-[#FF6B00]",
      accentColor: "text-[#C04BFF]",
    },
    {
      icon: Coins,
      title: "BUID Token",
      subtitle: "The Coordination Layer",
      features: [
        "Represents ownership and governance",
        "Rewards builders, backers, and validators",
        "Proportional to contribution input",
        "Powers the entire ecosystem",
      ],
      iconGradient: "from-[#FF6B00] to-[#00E0FF]",
      accentColor: "text-[#FF6B00]",
    },
  ];

  return (
    <section id="solution" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#00E0FF] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#C04BFF] rounded-full blur-[120px]"></div>
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
            <span className="text-4xl">⚙️</span>
          </div>
          <h2 className="text-4xl sm:text-5xl text-[#E8E9EB] mb-4">The Solution</h2>
          <p className="text-xl text-[#A0A2A8] max-w-3xl mx-auto">
            A decentralised venture ecosystem that merges AI-driven product creation with on-chain venture coordination
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`p-8 bg-[#1E1F24]/80 border-[#E8E9EB]/10 backdrop-blur-sm h-full hover:border-[#00E0FF]/30 transition-all`}>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${solution.iconGradient} flex items-center justify-center mb-6`}>
                  <solution.icon className="w-8 h-8 text-[#0D0E10]" />
                </div>
                <h3 className="text-[#E8E9EB] mb-1">{solution.title}</h3>
                <p className={`${solution.accentColor} mb-6`}>{solution.subtitle}</p>
                <ul className="space-y-3">
                  {solution.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 text-[#A0A2A8]">
                      <CheckCircle2 className="w-5 h-5 text-[#00FFA3] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Card className="p-8 bg-gradient-to-r from-[#00E0FF]/5 via-[#C04BFF]/5 to-[#FF6B00]/5 border-[#E8E9EB]/10 backdrop-blur-sm">
            <h3 className="text-2xl text-[#E8E9EB] mb-4">The Self-Sustaining Loop</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xl">
              <span className="text-[#00E0FF]">Capital</span>
              <span className="text-[#A0A2A8]">→</span>
              <span className="text-[#C04BFF]">Execution</span>
              <span className="text-[#A0A2A8]">→</span>
              <span className="text-[#FF6B00]">Proof</span>
              <span className="text-[#A0A2A8]">→</span>
              <span className="text-[#00FFA3]">Reward</span>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

import { Card } from "./ui/card";
import { Lock, Clock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export function ProblemSection() {
  const problems = [
    {
      icon: Lock,
      title: "Gatekept Venture Capital",
      stats: "0.05% of startups ever raise VC funding",
      description: "Access is driven by network, geography, and optics, not execution. Innovation outside Silicon Valley or major hubs is systematically underfunded.",
      iconColor: "text-[#FF3366]",
      borderColor: "border-[#FF3366]/20",
    },
    {
      icon: Clock,
      title: "High Friction, Low Transparency",
      stats: "Months wasted chasing capital",
      description: "Early builders spend months chasing capital instead of building. Investors face opaque deal flow and no real-time visibility on progress. Venture funding is manual, slow, and reputation-based.",
      iconColor: "text-[#FF6B00]",
      borderColor: "border-[#FF6B00]/20",
    },
    {
      icon: AlertCircle,
      title: "Execution Bottleneck",
      stats: "Projects die in post-funding limbo",
      description: "Even when funding arrives, execution stalls: lack of tools, talent coordination, and accountability. No integrated build layer connecting money to milestones.",
      iconColor: "text-[#FF3366]",
      borderColor: "border-[#FF3366]/20",
    },
  ];

  return (
    <section id="problem" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1E1F24]/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <span className="text-5xl">🔥</span>
          </div>
          <h2 className="text-4xl sm:text-5xl text-[#E8E9EB] mb-4">The Problem</h2>
          <p className="text-xl text-[#A0A2A8] max-w-3xl mx-auto">
            The current venture capital system is broken, gatekept, and inaccessible to most innovators
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`p-6 bg-[#1E1F24]/80 border ${problem.borderColor} backdrop-blur-sm h-full hover:bg-[#1E1F24] transition-all`}>
                <problem.icon className={`w-12 h-12 ${problem.iconColor} mb-4`} />
                <h3 className="text-[#E8E9EB] mb-2">{problem.title}</h3>
                <p className={`${problem.iconColor} mb-3`}>
                  {problem.stats}
                </p>
                <p className="text-[#A0A2A8]">
                  {problem.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

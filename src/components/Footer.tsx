import { useDisconnectWallet } from "@mysten/dapp-kit";
import { Rocket, Github, Twitter, MessageCircle } from "lucide-react";

export function Footer() {
  const links = {
    product: [
      { name: "Platform", href: "#solution" },
      { name: "Vault³", href: "#solution" },
      { name: "BUID Token", href: "#solution" },
      { name: "Whitepaper", href: "#" },
    ],
    company: [
      { name: "About", href: "#vision" },
      { name: "Market", href: "#market" },
      { name: "Careers", href: "#" },
      { name: "Blog", href: "#" },
    ],
    resources: [
      { name: "Documentation", href: "#" },
      { name: "Guides", href: "#" },
      { name: "Help Center", href: "#" },
      { name: "Community", href: "#" },
    ],
  };

  const social = [
    { 
      icon: Twitter, 
      href: "https://twitter.com/foundrysui", 
      label: "Twitter",
      username: "@foundrysui",
      color: "hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10"
    },
    { 
      icon: Github, 
      href: "https://github.com/makimakiver/Foundry", 
      label: "GitHub",
      username: "foundry3",
      color: "hover:text-[#C04BFF] hover:bg-[#C04BFF]/10"
    },
    { 
      icon: MessageCircle, 
      href: "https://t.me/+4MDbMciKMYsxNTBk", 
      label: "Telegram",
      username: "Join Server",
      color: "hover:text-[#5865F2] hover:bg-[#5865F2]/10"
    },
  ];
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-[#00E0FF] via-[#C04BFF] to-[#FF6B00] p-2 rounded-lg">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl text-foreground">Foundry³</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Building the future of decentralized venture capital. Where anyone can build, back, and own.
            </p>
            
            {/* Enhanced Social Links */}
            <div className="space-y-3">
              <h4 className="text-foreground text-sm mb-3">Follow Us</h4>
              <div className="flex flex-col gap-3">
                {social.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg bg-card border border-border ${item.color} transition-all group max-w-xs`}
                  >
                    <div className="p-2 rounded-lg bg-background">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-foreground text-sm">{item.label}</p>
                      <p className="text-muted-foreground text-xs">{item.username}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              {links.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground">
            © 2025 Foundry³. All rights reserved.
          </p>
          <div className="flex gap-6 text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

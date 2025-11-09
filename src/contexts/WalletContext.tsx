import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const connect = () => {
    // Simulate wallet connection - in production, this would use Web3 provider
    // Use a fixed address that matches one of the project team members for demo
    const mockAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
    
    setWalletAddress(mockAddress);
    setIsConnected(true);
    toast.success("Wallet connected successfully");
  };

  const disconnect = () => {
    setWalletAddress("");
    setIsConnected(false);
    toast.info("Wallet disconnected");
  };

  return (
    <WalletContext.Provider value={{ isConnected, walletAddress, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

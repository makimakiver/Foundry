import { Transaction } from "@mysten/sui/transactions";
import { SuinsClient, SuinsTransaction } from '@mysten/suins';
import { toast } from "sonner@2.0.3";

/**
 * Handles the primary Sui Name Service (SuiNS) registration for a project
 * 
 * @param projectName - The name of the project to register (will be used as the SuiNS name)
 * @param founderAddress - The Sui address of the project founder
 * @param suinsClient - The initialized SuinsClient instance
 * @param signAndExecuteTransaction - Function to sign and execute the transaction
 * @returns Promise<{ success: boolean; nftObjectId?: string; digest?: string; error?: string }>
 */
export async function handleSuiNameRegistration(
  projectName: string,
  founderAddress: string,
  suinsClient: SuinsClient,
  signAndExecuteTransaction: (params: {
    transaction: Transaction;
    chain?: string;
  }) => Promise<{ digest: string }>
): Promise<{ success: boolean; nftObjectId?: string; digest?: string; error?: string }> {
  try {
    // Validate inputs
    if (!projectName || projectName.trim().length === 0) {
      throw new Error("Project name is required for SuiNS registration");
    }

    if (!founderAddress) {
      throw new Error("Founder address is required for SuiNS registration");
    }

    // Sanitize project name for SuiNS (lowercase, no spaces)
    const sanitizedName = projectName.toLowerCase().replace(/\s+/g, '-');
    
    toast.loading(`Registering SuiNS name: ${sanitizedName}.sui...`);

    // Create a new transaction
    const tx = new Transaction();
    
    // Create SuinsTransaction wrapper
    const suinsTx = new SuinsTransaction(suinsClient, tx);
    
    // Get the coin configuration for SUI payments
    const coinConfig = suinsClient.config.coins.SUI;
    
    // Get the price info object (required for SUI/NS payments)
    const priceInfoObjectId = (await suinsClient.getPriceInfoObject(tx, coinConfig.feed))[0];
    
    // Get the price list to determine cost based on name length
    const priceList = await suinsClient.getPriceList();
    
    let priceMist = '';
    for (const [range, price] of priceList) {
      const [min, max] = range;
      if (sanitizedName.length >= min && sanitizedName.length <= max) {
        priceMist = price.toString();
        break;
      }
    }

    if (!priceMist) {
      throw new Error(`Unable to determine price for name length: ${sanitizedName.length}`);
    }

    // Split coins for payment
    const [paymentCoin] = tx.splitCoins(tx.gas, [priceMist]);
    
    // Register the name (1 year = 365 days)
    const nft = suinsTx.register({
      name: sanitizedName,
      years: 1,
      payment: paymentCoin,
      priceInfoObjectId,
    });

    // Transfer the NFT to the founder
    tx.transferObjects([nft], tx.pure.address(founderAddress));

    // Execute the transaction
    const result = await signAndExecuteTransaction({
      transaction: tx,
      chain: 'sui:testnet',
    });

    toast.dismiss();
    toast.success(`Successfully registered ${sanitizedName}.sui!`);

    return {
      success: true,
      digest: result.digest,
      nftObjectId: undefined, // Will be extracted from transaction result if needed
    };
  } catch (error) {
    toast.dismiss();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.error(`SuiNS registration failed: ${errorMessage}`);
    
    console.error('SuiNS registration error:', error);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Creates a subname under a parent SuiNS name
 * 
 * @param parentNftObjectId - The object ID of the parent SuiNS NFT
 * @param subname - The subname to create (e.g., "founder" for "founder.projectname.sui")
 * @param targetAddress - The address that the subname should point to
 * @param suinsClient - The initialized SuinsClient instance
 * @param signAndExecuteTransaction - Function to sign and execute the transaction
 * @param expirationTimestampMs - Optional expiration timestamp (must be <= parent expiration)
 * @returns Promise<{ success: boolean; digest?: string; error?: string }>
 */
export async function createSuiSubname(
  parentNftObjectId: string,
  subname: string,
  targetAddress: string,
  suinsClient: SuinsClient,
  signAndExecuteTransaction: (params: {
    transaction: Transaction;
    chain?: string;
  }) => Promise<{ digest: string }>,
  expirationTimestampMs?: number
): Promise<{ success: boolean; digest?: string; error?: string }> {
  try {
    if (!parentNftObjectId || !subname || !targetAddress) {
      throw new Error("Parent NFT, subname, and target address are required");
    }

    toast.loading(`Creating subname: ${subname}...`);

    const tx = new Transaction();
    const suinsTx = new SuinsTransaction(suinsClient, tx);

    // Create a leaf subname (points directly to an address)
    suinsTx.createLeafSubName({
      parentNft: tx.object(parentNftObjectId),
      name: subname,
      targetAddress: targetAddress,
    });

    const result = await signAndExecuteTransaction({
      transaction: tx,
      chain: 'sui:testnet',
    });

    toast.dismiss();
    toast.success(`Successfully created subname: ${subname}`);

    return {
      success: true,
      digest: result.digest,
    };
  } catch (error) {
    toast.dismiss();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.error(`Subname creation failed: ${errorMessage}`);
    
    console.error('Subname creation error:', error);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Formats a Sui amount from MIST to SUI
 * 
 * @param mist - Amount in MIST (smallest unit)
 * @returns Formatted string in SUI
 */
export function formatSui(mist: bigint): string {
  const MIST_PER_SUI = BigInt(1_000_000_000);
  const int = mist / MIST_PER_SUI;
  const frac = (mist % MIST_PER_SUI).toString().padStart(9, '0').replace(/0+$/, '');
  return frac ? `${int}.${frac}` : `${int}`;
}


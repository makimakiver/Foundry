import { Transaction } from "@mysten/sui/transactions";
import { SuinsClient, SuinsTransaction } from '@mysten/suins';
import { toast } from "sonner@2.0.3";

/**
 * Handles the primary Sui Name Service (SuiNS) registration for a project
 * 
 * This function explicitly validates all required parameters to prevent the
 * "TypeError: Invalid string value: undefined" error that can occur when
 * undefined values are passed to the Sui transaction builder.
 * 
 * @param projectName - The name of the project to register (will be used as the SuiNS name)
 * @param ownerAddress - The Sui address of the project founder/owner (REQUIRED)
 * @param suinsClient - The initialized SuinsClient instance
 * @param signAndExecuteTransaction - Function to sign and execute the transaction
 * @param client - Optional Sui client for querying transaction results
 * @returns Promise<{ success: boolean; nftObjectId?: string; digest?: string; error?: string }>
 */
export async function handleSuiNameRegistration(
  projectName: string,
  ownerAddress: string,
  suinsClient: SuinsClient,
  signAndExecuteTransaction: (params: {
    transaction: Transaction;
    chain?: string;
  }) => Promise<{ digest: string }>,
  client?: any // Optional Sui client for querying transaction results
): Promise<{ success: boolean; nftObjectId?: string; digest?: string; error?: string }> {
  try {
    // ========================================
    // CRITICAL VALIDATION: Prevent TypeError
    // ========================================
    // This validation prevents the "TypeError: Invalid string value: undefined" 
    // error that occurs when undefined values are passed to tx.pure.address()
    
    // Validate projectName
    if (!projectName || typeof projectName !== 'string' || projectName.trim().length === 0) {
      const error = "Project name is required and must be a non-empty string for SuiNS registration";
      console.error('❌ SuiNS Registration Error:', error);
      console.error('   Received projectName:', projectName, 'Type:', typeof projectName);
      toast.error(error);
      return {
        success: false,
        error,
      };
    }

    // Validate ownerAddress (CRITICAL - prevents TypeError)
    if (!ownerAddress || typeof ownerAddress !== 'string' || ownerAddress.trim().length === 0) {
      const error = "Owner address is required and must be a valid string for SuiNS registration. This prevents TypeError: Invalid string value: undefined.";
      console.error('❌ SuiNS Registration Error:', error);
      console.error('   Received ownerAddress:', ownerAddress, 'Type:', typeof ownerAddress);
      toast.error('Wallet address is required for SuiNS registration');
      return {
        success: false,
        error,
      };
    }

    // Additional validation: Check if address looks like a valid Sui address
    if (!ownerAddress.startsWith('0x') || ownerAddress.length < 10) {
      const error = `Invalid Sui address format: ${ownerAddress}. Address must start with '0x' and be properly formatted.`;
      console.error('❌ SuiNS Registration Error:', error);
      toast.error('Invalid wallet address format');
      return {
        success: false,
        error,
      };
    }

    // Validate suinsClient
    if (!suinsClient) {
      const error = "SuinsClient is required for SuiNS registration";
      console.error('❌ SuiNS Registration Error:', error);
      toast.error('SuiNS client not initialized');
      return {
        success: false,
        error,
      };
    }

    // Validate signAndExecuteTransaction function
    if (!signAndExecuteTransaction || typeof signAndExecuteTransaction !== 'function') {
      const error = "signAndExecuteTransaction function is required for SuiNS registration";
      console.error('❌ SuiNS Registration Error:', error);
      toast.error('Transaction signing function not available');
      return {
        success: false,
        error,
      };
    }

    console.log('✅ All validations passed for SuiNS registration');
    console.log('   Project Name:', projectName);
    console.log('   Owner Address:', ownerAddress);
    console.log('   SuinsClient:', suinsClient ? 'Initialized' : 'Missing');

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

    // Transfer the NFT to the owner (with explicit validation to prevent TypeError)
    console.log('Transferring SuiNS NFT to owner address:', ownerAddress);
    console.log('Owner address type check before transfer:', typeof ownerAddress);
    console.log('Owner address value check:', ownerAddress);
    
    // Final safety check before calling tx.pure.address()
    if (!ownerAddress || typeof ownerAddress !== 'string') {
      throw new Error(`CRITICAL: ownerAddress is invalid at transfer point. Value: ${ownerAddress}, Type: ${typeof ownerAddress}`);
    }
    
    tx.transferObjects([nft], tx.pure.address(ownerAddress));

    // Execute the transaction
    const result = await signAndExecuteTransaction({
      transaction: tx,
      chain: 'sui:testnet',
    });

    // Try to extract NFT object ID from transaction result if client is provided
    let nftObjectId: string | undefined;
    if (client && result.digest) {
      try {
        const txInfo = await client.getTransactionBlock({
          digest: result.digest,
          options: { showObjectChanges: true }
        });
        
        // Find the created SuiNS NFT object
        const nftChange = txInfo?.objectChanges?.find(
          (o: any) =>
            o.type === 'created' &&
            ((o.objectType ?? o.object_type) || '').toLowerCase().includes('::suins::')
        );
        
        if (nftChange) {
          nftObjectId = nftChange.objectId;
          console.log(`✅ SuiNS NFT Object ID: ${nftObjectId}`);
        }
      } catch (error) {
        console.warn('Could not extract NFT object ID from transaction:', error);
      }
    }

    toast.dismiss();
    toast.success(`Successfully registered ${sanitizedName}.sui!`);

    return {
      success: true,
      digest: result.digest,
      nftObjectId,
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
 * Registers SuiNS subnames for all team members
 * 
 * This function iterates through team members and creates subnames in the format:
 * {projectName}.{memberRole} (e.g., "foundry.cofounder")
 * 
 * Each subname is linked to the respective team member's Sui wallet address.
 * 
 * @param projectName - The sanitized project name (base domain)
 * @param teamMembers - Array of team members with role and address
 * @param parentNftObjectId - The object ID of the parent project SuiNS NFT
 * @param suinsClient - The initialized SuinsClient instance
 * @param signAndExecuteTransaction - Function to sign and execute transactions
 * @returns Promise with results for each team member registration
 */
export async function registerTeamSubnames(
  projectName: string,
  teamMembers: Array<{ role: string; address: string }>,
  parentNftObjectId: string,
  suinsClient: SuinsClient,
  signAndExecuteTransaction: (params: {
    transaction: Transaction;
    chain?: string;
  }) => Promise<{ digest: string }>
): Promise<{
  success: boolean;
  results: Array<{
    role: string;
    address: string;
    success: boolean;
    subname?: string;
    digest?: string;
    error?: string;
  }>;
  successCount: number;
  failureCount: number;
}> {
  const results: Array<{
    role: string;
    address: string;
    success: boolean;
    subname?: string;
    digest?: string;
    error?: string;
  }> = [];

  // Validate inputs
  if (!projectName || projectName.trim().length === 0) {
    toast.error("Project name is required for team subname registration");
    return {
      success: false,
      results: [],
      successCount: 0,
      failureCount: 0,
    };
  }

  if (!parentNftObjectId) {
    toast.error("Parent NFT object ID is required for team subname registration");
    return {
      success: false,
      results: [],
      successCount: 0,
      failureCount: 0,
    };
  }

  if (!teamMembers || teamMembers.length === 0) {
    console.log("No team members to register subnames for");
    return {
      success: true,
      results: [],
      successCount: 0,
      failureCount: 0,
    };
  }

  // Sanitize project name
  const sanitizedProjectName = projectName.toLowerCase().replace(/\s+/g, '-');

  // Filter out team members with missing data
  const validMembers = teamMembers.filter(member => 
    member.address && 
    member.address.trim().length > 0 && 
    member.role && 
    member.role.trim().length > 0
  );

  if (validMembers.length === 0) {
    console.log("No valid team members with both role and address");
    return {
      success: true,
      results: [],
      successCount: 0,
      failureCount: 0,
    };
  }

  toast.loading(`Registering subnames for ${validMembers.length} team member(s)...`);

  let successCount = 0;
  let failureCount = 0;

  // Process each team member
  for (let i = 0; i < validMembers.length; i++) {
    const member = validMembers[i];
    
    // Sanitize role for subname (lowercase, no spaces, no special chars)
    const sanitizedRole = member.role
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    // Create subname in format: projectname.role (e.g., "foundry.cofounder")
    const fullSubname = `${sanitizedProjectName}.${sanitizedRole}`;

    try {
      console.log(`Registering subname ${i + 1}/${validMembers.length}: ${fullSubname} → ${member.address}`);

      const tx = new Transaction();
      const suinsTx = new SuinsTransaction(suinsClient, tx);

      // Create a leaf subname that points to the team member's address
      suinsTx.createLeafSubName({
        parentNft: tx.object(parentNftObjectId),
        name: sanitizedRole, // Just the role part (e.g., "cofounder")
        targetAddress: member.address,
      });

      // Execute the transaction
      const result = await signAndExecuteTransaction({
        transaction: tx,
        chain: 'sui:testnet',
      });

      successCount++;
      results.push({
        role: member.role,
        address: member.address,
        success: true,
        subname: fullSubname,
        digest: result.digest,
      });

      console.log(`✅ Successfully registered: ${fullSubname}`);

    } catch (error) {
      failureCount++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      results.push({
        role: member.role,
        address: member.address,
        success: false,
        subname: fullSubname,
        error: errorMessage,
      });

      console.error(`❌ Failed to register ${fullSubname}:`, errorMessage);
    }

    // Add a small delay between transactions to avoid rate limiting
    if (i < validMembers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  toast.dismiss();

  // Provide user feedback
  if (successCount === validMembers.length) {
    toast.success(`Successfully registered ${successCount} team member subname(s)!`);
  } else if (successCount > 0) {
    toast.warning(`Registered ${successCount}/${validMembers.length} team member subname(s)`);
  } else {
    toast.error(`Failed to register team member subnames`);
  }

  return {
    success: successCount > 0,
    results,
    successCount,
    failureCount,
  };
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


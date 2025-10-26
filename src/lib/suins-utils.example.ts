/**
 * Example usage of SuiNS utility functions
 * 
 * This file demonstrates how to use the SuiNS integration utilities
 * in different scenarios.
 */

import { SuinsClient } from '@mysten/suins';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { getFullnodeUrl } from "@mysten/sui/client";
import { handleSuiNameRegistration, createSuiSubname, formatSui } from './suins-utils';

// Example 1: Basic SuiNS Name Registration
async function exampleBasicRegistration(
  signAndExecuteTransaction: any // From useSignAndExecuteTransaction hook
) {
  // Initialize the Sui client
  const client = new SuiJsonRpcClient({
    url: getFullnodeUrl('testnet'),
    network: 'testnet',
  });

  // Initialize the SuiNS client
  const suinsClient = new SuinsClient({
    client,
    network: 'testnet',
  });

  // Register a name for a project
  const result = await handleSuiNameRegistration(
    "DeFi Analytics Platform", // Project name
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Founder address
    suinsClient,
    signAndExecuteTransaction
  );

  if (result.success) {
    console.log("✅ Registration successful!");
    console.log("Transaction digest:", result.digest);
    // Name registered: defi-analytics-platform.sui
  } else {
    console.error("❌ Registration failed:", result.error);
  }
}

// Example 2: Handling Registration with Error Recovery
async function exampleWithErrorHandling(
  projectName: string,
  founderAddress: string,
  suinsClient: SuinsClient,
  signAndExecuteTransaction: any
) {
  try {
    const result = await handleSuiNameRegistration(
      projectName,
      founderAddress,
      suinsClient,
      signAndExecuteTransaction
    );

    if (result.success) {
      // Continue with project creation
      console.log("Name registered successfully, continuing...");
      return { registered: true, digest: result.digest };
    } else {
      // Log the error but don't block project creation
      console.warn("Name registration failed but continuing:", result.error);
      return { registered: false, error: result.error };
    }
  } catch (error) {
    console.error("Unexpected error during registration:", error);
    return { registered: false, error: "Unexpected error" };
  }
}

// Example 3: Creating Subnames for Team Members
async function exampleCreateTeamSubnames(
  parentNftObjectId: string,
  teamMembers: Array<{ name: string; address: string }>,
  suinsClient: SuinsClient,
  signAndExecuteTransaction: any
) {
  const results = [];

  for (const member of teamMembers) {
    const result = await createSuiSubname(
      parentNftObjectId,
      member.name, // e.g., "founder", "cto", "designer"
      member.address,
      suinsClient,
      signAndExecuteTransaction
    );

    results.push({
      name: member.name,
      success: result.success,
      digest: result.digest,
      error: result.error,
    });

    if (result.success) {
      console.log(`✅ Created subname: ${member.name}`);
    } else {
      console.log(`❌ Failed to create subname: ${member.name}`, result.error);
    }
  }

  return results;
}

// Example 4: Complete Project Launch Flow
async function exampleCompleteFlow(
  projectData: {
    name: string;
    description: string;
    fundingGoal: string;
    teamMembers: Array<{ name: string; address: string }>;
  },
  founderAddress: string,
  suinsClient: SuinsClient,
  signAndExecuteTransaction: any
) {
  console.log("🚀 Starting project launch flow...");

  // Step 1: Register primary project name
  console.log("Step 1: Registering project name...");
  const registrationResult = await handleSuiNameRegistration(
    projectData.name,
    founderAddress,
    suinsClient,
    signAndExecuteTransaction
  );

  if (!registrationResult.success) {
    console.warn("⚠️ Name registration failed, but continuing...");
  }

  // Step 2: Create subnames for team members (optional)
  if (registrationResult.success && registrationResult.nftObjectId) {
    console.log("Step 2: Creating team member subnames...");
    await exampleCreateTeamSubnames(
      registrationResult.nftObjectId,
      projectData.teamMembers,
      suinsClient,
      signAndExecuteTransaction
    );
  }

  // Step 3: Continue with rest of project creation
  console.log("Step 3: Submitting project to smart contract...");
  // ... rest of the flow

  console.log("✅ Project launch complete!");
}

// Example 5: Formatting SUI Amounts
function exampleFormatting() {
  const amounts = [
    BigInt(1_000_000_000), // 1 SUI
    BigInt(1_500_000_000), // 1.5 SUI
    BigInt(123_456_789), // 0.123456789 SUI
    BigInt(5_000_000_000_000), // 5000 SUI
  ];

  console.log("Formatting SUI amounts:");
  amounts.forEach((amount) => {
    console.log(`${amount} MIST = ${formatSui(amount)} SUI`);
  });
}

// Example 6: Name Sanitization Preview
function exampleNameSanitization() {
  const projectNames = [
    "My Amazing Project",
    "DeFi Analytics Platform",
    "AI Code Assistant",
    "Creator Economy DAO",
  ];

  console.log("Name sanitization examples:");
  projectNames.forEach((name) => {
    const sanitized = name.toLowerCase().replace(/\s+/g, '-');
    console.log(`"${name}" → "${sanitized}.sui"`);
  });
}

// Example 7: Checking Name Availability (conceptual)
async function exampleCheckAvailability(
  projectName: string,
  suinsClient: SuinsClient
) {
  // Note: This is a conceptual example. The actual implementation
  // would require querying the SuiNS registry to check if a name exists.
  
  const sanitizedName = projectName.toLowerCase().replace(/\s+/g, '-');
  
  try {
    // Attempt to get the name object
    // If it exists, the name is taken
    // If it doesn't exist, the name is available
    
    console.log(`Checking availability for: ${sanitizedName}.sui`);
    
    // Actual implementation would query the blockchain here
    // const nameObject = await suinsClient.getName(sanitizedName);
    
    // For now, just return a placeholder
    return {
      name: sanitizedName,
      available: true, // Placeholder
    };
  } catch (error) {
    console.error("Error checking availability:", error);
    return {
      name: sanitizedName,
      available: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Example 8: Batch Registration (multiple projects)
async function exampleBatchRegistration(
  projects: Array<{ name: string; founderAddress: string }>,
  suinsClient: SuinsClient,
  signAndExecuteTransaction: any
) {
  console.log(`📦 Batch registering ${projects.length} projects...`);
  
  const results = [];
  
  for (const project of projects) {
    console.log(`Processing: ${project.name}`);
    
    const result = await handleSuiNameRegistration(
      project.name,
      project.founderAddress,
      suinsClient,
      signAndExecuteTransaction
    );
    
    results.push({
      projectName: project.name,
      success: result.success,
      digest: result.digest,
      error: result.error,
    });
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ Successfully registered ${successCount}/${projects.length} projects`);
  
  return results;
}

// Export examples for reference
export {
  exampleBasicRegistration,
  exampleWithErrorHandling,
  exampleCreateTeamSubnames,
  exampleCompleteFlow,
  exampleFormatting,
  exampleNameSanitization,
  exampleCheckAvailability,
  exampleBatchRegistration,
};


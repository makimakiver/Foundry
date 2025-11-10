// src/lib/gas-calculation.ts - Frontend gas calculation using devInspect

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

// Environment variables
const VENDOR_PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID;
const OFF_CHAIN_CAP = import.meta.env.VITE_OFF_CHAIN_CAP || '0x79d0335f4f19f12f7eec6d6a3b3a9adaa4df1ffba8340892637a7efd63feacc3';
const SUBDOMAIN_PACKAGE_ID = import.meta.env.VITE_SUINS_SUBDOMAIN_PACKAGE_ID || '0x3c272bc45f9157b7818ece4f7411bdfa8af46303b071aca4e18c03119c9ff636';
const SUBNAME_PROXY_ID = import.meta.env.VITE_SUINS_SUBDOMAIN_PROXY_PACKAGE_ID || '0x295a0749dae0e76126757c305f218f929df0656df66a6361f8b6c6480a943f12';
const SUBNAME_SHARED_NFT_ID = import.meta.env.VITE_SUINS_SHARED_OBJECT_ID || '0x300369e8909b9a6464da265b9a5a9ab6fe2158a040e84e808628cde7a07ee5a3';
const NAME_NFT = import.meta.env.VITE_FOUNDRY_NS_ID || '0xb65554e77d3c489ae3f232b49106ee77e1d903a279b10bc4414e1d794465cb66';

// Placeholder addresses for devInspect
const OFFCHAIN_SENDER = import.meta.env.VITE_OFFCCHAIN_ACC || '0x39c26ec565ee7e77ef666c030b9201de0047fabc3a8301e43007a8e31e8036b2';
const PROJECT_SIGNER = '0x0000000000000000000000000000000000000000000000000000000000000001';
const HOLDER = import.meta.env.VITE_HOLDER_ACC || '0x7e3617928ec1ea5a316954e0f207fe27c6733513d65d21f366ae3ae907d877cb';

/**
 * Helper function to calculate total gas from gasUsed object
 */
function calculateTotalGas(gasUsed: any): bigint {
  const computationCost = BigInt(gasUsed.computationCost || 0);
  const storageCost = BigInt(gasUsed.storageCost || 0);
  const storageRebate = BigInt(gasUsed.storageRebate || 0);
  
  return computationCost + storageCost - storageRebate;
}

/**
 * Calculate the gas cost for offchain admin transaction (mint creation cap)
 */
async function calculateOffchainGasCost(
  client: SuiClient,
  projectObjectId: string
): Promise<bigint> {
  try {
    console.log('Calculating offchain transaction gas...');
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${VENDOR_PACKAGE_ID}::start_project::mint_creation_cap`,
      arguments: [
        tx.object(OFF_CHAIN_CAP),
        tx.object(projectObjectId),
        tx.pure.address(PROJECT_SIGNER)
      ],
    });
    
    const result = await client.devInspectTransactionBlock({
      sender: OFFCHAIN_SENDER,
      transactionBlock: tx,
    });
    
    return calculateTotalGas(result.effects.gasUsed);
  } catch (error) {
    console.warn('Failed to calculate offchain gas, using fallback:', error);
    return BigInt(10_000_000); // 0.01 SUI fallback
  }
}

/**
 * Calculate the gas cost for project signer's admin transaction (finish creation cap)
 */
async function calculateProjectSignerGasCost(
  client: SuiClient,
  creationCapId: string,
  holderGasFund: bigint
): Promise<bigint> {
  try {
    console.log('Calculating project signer transaction gas...');
    const tx = new Transaction();
    
    // Simulate transferring gas to holder
    const [gasCoin] = tx.splitCoins(tx.gas, [holderGasFund]);
    tx.transferObjects([gasCoin], HOLDER);
    
    // Finish creation cap
    tx.moveCall({
      target: `${VENDOR_PACKAGE_ID}::start_project::finish_creation_cap`,
      arguments: [tx.object(creationCapId)],
    });
    
    const result = await client.devInspectTransactionBlock({
      sender: PROJECT_SIGNER,
      transactionBlock: tx,
    });
    
    return calculateTotalGas(result.effects.gasUsed);
  } catch (error) {
    console.warn('Failed to calculate project signer gas, using fallback:', error);
    return BigInt(10_000_000); // 0.01 SUI fallback
  }
}

/**
 * Calculate the gas cost for holder transaction (create SuiNS NFTs)
 */
async function calculateHolderGasCost(
  client: SuiClient,
  subName: string,
  expirationMs: number
): Promise<bigint> {
  try {
    console.log('Calculating holder transaction gas...');
    const tx = new Transaction();
    
    const subnameNft = tx.moveCall({
      target: `${SUBDOMAIN_PACKAGE_ID}::subdomains::new`,
      arguments: [
        tx.object(SUBNAME_SHARED_NFT_ID),
        tx.object(NAME_NFT),
        tx.object('0x6'),
        tx.pure.string(subName),
        tx.pure.u64(expirationMs),
        tx.pure.bool(true),
        tx.pure.bool(true),
      ],
    });
    
    const founder_subdomain = 'founder.' + subName;
    const extraSubnameNft = tx.moveCall({
      target: `${SUBNAME_PROXY_ID}::subdomain_proxy::new`,
      arguments: [
        tx.object(SUBNAME_SHARED_NFT_ID),
        subnameNft,
        tx.object('0x6'),
        tx.pure.string(founder_subdomain),
        tx.pure.u64(expirationMs),
        tx.pure.bool(true),
        tx.pure.bool(false),
      ],
    });
    
    tx.transferObjects([subnameNft], PROJECT_SIGNER);
    tx.transferObjects([extraSubnameNft], OFFCHAIN_SENDER);
    
    const result = await client.devInspectTransactionBlock({
      sender: HOLDER,
      transactionBlock: tx,
    });
    
    return calculateTotalGas(result.effects.gasUsed);
  } catch (error) {
    console.warn('Failed to calculate holder gas, using fallback:', error);
    return BigInt(50_000_000); // 0.05 SUI fallback
  }
}

/**
 * Calculate all gas costs needed for project creation
 */
export async function calculateGasCosts(
  client: SuiClient,
  projectName: string,
  sampleProjectId: string = '0x507e4383656d60e8a78a8cb56c78dbbc051044f444003416900f3d1a072d667d',
  sampleCreationCapId: string = '0x713345d415e815fa627d07ca945f1014417406c1a9ec4faf54723210555ef931'
) {
  try {
    console.log('========================================');
    console.log('CALCULATING GAS COSTS (Client-Side)');
    console.log('========================================');
    
    const subName = projectName + '.foundry.sui';
    const expirationMs = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year
    
    // Calculate individual gas costs
    const offchainGasBase = await calculateOffchainGasCost(client, sampleProjectId);
    const holderGasBase = await calculateHolderGasCost(client, subName, expirationMs);
    const projectSignerGasBase = await calculateProjectSignerGasCost(client, sampleCreationCapId, holderGasBase);
    
    // Add 60% buffer to gas costs (observed: actual costs can be 44% higher than devInspect)
    const BUFFER_MULTIPLIER = 160; // 160% = original + 60% buffer
    const offchainGas = (offchainGasBase * BigInt(BUFFER_MULTIPLIER)) / BigInt(100);
    const projectSignerGas = (projectSignerGasBase * BigInt(BUFFER_MULTIPLIER)) / BigInt(100);
    const holderGas = (holderGasBase * BigInt(BUFFER_MULTIPLIER)) / BigInt(100);
    
    const totalGas = offchainGas + projectSignerGas + holderGas;
    const totalSui = (Number(totalGas) / 1_000_000_000).toFixed(4);
    
    console.log('Gas Estimates (with 60% buffer):');
    console.log('  Offchain:', offchainGas.toString(), 'MIST');
    console.log('  Project Signer:', projectSignerGas.toString(), 'MIST');
    console.log('  Holder:', holderGas.toString(), 'MIST');
    console.log('  Total:', totalSui, 'SUI');
    console.log('========================================');
    
    return {
      offchainGas,
      projectSignerGas,
      holderGas,
      totalGas,
      totalSui,
      breakdown: {
        offchain: {
          base: offchainGasBase.toString(),
          withBuffer: offchainGas.toString()
        },
        projectSigner: {
          base: projectSignerGasBase.toString(),
          withBuffer: projectSignerGas.toString()
        },
        holder: {
          base: holderGasBase.toString(),
          withBuffer: holderGas.toString()
        }
      }
    };
  } catch (error) {
    console.error('Error calculating gas costs:', error);
    
    // Return fallback amounts with generous buffer
    const fallbackOffchain = BigInt(15_000_000); // 0.015 SUI
    const fallbackProjectSigner = BigInt(15_000_000); // 0.015 SUI
    const fallbackHolder = BigInt(60_000_000); // 0.06 SUI
    const fallbackTotal = fallbackOffchain + fallbackProjectSigner + fallbackHolder;
    
    console.warn('Using fallback gas estimates:', {
      offchain: fallbackOffchain.toString(),
      projectSigner: fallbackProjectSigner.toString(),
      holder: fallbackHolder.toString(),
      total: (Number(fallbackTotal) / 1_000_000_000).toFixed(4) + ' SUI'
    });
    
    return {
      offchainGas: fallbackOffchain,
      projectSignerGas: fallbackProjectSigner,
      holderGas: fallbackHolder,
      totalGas: fallbackTotal,
      totalSui: (Number(fallbackTotal) / 1_000_000_000).toFixed(4)
    };
  }
}

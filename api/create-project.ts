// api/create-project.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SealClient, SessionKey } from '@mysten/seal';
import { fromHex } from '@mysten/sui/utils';

// Environment variables (server-side - no VITE_ prefix needed)
const VENDOR_PACKAGE_ID = process.env.VITE_PACKAGE_ID || '0x2eb31c1ff6a0b3985dcb1ae5966596bcef9b692619ac59d2c2c67d50f315413e';
const OFF_CHAIN_CAP = process.env.VITE_OFFCHAIN_CAP || '0x90fbe3f7402735e9f080fef0763511e04bb986d2f28316bd065542590448c255';
const REGISTRY = process.env.VITE_REGISTRY_ID || '0x49c1775d012c72f185bd91359dfc98cae12db1f4b7fa6c878edc62189189dee4';
const SUBDOMAIN_PACKAGE_ID = process.env.VITE_SUINS_SUBDOMAIN_PACKAGE_ID || '0x3c272bc45f9157b7818ece4f7411bdfa8af46303b071aca4e18c03119c9ff636';
const SUBNAME_PROXY_ID = process.env.VITE_SUINS_SUBDOMAIN_PROXY_PACKAGE_ID || '0x295a0749dae0e76126757c305f218f929df0656df66a6361f8b6c6480a943f12';
const SUBNAME_SHARED_NFT_ID = process.env.VITE_SUINS_SHARED_OBJECT_ID || '0x300369e8909b9a6464da265b9a5a9ab6fe2158a040e84e808628cde7a07ee5a3';
const NAME_NFT = process.env.VITE_FOUNDRY_NS_ID || '0xb65554e77d3c489ae3f232b49106ee77e1d903a279b10bc4414e1d794465cb66';

// Initialize Sui client
const client = new SuiClient({ url: getFullnodeUrl('testnet') });

// Seal server object IDs
const MYSTEN_2 = "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8";
const RUBY = "0x6068c0acb197dddbacd4746a9de7f025b2ed5a5b6c1b1ab44dade4426d141da2";
const NODE_INFRA = "0x5466b7df5c15b508678d51496ada8afab0d6f70a01c10613123382b1b8131007";
const STUDIO_MIRAI = "0x164ac3d2b3b8694b8181c13f671950004765c23f270321a45fdd04d40cccf0f2";
const serverObjectIds = [MYSTEN_2, RUBY, NODE_INFRA, STUDIO_MIRAI];

const sealClient = new SealClient({
  suiClient: client as any,
  serverConfigs: serverObjectIds.map((id) => ({
    objectId: id,
    weight: 1,
  })),
  verifyKeyServers: false,
});

// Encrypted holder keypair (from your project-registration.ts)
const encrypted_objects = [0,216,63,191,213,212,54,56,201,178,16,42,164,107,212,40,78,123,166,90,128,59,162,157,112,108,72,90,105,103,28,181,230,1,1,4,245,209,74,129,169,130,20,74,228,65,205,125,100,176,144,39,241,22,164,104,189,54,231,236,164,148,247,80,89,22,35,200,1,96,104,192,172,177,151,221,219,172,212,116,106,157,231,240,37,178,237,90,91,108,27,26,180,77,173,228,66,109,20,29,162,2,84,102,183,223,92,21,181,8,103,141,81,73,106,218,138,250,176,214,247,10,1,193,6,19,18,51,130,177,184,19,16,7,3,22,74,195,210,179,184,105,75,129,129,193,63,103,25,80,0,71,101,194,63,39,3,33,164,95,221,4,212,12,204,240,242,4,1,0,143,68,183,30,155,141,159,13,56,182,18,106,247,89,187,91,109,145,51,29,138,31,56,79,100,225,93,3,209,214,116,80,24,114,200,137,11,2,196,213,211,222,76,175,243,79,26,212,13,113,93,163,14,205,191,124,150,68,189,44,57,147,194,19,48,92,58,218,67,230,186,217,16,229,229,211,193,193,88,26,127,240,8,133,71,49,64,111,156,18,202,65,205,51,26,20,4,135,251,183,218,12,172,202,135,42,50,72,108,179,208,172,118,212,215,87,147,104,173,60,78,155,82,83,70,40,15,136,17,231,140,116,84,206,121,55,213,158,250,128,60,210,204,199,15,97,13,170,196,80,110,204,71,237,221,243,215,65,176,13,108,6,127,169,27,9,233,174,123,145,177,22,209,62,67,74,56,49,65,57,167,39,183,66,210,168,223,119,73,97,186,152,89,12,231,62,65,9,152,200,31,68,58,225,135,129,187,199,240,34,53,97,255,33,193,86,231,186,232,41,163,22,159,24,49,236,190,242,133,199,38,15,137,123,232,154,228,218,109,91,200,146,95,107,17,205,43,227,146,95,103,161,72,140,11,196,86,0,86,140,170,6,162,232,201,164,72,107,156,144,45,119,203,244,43,33,153,107,127,108,130,24,241,17,236,0,186,134,29,93,22,107,198,220,35,59,79,56,131,211,142,225,168,221,15,245,51,45,198,181,7,142,179,232,221,90,179,67,99,177,179,4,171,173,33,220,88,192,73,82,217,204,77,233,105,68,126,241,79,208,223,222,73,53,175,1,0];
const encryptedBytes = new Uint8Array(encrypted_objects);


/**
 * Main API Handler - Handles admin transactions for project creation
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('========================================');
    console.log('SERVER: Starting project creation flow');
    console.log('========================================');
    const { 
      projectObjectId, 
      subName, 
      expirationMs,
      userAddress,
      teamMembers = [], // Array of { name: address, role: string }
      projectSignerGasFund // Gas amount for project_signer (optional, defaults to 10M MIST)
    } = req.body;

    // Validate required fields
    if (!projectObjectId || !subName) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectObjectId and subName are required' 
      });
    }
    
    if (!userAddress) {
      return res.status(400).json({
        error: 'Missing required field: userAddress is required'
      });
    }

    console.log('Project Object ID:', projectObjectId);
    console.log('Subname:', subName);
    console.log('User Address:', userAddress);
    console.log('Team Members:', teamMembers.length);

    // Get private keys from environment
    const offchainSecretKey = process.env.VITE_OFFCHAIN_SECRET_KEY;
    if (!offchainSecretKey) {
      return res.status(500).json({ error: 'Server configuration error: OFFCHAIN_SECRET_KEY not set' });
    }

    const offchain_keypair = Ed25519Keypair.fromSecretKey(offchainSecretKey);
    const offchain_sender = offchain_keypair.getPublicKey().toSuiAddress();

    // Generate new project signer keypair
    const keypair_project_signer = new Ed25519Keypair();
    const project_signer = keypair_project_signer.getPublicKey().toSuiAddress();
    const project_signer_secret = keypair_project_signer.getSecretKey();

    console.log('Generated project signer:', project_signer);

    // Step 1: Fund project_signer and mint creation cap
    console.log('Step 1: Funding project_signer and minting creation cap...');
    const tx1 = new Transaction();
    
    // Transfer gas from offchain to project_signer
    // Note: Frontend already funded offchain account with gas for both operations
    // Calculate the gas needed for project_signer's transaction
    const gasForProjectSigner = BigInt(projectSignerGasFund || 10_000_000);
    const [projectSignerGasCoin] = tx1.splitCoins(tx1.gas, [gasForProjectSigner]);
    tx1.transferObjects([projectSignerGasCoin], project_signer);
    
    tx1.moveCall({
      target: `${VENDOR_PACKAGE_ID}::start_project::mint_creation_cap`,
      arguments: [
        tx1.object(OFF_CHAIN_CAP),
        tx1.object(projectObjectId),
        tx1.pure.address(project_signer)
      ],
    });
    
    tx1.transferObjects([tx1.object(projectObjectId)], project_signer);

    const result1 = await client.signAndExecuteTransaction({
      signer: offchain_keypair,
      transaction: tx1,
      options: { showEffects: true, showObjectChanges: true }
    });
    
    await client.waitForTransaction({ digest: result1.digest });
    console.log('✅ Creation cap minted:', result1.digest);

    // Extract creation cap ID
    const createdObjects = result1.objectChanges?.filter(
      (change: any) => change.type === 'created'
    ) || [];
    
    const creationCap = createdObjects.find(
      (change: any) => {
        const objectType = change.objectType || '';
        return objectType.includes('::start_project::CreationCap');
      }
    );
    
    if (!creationCap || !('objectId' in creationCap)) {
      throw new Error('Failed to find created creation cap object');
    }
    
    const creationCapId = (creationCap as any).objectId;
    console.log('Creation cap ID:', creationCapId);

    // Step 2: Setup session key and decrypt holder keypair
    console.log('Step 2: Setting up session key and decrypting...');
    const sessionKey = await SessionKey.create({
      address: project_signer,
      packageId: VENDOR_PACKAGE_ID,
      ttlMin: 10,
      suiClient: client as any,
    });
    
    const message = sessionKey.getPersonalMessage();
    const { signature } = await keypair_project_signer.signPersonalMessage(message);
    await sessionKey.setPersonalMessageSignature(signature);

    // Build seal approval transaction
    const idBytes = fromHex("0x1");
    const sealTx = new Transaction();
    sealTx.moveCall({
      target: `${VENDOR_PACKAGE_ID}::start_project::seal_approve`,
      arguments: [
        sealTx.pure.vector("u8", idBytes),
        sealTx.object(creationCapId),
        sealTx.object(projectObjectId)
      ],
    });

    const txBytes = await sealTx.build({ client, onlyTransactionKind: true });
    
    const decryptedBytes = await sealClient.decrypt({ 
      data: encryptedBytes, 
      sessionKey, 
      txBytes 
    });
    
    const holder_privKey = new TextDecoder().decode(decryptedBytes);
    const holder_keypair = Ed25519Keypair.fromSecretKey(holder_privKey);
    const holder_address = holder_keypair.getPublicKey().toSuiAddress();
    
    console.log('✅ Holder address decrypted:', holder_address);

    // Step 3: Finish creation cap (project_signer executes)
    console.log('Step 3: Finishing creation cap...');
    const tx2 = new Transaction();
    tx2.moveCall({
      target: `${VENDOR_PACKAGE_ID}::start_project::finish_creation_cap`,
      arguments: [tx2.object(creationCapId)],
    });
    tx2.transferObjects([tx2.object(projectObjectId)], holder_address);
    
    const result2 = await client.signAndExecuteTransaction({
      signer: keypair_project_signer,
      transaction: tx2,
      options: { showEffects: true }
    });
    
    await client.waitForTransaction({ digest: result2.digest });
    console.log('✅ Creation cap finished:', result2.digest);

    // Step 4: Create subname NFTs (holder executes)
    if (subName) {
      const expirationMs = 1792963031733;
      console.log('Step 4: Creating subname NFTs...');
      console.log(`Creating NFTs for founder + ${teamMembers.length} team members`);
      
      const tx3 = new Transaction();
      
      // Create main project subdomain NFT
      const subnameNft = tx3.moveCall({
        target: `${SUBDOMAIN_PACKAGE_ID}::subdomains::new`,
        arguments: [
          tx3.object(SUBNAME_SHARED_NFT_ID),
          tx3.object(NAME_NFT),
          tx3.object('0x6'),
          tx3.pure.string(subName),
          tx3.pure.u64(expirationMs),
          tx3.pure.bool(true),
          tx3.pure.bool(true),
        ],
      });
      
      // Create founder subdomain NFT
      const founder_subdomain = 'founder.' + subName;
      const founderSubnameNft = tx3.moveCall({
        target: `${SUBNAME_PROXY_ID}::subdomain_proxy::new`,
        arguments: [
          tx3.object(SUBNAME_SHARED_NFT_ID),
          subnameNft,
          tx3.object('0x6'),
          tx3.pure.string(founder_subdomain),
          tx3.pure.u64(expirationMs),
          tx3.pure.bool(true),
          tx3.pure.bool(false),
        ],
      });
      
      
      // Create subdomains for team members
      if (teamMembers && teamMembers.length > 0) {
        console.log('Creating subdomains for team members:', teamMembers);
        
        // Filter out empty team members and create arrays
        const validMembers = teamMembers.filter((member: any) => 
          member.name && member.role && 
        member.name.trim() !== '' && member.role.trim() !== ''
      );
      
      if (validMembers.length > 0) {
        // Create separate arrays for addresses and roles
        const memberAddresses = validMembers.map((member: any) => member.name);
        const memberRoles = validMembers.map((member: any) => member.role);
        
        console.log('Member Addresses:', memberAddresses);
        console.log('Member Roles:', memberRoles);
        
        // Call distribute_role with the arrays
        tx3.moveCall({
          target: `${VENDOR_PACKAGE_ID}::ideation::distribute_role`,
          arguments: [
            tx3.object(projectObjectId),
            tx3.object(SUBNAME_SHARED_NFT_ID),
            subnameNft,
            tx3.object('0x6'),
            tx3.pure.vector('address', memberAddresses),
            tx3.pure.vector('string', memberRoles),
            tx3.pure.u64(expirationMs)
          ],
        });
        // Transfer main project NFT to project_signer
        tx3.transferObjects([subnameNft, tx3.object(projectObjectId)], project_signer);
        // Transfer founder NFT to user
        tx3.transferObjects([founderSubnameNft], userAddress);
          
          console.log(`✅ distribute_role called for ${validMembers.length} team members`);
        } else {
          console.log('No valid team members to process');
        }
      }

      const result3 = await client.signAndExecuteTransaction({
        signer: holder_keypair,
        transaction: tx3,
        options: { showEffects: true }
      });
      
      await client.waitForTransaction({ digest: result3.digest });
      console.log('✅ All subname NFTs created:', result3.digest);
      console.log(`✅ Created ${1 + (teamMembers?.length || 0)} subdomains total`);
    }

    console.log('========================================');
    console.log('✅ SERVER: Project creation completed');
    console.log('========================================');

    // Calculate valid team members
    const validMembers = teamMembers.filter((m: any) => 
      m.name && m.role && m.name.trim() !== '' && m.role.trim() !== ''
    );
    
    // Return success response with keypair for frontend to use
    res.status(200).json({
      success: true,
      message: 'Project creation completed successfully',
      data: {
        projectObjectId,
        creationCapId,
        projectSigner: project_signer,
        projectSignerSecretKey: project_signer_secret,
        holderAddress: holder_address,
        offchainSender: offchain_sender,
        teamMembersProcessed: validMembers.length,
        subdomainsCreated: {
          founder: `founder.${subName}`,
          teamMembers: validMembers.map((m: any) => `${m.role}.${subName}`)
        },
        transactions: {
          mintCreationCap: result1.digest,
          finishCreationCap: result2.digest,
        }
      }
    });

  } catch (error: any) {
    console.error('========================================');
    console.error('❌ SERVER ERROR:', error);
    console.error('========================================');
    
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}


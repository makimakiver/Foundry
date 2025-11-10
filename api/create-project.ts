// api/create-project.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SealClient, SessionKey } from '@mysten/seal';
import { fromHex } from '@mysten/sui/utils';

// Environment variables
const VENDOR_PACKAGE_ID = process.env.VENDOR_PACKAGE_ID || '0x5df51723e792d8997665212dc9c26a0bd2cb72591d7a571140e3685a6ef01bf0';
const OFF_CHAIN_CAP = process.env.OFF_CHAIN_CAP || '0x79d0335f4f19f12f7eec6d6a3b3a9adaa4df1ffba8340892637a7efd63feacc3';
const REGISTRY = process.env.REGISTRY || '0x49c1775d012c72f185bd91359dfc98cae12db1f4b7fa6c878edc62189189dee4';
const SUBDOMAIN_PACKAGE_ID = process.env.SUBDOMAIN_PACKAGE_ID || '0x3c272bc45f9157b7818ece4f7411bdfa8af46303b071aca4e18c03119c9ff636';
const SUBNAME_PROXY_ID = process.env.SUBNAME_PROXY_ID || '0x295a0749dae0e76126757c305f218f929df0656df66a6361f8b6c6480a943f12';
const SUBNAME_SHARED_NFT_ID = process.env.SUBNAME_SHARED_NFT_ID || '0x300369e8909b9a6464da265b9a5a9ab6fe2158a040e84e808628cde7a07ee5a3';
const NAME_NFT = process.env.NAME_NFT || '0xb65554e77d3c489ae3f232b49106ee77e1d903a279b10bc4414e1d794465cb66';

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
const encrypted_objects = [0,93,245,23,35,231,146,216,153,118,101,33,45,201,194,106,11,210,203,114,89,29,122,87,17,64,227,104,90,110,240,27,240,1,1,4,245,209,74,129,169,130,20,74,228,65,205,125,100,176,144,39,241,22,164,104,189,54,231,236,164,148,247,80,89,22,35,200,1,96,104,192,172,177,151,221,219,172,212,116,106,157,231,240,37,178,237,90,91,108,27,26,180,77,173,228,66,109,20,29,162,2,84,102,183,223,92,21,181,8,103,141,81,73,106,218,138,250,176,214,247,10,1,193,6,19,18,51,130,177,184,19,16,7,3,22,74,195,210,179,184,105,75,129,129,193,63,103,25,80,0,71,101,194,63,39,3,33,164,95,221,4,212,12,204,240,242,4,1,0,143,153,180,252,224,197,76,112,60,236,75,3,141,27,36,104,176,233,79,98,52,79,48,69,94,116,151,18,38,91,235,20,82,163,91,43,193,240,37,7,50,31,173,207,57,224,83,47,13,66,231,27,83,85,14,229,116,248,83,99,131,69,237,235,71,109,57,82,181,57,121,85,133,143,134,11,183,117,22,134,80,250,127,101,48,35,162,100,93,103,67,85,205,10,110,130,4,16,126,83,140,115,31,110,15,48,211,114,141,204,95,96,250,73,222,130,180,107,50,229,133,191,224,198,10,120,171,46,129,206,71,206,100,38,133,210,189,246,113,76,121,190,159,230,169,170,228,100,113,164,30,199,10,83,82,196,245,169,59,47,146,155,105,15,99,2,86,2,171,66,36,148,2,160,142,132,142,5,72,225,50,28,172,135,217,149,141,186,28,179,160,137,254,171,184,86,118,96,113,251,118,199,206,144,10,248,98,34,26,218,95,34,197,205,180,216,167,39,249,223,174,104,154,167,188,142,51,188,50,194,68,241,144,180,63,12,223,24,153,180,175,6,170,48,192,94,100,201,149,105,166,181,144,43,129,151,35,0,86,201,62,139,24,135,139,71,54,26,54,85,144,62,240,178,207,223,132,106,224,146,244,34,255,251,238,0,138,180,252,195,201,111,144,131,153,29,23,117,219,171,184,192,39,44,226,89,1,45,213,182,81,161,76,57,35,41,207,236,249,245,191,108,66,71,124,150,1,111,156,75,49,133,23,32,87,63,195,254,120,114,184,78,63,147,86,1,0];
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
      projectSignerGasFund // Gas amount for project_signer (optional, defaults to 10M MIST)
    } = req.body;

    // Validate required fields
    if (!projectObjectId || !subName) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectObjectId and subName are required' 
      });
    }

    console.log('========================================');
    console.log('SERVER: Starting project creation flow');
    console.log('========================================');
    console.log('Project Object ID:', projectObjectId);
    console.log('Subname:', subName);

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
      const tx3 = new Transaction();
      
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
      
      const founder_subdomain = 'founder.' + subName;
      const extraSubnameNft = tx3.moveCall({
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
      
      tx3.transferObjects([subnameNft], project_signer);
      tx3.transferObjects([extraSubnameNft], userAddress);

      const result3 = await client.signAndExecuteTransaction({
        signer: holder_keypair,
        transaction: tx3,
        options: { showEffects: true }
      });
      
      await client.waitForTransaction({ digest: result3.digest });
      console.log('✅ Subname NFTs created:', result3.digest);
    }

    console.log('========================================');
    console.log('✅ SERVER: Project creation completed');
    console.log('========================================');

    // Return success response with keypair for frontend to use
    res.status(200).json({
      success: true,
      message: 'Project creation completed successfully',
      data: {
        projectObjectId,
        creationCapId,
        projectSigner: project_signer,
        projectSignerSecretKey: project_signer_secret, // Frontend will need this to continue
        holderAddress: holder_address,
        offchainSender: offchain_sender,
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


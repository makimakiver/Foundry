// api/project-registration.ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHex } from '@mysten/sui/utils';
import { SealClient, SessionKey } from '@mysten/seal';
import 'dotenv/config';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { walrus, WalrusFile } from '@mysten/walrus';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  projectCreation().catch((e) => {
    console.error('✗ Fatal error:', e);
  });
  res.status(200).json({ 
    message: 'Hello from serverless!',
    timestamp: new Date().toISOString()
  });
}

// ---------- CONFIG & CLIENTS ----------
const NETWORK = 'testnet';
const RPC_URL = getFullnodeUrl(NETWORK);

console.log('[init] network:', NETWORK);
console.log('[init] rpc url:', RPC_URL);

const client = new SuiJsonRpcClient({
	url: getFullnodeUrl('testnet'),
	network: 'testnet',
}).$extend(
	walrus({
		uploadRelay: {
			host: 'https://upload-relay.testnet.walrus.space',
			sendTip: {
				max: 1_000,
			},
		},
	}),
);

const MYSTEN_2 = "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8";
const RUBY = "0x6068c0acb197dddbacd4746a9de7f025b2ed5a5b6c1b1ab44dade4426d141da2";
const NODE_INFRA = "0x5466b7df5c15b508678d51496ada8afab0d6f70a01c10613123382b1b8131007";
const STUDIO_MIRAI = "0x164ac3d2b3b8694b8181c13f671950004765c23f270321a45fdd04d40cccf0f2";
const serverObjectIds = [MYSTEN_2, RUBY, NODE_INFRA, STUDIO_MIRAI];

const sealClient = new SealClient({
  suiClient: client as any, // Type compatibility issue between @mysten/seal and @mysten/sui versions
  serverConfigs: serverObjectIds.map((id) => ({
    objectId: id,
    weight: 1,
  })),
  verifyKeyServers: false,
});
// ---------- KEYS ----------
const secretKeyB64 = process.env.PRIVATE_KEY;
const offchain_secret_key = process.env.OFFCHAIN_SECRET_KEY;
if (!secretKeyB64 || !offchain_secret_key) {
  console.error('[keys] PRIVATE_KEY env var missing (base64-encoded Ed25519 secret key)');
  process.exit(1);
}

const keypair = Ed25519Keypair.fromSecretKey(secretKeyB64);
const sender = keypair.getPublicKey().toSuiAddress();

const offchain_keypair = Ed25519Keypair.fromSecretKey(offchain_secret_key);
const offchain_sender = offchain_keypair.getPublicKey().toSuiAddress();

const keypair_project_signer = new Ed25519Keypair();
const project_signer = keypair_project_signer.getPublicKey().toSuiAddress();

const holder = '0x7e3617928ec1ea5a316954e0f207fe27c6733513d65d21f366ae3ae907d877cb';

const encrypted_objects = [0,93,245,23,35,231,146,216,153,118,101,33,45,201,194,106,11,210,203,114,89,29,122,87,17,64,227,104,90,110,240,27,240,1,1,4,245,209,74,129,169,130,20,74,228,65,205,125,100,176,144,39,241,22,164,104,189,54,231,236,164,148,247,80,89,22,35,200,1,96,104,192,172,177,151,221,219,172,212,116,106,157,231,240,37,178,237,90,91,108,27,26,180,77,173,228,66,109,20,29,162,2,84,102,183,223,92,21,181,8,103,141,81,73,106,218,138,250,176,214,247,10,1,193,6,19,18,51,130,177,184,19,16,7,3,22,74,195,210,179,184,105,75,129,129,193,63,103,25,80,0,71,101,194,63,39,3,33,164,95,221,4,212,12,204,240,242,4,1,0,143,153,180,252,224,197,76,112,60,236,75,3,141,27,36,104,176,233,79,98,52,79,48,69,94,116,151,18,38,91,235,20,82,163,91,43,193,240,37,7,50,31,173,207,57,224,83,47,13,66,231,27,83,85,14,229,116,248,83,99,131,69,237,235,71,109,57,82,181,57,121,85,133,143,134,11,183,117,22,134,80,250,127,101,48,35,162,100,93,103,67,85,205,10,110,130,4,16,126,83,140,115,31,110,15,48,211,114,141,204,95,96,250,73,222,130,180,107,50,229,133,191,224,198,10,120,171,46,129,206,71,206,100,38,133,210,189,246,113,76,121,190,159,230,169,170,228,100,113,164,30,199,10,83,82,196,245,169,59,47,146,155,105,15,99,2,86,2,171,66,36,148,2,160,142,132,142,5,72,225,50,28,172,135,217,149,141,186,28,179,160,137,254,171,184,86,118,96,113,251,118,199,206,144,10,248,98,34,26,218,95,34,197,205,180,216,167,39,249,223,174,104,154,167,188,142,51,188,50,194,68,241,144,180,63,12,223,24,153,180,175,6,170,48,192,94,100,201,149,105,166,181,144,43,129,151,35,0,86,201,62,139,24,135,139,71,54,26,54,85,144,62,240,178,207,223,132,106,224,146,244,34,255,251,238,0,138,180,252,195,201,111,144,131,153,29,23,117,219,171,184,192,39,44,226,89,1,45,213,182,81,161,76,57,35,41,207,236,249,245,191,108,66,71,124,150,1,111,156,75,49,133,23,32,87,63,195,254,120,114,184,78,63,147,86,1,0];
const encryptedBytes = new Uint8Array(encrypted_objects);
console.log('[keys] sender address:', sender);

// Configuration foundry constants
const VENDOR_PACKAGE_ID = process.env.VITE_PACKAGE_ID || '0x5df51723e792d8997665212dc9c26a0bd2cb72591d7a571140e3685a6ef01bf0';
const OFF_CHAIN_CAP = process.env.VITE_OFFCHAIN_CAP || '0x79d0335f4f19f12f7eec6d6a3b3a9adaa4df1ffba8340892637a7efd63feacc3';
const REGISTRY = process.env.VITE_REGISTRY_ID || '0x49c1775d012c72f185bd91359dfc98cae12db1f4b7fa6c878edc62189189dee4';
const SAMPLE_CREATION_CAP_ID = process.env.VITE_SAMPLE_CREATION_CAP_ID || '0x713345d415e815fa627d07ca945f1014417406c1a9ec4faf54723210555ef931';

const NAME_NFT = process.env.VITE_FOUNDRY_NS_ID || '0xb65554e77d3c489ae3f232b49106ee77e1d903a279b10bc4414e1d794465cb66';
const SUBDOMAIN_PACKAGE_ID = process.env.VITE_SUINS_SUBDOMAIN_PACKAGE_ID || '0x3c272bc45f9157b7818ece4f7411bdfa8af46303b071aca4e18c03119c9ff636';
const SUBNAME_PROXY_ID = process.env.VITE_SUINS_SUBDOMAIN_PROXY_PACKAGE_ID || '0x295a0749dae0e76126757c305f218f929df0656df66a6361f8b6c6480a943f12';
const SUBNAME_SHARED_NFT_ID = process.env.VITE_SUINS_SHARED_OBJECT_ID || '0x300369e8909b9a6464da265b9a5a9ab6fe2158a040e84e808628cde7a07ee5a3';

/**
 * Creates a project transaction
 */
async function buildProjectTransaction(
  subName: string, 
  blob_objectId: string, 
  offchainGasFund?: bigint, 
  projectSignerGasFund?: bigint,
  holderGasFund?: bigint
) {

  console.log("Creating project transaction...");
  const tx = new Transaction();
  
  // Transfer gas funds to offchain account if specified
  if (offchainGasFund) {
    console.log(`Including gas transfer of ${offchainGasFund} MIST to offchain account...`);
    const [gasCoin] = tx.splitCoins(tx.gas, [offchainGasFund]);
    tx.transferObjects([gasCoin], offchain_sender);
  }
  
  // Transfer gas funds to project signer account if specified
  if (projectSignerGasFund) {
    console.log(`Including gas transfer of ${projectSignerGasFund} MIST to project signer account...`);
    const [gasCoin] = tx.splitCoins(tx.gas, [projectSignerGasFund]);
    tx.transferObjects([gasCoin], project_signer);
  }
  
  // Transfer gas funds to holder account if specified
  if (holderGasFund) {
    console.log(`Including gas transfer of ${holderGasFund} MIST to holder account...`);
    const [gasCoin] = tx.splitCoins(tx.gas, [holderGasFund]);
    tx.transferObjects([gasCoin], holder);
  }
  
  const project = tx.moveCall({
    target: `${VENDOR_PACKAGE_ID}::ideation::create_project`,
    arguments: [
      tx.object(REGISTRY),
      tx.pure.string(subName),
      tx.object(blob_objectId),
      tx.pure.string(''),
      tx.pure.u64(0),
      tx.pure.string('')
    ]
  });
  tx.transferObjects([project], offchain_sender);
  console.log("Project transaction built");
  
  return { tx };
}

/**
 * Builds admin transaction for minting creation cap and seal approval
*/
async function buildAdminTransaction(projectObjectId: string, gasBudget?: bigint, holderGasFund?: bigint) {
  console.log("Building admin transaction...");
  const tx = new Transaction();
  console.log("Building mint creation cap...");
  tx.moveCall({
    target: `${VENDOR_PACKAGE_ID}::start_project::mint_creation_cap`,
    arguments: [
      tx.object(OFF_CHAIN_CAP),
      tx.object(projectObjectId),
      tx.pure.address(project_signer)
    ],
  });
  tx.transferObjects([tx.object(projectObjectId)], project_signer);
  const result = await client.signAndExecuteTransaction({
    signer: offchain_keypair,
    transaction: tx,
    options: { showEffects: true, showObjectChanges: true }
  });
  await client.waitForTransaction({ digest: result.digest });
  // Extract project object ID from transaction result
  const createdObjects = result.objectChanges?.filter(
    (change: any) => change.type === 'created'
  ) || [];
  
  // Find Project object, excluding ProjectCreationCap
  const creationCap = createdObjects.find(
    (change: any) => {
      const objectType = change.objectType || '';
      return objectType.includes('::start_project::CreationCap')
    }
  );
  
  if (!creationCap || !('objectId' in creationCap)) {
    throw new Error('Failed to find created project object');
  }
  
  const creationCapId = (creationCap as any).objectId;
  console.log("Creation cap ID:", creationCapId);
  // console.log("Waiting for 3 seconds...");
  // await new Promise(resolve => setTimeout(resolve, 3000));
  // console.log("3 seconds passed...");
  // Setup session key and decrypt
  const { holder_keypair, holder_address } = await setupSessionKeyAndDecrypt(projectObjectId, creationCapId);
  const new_tx = new Transaction();
  // // Transfer gas funds to holder account if specified
  // if (holderGasFund) {
  //   console.log(`Including gas transfer of ${holderGasFund} MIST to holder account (${holder_address})...`);
  //   const [gasCoin] = new_tx.splitCoins(new_tx.gas, [holderGasFund]);
  //   new_tx.transferObjects([gasCoin], holder_address);
  // }
  
  // Finish creation cap
  new_tx.moveCall({
    target: `${VENDOR_PACKAGE_ID}::start_project::finish_creation_cap`,
    arguments: [new_tx.object(creationCapId)],
  });
  
  console.log("Admin transaction built");
  return { new_tx, holder_keypair, holder_address };
}

/**
 * Creates session key and decrypts data for seal approval
*/
async function setupSessionKeyAndDecrypt(projectObjectId: string, creationCapId: string) {
  console.log("Creating session key...");
  console.log("Project signer secret key:", keypair_project_signer.getSecretKey());
  console.log("Project signer address:", project_signer);
  const sessionKey = await SessionKey.create({
    address: project_signer,
    packageId: VENDOR_PACKAGE_ID,
    ttlMin: 10,
    suiClient: new SuiClient({ url: getFullnodeUrl('testnet') }) as any, // Type compatibility issue
  });
  
  console.log("Signing session key...");
  const message = sessionKey.getPersonalMessage();
  const { signature } = await keypair_project_signer.signPersonalMessage(message);
  await sessionKey.setPersonalMessageSignature(signature);
  console.log("Session key created...");
  const idBytes = fromHex("0x1");
  const tx = new Transaction();
  const cap_info = await client.getObject({
    id: creationCapId,
    options: { showContent: true }
  });
  // console.log("Cap info:", cap_info);
  const cap_object = (cap_info.data?.content as any)?.fields;
  console.log("Cap object:", cap_object?.project_id);
  const project_info = await client.getObject({
    id: projectObjectId,
    options: { showContent: true }
  });
  const project_object = (project_info.data?.content as any)?.fields;
  console.log("Project object:", project_object?.id?.id);
  tx.moveCall({
    target: `${VENDOR_PACKAGE_ID}::start_project::seal_approve`,
    arguments: [
      tx.pure.vector("u8", idBytes),
      tx.object(creationCapId),
      tx.object(projectObjectId)
    ],
  });
  // Build transaction bytes for decryption
  const txBytes = await tx.build({ client, onlyTransactionKind: true });
  
  console.log("Decrypting data...");
  const decryptedBytes = await sealClient.decrypt({ 
    data: encryptedBytes, 
    sessionKey, 
    txBytes 
  });
  
  console.log("Decrypted data:", decryptedBytes);
  const holder_privKey = new TextDecoder().decode(decryptedBytes);
  console.log("Holder private key:", holder_privKey);
  const holder_keypair = Ed25519Keypair.fromSecretKey(holder_privKey);
  const holder_address = holder_keypair.getPublicKey().toSuiAddress();
  
  console.log("Holder address:", holder_address);
  return { holder_keypair, holder_address };
}


/**
 * Builds holder transaction for subname NFTs
 */
function buildHolderTransaction(subName: string, expirationMs: number, holderKeypair: Ed25519Keypair, gasBudget?: bigint) {
  console.log("Building holder transaction...");
  const tx = new Transaction();
  
  // Set gas budget if provided
  if (gasBudget) {
    tx.setGasBudget(gasBudget);
  }
  
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
  tx.transferObjects([subnameNft], project_signer);
  tx.transferObjects([extraSubnameNft], sender);
  
  console.log("Holder transaction built");
  return { tx, subnameNft, extraSubnameNft };
}

/**
 * Transfers SUI to cover gas costs to the specified recipient
 */
async function transferGasFunds(recipient: string, amount: bigint) {
  console.log(`Transferring ${amount} MIST (${Number(amount) / 1_000_000_000} SUI) to ${recipient} for gas...`);
  const tx = new Transaction();
  
  const [coin] = tx.splitCoins(tx.gas, [amount]);
  tx.transferObjects([coin], recipient);
  
  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showEffects: true }
  });
  
  await client.waitForTransaction({ digest: result.digest });
  console.log(`Gas funds transferred: ${result.digest}`);
  return result;
}

/**
 * Calculate the gas cost of a transaction
 */
async function calculateAdminTransactionGasCost(projectObjectId: string) {
  console.log("Building admin transaction...");
  const tx = new Transaction();
  
  const cap_object = tx.moveCall({
    target: `${VENDOR_PACKAGE_ID}::start_project::mint_creation_cap`,
    arguments: [
      tx.object(OFF_CHAIN_CAP),
      tx.object(projectObjectId),
      tx.pure.address(project_signer)
    ],
  });
  console.log(project_signer);
  const dr = await client.devInspectTransactionBlock({
    sender: offchain_sender,          // 0x + 64 hex
    transactionBlock: tx,           // pass the Transaction object directly
  });
  console.log(dr.effects.gasUsed);
  const totalCost = calculateTotalGas(dr.effects.gasUsed);
  return { totalCost };
}

/**
 * Calculate the gas cost of project signer's admin transaction (finish_creation_cap)
 */
async function calculateProjectSignerAdminGasCost(creationCapId: string, holderGasFund: bigint) {
  console.log("Calculating project signer admin transaction gas...");
  const tx = new Transaction();
  
  // Transfer gas funds to holder account (simulating the actual transaction)
  const [gasCoin] = tx.splitCoins(tx.gas, [holderGasFund]);
  tx.transferObjects([gasCoin], holder);
  
  // Finish creation cap
  tx.moveCall({
    target: `${VENDOR_PACKAGE_ID}::start_project::finish_creation_cap`,
    arguments: [tx.object(creationCapId)],
  });
  
  const dr = await client.devInspectTransactionBlock({
    sender: project_signer,
    transactionBlock: tx,
  });
  console.log("Project signer admin gas:", dr.effects.gasUsed);
  const totalCost = calculateTotalGas(dr.effects.gasUsed);
  return { totalCost };
}

/**
 * Calculate the gas cost of a holder transaction
 */
async function calculateHolderTransactionGasCost(subName: string, expirationMs: number) {
  console.log("Building holder transaction...");
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
  tx.transferObjects([subnameNft], project_signer);
  tx.transferObjects([extraSubnameNft], sender);
  console.log("Holder transaction built");
  const dr = await client.devInspectTransactionBlock({
    sender: holder,
    transactionBlock: tx,
  });
  console.log(dr.effects.gasUsed);
  const totalCost = calculateTotalGas(dr.effects.gasUsed);
  return { totalCost };
}

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
 * Main orchestration function
 */
const projectCreation = async () => {
  const subName = 'potato-03.foundry.sui';
  console.log('calculating gas cost...');
  const sample_project_id = '0x507e4383656d60e8a78a8cb56c78dbbc051044f444003416900f3d1a072d667d';
  const offchain_gas_cost = await calculateAdminTransactionGasCost(sample_project_id);
  const holder_gas_cost = await calculateHolderTransactionGasCost(subName, 1792963031733);
  const project_signer_admin_gas_cost = await calculateProjectSignerAdminGasCost(SAMPLE_CREATION_CAP_ID, holder_gas_cost.totalCost);

  // Add 60% buffer to gas costs to ensure enough (20% was insufficient)
  // Observed: actual costs can be 44% higher than devInspect estimates
  const offchain_gas_with_buffer = (offchain_gas_cost.totalCost * BigInt(160)) / BigInt(100);
  const holder_gas_with_buffer = (holder_gas_cost.totalCost * BigInt(160)) / BigInt(100);
  const project_signer_admin_gas_with_buffer = (project_signer_admin_gas_cost.totalCost * BigInt(160)) / BigInt(100);
  
  console.log('========================================');
  console.log('GAS ESTIMATION (with 60% safety buffer)');
  console.log('========================================');
  console.log('Offchain transaction gas:', offchain_gas_cost.totalCost.toString(), 'MIST');
  console.log('Offchain with 60% buffer:', offchain_gas_with_buffer.toString(), 'MIST');
  console.log('');
  console.log('Project Signer Admin gas:', project_signer_admin_gas_cost.totalCost.toString(), 'MIST');
  console.log('Project Signer with 60% buffer:', project_signer_admin_gas_with_buffer.toString(), 'MIST');
  console.log('');
  console.log('Holder transaction gas:', holder_gas_cost.totalCost.toString(), 'MIST');
  console.log('Holder with 60% buffer:', holder_gas_with_buffer.toString(), 'MIST');
  console.log('');
  console.log('Total gas needed:', (offchain_gas_with_buffer + project_signer_admin_gas_with_buffer + holder_gas_with_buffer).toString(), 'MIST');
  console.log('Total gas needed:', (Number(offchain_gas_with_buffer + project_signer_admin_gas_with_buffer + holder_gas_with_buffer) / 1_000_000_000).toFixed(4), 'SUI');
  console.log('========================================');
  
  console.log("Starting walrus upload...");
  const blob_objectId = await walrus_upload();
  console.log("Starting project creation...");
  console.log(blob_objectId);
  const expirationMs = 1792963031733;
  
  console.log("Project creation parameters:", {
    subName,
    expirationMs,
  });
  
  try {
    // Step 1: Create and execute project transaction (includes gas transfer to all accounts)
    console.log("=== Step 1: Creating Project & Funding All Accounts ===");
    const projectResult = await buildProjectTransaction(
      subName, 
      blob_objectId, 
      offchain_gas_with_buffer,
      project_signer_admin_gas_with_buffer,  // Fund project_signer for admin transaction
      holder_gas_with_buffer
    );
    
    const projectTxResult = await client.signAndExecuteTransaction({ 
      signer: keypair, 
      transaction: projectResult.tx,
      options: { showEffects: true, showObjectChanges: true }
    });
    await client.waitForTransaction({ digest: projectTxResult.digest });
    console.log("Project transaction executed:", projectTxResult.digest);
    
    // Extract project object ID from transaction result
    const createdObjects = projectTxResult.objectChanges?.filter(
      (change: any) => change.type === 'created'
    ) || [];
    
    // Find Project object, excluding ProjectCreationCap
    const projectObject = createdObjects.find(
      (change: any) => {
        const objectType = change.objectType || '';
        return objectType.includes('::ideation::Project') && 
               !objectType.includes('::ideation::ProjectCap');
      }
    );
    
    if (!projectObject || !('objectId' in projectObject)) {
      throw new Error('Failed to find created project object');
    }
    
    const projectObjectId = (projectObject as any).objectId;
    console.log("Project object ID:", projectObjectId);
    
    // Step 2: Offchain mints creation cap, then project_signer executes admin transaction
    console.log("=== Step 2: Admin Transactions (Mint Cap & Seal Approval) ===");
    const adminResult = await buildAdminTransaction(projectObjectId, offchain_gas_with_buffer, holder_gas_with_buffer);
    
    const adminTxResult = await client.signAndExecuteTransaction({ 
      signer: keypair_project_signer, 
      transaction: adminResult.new_tx,
      options: { showEffects: true }
    });
    await client.waitForTransaction({ digest: adminTxResult.digest });
    console.log("Admin transaction executed:", adminTxResult.digest);
    
    // Step 3: Create and execute holder transaction (subname NFTs)
    console.log("=== Step 3: Creating Subname NFTs ===");
    const holderResult = buildHolderTransaction(subName, expirationMs, adminResult.holder_keypair, holder_gas_with_buffer);
    
    const holderTxResult = await client.signAndExecuteTransaction({ 
      signer: adminResult.holder_keypair, 
      transaction: holderResult.tx,
      options: { showEffects: true }
    });
    await client.waitForTransaction({ digest: holderTxResult.digest });
    console.log("Holder transaction executed:", holderTxResult.digest);
    
    // Success!
    console.log('========================================');
    console.log('✅ PROJECT CREATION SUCCESSFUL');
    console.log('========================================');
    console.log('Project Object ID:', projectObjectId);
    console.log('Holder Address:', adminResult.holder_address);
    console.log('Sender Address:', sender);
    console.log('Project Signer Address:', project_signer);
    console.log('Offchain Address:', offchain_sender);
    console.log('Holder Address:', holder);
    console.log('========================================');
    
  } catch (error) {
    console.error('========================================');
    console.error('❌ PROJECT CREATION FAILED');
    console.error('========================================');
    console.error('Error details:', error);
    console.error('========================================');
    throw error;
  }
}
projectCreation().catch((e) => {
  console.error('✗ Fatal error:', e);
});
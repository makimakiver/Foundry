import { PinataSDK } from "pinata";

// Initialize Pinata SDK
const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: import.meta.env.VITE_PINATA_GATEWAY,
});

/**
 * Upload an image file to Pinata IPFS
 * @param file - The image file to upload
 * @returns The IPFS URL of the uploaded image
 */
export async function uploadImageToPinata(file: File): Promise<string> {
  try {
    console.log('📤 Uploading image to Pinata IPFS...', file.name);
    
    // Upload file to Pinata
    const upload = await pinata.upload.file(file);
    
    console.log('✅ Image uploaded successfully!');
    console.log('IPFS Hash:', (upload as any).IpfsHash || upload.cid);
    
    // Get the CID from the upload response
    const cid = (upload as any).IpfsHash || upload.cid;
    
    // Return the IPFS gateway URL
    const gatewayUrl = await pinata.gateways.createSignedURL({
      cid: cid,
      expires: 315360000, // 10 years in seconds
    });
    
    console.log('🌐 Gateway URL:', gatewayUrl);
    
    return gatewayUrl;
  } catch (error) {
    console.error('❌ Failed to upload image to Pinata:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload an image from a data URL to Pinata IPFS
 * @param dataUrl - The data URL of the image
 * @param filename - The filename to use
 * @returns The IPFS URL of the uploaded image
 */
export async function uploadImageFromDataUrl(dataUrl: string, filename: string = 'image.png'): Promise<string> {
  try {
    // Convert data URL to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // Convert Blob to File
    const file = new File([blob], filename, { type: blob.type });
    
    // Upload to Pinata
    return await uploadImageToPinata(file);
  } catch (error) {
    console.error('❌ Failed to upload image from data URL:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if Pinata is configured
 * @returns true if Pinata JWT is configured
 */
export function isPinataConfigured(): boolean {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  const gateway = import.meta.env.VITE_PINATA_GATEWAY;
  return !!jwt && !!gateway;
}

/**
 * Get configuration status message
 * @returns Configuration status message
 */
export function getPinataConfigStatus(): string {
  if (!import.meta.env.VITE_PINATA_JWT) {
    return 'Missing VITE_PINATA_JWT environment variable';
  }
  if (!import.meta.env.VITE_PINATA_GATEWAY) {
    return 'Missing VITE_PINATA_GATEWAY environment variable';
  }
  return 'Pinata is configured';
}


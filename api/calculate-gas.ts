// api/calculate-gas.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
/**
 * API Route Handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ 
    message: 'Hello from serverless!',
    timestamp: new Date().toISOString()
  });
}


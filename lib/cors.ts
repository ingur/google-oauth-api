import type { VercelResponse } from '@vercel/node';

export function setCORSHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function handleCORS(req: any, res: VercelResponse): boolean {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return true;
  }

  return false;
}
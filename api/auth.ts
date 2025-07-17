import type { VercelRequest, VercelResponse } from '@vercel/node';
import { encrypt } from '../lib/crypto';
import { createOAuthClient } from '../lib/oauth';
import { handleCORS } from '../lib/cors';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (handleCORS(req, res)) return;

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code required' });
  }

  const oauth2Client = createOAuthClient();

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to get tokens');
    }

    // Encrypt refresh token for secure storage
    const refreshToken = encrypt(tokens.refresh_token);

    return res.status(200).json({
      access_token: tokens.access_token,
      refresh_token: refreshToken,
      expires_in: tokens.expiry_date
        ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
        : 3600
    });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(400).json({
      error: 'Authorization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
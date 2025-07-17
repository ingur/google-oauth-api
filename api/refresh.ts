import type { VercelRequest, VercelResponse } from '@vercel/node';
import { decrypt } from '../lib/crypto';
import { createOAuthClient } from '../lib/oauth';
import { handleCORS } from '../lib/cors';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (handleCORS(req, res)) return;

  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  let decryptedRefreshToken: string;
  try {
    decryptedRefreshToken = decrypt(refresh_token);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid refresh token' });
  }

  const oauth2Client = createOAuthClient('postmessage');

  oauth2Client.setCredentials({
    refresh_token: decryptedRefreshToken
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();

    return res.status(200).json({
      access_token: credentials.access_token,
      expires_in: credentials.expiry_date
        ? Math.floor((credentials.expiry_date - Date.now()) / 1000)
        : 3600,
      token_type: 'Bearer'
    });
  } catch (error) {
    console.error('Token refresh failed:', error);
    return res.status(401).json({
      error: 'Invalid or expired refresh token'
    });
  }
}
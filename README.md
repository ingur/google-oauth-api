# google-oauth-api

Free and easy serverless Google OAuth 2.0 service with secure token management:
- Refresh tokens encrypted with AES-256-CBC
- Client secrets server-side only
- Stateless design
- CORS enabled

## Quick Start

1. Set environment variables:
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
ENCRYPTION_KEY=your-32-char-key
```

2. Deploy to Vercel:
```bash
vercel deploy
```

## Endpoints

### `POST /api/auth`
Exchange authorization code for tokens.

```json
// Request
{ "code": "auth_code_from_google" }

// Response
{
  "access_token": "ya29...",
  "refresh_token": "encrypted_token",
  "expires_in": 3600
}
```

### `POST /api/refresh`
Refresh expired access token.

```json
// Request
{ "refresh_token": "encrypted_token" }

// Response
{
  "access_token": "ya29...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

## Usage

```javascript
// 1. Redirect to Google OAuth
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: 'your-client-id',
  redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'https://www.googleapis.com/auth/drive.file',
  access_type: 'offline'
})}`;
window.location.href = authUrl;

// 2. Exchange code for tokens
const { access_token, refresh_token } = await fetch('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: urlParams.get('code') })
}).then(r => r.json());

// 3. Refresh when needed
const { access_token: newToken } = await fetch('/api/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh_token })
}).then(r => r.json());
```

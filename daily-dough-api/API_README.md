# Daily Dough API

Backend API for the Daily Dough budgeting app, built with Next.js App Router and Plaid integration.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Required variables:**

- `PLAID_CLIENT_ID` - Your Plaid client ID
- `PLAID_SECRET` - Your Plaid secret key
- `PLAID_ENV` - Environment (sandbox/development/production)
- `ENCRYPTION_KEY` - 32-byte base64 key for encrypting access tokens
- Database connection strings (see Vercel Postgres setup below)

### 3. Generate Encryption Key

```bash
openssl rand -base64 32
```

### 4. Database Setup

#### Option A: Vercel Postgres (Recommended for MVP)

1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the environment variables to your `.env.local`
4. Run the database schema:

```sql
CREATE TABLE IF NOT EXISTS user_items (
  user_id TEXT PRIMARY KEY,
  access_token_enc TEXT NOT NULL,
  institution_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Option B: Neon Postgres

1. Create account at [neon.tech](https://neon.tech)
2. Create a new database
3. Use the connection string in your `.env.local`

### 5. Plaid Setup

1. Create account at [plaid.com](https://plaid.com)
2. Get your Client ID and Secret from the dashboard
3. Enable the Transactions product
4. Add redirect URI: `daily-dough://plaid-oauth`

## API Endpoints

### Health Check

- `GET /api/health` - Server health status

### Plaid Integration

- `POST /api/plaid/link-token/create` - Create Plaid Link token
- `POST /api/plaid/item/public_token/exchange` - Exchange public token for access token
- `GET /api/plaid/transactions` - Fetch user transactions

## Development

```bash
npm run dev
```

Server runs on http://localhost:3000

Test the health endpoint: http://localhost:3000/api/health

## Deployment to Vercel

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

The API will be available at `https://your-app.vercel.app/api/`

## Security Notes

- Access tokens are encrypted before storage using AES-256-GCM
- All Plaid secrets stay server-side only
- Use HTTPS in production
- Rotate encryption keys periodically

## Next Steps

1. **Add webhook support** - Replace polling with real-time updates
2. **Upgrade to transactions/sync** - More efficient incremental sync
3. **Add user authentication** - Replace hardcoded user_id
4. **Add transaction categorization** - Your Bills + Ignored rules
5. **Add rate limiting** - Protect against abuse
6. **Add logging** - Monitor API usage and errors

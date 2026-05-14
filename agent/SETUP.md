# API Setup Guide

## 1. Tavily Search API Setup (Jimmy's Recommendation ✨)

**Why Tavily?** It's a search engine built specifically for AI agents like Jimmy. Returns "AI-ready" clean text from the web.

### Get Your API Key:

1. Go to [https://tavily.com](https://tavily.com)
2. Sign up for a free account
3. Navigate to API Keys in your dashboard
4. Copy your API key (starts with `tvly-...`)

### Pricing:

- **FREE TIER**: 1,000 searches per month (perfect for Jimmy!)
- **Paid Plans**: Start at $100/month for 10,000 searches if you need more
- Real-time web access included
- No credit card required for free tier

### Why This is Better Than Perplexity:

- ✅ Free tier (1,000 searches vs Perplexity's paid-only)
- ✅ Built for AI agents (clean, structured data)
- ✅ You already have access to it
- ✅ Combined with cheap OpenRouter models = virtually free operation

## 2. OpenRouter Setup

OpenRouter provides access to multiple LLM providers through one API. Jimmy uses this for analyzing Tavily's search results.

### Get Your API Key:

1. Go to [https://openrouter.ai](https://openrouter.ai)
2. Sign up with your account
3. Go to [Keys](https://openrouter.ai/keys) in settings
4. Create a new API key
5. Copy the key (starts with `sk-or-...`)

### Pricing:

Jimmy uses **ultra-cheap models** to keep costs minimal:

- **Gemini 2.0 Flash (free)**: $0 per 1M tokens (recommended!)
- **Gemini 1.5 Flash**: ~$0.075 per 1M input tokens
- **Mixtral 8x7B**: ~$0.24 per 1M tokens
- **Claude 3.5 Sonnet**: ~$3 per 1M tokens (if you need premium analysis)

### Recommended Model for Jimmy:

```bash
# In your .env file:
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
```

This model is **FREE** and perfect for analyzing Tavily's search results!

[Full model list](https://openrouter.ai/models)

## 3. PostgreSQL Setup

You'll need a Postgres database. Options:

### Option A: Railway (Recommended for Pi)

1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the connection string from "Connect" tab
4. Format: `postgresql://user:pass@host:port/dbname`

### Option B: Local Postgres

```bash
# Install on Mac
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb jimmy

# Connection string
postgresql://localhost:5432/jimmy
```

### Option C: Supabase (Free tier available)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from Settings → Database
4. Use "Transaction" mode connection string

## 4. Configure Environment

Copy the example file:

```bash
cp .env.example .env
```

Edit `.env` with your keys:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/jimmy

# Tavily Search API (FREE tier: 1,000 searches/month)
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxx

# OpenRouter API (for cheap LLM analysis)
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxx

# Optional: Override default model (default is FREE Gemini Flash)
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free

# Scheduler (set to "true" to enable automated research runs every 6 hours)
ENABLE_SCHEDULER=false
RUN_ANALYSIS_ON_STARTUP=false
```

## 5. Initialize Database

Run migrations to create tables:

```bash
npm run db:generate
npm run db:migrate
```

## 6. Test the Setup

Run Jimmy:

```bash
npm run dev
```

You should see:

```
🚀 Jimmy - Senior Market Strategist & Artisan Researcher is working...
📡 Step 1: Searching web with Tavily...
✓ Tavily found 10 sources
🤖 Step 2: Analyzing with OpenRouter (Gemini Flash)...
✅ Saved X opportunities to Postgres via Drizzle!
💰 Cost: Tavily (free tier), OpenRouter (~$0.001 per research run)
```

## Jimmy's Two-Step Research Workflow

**Step 1: Tavily Search (FREE)**

- Jimmy sends a search query to Tavily
- Tavily searches the web and returns AI-ready clean text from 10+ sources
- Cost: FREE (1,000 searches/month)

**Step 2: OpenRouter Analysis (Nearly FREE)**

- Jimmy sends Tavily's results to OpenRouter (Gemini Flash)
- The LLM analyzes the data and structures it into market opportunities
- Cost: ~$0.001 per run (using free Gemini model)

**Result: Virtually free market research with real-time data!**

## Cost Estimation

For automated 6-hour research runs (4x per day):

**Monthly estimate:**

- Tavily API: **$0** (free tier covers 1,000 searches, you'd use ~120/month)
- OpenRouter: **~$0.12** (using free Gemini model, ~$0.001 per run × 120 runs)
- Database: $5-10 (Railway/Supabase)
- **Total: ~$5-10/month** (just database costs!)

Compare to Perplexity approach: ~$15-25/month

## Troubleshooting

### "Cannot find module" errors

```bash
npm install
```

### Database connection errors

- Check your DATABASE_URL format
- Ensure database is running
- Test connection: `psql $DATABASE_URL`

### API errors

- Verify API keys are correct
- Check you have credits/billing enabled (Tavily free tier doesn't need billing)
- Review rate limits for your plan

### Tavily Search Tips

- Tavily works best with keyword-rich queries
- The agent already has an optimized `tavilyQuery` field
- Free tier: 1,000 searches/month is plenty for Jimmy
- Check usage at [tavily.com/dashboard](https://tavily.com/dashboard)

### OpenRouter Model Selection

Default model (Gemini 2.0 Flash) is FREE and fast. If you need better analysis:

- `google/gemini-1.5-flash` - $0.075 per 1M tokens (still very cheap)
- `anthropic/claude-3.5-sonnet` - $3 per 1M tokens (premium quality)

Change in `.env`:

```bash
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```

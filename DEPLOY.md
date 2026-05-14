# Market Analyzer - Deploying to Raspberry Pi

## Quick Start on Pi

1. **Clone/Pull the repo:**

   ```bash
   cd ~/market-analyzer
   git pull origin main
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   nano .env
   # Add your API keys
   ```

3. **Start with Docker Compose:**

   ```bash
   # Start all services (postgres, adminer, agent)
   docker compose up -d

   # View logs
   docker compose logs -f agent

   # Stop everything
   docker compose down
   ```

4. **Access Adminer (database UI):**
   - Open: `http://raspberrypi:8081` (or `http://100.119.12.61:8081`)
   - Server: `postgres`
   - Username: `market_analyzer`
   - Password: `market_analyzer_dev_password`
   - Database: `market_analyzer`

## Enable 24/7 Scheduler

To run automated research every 6 hours:

```bash
# Edit .env
nano .env

# Change to:
ENABLE_SCHEDULER=true

# Restart agent
docker compose restart agent
```

## Useful Commands

```bash
# View agent logs
docker compose logs -f agent

# Restart just the agent
docker compose restart agent

# Rebuild after code changes
docker compose up -d --build agent

# Run a one-time search
docker compose exec agent npm run dev

# Check database
docker compose exec postgres psql -U market_analyzer -d market_analyzer -c "SELECT * FROM market_opportunities;"
```

## Cost

- Tavily: FREE (1,000 searches/month)
- OpenRouter: FREE with certain models
- Database: FREE (local on Pi)
- Total: $0/month for normal usage! 🎉

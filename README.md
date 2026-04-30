# Intelli-Crypto

Foundation for a real-time crypto intelligence and arbitrage platform.

## Project Structure

```text
backend/
  manage.py
  requirements.txt
  intelli_crypto/
    asgi.py
    settings.py
    urls.py
  arbitrage/
    consumers.py
    routing.py
    services/
      arbitrage_engine.py
      crypto_ai.py
    management/commands/
      run_arbitrage_engine.py
src/
  components/
  pages/
  state/
docker-compose.yml
Dockerfile.backend
```

## Frontend Setup

```bash
npm install
npm run dev
```

Local app:

```text
http://localhost:5173/
```

The current frontend includes:

- Landing page with a 3D Market Galaxy.
- Registration with username, email, password, expertise level, jurisdiction, base currency, risk profile, max trade size, exchange coverage, 2FA, and risk disclosure.
- Login and protected application shell.
- Dashboard, AI Insights, Buy / Sell, History, Logs, and User Settings pages.
- AI suggestion cards, prediction cards, and risk checks prepared for backend `CryptoAI` integration.
- Market Live page with Demo and Live modes, public exchange quote fetching, fee-aware route scoring, and fallback demo quotes.
- Expanded settings for exchange coverage, fee/slippage model, refresh interval, paper trading, smart alerts, anomaly detection, whale watch, and execution safety.
- Live Agent chatbot that answers app and market questions from current quotes, arbitrage routes, AI predictions, exchange coverage, logs, history, and user settings.

## Backend Environment Setup

```bash
cp backend/.env.example backend/.env
docker compose build
docker compose up db redis
docker compose run --rm backend python manage.py migrate
```

Run the real-time arbitrage engine:

```bash
docker compose run --rm backend python manage.py run_arbitrage_engine
```

Optional exchange override:

```bash
docker compose run --rm backend python manage.py run_arbitrage_engine --exchanges binance,kraken,coinbase,okx,bybit,kucoin
```

WebSocket stream:

```text
ws://localhost:8000/ws/arbitrage/
```

## Notes

- Exchange calls use `ccxt.async_support` and `asyncio.gather` to avoid blocking.
- WebSocket publishing uses Django Channels and Redis.
- The first engine supports `BTC/USDT` and `ETH/USDT` across Binance, Kraken, and Coinbase.

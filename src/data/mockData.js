export const marketCoins = [
  { symbol: "BTC", name: "Bitcoin", price: 64250.44, change: 2.8, volume: 28400000000, x: -5.4, z: -1.2 },
  { symbol: "ETH", name: "Ethereum", price: 3168.9, change: 1.2, volume: 14200000000, x: -2.4, z: 2.1 },
  { symbol: "SOL", name: "Solana", price: 148.32, change: 5.1, volume: 4800000000, x: 0.8, z: -2.7 },
  { symbol: "XRP", name: "XRP", price: 0.61, change: -1.9, volume: 2100000000, x: 3.3, z: 1.6 },
  { symbol: "DOGE", name: "Dogecoin", price: 0.12, change: -3.4, volume: 1800000000, x: 5.7, z: -0.4 },
  { symbol: "LINK", name: "Chainlink", price: 14.4, change: 0.7, volume: 860000000, x: 1.6, z: 3.8 },
];

export const exchangeCatalog = [
  { name: "Binance", region: "Global", status: "Online", latency: 72, fee: "0.10%", liveSupport: true },
  { name: "Kraken", region: "US/EU", status: "Online", latency: 96, fee: "0.16%", liveSupport: true },
  { name: "Coinbase", region: "US", status: "Online", latency: 104, fee: "0.25%", liveSupport: true },
  { name: "OKX", region: "Global", status: "Demo", latency: 88, fee: "0.08%", liveSupport: false },
  { name: "Bybit", region: "Global", status: "Demo", latency: 91, fee: "0.10%", liveSupport: false },
  { name: "KuCoin", region: "Global", status: "Demo", latency: 111, fee: "0.10%", liveSupport: false },
  { name: "Bitstamp", region: "EU", status: "Demo", latency: 130, fee: "0.30%", liveSupport: false },
  { name: "Gemini", region: "US", status: "Demo", latency: 126, fee: "0.20%", liveSupport: false },
];

export const demoExchangeQuotes = [
  { exchange: "Binance", pair: "BTC/USDT", bid: 64271.2, ask: 64284.9, volume: 28400000000, latency: 72 },
  { exchange: "Kraken", pair: "BTC/USDT", bid: 64308.6, ask: 64238.7, volume: 9800000000, latency: 96 },
  { exchange: "Coinbase", pair: "BTC/USDT", bid: 64292.4, ask: 64305.1, volume: 11200000000, latency: 104 },
  { exchange: "OKX", pair: "BTC/USDT", bid: 64288.8, ask: 64299.3, volume: 15600000000, latency: 88 },
  { exchange: "Bybit", pair: "BTC/USDT", bid: 64279.5, ask: 64293.4, volume: 12100000000, latency: 91 },
  { exchange: "KuCoin", pair: "BTC/USDT", bid: 64252.8, ask: 64269.2, volume: 4200000000, latency: 111 },
  { exchange: "Binance", pair: "ETH/USDT", bid: 3172.8, ask: 3173.7, volume: 14200000000, latency: 74 },
  { exchange: "Kraken", pair: "ETH/USDT", bid: 3181.2, ask: 3170.9, volume: 3800000000, latency: 101 },
  { exchange: "Coinbase", pair: "ETH/USDT", bid: 3174.4, ask: 3175.6, volume: 5200000000, latency: 108 },
  { exchange: "OKX", pair: "ETH/USDT", bid: 3175.8, ask: 3176.6, volume: 7600000000, latency: 90 },
  { exchange: "Bybit", pair: "ETH/USDT", bid: 3173.9, ask: 3175.2, volume: 6100000000, latency: 92 },
  { exchange: "KuCoin", pair: "ETH/USDT", bid: 3169.1, ask: 3171.4, volume: 2100000000, latency: 113 },
];

export const arbitrageRows = [
  { pair: "BTC/USDT", buy: "Kraken", sell: "Binance", spread: "0.42%", status: "Executable", latency: "83ms", aiAction: "Stage", confidence: 84 },
  { pair: "ETH/USDT", buy: "Coinbase", sell: "Kraken", spread: "0.31%", status: "Watch", latency: "118ms", aiAction: "Wait", confidence: 67 },
  { pair: "SOL/USDT", buy: "Binance", sell: "Coinbase", spread: "0.19%", status: "Watch", latency: "96ms", aiAction: "Reduce size", confidence: 61 },
  { pair: "LINK/USDT", buy: "Kraken", sell: "Coinbase", spread: "0.11%", status: "Thin book", latency: "142ms", aiAction: "Avoid", confidence: 76 },
];

export const historyRows = [
  { id: "ARB-1048", time: "10:42:11", pair: "BTC/USDT", action: "BUY Kraken / SELL Binance", pnl: "+$184.20", result: "Closed" },
  { id: "ARB-1047", time: "10:31:09", pair: "ETH/USDT", action: "BUY Coinbase / SELL Kraken", pnl: "+$73.08", result: "Closed" },
  { id: "ARB-1046", time: "10:20:44", pair: "SOL/USDT", action: "BUY Binance / SELL Coinbase", pnl: "-$18.51", result: "Stopped" },
  { id: "ARB-1045", time: "10:02:35", pair: "BTC/USDT", action: "BUY Coinbase / SELL Kraken", pnl: "+$129.70", result: "Closed" },
];

export const logRows = [
  { level: "INFO", time: "10:43:01", source: "ArbitrageEngine", message: "Published 4 active cross-exchange spreads." },
  { level: "WARN", time: "10:42:58", source: "RiskGuard", message: "SOL order size reduced due to thin liquidity." },
  { level: "INFO", time: "10:42:51", source: "CryptoAI", message: "BTC signal HOLD with 68 confidence." },
  { level: "ERROR", time: "10:42:33", source: "CoinbaseAdapter", message: "Ticker retry succeeded after transient timeout." },
];

export const aiPredictions = [
  {
    symbol: "BTC/USDT",
    action: "HOLD",
    confidence: 68,
    targetPrice: 65180,
    horizon: "4h",
    rsi: 58,
    meanReversion: "Price is near the 100-point mean, so edge is mostly from spread quality.",
    suggestion: "Only execute if net spread remains above fees by 0.18% after slippage.",
  },
  {
    symbol: "ETH/USDT",
    action: "BUY",
    confidence: 74,
    targetPrice: 3240,
    horizon: "6h",
    rsi: 34,
    meanReversion: "ETH is below its short-term mean with RSI near oversold territory.",
    suggestion: "Prefer staged entries and pair with Kraken sell-side liquidity checks.",
  },
  {
    symbol: "SOL/USDT",
    action: "SELL",
    confidence: 71,
    targetPrice: 141.8,
    horizon: "3h",
    rsi: 69,
    meanReversion: "Momentum looks extended above the mean after a sharp volume burst.",
    suggestion: "Reduce position size and require stronger confirmation before chasing.",
  },
];

export const aiSuggestions = [
  {
    title: "Prioritize BTC route",
    severity: "High",
    category: "Arbitrage",
    text: "BTC/USDT has the best spread-to-latency score. Stage the order, then re-check net spread after fees before execution.",
  },
  {
    title: "Throttle SOL exposure",
    severity: "Medium",
    category: "Risk",
    text: "SOL volatility is elevated and route depth is thin. Keep max order size below 35% of your current per-trade limit.",
  },
  {
    title: "Watch ETH mean reversion",
    severity: "Medium",
    category: "Prediction",
    text: "ETH is approaching an AI BUY zone. Confirmation improves if RSI stays below 38 while spread remains positive.",
  },
  {
    title: "Enable fee-aware mode",
    severity: "Low",
    category: "Settings",
    text: "Your current profile should subtract estimated maker/taker fees before marking an opportunity executable.",
  },
  {
    title: "Switch to live watchlist",
    severity: "Low",
    category: "Settings",
    text: "Use Live mode for BTC and ETH monitoring, while keeping paper trading on until exchange credentials and risk limits are verified.",
  },
  {
    title: "Detect stale exchange prices",
    severity: "Medium",
    category: "Risk",
    text: "Flag any venue whose quote latency is 2x above the median before trusting a cross-exchange spread.",
  },
];

export const intelligentFeatureIdeas = [
  { name: "Fee-Aware Arbitrage Score", impact: "High", detail: "Ranks spreads by fees, slippage, latency, and volume instead of raw percentage." },
  { name: "Whale Flow Watch", impact: "Medium", detail: "Highlights abnormal volume bursts that can invalidate mean-reversion signals." },
  { name: "Stale Quote Detector", impact: "High", detail: "Blocks opportunities when one exchange price is delayed or outside normal drift." },
  { name: "Paper-to-Live Checklist", impact: "High", detail: "Requires API health, 2FA, risk limits, fee model, and circuit breaker before live execution." },
  { name: "Strategy Replay", impact: "Medium", detail: "Replays historic opportunities to compare AI suggestions against realized spreads." },
  { name: "Smart Alert Bundles", impact: "Medium", detail: "Groups noisy market events into fewer action-ready alerts for BTC, ETH, and selected exchanges." },
];

export const aiRiskChecks = [
  { label: "Fee-adjusted spread", value: "PASS", detail: "Best route remains positive after 0.16% estimated fees." },
  { label: "Liquidity depth", value: "WATCH", detail: "SOL and LINK books need smaller staged orders." },
  { label: "Volatility guard", value: "PASS", detail: "Current portfolio exposure is within Balanced profile limits." },
  { label: "Latency quality", value: "PASS", detail: "Median exchange response is under 120ms." },
];

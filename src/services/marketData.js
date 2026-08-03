import { demoExchangeQuotes } from "../data/mockData.js";
import { apiRequest } from "./api.js";

const exchangeNames = {
  binance: "Binance",
  kraken: "Kraken",
  coinbase: "Coinbase",
  okx: "OKX",
  bybit: "Bybit",
  kucoin: "KuCoin",
};

const liveEndpoints = [
  {
    exchange: "Binance",
    pair: "BTC/USDT",
    url: "https://api.binance.com/api/v3/ticker/bookTicker?symbol=BTCUSDT",
    map: (data) => ({ bid: Number(data.bidPrice), ask: Number(data.askPrice) }),
  },
  {
    exchange: "Binance",
    pair: "ETH/USDT",
    url: "https://api.binance.com/api/v3/ticker/bookTicker?symbol=ETHUSDT",
    map: (data) => ({ bid: Number(data.bidPrice), ask: Number(data.askPrice) }),
  },
  {
    exchange: "Kraken",
    pair: "BTC/USDT",
    url: "https://api.kraken.com/0/public/Ticker?pair=XBTUSDT",
    map: (data) => ({ bid: Number(data.result[Object.keys(data.result)[0]].b[0]), ask: Number(data.result[Object.keys(data.result)[0]].a[0]) }),
  },
  {
    exchange: "Kraken",
    pair: "ETH/USDT",
    url: "https://api.kraken.com/0/public/Ticker?pair=ETHUSDT",
    map: (data) => ({ bid: Number(data.result[Object.keys(data.result)[0]].b[0]), ask: Number(data.result[Object.keys(data.result)[0]].a[0]) }),
  },
  {
    exchange: "Coinbase",
    pair: "BTC/USDT",
    url: "https://api.exchange.coinbase.com/products/BTC-USDT/ticker",
    map: (data) => ({ bid: Number(data.bid), ask: Number(data.ask) }),
  },
  {
    exchange: "Coinbase",
    pair: "ETH/USDT",
    url: "https://api.exchange.coinbase.com/products/ETH-USDT/ticker",
    map: (data) => ({ bid: Number(data.bid), ask: Number(data.ask) }),
  },
];

export async function fetchMarketQuotes({ mode, enabledExchanges }) {
  if (mode !== "Live") {
    return withScores(demoExchangeQuotes.filter((quote) => enabledExchanges.includes(quote.exchange)), "Demo");
  }

  try {
    const backendQuotes = await fetchBackendQuotes(enabledExchanges);
    if (backendQuotes.length) {
      return withScores(backendQuotes, "Live · CCXT backend");
    }
  } catch {
    // The public browser adapters below keep Live mode useful if Django is offline.
  }

  const startedAt = performance.now();
  const responses = await Promise.allSettled(
    liveEndpoints
      .filter((endpoint) => enabledExchanges.includes(endpoint.exchange))
      .map(async (endpoint) => {
        const response = await fetch(endpoint.url, { headers: { Accept: "application/json" } });
        if (!response.ok) {
          throw new Error(`${endpoint.exchange} ${endpoint.pair} failed`);
        }
        const data = await response.json();
        const mapped = endpoint.map(data);
        return {
          exchange: endpoint.exchange,
          pair: endpoint.pair,
          bid: mapped.bid,
          ask: mapped.ask,
          volume: null,
          latency: Math.round(performance.now() - startedAt),
        };
      })
  );

  const liveQuotes = responses
    .filter((response) => response.status === "fulfilled")
    .map((response) => response.value)
    .filter((quote) => Number.isFinite(quote.bid) && Number.isFinite(quote.ask));

  const fallbackQuotes = demoExchangeQuotes.filter(
    (quote) =>
      enabledExchanges.includes(quote.exchange) &&
      !liveQuotes.some((liveQuote) => liveQuote.exchange === quote.exchange && liveQuote.pair === quote.pair)
  );

  return withScores([...liveQuotes, ...fallbackQuotes], liveQuotes.length ? "Live + fallback" : "Demo fallback");
}

async function fetchBackendQuotes(enabledExchanges) {
  const exchangeIds = enabledExchanges.map((name) => name.toLowerCase()).join(",");
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 12000);
  try {
    const startedAt = performance.now();
    const payload = await apiRequest(`/market/snapshot/?exchanges=${encodeURIComponent(exchangeIds)}`, {
      signal: controller.signal,
    });
    const latency = Math.round(performance.now() - startedAt);
    return (payload.tickers || [])
      .filter((ticker) => Number.isFinite(ticker.bid) && Number.isFinite(ticker.ask))
      .map((ticker) => ({
        exchange: exchangeNames[ticker.exchange] || ticker.exchange,
        pair: ticker.symbol,
        bid: Number(ticker.bid),
        ask: Number(ticker.ask),
        volume: ticker.quote_volume,
        change: ticker.percentage,
        latency,
      }));
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function findArbitrageOpportunities(quotes, settings = {}) {
  const makerFee = Number(settings.makerFee || 0.08);
  const takerFee = Number(settings.takerFee || 0.1);
  const slippage = Number(settings.slippageBuffer || 0.12);
  const minNetSpread = Number(settings.minNetSpread || 0.18);
  const totalCostPct = makerFee + takerFee + slippage;

  const byPair = quotes.reduce((map, quote) => {
    map[quote.pair] = [...(map[quote.pair] || []), quote];
    return map;
  }, {});

  return Object.entries(byPair)
    .flatMap(([pair, pairQuotes]) =>
      pairQuotes.flatMap((buySide) =>
        pairQuotes
          .filter((sellSide) => sellSide.exchange !== buySide.exchange && buySide.ask < sellSide.bid)
          .map((sellSide) => {
            const grossSpreadPct = ((sellSide.bid - buySide.ask) / buySide.ask) * 100;
            const netSpreadPct = grossSpreadPct - totalCostPct;
            const latencyPenalty = Math.max(buySide.latency, sellSide.latency) / 20;
            const score = Math.max(0, Math.round(netSpreadPct * 120 + 75 - latencyPenalty));
            return {
              pair,
              buy: buySide.exchange,
              sell: sellSide.exchange,
              buyAsk: buySide.ask,
              sellBid: sellSide.bid,
              grossSpreadPct,
              netSpreadPct,
              score,
              status: netSpreadPct >= minNetSpread ? "Executable" : "Watch",
              suggestion: netSpreadPct >= minNetSpread ? "Stage paper trade" : "Wait for wider net spread",
            };
          })
      )
    )
    .sort((a, b) => b.score - a.score);
}

function withScores(quotes, source) {
  return quotes.map((quote) => ({
    ...quote,
    source,
    mid: (quote.bid + quote.ask) / 2,
    updatedAt: new Date().toLocaleTimeString(),
  }));
}

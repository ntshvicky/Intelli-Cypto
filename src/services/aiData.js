import { aiPredictions as demoPredictions } from "../data/mockData.js";
import { apiRequest } from "./api.js";

export async function fetchAIPredictions(mode) {
  if (mode !== "Live") {
    return { predictions: demoPredictions, source: "Demo model" };
  }

  const payload = await apiRequest("/ai/predictions/?exchange=kraken");
  const predictions = (payload.predictions || []).map((item) => ({
    symbol: item.symbol,
    action: item.action,
    confidence: item.confidence,
    targetPrice: Number(item.target_price),
    horizon: item.horizon,
    rsi: item.rsi,
    meanReversion: `Computed from 100 real ${item.horizon.split(" · ")[0]} closing prices on ${payload.source}.`,
    suggestion: item.action === "BUY"
      ? "Price and RSI are below the model band; validate liquidity before staging a paper entry."
      : item.action === "SELL"
        ? "Price and RSI are above the model band; reduce exposure or wait for reversion."
        : "Price remains inside the model band; prioritize fee-adjusted spread quality.",
  }));
  if (!predictions.length) {
    throw new Error("The live model did not receive enough exchange candles.");
  }
  return { predictions, source: `${payload.source} · 100 live candles` };
}

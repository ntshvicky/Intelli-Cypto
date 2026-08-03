import {
  aiPredictions,
  aiRiskChecks,
  aiSuggestions,
  exchangeCatalog,
  historyRows,
  intelligentFeatureIdeas,
  logRows,
  marketCoins,
} from "../data/mockData.js";

export const starterPrompts = [
  "What is the best arbitrage opportunity right now?",
  "Should I switch to live mode?",
  "Which exchanges are healthy?",
  "What risk settings should I change?",
  "Explain BTC and ETH signals.",
  "What features should we build next?",
];

export function buildAgentContext({ user, quotes, opportunities, source, status, mode, predictions, history, logs }) {
  return {
    user,
    quotes,
    opportunities,
    source,
    status,
    mode,
    exchanges: exchangeCatalog,
    coins: marketCoins,
    predictions: predictions ?? aiPredictions,
    suggestions: aiSuggestions,
    riskChecks: aiRiskChecks,
    featureIdeas: intelligentFeatureIdeas,
    history: history ?? historyRows,
    logs: logs ?? logRows,
    generatedAt: new Date().toLocaleTimeString(),
  };
}

export function askLiveAgent(question, context) {
  const prompt = question.trim().toLowerCase();
  const topOpportunity = context.opportunities[0];
  const enabledExchanges = context.exchanges.filter((exchange) => context.user.exchanges.includes(exchange.name));
  const liveEnabled = context.mode === "Live";
  const bestPrediction = [...context.predictions].sort((a, b) => b.confidence - a.confidence)[0] || null;

  if (!question.trim()) {
    return agentResponse("Ask me about arbitrage, exchange health, AI signals, risk settings, or app features.", [
      "I can inspect live/demo quotes, route scores, predictions, logs, settings, and enabled exchanges.",
    ]);
  }

  if (includesAny(prompt, ["best", "arbitrage", "opportunity", "spread", "route"])) {
    if (!topOpportunity) {
      return agentResponse("No executable spread is visible from the current quote set.", [
        `Mode: ${context.mode}. Source: ${context.source}.`,
        "Keep paper trading enabled and wait for a wider fee-adjusted spread.",
      ], ["quotes", "opportunities", "fee model"]);
    }

    return agentResponse(
      `${topOpportunity.pair} is currently the strongest route: buy on ${topOpportunity.buy}, sell on ${topOpportunity.sell}.`,
      [
        `Gross spread: ${topOpportunity.grossSpreadPct.toFixed(3)}%. Net spread after your fee/slippage model: ${topOpportunity.netSpreadPct.toFixed(3)}%.`,
        `AI route score: ${topOpportunity.score}. Status: ${topOpportunity.status}.`,
        topOpportunity.netSpreadPct > Number(context.user.minNetSpread || 0.18)
          ? "Recommendation: stage this in paper mode first, then re-check quote freshness before execution."
          : "Recommendation: watch it, but do not execute until the net spread clears your minimum threshold.",
      ],
      ["quote matrix", "fee-aware route ranking", "user settings"]
    );
  }

  if (includesAny(prompt, ["live", "demo", "mode", "real data", "real-time"])) {
    return agentResponse(
      liveEnabled ? "Live mode is enabled with demo fallback protection." : "Demo mode is enabled, which is safest for testing workflows.",
      [
        `Current source: ${context.source}. Data status: ${context.status}. Refresh interval: ${context.user.refreshInterval}s.`,
        "Live mode uses public endpoints where available and falls back to demo quotes when an exchange blocks browser access.",
        context.user.paperTrading
          ? "Paper trading is on, so live data can be inspected without placing real orders."
          : "Paper trading is off. Keep manual approval and circuit-breaker controls enabled before real execution.",
      ],
      ["market data mode", "settings", "exchange adapters"]
    );
  }

  if (includesAny(prompt, ["exchange", "venue", "healthy", "health", "latency", "kraken", "binance", "coinbase", "okx", "bybit", "kucoin"])) {
    const healthLines = enabledExchanges.map((exchange) => {
      const quoteCount = context.quotes.filter((quote) => quote.exchange === exchange.name).length;
      return `${exchange.name}: ${exchange.status}, ${exchange.latency}ms baseline, ${quoteCount} active quotes, ${exchange.liveSupport ? "live API" : "demo adapter"}.`;
    });

    return agentResponse(
      `${enabledExchanges.length} exchanges are enabled in your workspace.`,
      healthLines,
      ["exchange coverage", "quote matrix", "settings"]
    );
  }

  if (includesAny(prompt, ["risk", "setting", "settings", "fee", "slippage", "safe", "safety", "limit"])) {
    const riskAdvice = [
      `Risk profile: ${context.user.riskProfile}. Max trade size: ${context.user.baseCurrency} ${Number(context.user.maxTradeSize || 0).toLocaleString()}.`,
      `Fee model: maker ${context.user.makerFee}%, taker ${context.user.takerFee}%, slippage buffer ${context.user.slippageBuffer}%, minimum net spread ${context.user.minNetSpread}%.`,
      context.user.autoExecute
        ? "Auto-execute is armed. For a demo product, I recommend disabling it until API keys, kill switches, and venue-specific order limits exist."
        : "Auto-execute is off, which is the correct default while strategy behavior is being validated.",
      context.user.anomalyDetection ? "Anomaly detection is enabled; keep it on for stale quote and volatility guardrails." : "Enable anomaly detection to catch stale quotes and sudden volatility.",
    ];

    return agentResponse("Your risk posture is suitable for paper trading, with a few controls worth watching.", riskAdvice, [
      "settings",
      "risk checks",
      "execution controls",
    ]);
  }

  if (includesAny(prompt, ["btc", "eth", "signal", "prediction", "buy", "sell", "hold", "rsi", "target"])) {
    if (!bestPrediction) {
      return agentResponse("Live AI predictions are not available yet.", [
        "The model needs 100 exchange candles before it can calculate RSI and mean reversion.",
        "Check the AI Insights screen again after the live candle request completes.",
      ], ["live candle model"]);
    }
    const lines = context.predictions.map(
      (prediction) =>
        `${prediction.symbol}: ${prediction.action} with ${prediction.confidence}% confidence, RSI ${prediction.rsi}, target $${prediction.targetPrice.toLocaleString()} over ${prediction.horizon}. ${prediction.suggestion}`
    );

    return agentResponse(`${bestPrediction.symbol} has the strongest current AI conviction: ${bestPrediction.action}.`, lines, [
      "CryptoAI predictions",
      "RSI",
      "mean reversion",
    ]);
  }

  if (includesAny(prompt, ["feature", "build", "improve", "suggest", "roadmap", "unique", "intelligent"])) {
    const lines = context.featureIdeas.map((idea) => `${idea.name} (${idea.impact} impact): ${idea.detail}`);
    return agentResponse("The highest-value next build is the Paper-to-Live Checklist plus stale quote detection.", lines, [
      "feature suggestions",
      "risk model",
      "execution readiness",
    ]);
  }

  if (includesAny(prompt, ["history", "pnl", "profit", "loss", "trade", "logs", "errors"])) {
    const pnlLines = context.history.map((item) => `${item.id}: ${item.pair}, ${item.pnl}, ${item.result}, ${item.action}.`);
    const logLines = context.logs.slice(0, 3).map((item) => `${item.level} ${item.time} ${item.source}: ${item.message}`);
    return agentResponse(
      context.history.length || context.logs.length ? "Here is the activity currently recorded for this workspace." : "No activity has been recorded for this workspace yet.",
      [...pnlLines, ...logLines, ...(!pnlLines.length && !logLines.length ? ["Place or stage a paper trade to create a MySQL audit record."] : [])],
      ["trade history", "system logs"]
    );
  }

  return agentResponse("Here is the current market cockpit summary.", [
    topOpportunity
      ? `Best route: ${topOpportunity.pair}, buy ${topOpportunity.buy}, sell ${topOpportunity.sell}, net ${topOpportunity.netSpreadPct.toFixed(3)}%, score ${topOpportunity.score}.`
      : "No current fee-adjusted opportunity is available.",
    `Data mode: ${context.mode}. Source: ${context.source}. Enabled exchanges: ${context.user.exchanges.join(", ")}.`,
    bestPrediction ? `Top AI signal: ${bestPrediction.symbol} ${bestPrediction.action}, ${bestPrediction.confidence}% confidence.` : "Live AI candles are still loading.",
    "Ask about arbitrage, exchange health, live mode, risk settings, predictions, logs, or next features for a narrower answer.",
  ], ["market summary", "settings", "AI predictions"]);
}

function agentResponse(title, bullets, sources = []) {
  return {
    id: crypto.randomUUID(),
    role: "agent",
    title,
    bullets,
    sources,
    createdAt: new Date().toLocaleTimeString(),
  };
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

import { Activity, Brain, RadioTower } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AISuggestionCard from "../components/AISuggestionCard.jsx";
import MarketGalaxy from "../components/MarketGalaxy.jsx";
import MetricCard from "../components/MetricCard.jsx";
import Panel from "../components/Panel.jsx";
import { aiSuggestions, arbitrageRows, marketCoins } from "../data/mockData.js";
import { useMarketData } from "../hooks/useMarketData.js";
import { fetchTradeHistory } from "../services/activityStore.js";
import { useAuth } from "../state/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const { quotes, opportunities, source, status, mode } = useMarketData();
  const topOpportunity = opportunities[0];
  const [paperPnl, setPaperPnl] = useState({ amount: 368.47, count: 12 });
  const routes = opportunities.length ? opportunities.slice(0, 4) : mode === "Demo" ? arbitrageRows : [];
  const dashboardSuggestions = mode === "Demo" ? aiSuggestions.slice(0, 3) : [
    {
      title: topOpportunity ? `Review ${topOpportunity.pair} route` : "Wait for a net-positive route",
      severity: topOpportunity?.status === "Executable" ? "High" : "Medium",
      category: "Live arbitrage",
      text: topOpportunity
        ? `Current live route is ${topOpportunity.buy} to ${topOpportunity.sell}, net ${topOpportunity.netSpreadPct.toFixed(3)}% after your configured costs.`
        : "No cross-exchange spread currently clears the fee and slippage model. Do not stage a synthetic fallback route.",
    },
    {
      title: "Keep execution paper-only",
      severity: "Medium",
      category: "Safety",
      text: "Live quotes and real candle models are enabled, while orders remain simulated and are recorded in MySQL.",
    },
    {
      title: "Confirm source freshness",
      severity: "Low",
      category: "Market data",
      text: `${source} is the current quote source. Compare quote timestamps and latency before acting on a short-lived spread.`,
    },
  ];

  useEffect(() => {
    if (user.isDemo) return;
    fetchTradeHistory()
      .then((trades) => {
        const amount = trades.reduce((total, trade) => {
          const parsed = Number(String(trade.pnl).replace(/[^0-9.-]/g, ""));
          return total + (Number.isFinite(parsed) ? parsed : 0);
        }, 0);
        setPaperPnl({ amount, count: trades.length });
      })
      .catch(() => setPaperPnl({ amount: 0, count: 0 }));
  }, [user.isDemo]);

  const moverCoins = useMemo(() => {
    if (mode === "Demo") return marketCoins;
    return marketCoins.flatMap((coin) => {
      const coinQuotes = quotes.filter((quote) => quote.pair === `${coin.symbol}/USDT`);
      if (!coinQuotes.length) return [];
      const prices = coinQuotes.map((quote) => quote.mid);
      const changes = coinQuotes.map((quote) => Number(quote.change)).filter(Number.isFinite);
      const volumes = coinQuotes.map((quote) => Number(quote.volume)).filter(Number.isFinite);
      return [{
        ...coin,
        price: prices.reduce((sum, value) => sum + value, 0) / prices.length,
        change: changes.length ? changes.reduce((sum, value) => sum + value, 0) / changes.length : 0,
        volume: volumes.length ? volumes.reduce((sum, value) => sum + value, 0) : coin.volume,
      }];
    });
  }, [mode, quotes]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-cyber">Live intelligence</p>
          <h1 className="mt-1 text-3xl font-semibold">Market Dashboard</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded border border-mint/30 bg-mint/10 px-3 py-2 text-sm text-mint">
          <RadioTower size={16} />
          {status === "ready" ? `${source} connected` : "Connecting market feed"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Best net spread"
          value={topOpportunity ? `${topOpportunity.netSpreadPct.toFixed(3)}%` : "0.00%"}
          detail={topOpportunity ? `${topOpportunity.pair} ${topOpportunity.buy} to ${topOpportunity.sell}` : "Waiting for market data"}
          tone="mint"
        />
        <MetricCard label="Route signal" value={topOpportunity?.status || "WAIT"} detail={topOpportunity ? `Score ${topOpportunity.score}` : "No current fee-adjusted edge"} tone="cyber" />
        <MetricCard label="Paper PnL" value={`${paperPnl.amount >= 0 ? "+" : "-"}$${Math.abs(paperPnl.amount).toFixed(2)}`} detail={`Across ${paperPnl.count} recorded routes`} tone="gold" />
        <MetricCard label="Data mode" value={mode} detail={source} tone="danger" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="3D Market Galaxy">
          <MarketGalaxy coins={moverCoins} />
        </Panel>
        <Panel title="Live Arbitrage Routes" action={<Activity size={18} className="text-cyber" />}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="pb-3">Pair</th>
                  <th className="pb-3">Buy</th>
                  <th className="pb-3">Sell</th>
                  <th className="pb-3">Spread</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {routes.map((row) => (
                  <tr key={`${row.pair}-${row.buy}-${row.sell}`} className="text-slate-300">
                    <td className="py-3 font-medium text-white">{row.pair}</td>
                    <td className="py-3">{row.buy}</td>
                    <td className="py-3">{row.sell}</td>
                    <td className="py-3 text-mint">{row.netSpreadPct ? `${row.netSpreadPct.toFixed(3)}%` : row.spread}</td>
                    <td className="py-3">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!routes.length && <p className="py-8 text-center text-sm text-slate-500">No live fee-adjusted arbitrage route is available.</p>}
          </div>
        </Panel>
      </div>

      <Panel
        title="AI Recommendations"
        action={
          <Link to="/app/ai" className="inline-flex items-center gap-2 rounded bg-cyber/12 px-3 py-2 text-sm text-cyber hover:bg-cyber/18">
            <Brain size={16} />
            Open AI
          </Link>
        }
      >
        <div className="grid gap-3 lg:grid-cols-3">
          {dashboardSuggestions.map((suggestion) => (
            <AISuggestionCard key={suggestion.title} suggestion={suggestion} />
          ))}
        </div>
      </Panel>

      <Panel title="Market Movers">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {moverCoins.map((coin) => (
            <div key={coin.symbol} className="rounded border border-line bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{coin.name}</p>
                  <p className="text-sm text-slate-500">{coin.symbol}</p>
                </div>
                <p className={coin.change >= 0 ? "text-mint" : "text-danger"}>{coin.change.toFixed(2)}%</p>
              </div>
              <p className="mt-4 text-xl font-semibold">${coin.price.toLocaleString()}</p>
            </div>
          ))}
          {!moverCoins.length && <p className="text-sm text-slate-500">Waiting for live market movers.</p>}
        </div>
      </Panel>
    </div>
  );
}

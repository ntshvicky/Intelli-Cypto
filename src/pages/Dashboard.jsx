import { Activity, Brain, RadioTower } from "lucide-react";
import { Link } from "react-router-dom";
import AISuggestionCard from "../components/AISuggestionCard.jsx";
import MarketGalaxy from "../components/MarketGalaxy.jsx";
import MetricCard from "../components/MetricCard.jsx";
import Panel from "../components/Panel.jsx";
import { aiSuggestions, arbitrageRows, marketCoins } from "../data/mockData.js";
import { useMarketData } from "../hooks/useMarketData.js";

export default function Dashboard() {
  const { opportunities, source, mode } = useMarketData();
  const topOpportunity = opportunities[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-cyber">Live intelligence</p>
          <h1 className="mt-1 text-3xl font-semibold">Market Dashboard</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded border border-mint/30 bg-mint/10 px-3 py-2 text-sm text-mint">
          <RadioTower size={16} />
          WebSocket stream ready
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Best net spread"
          value={topOpportunity ? `${topOpportunity.netSpreadPct.toFixed(3)}%` : "0.00%"}
          detail={topOpportunity ? `${topOpportunity.pair} ${topOpportunity.buy} to ${topOpportunity.sell}` : "Waiting for market data"}
          tone="mint"
        />
        <MetricCard label="AI signal" value="HOLD" detail="BTC confidence 68" tone="cyber" />
        <MetricCard label="Daily PnL" value="+$368.47" detail="Across 12 closed routes" tone="gold" />
        <MetricCard label="Data mode" value={mode} detail={source} tone="danger" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="3D Market Galaxy">
          <MarketGalaxy />
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
                {(opportunities.length ? opportunities.slice(0, 4) : arbitrageRows).map((row) => (
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
          {aiSuggestions.slice(0, 3).map((suggestion) => (
            <AISuggestionCard key={suggestion.title} suggestion={suggestion} />
          ))}
        </div>
      </Panel>

      <Panel title="Market Movers">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {marketCoins.map((coin) => (
            <div key={coin.symbol} className="rounded border border-line bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{coin.name}</p>
                  <p className="text-sm text-slate-500">{coin.symbol}</p>
                </div>
                <p className={coin.change >= 0 ? "text-mint" : "text-danger"}>{coin.change}%</p>
              </div>
              <p className="mt-4 text-xl font-semibold">${coin.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

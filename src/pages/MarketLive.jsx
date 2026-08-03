import { Bot, RefreshCcw, Satellite, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import MetricCard from "../components/MetricCard.jsx";
import Panel from "../components/Panel.jsx";
import { exchangeCatalog } from "../data/mockData.js";
import { useMarketData } from "../hooks/useMarketData.js";
import { useAuth } from "../state/AuthContext.jsx";

export default function MarketLive() {
  const { user, updateUser } = useAuth();
  const { quotes, opportunities, source, status, mode, refreshMs } = useMarketData();

  const toggleMode = async () => {
    try {
      await updateUser({ marketDataMode: mode === "Live" ? "Demo" : "Live" });
    } catch {
      // Settings remains unchanged when persistence fails.
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-cyber">{user.isDemo ? "Browser demo workspace" : "MySQL workspace"} · Demo and live market data</p>
          <h1 className="mt-1 text-3xl font-semibold">Market Live</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/app/agent" className="inline-flex items-center justify-center gap-2 rounded bg-cyber/12 px-4 py-3 text-sm font-semibold text-cyber hover:bg-cyber/18">
            <Bot size={17} />
            Ask Agent
          </Link>
          <button
            onClick={toggleMode}
            className={`inline-flex items-center justify-center gap-2 rounded px-4 py-3 text-sm font-semibold ${mode === "Live" ? "bg-mint text-slate-950" : "bg-white/8 text-slate-200"}`}
          >
            <Satellite size={17} />
            {mode} mode
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Data source" value={source} detail={`${status}, refresh ${refreshMs / 1000}s`} tone="cyber" />
        <MetricCard label="Enabled exchanges" value={user.exchanges.length} detail={user.exchanges.join(", ")} tone="mint" />
        <MetricCard label="Best AI score" value={opportunities[0]?.score || 0} detail={opportunities[0]?.pair || "Waiting for quotes"} tone="gold" />
        <MetricCard label="Execution guard" value={user.paperTrading ? "Paper" : "Live"} detail={user.autoExecute ? "Auto-execute armed" : "Manual approval"} tone="danger" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Exchange Quote Matrix" action={<RefreshCcw size={18} className="text-cyber" />}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="pb-3">Exchange</th>
                  <th className="pb-3">Pair</th>
                  <th className="pb-3">Bid</th>
                  <th className="pb-3">Ask</th>
                  <th className="pb-3">Mid</th>
                  <th className="pb-3">Latency</th>
                  <th className="pb-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {quotes.map((quote) => (
                  <tr key={`${quote.exchange}-${quote.pair}`} className="text-slate-300">
                    <td className="py-3 font-medium text-white">{quote.exchange}</td>
                    <td className="py-3">{quote.pair}</td>
                    <td className="py-3 text-mint">${quote.bid.toLocaleString()}</td>
                    <td className="py-3 text-danger">${quote.ask.toLocaleString()}</td>
                    <td className="py-3">${quote.mid.toLocaleString()}</td>
                    <td className="py-3">{quote.latency}ms</td>
                    <td className="py-3 text-slate-500">{quote.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Fee-Aware Route Ranking" action={<ShieldCheck size={18} className="text-mint" />}>
          <div className="space-y-3">
            {opportunities.slice(0, 6).map((item) => (
              <div key={`${item.pair}-${item.buy}-${item.sell}`} className="rounded border border-line bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.pair}</p>
                    <p className="mt-1 text-sm text-slate-400">Buy {item.buy}, sell {item.sell}</p>
                  </div>
                  <span className="rounded bg-cyber/12 px-3 py-1 text-sm text-cyber">Score {item.score}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded bg-white/5 p-2">
                    <p className="text-slate-500">Gross</p>
                    <p className="text-white">{item.grossSpreadPct.toFixed(3)}%</p>
                  </div>
                  <div className="rounded bg-white/5 p-2">
                    <p className="text-slate-500">Net</p>
                    <p className={item.netSpreadPct > 0 ? "text-mint" : "text-danger"}>{item.netSpreadPct.toFixed(3)}%</p>
                  </div>
                  <div className="rounded bg-white/5 p-2">
                    <p className="text-slate-500">State</p>
                    <p className="text-white">{item.status}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-400">{item.suggestion}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Exchange Coverage">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {exchangeCatalog.map((exchange) => (
            <div key={exchange.name} className="rounded border border-line bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{exchange.name}</p>
                <span className={user.exchanges.includes(exchange.name) ? "text-mint" : "text-slate-500"}>
                  {user.exchanges.includes(exchange.name) ? "Enabled" : "Off"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{exchange.region}</p>
              <div className="mt-4 flex justify-between text-sm text-slate-300">
                <span>{exchange.fee}</span>
                <span>{exchange.latency}ms</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

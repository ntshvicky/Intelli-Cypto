import { ArrowDownUp, ShieldCheck } from "lucide-react";
import { useState } from "react";
import AIPredictionCard from "../components/AIPredictionCard.jsx";
import MetricCard from "../components/MetricCard.jsx";
import Panel from "../components/Panel.jsx";
import { aiPredictions, arbitrageRows } from "../data/mockData.js";
import { useMarketData } from "../hooks/useMarketData.js";

export default function Trade() {
  const [side, setSide] = useState("BUY");
  const [pair, setPair] = useState("BTC/USDT");
  const [amount, setAmount] = useState("0.25");
  const [exchange, setExchange] = useState("Binance");
  const selectedPrediction = aiPredictions.find((prediction) => prediction.symbol === pair) || aiPredictions[0];
  const { opportunities, mode } = useMarketData();
  const rankedRows = opportunities.length ? opportunities : arbitrageRows;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-cyber">Execution</p>
        <h1 className="mt-1 text-3xl font-semibold">Buy / Sell</h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <Panel title="Order Ticket" action={<ArrowDownUp size={18} className="text-cyber" />}>
          <div className="grid grid-cols-2 gap-2">
            {["BUY", "SELL"].map((item) => (
              <button
                key={item}
                onClick={() => setSide(item)}
                className={`rounded px-4 py-3 text-sm font-semibold ${side === item ? (item === "BUY" ? "bg-mint text-slate-950" : "bg-danger text-white") : "bg-white/7 text-slate-300"}`}
              >
                {item}
              </button>
            ))}
          </div>

          <label className="mt-4 block text-sm">
            <span className="text-slate-300">Pair</span>
            <select value={pair} onChange={(event) => setPair(event.target.value)} className="mt-2 w-full rounded border border-line bg-slate-950/70 px-3 py-3 outline-none focus:border-cyber">
              {["BTC/USDT", "ETH/USDT", "SOL/USDT", "LINK/USDT"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="mt-4 block text-sm">
            <span className="text-slate-300">Exchange</span>
            <select value={exchange} onChange={(event) => setExchange(event.target.value)} className="mt-2 w-full rounded border border-line bg-slate-950/70 px-3 py-3 outline-none focus:border-cyber">
              {["Binance", "Kraken", "Coinbase"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="mt-4 block text-sm">
            <span className="text-slate-300">Amount</span>
            <input value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded border border-line bg-slate-950/70 px-3 py-3 outline-none focus:border-cyber" />
          </label>
          <div className="mt-4 rounded border border-line bg-white/5 p-3 text-sm text-slate-300">
            Estimated notional: <span className="text-white">${(Number(amount || 0) * 64250).toLocaleString()}</span>
          </div>
          <button className={`mt-5 w-full rounded px-5 py-3 font-semibold ${side === "BUY" ? "bg-mint text-slate-950" : "bg-danger text-white"}`}>
            Place simulated {side}
          </button>
        </Panel>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Route health" value="98.4%" detail="Exchange adapters online" tone="mint" />
            <MetricCard label="Slippage cap" value="0.20%" detail="Balanced profile default" tone="cyber" />
            <MetricCard label="Data mode" value={mode} detail="Live toggle in settings" tone="gold" />
          </div>
          <Panel title="Suggested Arbitrage Orders" action={<ShieldCheck size={18} className="text-mint" />}>
            <div className="space-y-3">
              {rankedRows.slice(0, 5).map((row) => (
                <div key={`${row.pair}-${row.sell}`} className="flex flex-col justify-between gap-3 rounded border border-line bg-white/[0.04] p-4 md:flex-row md:items-center">
                  <div>
                    <p className="font-semibold">{row.pair}</p>
                    <p className="mt-1 text-sm text-slate-400">Buy {row.buy}, sell {row.sell}{row.latency ? `, latency ${row.latency}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-mint">{row.netSpreadPct ? `${row.netSpreadPct.toFixed(3)}%` : row.spread}</span>
                    {row.score && <span className="rounded bg-cyber/12 px-2 py-1 text-xs text-cyber">AI {row.score}</span>}
                    <button className="rounded bg-white/8 px-3 py-2 text-sm hover:bg-white/12">Stage</button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="AI Order Advisor">
            <AIPredictionCard prediction={selectedPrediction} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

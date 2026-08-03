import { ArrowDownUp, CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import AIPredictionCard from "../components/AIPredictionCard.jsx";
import MetricCard from "../components/MetricCard.jsx";
import Panel from "../components/Panel.jsx";
import { aiPredictions, arbitrageRows } from "../data/mockData.js";
import { useAIPredictions } from "../hooks/useAIPredictions.js";
import { useMarketData } from "../hooks/useMarketData.js";
import { addSystemLog, addTradeHistory, createLogEntry, createTradeEntry, saveTradeActivity } from "../services/activityStore.js";
import { useAuth } from "../state/AuthContext.jsx";

export default function Trade() {
  const { user } = useAuth();
  const [side, setSide] = useState("BUY");
  const [pair, setPair] = useState("BTC/USDT");
  const [amount, setAmount] = useState("0.25");
  const [exchange, setExchange] = useState("Binance");
  const [notice, setNotice] = useState("");
  const [stagedRoutes, setStagedRoutes] = useState([]);
  const { quotes, opportunities, mode } = useMarketData();
  const { predictions } = useAIPredictions(mode);
  const selectedPrediction = predictions.find((prediction) => prediction.symbol === pair) || predictions[0] || aiPredictions[0];
  const rankedRows = opportunities.length ? opportunities : mode === "Demo" ? arbitrageRows : [];
  const selectedQuote = quotes.find((quote) => quote.exchange === exchange && quote.pair === pair);
  const executionPrice = selectedQuote ? (side === "BUY" ? selectedQuote.ask : selectedQuote.bid) : pair.startsWith("ETH") ? 3173.7 : pair.startsWith("SOL") ? 148.32 : pair.startsWith("LINK") ? 14.4 : 64250;
  const estimatedNotional = Number(amount || 0) * executionPrice;

  const placeOrder = async () => {
    if (!Number(amount) || Number(amount) <= 0) {
      setNotice("Enter a valid amount before placing an order.");
      return;
    }

    const trade = createTradeEntry({
      pair,
      side,
      exchange,
      amount,
      price: executionPrice,
      result: "Filled",
    });
    const log = createLogEntry({
      source: "ExecutionDesk",
      message: `Paper ${side} filled for ${amount} ${pair} on ${exchange} at $${executionPrice.toLocaleString()}.`,
    });
    try {
      const savedTrade = user.isDemo
        ? (addTradeHistory(trade), addSystemLog(log), trade)
        : await saveTradeActivity({ ...trade, side, exchange, amount, price: executionPrice, dataMode: mode }, log);
      setNotice(`${savedTrade.id} filled: paper ${side} ${amount} ${pair} on ${exchange}.`);
    } catch (error) {
      setNotice(`Could not record trade: ${error.message}`);
    }
  };

  const stageRoute = async (row) => {
    const staged = {
      ...row,
      id: `STAGE-${Date.now().toString().slice(-6)}`,
      stagedAt: new Date().toLocaleTimeString(),
    };
    setStagedRoutes((current) => [staged, ...current].slice(0, 5));
    const trade = createTradeEntry({
      pair: row.pair,
      side: "ROUTE",
      exchange: `${row.buy} -> ${row.sell}`,
      amount: "1",
      price: row.buyAsk || 0,
      result: "Staged",
      action: `STAGED BUY ${row.buy} / SELL ${row.sell}`,
    });
    const log = createLogEntry({
      source: "RoutePlanner",
      message: `Staged ${row.pair} route: buy ${row.buy}, sell ${row.sell}${row.score ? `, AI score ${row.score}` : ""}.`,
    });
    try {
      if (user.isDemo) {
        addTradeHistory(trade);
        addSystemLog(log);
      } else {
        await saveTradeActivity({ ...trade, side: "ROUTE", exchange: `${row.buy} -> ${row.sell}`, amount: "1", price: row.buyAsk || 0, dataMode: mode }, log);
      }
      setNotice(`Route staged: ${row.pair} ${row.buy} -> ${row.sell}.`);
    } catch (error) {
      setNotice(`Could not stage route: ${error.message}`);
    }
  };

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
              {["Binance", "Kraken", "Coinbase", "OKX", "Bybit", "KuCoin"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="mt-4 block text-sm">
            <span className="text-slate-300">Amount</span>
            <input value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded border border-line bg-slate-950/70 px-3 py-3 outline-none focus:border-cyber" />
          </label>
          <div className="mt-4 rounded border border-line bg-white/5 p-3 text-sm text-slate-300">
            Estimated notional: <span className="text-white">${estimatedNotional.toLocaleString()}</span>
            <span className="ml-2 text-slate-500">@ ${executionPrice.toLocaleString()}</span>
          </div>
          <button onClick={placeOrder} className={`mt-5 w-full rounded px-5 py-3 font-semibold ${side === "BUY" ? "bg-mint text-slate-950" : "bg-danger text-white"}`}>
            Place paper {side}
          </button>
          {notice && (
            <div className="mt-4 flex items-start gap-2 rounded border border-mint/25 bg-mint/10 p-3 text-sm text-mint">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
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
                    <button onClick={() => stageRoute(row)} className="rounded bg-white/8 px-3 py-2 text-sm hover:bg-white/12">Stage</button>
                  </div>
                </div>
              ))}
              {!rankedRows.length && <p className="rounded border border-line bg-white/[0.04] p-4 text-sm text-slate-400">No fee-adjusted cross-exchange route is available from the current live quotes.</p>}
            </div>
          </Panel>
          {stagedRoutes.length > 0 && (
            <Panel title="Staged Routes">
              <div className="space-y-2">
                {stagedRoutes.map((route) => (
                  <div key={route.id} className="flex items-center justify-between gap-3 rounded border border-line bg-white/[0.04] px-3 py-3 text-sm">
                    <span className="text-white">{route.pair}</span>
                    <span className="text-slate-400">{route.buy} {"->"} {route.sell}</span>
                    <span className="text-mint">{route.stagedAt}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
          <Panel title="AI Order Advisor">
            <AIPredictionCard prediction={selectedPrediction} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

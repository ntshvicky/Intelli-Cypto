const actionClass = {
  BUY: "bg-mint/15 text-mint",
  SELL: "bg-danger/15 text-danger",
  HOLD: "bg-cyber/15 text-cyber",
};

export default function AIPredictionCard({ prediction }) {
  return (
    <article className="rounded border border-line bg-white/[0.045] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{prediction.symbol}</p>
          <h3 className="mt-1 text-xl font-semibold text-white">${prediction.targetPrice.toLocaleString()}</h3>
        </div>
        <span className={`rounded px-3 py-1 text-xs font-semibold ${actionClass[prediction.action]}`}>
          {prediction.action}
        </span>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs text-slate-400">
          <span>Confidence</span>
          <span>{prediction.confidence}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded bg-white/8">
          <div className="h-full rounded bg-cyber" style={{ width: `${prediction.confidence}%` }} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded bg-white/5 p-3">
          <p className="text-slate-500">Horizon</p>
          <p className="mt-1 text-white">{prediction.horizon}</p>
        </div>
        <div className="rounded bg-white/5 p-3">
          <p className="text-slate-500">RSI</p>
          <p className="mt-1 text-white">{prediction.rsi}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{prediction.suggestion}</p>
    </article>
  );
}

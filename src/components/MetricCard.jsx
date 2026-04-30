export default function MetricCard({ label, value, detail, tone = "cyber" }) {
  const toneMap = {
    cyber: "text-cyber",
    mint: "text-mint",
    danger: "text-danger",
    gold: "text-gold",
  };

  return (
    <div className="rounded border border-line bg-white/[0.045] p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${toneMap[tone]}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

import { Brain, Lightbulb, ShieldAlert, TrendingUp } from "lucide-react";

const iconMap = {
  Arbitrage: TrendingUp,
  Risk: ShieldAlert,
  Prediction: Brain,
  Settings: Lightbulb,
};

const severityClass = {
  High: "border-mint/35 bg-mint/10 text-mint",
  Medium: "border-gold/35 bg-gold/10 text-gold",
  Low: "border-cyber/35 bg-cyber/10 text-cyber",
};

export default function AISuggestionCard({ suggestion }) {
  const Icon = iconMap[suggestion.category] || Lightbulb;

  return (
    <article className="rounded border border-line bg-white/[0.045] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded bg-cyber/12 text-cyber">
            <Icon size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{suggestion.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{suggestion.category}</p>
          </div>
        </div>
        <span className={`rounded border px-2 py-1 text-xs ${severityClass[suggestion.severity]}`}>
          {suggestion.severity}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{suggestion.text}</p>
    </article>
  );
}

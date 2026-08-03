import { Brain, Gauge, WandSparkles } from "lucide-react";
import AIPredictionCard from "../components/AIPredictionCard.jsx";
import AISuggestionCard from "../components/AISuggestionCard.jsx";
import MetricCard from "../components/MetricCard.jsx";
import Panel from "../components/Panel.jsx";
import { aiRiskChecks, aiSuggestions, intelligentFeatureIdeas } from "../data/mockData.js";
import { useAIPredictions } from "../hooks/useAIPredictions.js";
import { useAuth } from "../state/AuthContext.jsx";

export default function AIInsights() {
  const { user } = useAuth();
  const mode = user.marketDataMode || "Demo";
  const { predictions, source } = useAIPredictions(mode);
  const topPrediction = [...predictions].sort((a, b) => b.confidence - a.confidence)[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-cyber">AI decision support</p>
          <h1 className="mt-1 text-3xl font-semibold">AI Insights</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded border border-cyber/30 bg-cyber/10 px-3 py-2 text-sm text-cyber">
          <WandSparkles size={16} />
          {mode} mean reversion + RSI
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Model state" value={predictions.length ? "Active" : "Waiting"} detail={source} tone="mint" />
        <MetricCard label="Top action" value={topPrediction ? `${topPrediction.symbol.split("/")[0]} ${topPrediction.action}` : "—"} detail={topPrediction ? `${topPrediction.confidence} confidence` : "No live prediction"} tone="cyber" />
        <MetricCard label="Risk mode" value={user.riskProfile} detail="Fee-aware suggestions" tone="gold" />
        <MetricCard label="Inputs" value={mode === "Live" ? "Real candles" : "Demo series"} detail={mode === "Live" ? "Kraken 5-minute OHLCV" : "Static sample predictions"} tone="danger" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Predictions" action={<Brain size={18} className="text-cyber" />}>
          <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-1">
            {predictions.map((prediction) => (
              <AIPredictionCard key={prediction.symbol} prediction={prediction} />
            ))}
            {!predictions.length && <p className="rounded border border-line bg-white/[0.04] p-4 text-sm text-slate-400">{source}</p>}
          </div>
        </Panel>

        <Panel title="AI Suggestions" action={<Gauge size={18} className="text-mint" />}>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion) => (
              <AISuggestionCard key={suggestion.title} suggestion={suggestion} />
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Risk Checks">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {aiRiskChecks.map((check) => (
            <div key={check.label} className="rounded border border-line bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white">{check.label}</p>
                <span className={check.value === "PASS" ? "text-mint" : "text-gold"}>{check.value}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{check.detail}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Intelligent Feature Suggestions">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {intelligentFeatureIdeas.map((idea) => (
            <div key={idea.name} className="rounded border border-line bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">{idea.name}</h3>
                <span className={idea.impact === "High" ? "text-mint" : "text-gold"}>{idea.impact}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{idea.detail}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

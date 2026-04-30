import { Bot, RadioTower } from "lucide-react";
import LiveAgentChat from "../components/LiveAgentChat.jsx";

export default function Agent() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-cyber">Ask the market cockpit</p>
          <h1 className="mt-1 text-3xl font-semibold">Live Agent</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded border border-mint/30 bg-mint/10 px-3 py-2 text-sm text-mint">
          <RadioTower size={16} />
          App context connected
        </div>
      </div>

      <div className="rounded border border-cyber/20 bg-cyber/8 p-4">
        <div className="flex items-start gap-3">
          <Bot size={20} className="mt-0.5 text-cyber" />
          <p className="text-sm leading-6 text-slate-300">
            This agent can answer questions using current quotes, exchange health, fee-aware route scores, AI predictions,
            history, logs, enabled exchanges, and your saved settings. It does not place real orders.
          </p>
        </div>
      </div>

      <LiveAgentChat />
    </div>
  );
}

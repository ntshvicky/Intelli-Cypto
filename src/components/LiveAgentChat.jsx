import { Bot, DatabaseZap, Send, Sparkles, UserRound } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { buildAgentContext, askLiveAgent, starterPrompts } from "../services/liveAgent.js";
import { useMarketData } from "../hooks/useMarketData.js";
import { useAuth } from "../state/AuthContext.jsx";

export default function LiveAgentChat() {
  const { user } = useAuth();
  const marketData = useMarketData();
  const inputRef = useRef(null);
  const context = useMemo(() => buildAgentContext({ user, ...marketData }), [user, marketData]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      role: "agent",
      title: "I am Intelli-Agent, connected to your app data and current market context.",
      bullets: [
        "Ask me about arbitrage routes, exchange health, AI signals, risk settings, logs, history, or what to build next.",
        "I use the current quote matrix, fee model, enabled exchanges, AI predictions, and workspace settings.",
      ],
      sources: ["market data", "settings", "AI predictions", "logs"],
      createdAt: new Date().toLocaleTimeString(),
    },
  ]);

  const sendQuestion = (question) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) {
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: cleanQuestion,
      createdAt: new Date().toLocaleTimeString(),
    };
    const agentMessage = askLiveAgent(cleanQuestion, context);
    setMessages((current) => [...current, userMessage, agentMessage]);
    setInput("");
  };

  const submit = (event) => {
    event.preventDefault();
    sendQuestion(input);
  };

  return (
    <div className="grid min-h-[680px] gap-5 xl:grid-cols-[0.72fr_1.28fr]">
      <aside className="space-y-4">
        <div className="rounded border border-line bg-panel/76 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded bg-cyber/12 text-cyber">
              <Bot size={20} />
            </div>
            <div>
              <p className="font-semibold text-white">Intelli-Agent</p>
              <p className="text-sm text-slate-500">Context-aware market assistant</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            <AgentStat label="Data mode" value={marketData.mode} />
            <AgentStat label="Source" value={marketData.source} />
            <AgentStat label="Quotes" value={marketData.quotes.length} />
            <AgentStat label="Routes" value={marketData.opportunities.length} />
            <AgentStat label="Enabled exchanges" value={user.exchanges.length} />
          </div>
        </div>

        <div className="rounded border border-line bg-panel/76 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles size={16} className="text-gold" />
            Suggested questions
          </div>
          <div className="space-y-2">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendQuestion(prompt)}
                className="w-full rounded border border-line bg-white/[0.04] px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/[0.08]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex min-h-[680px] flex-col rounded border border-line bg-panel/76">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h2 className="font-semibold text-white">Live Agent Chat</h2>
            <p className="text-sm text-slate-500">Answers are grounded in current app data and market values.</p>
          </div>
          <div className="hidden items-center gap-2 rounded bg-mint/10 px-3 py-2 text-sm text-mint md:flex">
            <DatabaseZap size={16} />
            Context loaded
          </div>
        </div>

        <div className="thin-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message) =>
            message.role === "user" ? <UserBubble key={message.id} message={message} /> : <AgentBubble key={message.id} message={message} />
          )}
        </div>

        <form onSubmit={submit} className="border-t border-line p-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about best route, BTC signal, exchange health, settings, logs..."
              className="min-w-0 flex-1 rounded border border-line bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyber"
            />
            <button className="inline-flex items-center gap-2 rounded bg-cyber px-4 py-3 text-sm font-semibold text-slate-950">
              <Send size={17} />
              Send
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function AgentStat({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded bg-white/[0.04] px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function UserBubble({ message }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[82%] rounded border border-cyber/25 bg-cyber/12 p-4">
        <div className="mb-2 flex items-center justify-end gap-2 text-xs text-cyber">
          <span>{message.createdAt}</span>
          <UserRound size={14} />
        </div>
        <p className="text-sm leading-6 text-white">{message.text}</p>
      </div>
    </div>
  );
}

function AgentBubble({ message }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] rounded border border-line bg-white/[0.045] p-4">
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
          <Bot size={14} className="text-cyber" />
          <span>Intelli-Agent</span>
          <span>{message.createdAt}</span>
        </div>
        <h3 className="font-semibold leading-6 text-white">{message.title}</h3>
        <ul className="mt-3 space-y-2">
          {message.bullets.map((bullet) => (
            <li key={bullet} className="text-sm leading-6 text-slate-300">
              {bullet}
            </li>
          ))}
        </ul>
        {message.sources?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.sources.map((source) => (
              <span key={source} className="rounded bg-white/7 px-2 py-1 text-xs text-slate-400">
                {source}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

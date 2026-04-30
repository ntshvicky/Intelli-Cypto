import { Save, ShieldCheck, SlidersHorizontal, ToggleLeft } from "lucide-react";
import { useState } from "react";
import Panel from "../components/Panel.jsx";
import { exchangeCatalog } from "../data/mockData.js";
import { useAuth } from "../state/AuthContext.jsx";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(user);
  const [saved, setSaved] = useState(false);

  const update = (field, value) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleExchange = (exchange) => {
    setSaved(false);
    setForm((current) => ({
      ...current,
      exchanges: current.exchanges.includes(exchange)
        ? current.exchanges.filter((item) => item !== exchange)
        : [...current.exchanges, exchange],
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    updateUser(form);
    setSaved(true);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-cyber">Profile, data, risk, and execution</p>
        <h1 className="mt-1 text-3xl font-semibold">User Settings</h1>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <Panel title="Account Preferences" action={<Save size={18} className="text-cyber" />}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Full name" value={form.fullName || ""} onChange={(value) => update("fullName", value)} />
            <Field label="Username" value={form.username || ""} onChange={(value) => update("username", value)} />
            <Field label="Email" value={form.email || ""} onChange={(value) => update("email", value)} />
            <Select label="Expertise" value={form.expertise || "Pro"} onChange={(value) => update("expertise", value)} options={["Beginner", "Pro", "Whale"]} />
            <Select label="Jurisdiction" value={form.country || "United States"} onChange={(value) => update("country", value)} options={["United States", "India", "United Kingdom", "Singapore", "UAE"]} />
            <Select label="Base currency" value={form.baseCurrency || "USD"} onChange={(value) => update("baseCurrency", value)} options={["USD", "USDT", "EUR", "INR", "AED"]} />
            <Select label="Risk profile" value={form.riskProfile || "Balanced"} onChange={(value) => update("riskProfile", value)} options={["Conservative", "Balanced", "Aggressive"]} />
            <Field label="Maximum trade size" value={form.maxTradeSize || ""} onChange={(value) => update("maxTradeSize", value)} />
          </div>
        </Panel>

        <Panel title="Market Data Mode" action={<ToggleLeft size={18} className="text-mint" />}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Select label="Data mode" value={form.marketDataMode || "Demo"} onChange={(value) => update("marketDataMode", value)} options={["Demo", "Live"]} />
            <Select label="Refresh interval" value={form.refreshInterval || "5"} onChange={(value) => update("refreshInterval", value)} options={["3", "5", "10", "15", "30"]} />
            <Field label="Maker fee %" value={form.makerFee || ""} onChange={(value) => update("makerFee", value)} />
            <Field label="Taker fee %" value={form.takerFee || ""} onChange={(value) => update("takerFee", value)} />
            <Field label="Slippage buffer %" value={form.slippageBuffer || ""} onChange={(value) => update("slippageBuffer", value)} />
            <Field label="Minimum net spread %" value={form.minNetSpread || ""} onChange={(value) => update("minNetSpread", value)} />
            <Select label="Execution preset" value={form.executionPreset || "Balanced"} onChange={(value) => update("executionPreset", value)} options={["Conservative", "Balanced", "Aggressive", "Custom"]} />
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Live mode uses public market endpoints for supported venues and falls back to demo quotes when a browser request is blocked or unavailable.
          </p>
        </Panel>

        <Panel title="Exchange Coverage" action={<SlidersHorizontal size={18} className="text-cyber" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {exchangeCatalog.map((exchange) => (
              <label key={exchange.name} className="rounded border border-line bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-white">{exchange.name}</span>
                  <input type="checkbox" checked={form.exchanges?.includes(exchange.name)} onChange={() => toggleExchange(exchange.name)} />
                </div>
                <p className="mt-2 text-sm text-slate-500">{exchange.region}</p>
                <div className="mt-4 flex justify-between text-sm text-slate-300">
                  <span>{exchange.fee}</span>
                  <span>{exchange.liveSupport ? "Live API" : "Demo adapter"}</span>
                </div>
              </label>
            ))}
          </div>
        </Panel>

        <Panel title="Intelligent Controls" action={<ShieldCheck size={18} className="text-mint" />}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Toggle label="Paper trading" checked={Boolean(form.paperTrading)} onChange={(value) => update("paperTrading", value)} />
            <Toggle label="Auto-execute armed" checked={Boolean(form.autoExecute)} onChange={(value) => update("autoExecute", value)} />
            <Toggle label="Smart alerts" checked={Boolean(form.smartAlerts)} onChange={(value) => update("smartAlerts", value)} />
            <Toggle label="Anomaly detection" checked={Boolean(form.anomalyDetection)} onChange={(value) => update("anomalyDetection", value)} />
            <Toggle label="Whale flow watch" checked={Boolean(form.whaleWatch)} onChange={(value) => update("whaleWatch", value)} />
            <Toggle label="News sentiment" checked={Boolean(form.newsSentiment)} onChange={(value) => update("newsSentiment", value)} />
            <Toggle label="Two-factor authentication" checked={Boolean(form.twoFactor)} onChange={(value) => update("twoFactor", value)} />
          </div>
          <div className="mt-5 rounded border border-gold/25 bg-gold/10 p-4 text-sm leading-6 text-gold">
            Live execution remains manual in this demo. In production, API key vaulting, withdrawal locks, allowlisted IPs, and per-exchange kill switches are required before real orders.
          </div>
        </Panel>

        <div className="flex items-center gap-3">
          <button className="rounded bg-cyber px-5 py-3 font-semibold text-slate-950">Save settings</button>
          {saved && <span className="text-sm text-mint">Saved</span>}
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-300">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded border border-line bg-slate-950/70 px-3 py-3 outline-none focus:border-cyber" />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-300">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded border border-line bg-slate-950/70 px-3 py-3 outline-none focus:border-cyber">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded border border-line bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

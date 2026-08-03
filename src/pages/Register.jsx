import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { useState } from "react";

const initialForm = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  expertise: "Beginner",
  country: "United States",
  baseCurrency: "USD",
  riskProfile: "Balanced",
  maxTradeSize: "1000",
  exchanges: ["Binance", "Kraken"],
  twoFactor: true,
  terms: false,
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const toggleExchange = (exchange) => {
    setForm((current) => ({
      ...current,
      exchanges: current.exchanges.includes(exchange)
        ? current.exchanges.filter((item) => item !== exchange)
        : [...current.exchanges, exchange],
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await register(form);
      navigate("/app");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 text-slate-100">
      <form onSubmit={submit} className="glass w-full max-w-3xl rounded p-5 sm:p-7">
        <div className="mb-6">
          <Link to="/" className="text-sm text-cyber">Intelli-Crypto</Link>
          <h1 className="mt-3 text-3xl font-semibold">Create operator account</h1>
          <p className="mt-2 text-sm text-slate-400">Identity, risk profile, trading preferences, and exchange coverage are required for a serious arbitrage workspace.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" value={form.fullName} onChange={(value) => update("fullName", value)} required />
          <Field label="Username" value={form.username} onChange={(value) => update("username", value)} required />
          <Field label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} required />
          <Field label="Password" type="password" value={form.password} onChange={(value) => update("password", value)} required />
          <Select label="Expertise Level" value={form.expertise} onChange={(value) => update("expertise", value)} options={["Beginner", "Pro", "Whale"]} />
          <Select label="Country / jurisdiction" value={form.country} onChange={(value) => update("country", value)} options={["United States", "India", "United Kingdom", "Singapore", "UAE"]} />
          <Select label="Base currency" value={form.baseCurrency} onChange={(value) => update("baseCurrency", value)} options={["USD", "USDT", "EUR", "INR", "AED"]} />
          <Select label="Risk profile" value={form.riskProfile} onChange={(value) => update("riskProfile", value)} options={["Conservative", "Balanced", "Aggressive"]} />
          <Field label="Maximum trade size" type="number" value={form.maxTradeSize} onChange={(value) => update("maxTradeSize", value)} required />
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-slate-200">Exchange coverage</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {["Binance", "Kraken", "Coinbase"].map((exchange) => (
              <label key={exchange} className="flex items-center gap-2 rounded border border-line bg-white/5 px-3 py-3 text-sm">
                <input type="checkbox" checked={form.exchanges.includes(exchange)} onChange={() => toggleExchange(exchange)} />
                {exchange}
              </label>
            ))}
          </div>
        </div>

        <label className="mt-5 flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={form.twoFactor} onChange={(event) => update("twoFactor", event.target.checked)} />
          Enable two-factor authentication
        </label>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={form.terms} onChange={(event) => update("terms", event.target.checked)} required />
          I accept trading risk disclosures and platform terms.
        </label>

        {error && <p className="mt-5 rounded border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p>}
        <button disabled={submitting} className="mt-6 w-full rounded bg-mint px-5 py-3 font-semibold text-slate-950 disabled:opacity-60">
          {submitting ? "Creating MySQL account…" : "Create account"}
        </button>
        <p className="mt-4 text-center text-sm text-slate-400">
          Already registered? <Link to="/login" className="text-cyber">Log in</Link>
        </p>
      </form>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", required }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded border border-line bg-slate-950/70 px-3 py-3 text-slate-100 outline-none focus:border-cyber"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded border border-line bg-slate-950/70 px-3 py-3 text-slate-100 outline-none focus:border-cyber"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

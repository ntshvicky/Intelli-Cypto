import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(email, password);
      navigate("/app");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openDemo = () => {
    demoLogin();
    navigate("/app");
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 text-slate-100">
      <form onSubmit={submit} className="glass w-full max-w-md rounded p-6">
        <Link to="/" className="text-sm text-cyber">Intelli-Crypto</Link>
        <h1 className="mt-4 text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Access your arbitrage cockpit, execution logs, and risk settings.</p>
        <label className="mt-6 block text-sm">
          <span className="text-slate-300">Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded border border-line bg-slate-950/70 px-3 py-3 outline-none focus:border-cyber" />
        </label>
        <label className="mt-4 block text-sm">
          <span className="text-slate-300">Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded border border-line bg-slate-950/70 px-3 py-3 outline-none focus:border-cyber" />
        </label>
        {error && <p className="mt-4 rounded border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p>}
        <button disabled={submitting} className="mt-6 w-full rounded bg-cyber px-5 py-3 font-semibold text-slate-950 disabled:opacity-60">
          {submitting ? "Connecting…" : "Log in to MySQL account"}
        </button>
        <button type="button" onClick={openDemo} className="mt-3 w-full rounded border border-line bg-white/5 px-5 py-3 font-semibold text-slate-200 hover:bg-white/10">
          Continue with demo
        </button>
        <p className="mt-4 text-center text-sm text-slate-400">
          Need an account? <Link to="/register" className="text-cyber">Register</Link>
        </p>
      </form>
    </main>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("architect@intelli.crypto");
  const [password, setPassword] = useState("password");
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = (event) => {
    event.preventDefault();
    login(email, password);
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
        <button className="mt-6 w-full rounded bg-cyber px-5 py-3 font-semibold text-slate-950">Log in</button>
        <p className="mt-4 text-center text-sm text-slate-400">
          Need an account? <Link to="/register" className="text-cyber">Register</Link>
        </p>
      </form>
    </main>
  );
}

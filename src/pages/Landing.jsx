import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import MarketGalaxy from "../components/MarketGalaxy.jsx";

export default function Landing() {
  return (
    <main className="min-h-screen bg-ink text-slate-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-semibold">Intelli-Crypto</Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded px-4 py-2 text-sm text-slate-300 hover:bg-white/6">Log in</Link>
          <Link to="/register" className="rounded bg-cyber px-4 py-2 text-sm font-semibold text-slate-950">Register</Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl items-center gap-8 px-4 pb-10 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <p className="mb-4 inline-flex items-center gap-2 rounded border border-line bg-white/6 px-3 py-2 text-sm text-cyber">
            <Sparkles size={16} />
            Institutional-grade crypto intelligence
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Intelli-Crypto
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Monitor exchange spreads, inspect market motion in 3D, manage execution risk, and keep every trade decision auditable.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 rounded bg-mint px-5 py-3 text-sm font-semibold text-slate-950">
              Open command center
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="rounded border border-line px-5 py-3 text-sm font-semibold text-white hover:bg-white/8">
              View demo account
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Cross-exchange", Zap],
              ["Risk controls", ShieldCheck],
              ["AI signals", Sparkles],
            ].map(([label, Icon]) => (
              <div key={label} className="flex items-center gap-2 rounded border border-line bg-white/5 px-3 py-3 text-sm text-slate-300">
                <Icon size={17} className="text-cyber" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
        <MarketGalaxy />
      </section>
    </main>
  );
}

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Activity, BarChart3, Bot, Brain, History, LineChart, LogOut, ScrollText, Settings, WalletCards } from "lucide-react";
import { useAuth } from "../state/AuthContext.jsx";

const navItems = [
  { to: "/app", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/app/market", label: "Market Live", icon: LineChart },
  { to: "/app/agent", label: "Live Agent", icon: Bot },
  { to: "/app/ai", label: "AI Insights", icon: Brain },
  { to: "/app/trade", label: "Buy / Sell", icon: WalletCards },
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/logs", label: "Logs", icon: ScrollText },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-line bg-ink/88 px-4 py-5 backdrop-blur xl:block">
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded bg-cyber/15 text-cyber">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-lg font-semibold">Intelli-Crypto</p>
            <p className="text-xs text-slate-400">Arbitrage Command</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-3 py-3 text-sm transition ${
                  isActive ? "bg-cyber/14 text-white" : "text-slate-400 hover:bg-white/6 hover:text-white"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded border border-line bg-white/5 p-4">
          <p className="text-sm font-medium">{user?.fullName || user?.username}</p>
          <p className="mt-1 text-xs text-slate-400">{user?.expertise} operator</p>
          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-white/8 px-3 py-2 text-sm text-slate-200 hover:bg-white/12"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-ink/78 px-4 py-3 backdrop-blur xl:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Intelli-Crypto</p>
              <p className="text-xs text-slate-400">Live arbitrage cockpit</p>
            </div>
            <button onClick={handleLogout} className="rounded bg-white/8 p-2 text-slate-300">
              <LogOut size={18} />
            </button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded px-3 py-2 text-xs ${
                    isActive ? "bg-cyber/18 text-white" : "bg-white/6 text-slate-400"
                  }`
                }
              >
                <item.icon size={15} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

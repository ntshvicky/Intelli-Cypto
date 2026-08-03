import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./state/AuthContext.jsx";
import AppShell from "./components/AppShell.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import History from "./pages/History.jsx";
import Logs from "./pages/Logs.jsx";
import Trade from "./pages/Trade.jsx";
import Settings from "./pages/Settings.jsx";
import AIInsights from "./pages/AIInsights.jsx";
import MarketLive from "./pages/MarketLive.jsx";
import Agent from "./pages/Agent.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="grid min-h-screen place-items-center text-cyber">Connecting to Intelli-Crypto…</div>;
  }
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="market" element={<MarketLive />} />
        <Route path="agent" element={<Agent />} />
        <Route path="ai" element={<AIInsights />} />
        <Route path="trade" element={<Trade />} />
        <Route path="history" element={<History />} />
        <Route path="logs" element={<Logs />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, setAccessToken } from "../services/api.js";

const storageKey = "intelli-crypto-user";

const defaultUser = {
  username: "architect",
  email: "architect@intelli.crypto",
  expertise: "Pro",
  fullName: "Demo Architect",
  country: "United States",
  baseCurrency: "USD",
  riskProfile: "Balanced",
  maxTradeSize: "5000",
  exchanges: ["Binance", "Kraken", "Coinbase", "OKX", "Bybit", "KuCoin"],
  marketDataMode: "Demo",
  refreshInterval: "5",
  makerFee: "0.08",
  takerFee: "0.10",
  slippageBuffer: "0.12",
  minNetSpread: "0.18",
  paperTrading: true,
  autoExecute: false,
  smartAlerts: true,
  anomalyDetection: true,
  whaleWatch: true,
  newsSentiment: true,
  executionPreset: "Balanced",
  twoFactor: true,
};

const fallbackAuth = {
  user: null,
  token: null,
  loading: true,
  register: async () => {},
  login: async () => {},
  demoLogin: () => {},
  logout: () => {},
  updateUser: async () => {},
};

const AuthContext = createContext(fallbackAuth);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        setLoading(false);
        return;
      }
      try {
        const parsed = JSON.parse(saved);
        if (parsed.token) {
          setAccessToken(parsed.token);
          const payload = await apiRequest("/auth/me/");
          setToken(parsed.token);
          setUser({ ...defaultUser, ...payload.user, isDemo: false });
        } else {
          // Preserve accounts created by the original browser-only demo.
          setUser({ ...defaultUser, ...parsed, isDemo: true });
        }
      } catch {
        localStorage.removeItem(storageKey);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const value = useMemo(() => {
    const persistDemo = (nextUser) => {
      localStorage.setItem(storageKey, JSON.stringify(nextUser));
      setAccessToken(null);
      setToken(null);
      setUser(nextUser);
    };

    const persistReal = (nextToken, nextUser) => {
      localStorage.setItem(storageKey, JSON.stringify({ token: nextToken }));
      setAccessToken(nextToken);
      setToken(nextToken);
      setUser({ ...defaultUser, ...nextUser, isDemo: false });
    };

    return {
      user,
      token,
      loading,
      register: async (form) => {
        const payload = await apiRequest("/auth/register/", { method: "POST", body: JSON.stringify(form) });
        persistReal(payload.token, payload.user);
        return payload.user;
      },
      login: async (email, password) => {
        const payload = await apiRequest("/auth/login/", { method: "POST", body: JSON.stringify({ email, password }) });
        persistReal(payload.token, payload.user);
        return payload.user;
      },
      demoLogin: () => persistDemo({ ...defaultUser, isDemo: true }),
      logout: async () => {
        if (token) {
          try {
            await apiRequest("/auth/logout/", { method: "POST" });
          } catch {
            // Local logout still succeeds if the API is temporarily unavailable.
          }
        }
        localStorage.removeItem(storageKey);
        setAccessToken(null);
        setToken(null);
        setUser(null);
      },
      updateUser: async (patch) => {
        const nextUser = { ...defaultUser, ...user, ...patch };
        setUser(nextUser);
        if (nextUser.isDemo) {
          persistDemo(nextUser);
          return nextUser;
        }
        try {
          const payload = await apiRequest("/auth/me/", { method: "PATCH", body: JSON.stringify(patch) });
          const savedUser = { ...defaultUser, ...payload.user, isDemo: false };
          setUser(savedUser);
          return savedUser;
        } catch (requestError) {
          setUser(user);
          throw requestError;
        }
      },
    };
  }, [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

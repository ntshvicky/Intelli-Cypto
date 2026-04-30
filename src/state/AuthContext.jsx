import { createContext, useContext, useMemo, useState } from "react";

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
  register: () => {},
  login: () => {},
  logout: () => {},
  updateUser: () => {},
};

const AuthContext = createContext(fallbackAuth);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? { ...defaultUser, ...JSON.parse(saved) } : null;
  });

  const value = useMemo(() => {
    const persist = (nextUser) => {
      localStorage.setItem(storageKey, JSON.stringify(nextUser));
      setUser(nextUser);
    };

    return {
      user,
      register: (form) => persist({ ...defaultUser, ...form }),
      login: (email) => persist({ ...defaultUser, email }),
      logout: () => {
        localStorage.removeItem(storageKey);
        setUser(null);
      },
      updateUser: (patch) => persist({ ...defaultUser, ...user, ...patch }),
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

import { useEffect, useMemo, useState } from "react";
import { fetchMarketQuotes, findArbitrageOpportunities } from "../services/marketData.js";
import { useAuth } from "../state/AuthContext.jsx";

export function useMarketData() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [source, setSource] = useState("Loading");
  const [status, setStatus] = useState("loading");

  const refreshMs = Math.max(3, Number(user?.refreshInterval || 5)) * 1000;
  const enabledExchanges = user?.exchanges || [];
  const mode = user?.marketDataMode || "Demo";

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setStatus("loading");
      try {
        const nextQuotes = await fetchMarketQuotes({ mode, enabledExchanges });
        if (!cancelled) {
          setQuotes(nextQuotes);
          setSource(nextQuotes[0]?.source || mode);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    };

    load();
    const intervalId = window.setInterval(load, refreshMs);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [enabledExchanges.join(","), mode, refreshMs]);

  const opportunities = useMemo(() => findArbitrageOpportunities(quotes, user), [quotes, user]);

  return {
    quotes,
    opportunities,
    source,
    status,
    mode,
    refreshMs,
  };
}

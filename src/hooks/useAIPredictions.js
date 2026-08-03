import { useEffect, useState } from "react";
import { aiPredictions as demoPredictions } from "../data/mockData.js";
import { fetchAIPredictions } from "../services/aiData.js";

export function useAIPredictions(mode) {
  const [predictions, setPredictions] = useState(mode === "Demo" ? demoPredictions : []);
  const [source, setSource] = useState(mode === "Demo" ? "Demo model" : "Loading live candles…");

  useEffect(() => {
    let cancelled = false;
    setSource(mode === "Demo" ? "Demo model" : "Loading live candles…");
    fetchAIPredictions(mode)
      .then((payload) => {
        if (!cancelled) {
          setPredictions(payload.predictions);
          setSource(payload.source);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setPredictions([]);
          setSource(error.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  return { predictions, source };
}

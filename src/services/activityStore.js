const historyKey = "intelli-crypto-history";
const logsKey = "intelli-crypto-logs";

export function readStoredHistory() {
  return readJson(historyKey);
}

export function readStoredLogs() {
  return readJson(logsKey);
}

export function addTradeHistory(entry) {
  const next = [entry, ...readStoredHistory()].slice(0, 50);
  localStorage.setItem(historyKey, JSON.stringify(next));
  return next;
}

export function addSystemLog(entry) {
  const next = [entry, ...readStoredLogs()].slice(0, 80);
  localStorage.setItem(logsKey, JSON.stringify(next));
  return next;
}

export function createTradeEntry({ pair, side, exchange, amount, price, result = "Filled", action }) {
  const notional = Number(amount || 0) * Number(price || 0);
  const simulatedPnl = result === "Filled" ? notional * 0.0018 : 0;

  return {
    id: `SIM-${Date.now().toString().slice(-6)}`,
    time: new Date().toLocaleTimeString(),
    pair,
    action: action || `${side} ${amount} on ${exchange}`,
    pnl: `${simulatedPnl >= 0 ? "+" : "-"}$${Math.abs(simulatedPnl).toFixed(2)}`,
    result,
  };
}

export function createLogEntry({ level = "INFO", source = "ExecutionDesk", message }) {
  return {
    level,
    time: new Date().toLocaleTimeString(),
    source,
    message,
  };
}

export async function fetchTradeHistory() {
  const payload = await apiRequest("/trades/");
  return payload.trades;
}

export async function fetchSystemLogs() {
  const payload = await apiRequest("/logs/");
  return payload.logs;
}

export async function saveTradeActivity(trade, log) {
  const payload = await apiRequest("/trades/", {
    method: "POST",
    body: JSON.stringify({
      ...trade,
      logSource: log?.source,
      logMessage: log?.message,
    }),
  });
  return payload.trade;
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
import { apiRequest } from "./api.js";

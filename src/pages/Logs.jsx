import { AlertTriangle, Info } from "lucide-react";
import Panel from "../components/Panel.jsx";
import { logRows } from "../data/mockData.js";

export default function Logs() {
  const iconFor = (level) => level === "WARN" || level === "ERROR" ? <AlertTriangle size={16} /> : <Info size={16} />;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-cyber">Observability</p>
        <h1 className="mt-1 text-3xl font-semibold">System Logs</h1>
      </div>
      <Panel title="Event Stream">
        <div className="thin-scrollbar max-h-[640px] space-y-3 overflow-y-auto pr-2">
          {logRows.map((row, index) => (
            <div key={`${row.time}-${index}`} className="grid gap-3 rounded border border-line bg-white/[0.04] p-4 md:grid-cols-[120px_130px_1fr] md:items-center">
              <div className={`inline-flex w-fit items-center gap-2 rounded px-2 py-1 text-xs ${row.level === "ERROR" ? "bg-danger/15 text-danger" : row.level === "WARN" ? "bg-gold/15 text-gold" : "bg-cyber/15 text-cyber"}`}>
                {iconFor(row.level)}
                {row.level}
              </div>
              <p className="text-sm text-slate-400">{row.time}</p>
              <p className="text-sm text-slate-300"><span className="text-white">{row.source}</span>: {row.message}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

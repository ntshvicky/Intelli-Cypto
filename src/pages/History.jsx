import { useEffect, useState } from "react";
import Panel from "../components/Panel.jsx";
import { historyRows } from "../data/mockData.js";
import { fetchTradeHistory, readStoredHistory } from "../services/activityStore.js";
import { useAuth } from "../state/AuthContext.jsx";

export default function History() {
  const { user } = useAuth();
  const [rows, setRows] = useState(() => user.isDemo ? [...readStoredHistory(), ...historyRows] : []);
  const [status, setStatus] = useState(user.isDemo ? "Demo records" : "Loading MySQL records…");

  useEffect(() => {
    if (user.isDemo) return;
    fetchTradeHistory()
      .then((items) => {
        setRows(items);
        setStatus(`${items.length} MySQL record${items.length === 1 ? "" : "s"}`);
      })
      .catch((error) => setStatus(error.message));
  }, [user.isDemo]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-cyber">Audit trail · {status}</p>
        <h1 className="mt-1 text-3xl font-semibold">Trade History</h1>
      </div>
      <Panel title="Closed and Stopped Routes">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="pb-3">ID</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">Pair</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">PnL</th>
                <th className="pb-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 font-medium text-white">{row.id}</td>
                  <td className="py-3 text-slate-400">{row.time}</td>
                  <td className="py-3">{row.pair}</td>
                  <td className="py-3 text-slate-300">{row.action}</td>
                  <td className={`py-3 ${row.pnl.startsWith("+") ? "text-mint" : row.pnl.startsWith("-") ? "text-danger" : "text-slate-300"}`}>{row.pnl}</td>
                  <td className="py-3">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No paper trades have been recorded yet.</p>}
        </div>
      </Panel>
    </div>
  );
}

import Panel from "../components/Panel.jsx";
import { historyRows } from "../data/mockData.js";

export default function History() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-cyber">Audit trail</p>
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
              {historyRows.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 font-medium text-white">{row.id}</td>
                  <td className="py-3 text-slate-400">{row.time}</td>
                  <td className="py-3">{row.pair}</td>
                  <td className="py-3 text-slate-300">{row.action}</td>
                  <td className={`py-3 ${row.pnl.startsWith("+") ? "text-mint" : "text-danger"}`}>{row.pnl}</td>
                  <td className="py-3">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

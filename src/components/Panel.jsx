export default function Panel({ title, action, children }) {
  return (
    <section className="rounded border border-line bg-panel/76 p-4 shadow-glow">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

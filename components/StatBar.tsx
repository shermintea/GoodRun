type Stat = { label: string; value: string };
export default function StatBar({ stats }: { stats: Stat[] }) {
  return (
    <section className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-2xl font-semibold">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

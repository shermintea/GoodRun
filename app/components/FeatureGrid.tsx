type Feature = { title: string; desc: string; icon?: "calendar" | "users" | "check" };
export default function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <div key={i} className="rounded-2xl border p-5 bg-white">
            <div className="mb-3 h-8 w-8 rounded-full border flex items-center justify-center text-xs">
              {f.icon ?? "•"}
            </div>
            <h3 className="font-medium">{f.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

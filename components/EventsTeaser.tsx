type Item = { id: string; title: string; date: string; location: string; spotsLeft: number };

export default function EventsTeaser({
  title, description, items,
}: { title: string; description?: string; items: Item[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
        <a href="/events" className="text-sm underline">See all</a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((e) => (
          <article key={e.id} className="rounded-2xl border p-4 bg-white">
            <h3 className="font-medium">{e.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{e.location}</p>
            <p className="text-sm text-gray-600">{new Date(e.date).toLocaleDateString()}</p>
            <p className="text-sm mt-2">Spots left: <b>{e.spotsLeft}</b></p>
            <a className="mt-4 inline-block text-sm underline" href={`/events/${e.id}`}>View details</a>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function CTASection({
  title, subtitle, ctaLabel, ctaHref,
}: { title: string; subtitle?: string; ctaLabel: string; ctaHref: string }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="rounded-2xl border p-8 text-center bg-gray-50">
        <h3 className="text-xl sm:text-2xl font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        <a href={ctaHref} className="mt-6 inline-block rounded-xl border px-4 py-2">{ctaLabel}</a>
      </div>
    </section>
  );
}

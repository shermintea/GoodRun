type CTA = { label: string; href: string };

export default function Hero({
  eyebrow,
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaPrimary?: CTA;
  ctaSecondary?: CTA;
}) {
  return (
    <section>
      <h1>{title}</h1>
      {eyebrow && <p>{eyebrow}</p>}
      {subtitle && <p>{subtitle}</p>}
      <div>
        {ctaPrimary && <a href={ctaPrimary.href}>{ctaPrimary.label}</a>}
        {ctaSecondary && <a href={ctaSecondary.href}>{ctaSecondary.label}</a>}
      </div>
    </section>
  );
}


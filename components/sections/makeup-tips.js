import Link from "next/link";

export default function MakeupTips({ title, items = [] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <span className="font-script text-2xl text-brand-orchid-500">Guía Mariangel</span>
        <h2 className="text-2xl font-extrabold text-brand-deep-900 sm:text-3xl">{title}</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((tip) => (
          <div
            key={tip.id}
            className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-brand-plum-700/5 ring-1 ring-brand-blush-100"
          >
            {tip.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tip.image} alt={tip.title} className="h-48 w-full object-cover" />
            )}
            <div className="flex flex-1 flex-col gap-2 p-5">
              <h3 className="text-base font-bold text-brand-deep-900">{tip.title}</h3>
              <p className="flex-1 text-sm leading-relaxed text-brand-deep-900/70">{tip.text}</p>
              {tip.product && (
                <Link
                  href={`/producto/${tip.product.slug}`}
                  className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-brand-plum-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-plum-700"
                >
                  Ver {tip.product.name}
                  <span aria-hidden>→</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

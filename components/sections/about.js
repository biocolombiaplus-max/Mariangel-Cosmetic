export default function About({ about }) {
  if (!about) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="relative order-2 md:order-1">
          <div className="aspect-[4/3] overflow-hidden rounded-[2.5rem] shadow-xl shadow-brand-plum-700/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={about.image} alt={about.title} className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <span className="font-script text-2xl text-brand-orchid-500">Nuestra esencia</span>
          <h2 className="mt-1 text-2xl font-extrabold text-brand-deep-900 sm:text-3xl">
            {about.title}
          </h2>
          <p className="mt-4 text-brand-deep-900/70 leading-relaxed">{about.text}</p>
          <ul className="mt-6 flex flex-col gap-3">
            {(about.highlights || []).map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm font-medium text-brand-deep-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-pink-200 text-brand-plum-700">
                  ✓
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

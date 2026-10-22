export default function WhatsappReviews({ title, items = [] }) {
  items = items.filter((it) => it.image);
  if (items.length === 0) return null;

  return (
    <section className="bg-brand-blush-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <span className="font-script text-2xl text-brand-orchid-500">100% real</span>
          <h2 className="text-2xl font-extrabold text-brand-deep-900 sm:text-3xl">{title}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="overflow-hidden rounded-3xl bg-white shadow-md shadow-brand-plum-700/5"
            >
              <div className="flex items-center gap-2 bg-[#075E54] px-4 py-2.5">
                <svg viewBox="0 0 32 32" className="h-4 w-4 shrink-0 fill-white">
                  <path d="M16.004 2.667c-7.363 0-13.337 5.973-13.337 13.336 0 2.353.615 4.646 1.782 6.666l-1.892 6.908 7.077-1.856a13.29 13.29 0 0 0 6.37 1.622h.006c7.362 0 13.336-5.974 13.336-13.34 0-3.563-1.388-6.914-3.908-9.434a13.253 13.253 0 0 0-9.434-3.902Z" />
                </svg>
                <span className="text-xs font-semibold text-white">
                  {it.customerName || "Chat de WhatsApp"}
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.image} alt={it.customerName || ""} className="w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

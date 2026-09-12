import StarRating from "@/components/star-rating";

export default function Testimonials({ testimonials = [] }) {
  if (testimonials.length === 0) return null;
  return (
    <section className="brand-gradient-soft py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <span className="font-script text-2xl text-brand-orchid-500">Clientas felices</span>
          <h2 className="text-2xl font-extrabold text-brand-deep-900 sm:text-3xl">
            Lo que dicen de nosotras
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <div key={t.id} className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm">
              <StarRating rating={t.rating} />
              <p className="text-sm leading-relaxed text-brand-deep-900/80">&ldquo;{t.text}&rdquo;</p>
              <span className="mt-auto text-sm font-semibold text-brand-plum-700">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

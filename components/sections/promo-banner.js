export default function PromoBanner({ promo }) {
  if (!promo) return null;
  return (
    <section className="relative overflow-hidden">
      <div
        className="relative flex min-h-[110px] items-center justify-center px-4 py-6 text-center brand-gradient"
        style={
          promo.image
            ? {
                backgroundImage: `linear-gradient(rgba(75,39,72,0.55), rgba(75,39,72,0.55)), url(${promo.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <p className="max-w-3xl text-sm font-semibold uppercase tracking-wider text-white sm:text-base">
          {promo.text}
        </p>
      </div>
    </section>
  );
}

const STEPS = [
  {
    number: "1",
    icon: "🛍️",
    title: "Elige tus productos",
    text: "Explora el catálogo y agrega al carrito lo que te enamore.",
  },
  {
    number: "2",
    icon: "💬",
    title: "Escríbenos por WhatsApp",
    text: "Confirma tu pedido en un clic — nosotras armamos el mensaje por ti.",
  },
  {
    number: "3",
    icon: "🎁",
    title: "Recíbelo en tu puerta",
    text: "Coordina el pago y la entrega directamente con nuestro equipo.",
  },
];

export default function HowToBuy() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <span className="font-script text-2xl text-brand-orchid-500">Es muy fácil</span>
        <h2 className="text-2xl font-extrabold text-brand-deep-900 sm:text-3xl">Cómo comprar</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="relative rounded-3xl bg-white p-7 text-center shadow-sm ring-1 ring-brand-blush-100"
          >
            <span className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-brand-plum-600 text-sm font-bold text-white">
              {step.number}
            </span>
            <span className="mx-auto mb-3 mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-brand-blush-100 text-2xl">
              {step.icon}
            </span>
            <h3 className="text-base font-bold text-brand-deep-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-deep-900/60">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

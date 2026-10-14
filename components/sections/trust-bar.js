const ITEMS = [
  {
    icon: "🚚",
    title: "Envío a toda Colombia",
    text: "Gratis en Cúcuta, Los Patios y Villa del Rosario desde $59.000",
  },
  {
    icon: "💬",
    title: "Asesoría personalizada",
    text: "Te ayudamos a elegir tu tono por WhatsApp",
  },
  {
    icon: "🔒",
    title: "Compra segura",
    text: "Pagas al recibir o contraentrega",
  },
  {
    icon: "⭐",
    title: "+2.000 clientas felices",
    text: "Productos 100% originales y de calidad",
  },
];

export default function TrustBar() {
  return (
    <section className="border-y border-brand-blush-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-6 sm:px-6 md:grid-cols-4 md:gap-4">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-blush-100 text-xl">
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight text-brand-deep-900">{item.title}</p>
              <p className="text-xs leading-tight text-brand-deep-900/55">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

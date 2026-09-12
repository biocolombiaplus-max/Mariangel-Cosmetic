import { waLink } from "@/lib/whatsapp";

export default function WhatsAppCTA({ whatsapp, storeName }) {
  const message = `¡Hola ${storeName}! 💕 Quiero conocer más sobre sus productos.`;
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 pt-4 sm:px-6">
      <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-brand-deep-900 px-6 py-12 text-center sm:px-12">
        <span className="text-3xl">💬</span>
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          ¿Tienes dudas sobre un producto?
        </h2>
        <p className="max-w-md text-brand-blush-100/80">
          Escríbenos por WhatsApp y te ayudamos a elegir el tono y producto perfecto para ti.
        </p>
        <a
          href={waLink(whatsapp, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-95"
        >
          Chatea con nosotras
        </a>
      </div>
    </section>
  );
}

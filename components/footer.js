import Link from "next/link";
import BrandLogo from "@/components/brand-logo";
import { waLink, normalizeCoPhone } from "@/lib/whatsapp";

const BIOMARKETING_WHATSAPP = normalizeCoPhone("3505457420");
const BIOMARKETING_MESSAGE = "Quiero los servicios de página web de Biomarketing";

export default function Footer({ settings, footer, categories = [] }) {
  return (
    <footer className="mt-16 bg-brand-deep-900 text-brand-blush-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <BrandLogo logoUrl={settings?.logo} size="md" className="[&_span]:text-white" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-blush-100/80">
            {footer?.description}
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={settings?.instagramUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 2.3.32 3.1 1.1.8.8 1 1.9 1.1 3.1.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.32 2.3-1.1 3.1-.8.8-1.9 1-3.1 1.1-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-2.3-.32-3.1-1.1-.8-.8-1-1.9-1.1-3.1C2.8 15.6 2.8 15.2 2.8 12s0-3.6.07-4.9c.06-1.2.32-2.3 1.1-3.1.8-.8 1.9-1 3.1-1.1C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.07-1 .05-1.6.23-2 .4a3.2 3.2 0 0 0-1.2.77 3.2 3.2 0 0 0-.77 1.2c-.17.4-.35 1-.4 2C3 9.5 3 9.9 3 13s0 3.5.07 4.7c.05 1 .23 1.6.4 2 .17.45.4.8.77 1.2.35.35.7.6 1.2.77.4.17 1 .35 2 .4 1.2.07 1.6.07 4.7.07s3.5 0 4.7-.07c1-.05 1.6-.23 2-.4a3.2 3.2 0 0 0 1.2-.77 3.2 3.2 0 0 0 .77-1.2c.17-.4.35-1 .4-2C21 16.5 21 16.1 21 13s0-3.5-.07-4.7c-.05-1-.23-1.6-.4-2a3.2 3.2 0 0 0-.77-1.2 3.2 3.2 0 0 0-1.2-.77c-.4-.17-1-.35-2-.4C15.5 4 15.1 4 12 4Zm0 3.4a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2Zm0 1.8a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm5.8-2a1.3 1.3 0 1 1-2.6 0 1.3 1.3 0 0 1 2.6 0Z" />
              </svg>
            </a>
            <a
              href={`https://wa.me/${settings?.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="WhatsApp"
            >
              <svg viewBox="0 0 32 32" className="h-5 w-5 fill-white">
                <path d="M16.004 2.667c-7.363 0-13.337 5.973-13.337 13.336 0 2.353.615 4.646 1.782 6.666l-1.892 6.908 7.077-1.856a13.29 13.29 0 0 0 6.37 1.622h.006c7.362 0 13.336-5.974 13.336-13.34 0-3.563-1.388-6.914-3.908-9.434a13.253 13.253 0 0 0-9.434-3.902Z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-pink-200">
            Categorías
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-brand-blush-100/80">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/tienda?categoria=${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-pink-200">
            Contacto
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-brand-blush-100/80">
            <li>{footer?.schedule}</li>
            <li>{footer?.city}</li>
            <li>{footer?.email}</li>
            <li>
              <a
                href={`https://wa.me/${settings?.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                WhatsApp: +{settings?.whatsapp}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex justify-center border-t border-white/10 py-5">
        <a
          href={waLink(BIOMARKETING_WHATSAPP, BIOMARKETING_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="brand-gradient inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-plum-700/30 transition-transform hover:scale-[1.03]"
        >
          <svg viewBox="0 0 32 32" className="h-3.5 w-3.5 fill-white">
            <path d="M16.004 2.667c-7.363 0-13.337 5.973-13.337 13.336 0 2.353.615 4.646 1.782 6.666l-1.892 6.908 7.077-1.856a13.29 13.29 0 0 0 6.37 1.622h.006c7.362 0 13.336-5.974 13.336-13.34 0-3.563-1.388-6.914-3.908-9.434a13.253 13.253 0 0 0-9.434-3.902Z" />
          </svg>
          Página diseñada por{" "}
          <span className="font-script text-sm normal-case tracking-normal">Biomarketing</span>
        </a>
      </div>
      <div className="flex flex-col items-center gap-2 border-t border-white/10 py-4 text-center text-xs text-brand-blush-100/60 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <span>
          © {new Date().getFullYear()} {settings?.storeName || "Mariangel Cosmetic"}. Todos los derechos
          reservados.
        </span>
        <Link href="/admin/login" className="text-brand-blush-100/50 hover:text-white hover:underline">
          Iniciar sesión (equipo)
        </Link>
      </div>
    </footer>
  );
}

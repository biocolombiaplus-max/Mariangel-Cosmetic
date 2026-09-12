export default function InstagramGallery({ instagram, instagramUrl }) {
  if (!instagram) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <span className="font-script text-2xl text-brand-orchid-500">Síguenos</span>
        <h2 className="text-2xl font-extrabold text-brand-deep-900 sm:text-3xl">
          {instagram.title}
        </h2>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-sm font-semibold text-brand-plum-700 hover:underline"
        >
          {instagram.handle}
        </a>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-6">
        {(instagram.images || []).map((src, i) => (
          <a
            key={src + i}
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Instagram Mariangel Cosmetic"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-brand-deep-900/0 text-white opacity-0 transition-all group-hover:bg-brand-deep-900/30 group-hover:opacity-100">
              ♡
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

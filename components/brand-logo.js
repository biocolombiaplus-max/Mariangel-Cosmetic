// Recreated logo lockup inspired by the Mariangel Cosmetic brand mark
// (rose/lilac ring + script wordmark). Replace via the admin panel's
// "Logo" upload once you have the real logo file to use pixel-perfect art.
export default function BrandLogo({ className = "", showRing = true, size = "md", logoUrl = "" }) {
  const sizes = {
    sm: { ring: 34, text: "text-lg" },
    md: { ring: 44, text: "text-xl" },
    lg: { ring: 64, text: "text-3xl" },
  };
  const s = sizes[size] || sizes.md;

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt="Mariangel Cosmetic"
        className={className}
        style={{ height: s.ring, width: "auto" }}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {showRing && (
        <span
          className="relative inline-flex items-center justify-center rounded-full shrink-0"
          style={{
            width: s.ring,
            height: s.ring,
            background:
              "conic-gradient(from 210deg, var(--brand-pink-200), var(--brand-orchid-400), var(--brand-plum-700), var(--brand-pink-200))",
            padding: 2,
          }}
        >
          <span className="flex h-full w-full items-center justify-center rounded-full bg-brand-cream">
            <span className="brand-text-gradient font-script text-sm">M</span>
          </span>
        </span>
      )}
      <span className="flex flex-col leading-none">
        <span className={`font-script brand-text-gradient ${s.text}`}>Mariangel</span>
        <span className="text-[10px] tracking-[0.35em] text-brand-plum-700 font-semibold -mt-0.5">
          COSMETIC
        </span>
      </span>
    </span>
  );
}

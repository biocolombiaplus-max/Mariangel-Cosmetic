// Generates on-brand SVG placeholder images (products + hero/section art)
// so the store has a full, good-looking catalog before real photos are
// uploaded through the admin panel. Pure SVG, no external calls/deps.
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const palette = {
  blush50: "#FDF1F6",
  blush100: "#F8DCE9",
  pink200: "#F0BFDA",
  pink300: "#E39FC6",
  orchid400: "#CE7FB0",
  orchid500: "#B5629B",
  plum600: "#8E4C86",
  plum700: "#6E3A6B",
  deep800: "#4B2748",
  deep900: "#331B33",
  cream: "#FFF8F3",
};

function grad(id, stops) {
  return `<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
    ${stops.map((s, i) => `<stop offset="${(i / (stops.length - 1)) * 100}%" stop-color="${s}"/>`).join("\n    ")}
  </linearGradient>`;
}

function sparkle(cx, cy, s, fill, opacity = 0.85) {
  return `<path transform="translate(${cx} ${cy}) scale(${s})" opacity="${opacity}" fill="${fill}" d="M0 -10 C1 -3 3 -1 10 0 C3 1 1 3 0 10 C-1 3 -3 1 -10 0 C-3 -1 -1 -3 0 -10 Z"/>`;
}

function productSVG({ icon, stops, title }) {
  const w = 900, h = 1100;
  const id = "g" + Math.random().toString(36).slice(2, 8);
  const iconColor = "#ffffff";
  let art = "";
  switch (icon) {
    case "lipstick":
      art = `
        <rect x="${w/2-55}" y="${h/2-190}" width="110" height="150" rx="18" fill="${iconColor}" opacity="0.95"/>
        <path d="M ${w/2-55} ${h/2-40} L ${w/2+55} ${h/2-40} L ${w/2+30} ${h/2+120} Q ${w/2} ${h/2+165} ${w/2-30} ${h/2+120} Z" fill="${iconColor}" opacity="0.95"/>
        <rect x="${w/2-60}" y="${h/2-230}" width="120" height="46" rx="10" fill="${iconColor}"/>
      `;
      break;
    case "blush":
      art = `<circle cx="${w/2}" cy="${h/2}" r="150" fill="${iconColor}" opacity="0.9"/>
        <circle cx="${w/2}" cy="${h/2}" r="95" fill="none" stroke="${iconColor}" stroke-width="10" opacity="0.55"/>`;
      break;
    case "foundation":
      art = `<rect x="${w/2-110}" y="${h/2-170}" width="220" height="300" rx="36" fill="${iconColor}" opacity="0.92"/>
        <rect x="${w/2-60}" y="${h/2-230}" width="120" height="70" rx="20" fill="${iconColor}"/>`;
      break;
    case "eyeshadow":
      art = `<rect x="${w/2-160}" y="${h/2-110}" width="320" height="220" rx="28" fill="${iconColor}" opacity="0.92"/>
        <circle cx="${w/2-95}" cy="${h/2}" r="42" fill="${stops[0]}"/>
        <circle cx="${w/2}" cy="${h/2}" r="42" fill="${stops[1]}"/>
        <circle cx="${w/2+95}" cy="${h/2}" r="42" fill="${stops[2] || stops[1]}"/>`;
      break;
    case "brush":
      art = `<rect x="${w/2-16}" y="${h/2-40}" width="32" height="260" rx="14" fill="${iconColor}" opacity="0.95"/>
        <ellipse cx="${w/2}" cy="${h/2-140}" rx="70" ry="110" fill="${iconColor}"/>`;
      break;
    case "skincare":
      art = `<rect x="${w/2-90}" y="${h/2-160}" width="180" height="280" rx="90" fill="${iconColor}" opacity="0.92"/>
        <rect x="${w/2-45}" y="${h/2-200}" width="90" height="50" rx="16" fill="${iconColor}"/>`;
      break;
    case "kit":
      art = `<rect x="${w/2-170}" y="${h/2-120}" width="340" height="240" rx="30" fill="${iconColor}" opacity="0.92"/>
        <rect x="${w/2-170}" y="${h/2-170}" width="340" height="60" rx="16" fill="${iconColor}"/>`;
      break;
    case "brow":
      art = `<rect x="${w/2-14}" y="${h/2-180}" width="28" height="320" rx="14" fill="${iconColor}" opacity="0.95" transform="rotate(20 ${w/2} ${h/2})"/>`;
      break;
    default:
      art = `<circle cx="${w/2}" cy="${h/2}" r="140" fill="${iconColor}" opacity="0.9"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>${grad(id, stops)}</defs>
  <rect width="${w}" height="${h}" fill="url(#${id})"/>
  ${sparkle(120, 140, 2.2, "#ffffff", 0.5)}
  ${sparkle(w-140, 180, 1.4, "#ffffff", 0.4)}
  ${sparkle(w-110, h-160, 2, "#ffffff", 0.45)}
  ${sparkle(110, h-120, 1.3, "#ffffff", 0.35)}
  ${art}
  <text x="50%" y="${h-70}" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-size="34" fill="#ffffff" opacity="0.9" font-weight="600">${title}</text>
</svg>`;
}

function bannerSVG({ stops, label }) {
  const w = 1800, h = 900;
  const id = "b" + Math.random().toString(36).slice(2, 8);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>${grad(id, stops)}</defs>
  <rect width="${w}" height="${h}" fill="url(#${id})"/>
  <circle cx="${w*0.85}" cy="${h*0.25}" r="260" fill="#ffffff" opacity="0.08"/>
  <circle cx="${w*0.15}" cy="${h*0.8}" r="220" fill="#ffffff" opacity="0.07"/>
  ${sparkle(w*0.12, h*0.22, 3, "#ffffff", 0.55)}
  ${sparkle(w*0.9, h*0.75, 2.4, "#ffffff", 0.5)}
  ${sparkle(w*0.5, h*0.12, 1.8, "#ffffff", 0.4)}
  <text x="50%" y="52%" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-size="46" fill="#ffffff" opacity="0.85" font-weight="600" letter-spacing="4">${label}</text>
</svg>`;
}

mkdirSync(path.join(root, "public/products"), { recursive: true });
mkdirSync(path.join(root, "public/brand"), { recursive: true });

const products = [
  { file: "labial-mate-rose.svg", icon: "lipstick", title: "Labial Mate", stops: [palette.pink300, palette.orchid500] },
  { file: "labial-gloss-berry.svg", icon: "lipstick", title: "Gloss Brillante", stops: [palette.orchid400, palette.plum600] },
  { file: "labial-liquido-nude.svg", icon: "lipstick", title: "Labial Líquido", stops: [palette.blush100, palette.pink300] },
  { file: "rubor-duo.svg", icon: "blush", title: "Rubor en Polvo", stops: [palette.pink200, palette.orchid400] },
  { file: "iluminador-glow.svg", icon: "blush", title: "Iluminador Glow", stops: [palette.blush50, palette.pink300] },
  { file: "base-natural.svg", icon: "foundation", title: "Base Natural", stops: [palette.plum600, palette.deep800] },
  { file: "corrector-hd.svg", icon: "foundation", title: "Corrector HD", stops: [palette.pink300, palette.plum600] },
  { file: "paleta-sombras-sunset.svg", icon: "eyeshadow", title: "Paleta Sombras", stops: [palette.pink200, palette.orchid500, palette.plum700] },
  { file: "paleta-sombras-nude.svg", icon: "eyeshadow", title: "Paleta Nude", stops: [palette.blush100, palette.pink300, palette.orchid400] },
  { file: "set-brochas-pro.svg", icon: "brush", title: "Set de Brochas", stops: [palette.orchid500, palette.deep900] },
  { file: "esponja-blending.svg", icon: "brush", title: "Esponja Blending", stops: [palette.pink200, palette.pink300] },
  { file: "serum-hidratante.svg", icon: "skincare", title: "Sérum Hidratante", stops: [palette.blush50, palette.orchid400] },
  { file: "crema-glow.svg", icon: "skincare", title: "Crema Glow", stops: [palette.blush100, palette.plum600] },
  { file: "kit-mariangel-signature.svg", icon: "kit", title: "Kit Signature", stops: [palette.plum700, palette.deep900] },
  { file: "gel-cejas.svg", icon: "brow", title: "Gel de Cejas", stops: [palette.deep800, palette.plum600] },
];

for (const p of products) {
  writeFileSync(path.join(root, "public/products", p.file), productSVG(p));
}

const banners = [
  { file: "hero-1.svg", label: "NUEVA COLECCIÓN", stops: [palette.orchid500, palette.plum700] },
  { file: "hero-2.svg", label: "MARIANGEL COSMETIC", stops: [palette.pink300, palette.deep800] },
  { file: "promo-envio.svg", label: "ENVÍOS A TODA COLOMBIA", stops: [palette.plum600, palette.deep900] },
  { file: "about.svg", label: "NUESTRA HISTORIA", stops: [palette.blush100, palette.orchid400] },
  { file: "insta-1.svg", label: "@MARIANGELCOSMETIC", stops: [palette.pink200, palette.orchid500] },
  { file: "insta-2.svg", label: "GLOW UP", stops: [palette.orchid400, palette.plum600] },
  { file: "insta-3.svg", label: "BEAUTY", stops: [palette.pink300, palette.plum700] },
  { file: "insta-4.svg", label: "SELF CARE", stops: [palette.blush100, palette.pink300] },
  { file: "insta-5.svg", label: "TRENDY", stops: [palette.orchid500, palette.deep800] },
  { file: "insta-6.svg", label: "MARIANGEL", stops: [palette.plum600, palette.deep900] },
];

for (const b of banners) {
  writeFileSync(path.join(root, "public/brand", b.file), bannerSVG(b));
}

console.log(`Generated ${products.length} product images and ${banners.length} brand images.`);

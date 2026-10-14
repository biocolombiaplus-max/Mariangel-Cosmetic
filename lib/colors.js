// Best-effort mapping from a variant value's text (e.g. "02 - Rojo
// Vinotinto") to a CSS color, so color-like options can render as a small
// swatch dot instead of plain text — a nice touch borrowed from Shopify
// color pickers, without requiring the admin to configure anything extra.
const SWATCHES = [
  { keywords: ["vinotinto", "vino", "burdeos", "borgoña"], color: "#6e1423" },
  { keywords: ["rojo", "red", "escarlata", "scarlett", "scarlet"], color: "#d62828" },
  { keywords: ["rosado", "rosa", "pink", "fucsia", "fuchsia"], color: "#e85d9c" },
  { keywords: ["coral", "durazno", "peach", "salmon"], color: "#f08a6c" },
  { keywords: ["nude", "beige", "arena", "camel"], color: "#d9b08c" },
  { keywords: ["café", "cafe", "marrón", "marron", "chocolate", "brown"], color: "#6b4226" },
  { keywords: ["naranja", "orange"], color: "#f07d20" },
  { keywords: ["amarillo", "yellow", "dorado", "oro", "gold"], color: "#dba514" },
  { keywords: ["verde", "green", "menta", "mint"], color: "#4c9a5a" },
  { keywords: ["turquesa", "turquoise", "celeste", "aqua"], color: "#38b6bf" },
  { keywords: ["azul", "blue", "navy"], color: "#2a5ca8" },
  { keywords: ["morado", "purple", "violeta", "violet", "lila", "lavanda"], color: "#8e4c86" },
  { keywords: ["negro", "black"], color: "#1c1c1c" },
  { keywords: ["blanco", "white", "perla", "pearl"], color: "#f5f3f0" },
  { keywords: ["plateado", "plata", "silver"], color: "#c3c6ca" },
  { keywords: ["gris", "grey", "gray"], color: "#8a8a8a" },
];

function strip(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function swatchColorFor(value) {
  if (!value) return null;
  const normalized = strip(String(value));
  for (const { keywords, color } of SWATCHES) {
    if (keywords.some((k) => normalized.includes(strip(k)))) return color;
  }
  return null;
}

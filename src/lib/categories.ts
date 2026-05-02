export const CATEGORIES = [
  "Bolos",
  "Doces",
  "Salgados",
  "Massas",
  "Bebidas",
  "Carnes",
  "Sobremesas",
  "Lanches",
  "Receitas da Família",
  "Outros",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_EMOJI: Record<string, string> = {
  Bolos: "🎂",
  Doces: "🍬",
  Salgados: "🥟",
  Massas: "🍝",
  Bebidas: "🥤",
  Carnes: "🥩",
  Sobremesas: "🍰",
  Lanches: "🥪",
  "Receitas da Família": "👵",
  Outros: "🍽️",
};

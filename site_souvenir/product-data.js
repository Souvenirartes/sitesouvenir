const rawSouvenirProducts = [
  { name: "Chaveiro placa Mercosul", price: "R$ 29,90", category: "Chaveiros", accent: "#1d4f9c", hasVariants: true },
  { name: "Chaveiro Coracao", price: "R$ 25,90", category: "Chaveiros", accent: "#e57373", hasVariants: true },
  { name: "Chaveiro redondo", price: "R$ 23,90", category: "Chaveiros", accent: "#34a853", hasVariants: false },
  { name: "Chaveiro quadrado", price: "R$ 23,90", category: "Chaveiros", accent: "#ff8a65", hasVariants: false },
  { name: "Chaveiro link quadrado", price: "R$ 27,90", category: "Chaveiros", accent: "#9575cd", hasVariants: true },
  { name: "Chaveiro link redondo", price: "R$ 27,90", category: "Chaveiros", accent: "#4db6ac", hasVariants: true },
  { name: "Chaveiro link coracao", price: "R$ 27,90", category: "Chaveiros", accent: "#f06292", hasVariants: true },
  { name: "Necessaire", price: "R$ 49,90", category: "Acessorios", accent: "#8d6e63", hasVariants: false },
  { name: "Porta-moedas", price: "R$ 19,90", category: "Acessorios", accent: "#198754", hasVariants: false },
  { name: "Necessaire bau", price: "R$ 59,90", category: "Acessorios", accent: "#0f2f6e", hasVariants: true },
  { name: "Necessaire pet", price: "R$ 39,90", category: "Acessorios", accent: "#4fc3f7", hasVariants: true },
  { name: "Estojo", price: "R$ 34,90", category: "Acessorios", accent: "#ffb74d", hasVariants: false },
  { name: "Necessaire link", price: "R$ 44,90", category: "Acessorios", accent: "#81c784", hasVariants: true },
  { name: "Caneca", price: "R$ 39,90", category: "Canecas", accent: "#ff7043", hasVariants: false },
  { name: "Caneca personalizada", price: "R$ 59,90", category: "Canecas", accent: "#1d4f9c", hasVariants: true },
  { name: "Ima placa", price: "R$ 14,90", category: "Imas", accent: "#26a69a", hasVariants: false },
  { name: "Ima abridor retangular", price: "R$ 16,90", category: "Imas", accent: "#66bb6a", hasVariants: false },
  { name: "Chaveiro letra", price: "R$ 24,90", category: "Personalizados", accent: "#7e57c2", hasVariants: true }
];

const toSlug = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const parsePriceValue = (priceLabel) =>
  Number(priceLabel.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());

window.SOUVENIR_PRODUCT_DATA = rawSouvenirProducts.map((item, index) => ({
  id: `souvenir-${String(index + 1).padStart(3, "0")}`,
  slug: toSlug(item.name),
  currency: "BRL",
  priceValue: parsePriceValue(item.price),
  active: true,
  ...item
}));

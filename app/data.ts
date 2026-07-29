export type Category = "Açaí" | "Bowls" | "Bebidas" | "Combos";

export type Product = {
  id: string;
  name: string;
  category: Category;
  description: string;
  price: number;
  image: string;
  badge?: string;
  rating: number;
  prep: string;
};

export type CartItem = Product & { quantity: number; size: string };

export const products: Product[] = [
  {
    id: "acai-classico",
    name: "Açaí Clássico",
    category: "Açaí",
    description: "Açaí cremoso, banana, morango, granola artesanal e mel.",
    price: 24.9,
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=900&q=85",
    badge: "Mais pedido",
    rating: 4.9,
    prep: "15–20 min",
  },
  {
    id: "ninho-dream",
    name: "Ninho Dream",
    category: "Açaí",
    description: "Açaí, creme de Ninho, morango, leite em pó e leite condensado.",
    price: 29.9,
    image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=900&q=85",
    badge: "Favorito",
    rating: 4.8,
    prep: "15–20 min",
  },
  {
    id: "tropical-bowl",
    name: "Tropical Bowl",
    category: "Bowls",
    description: "Pitaya, manga, kiwi, banana, coco fresco e chia.",
    price: 31.9,
    image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=85",
    badge: "Fresh",
    rating: 4.9,
    prep: "12–18 min",
  },
  {
    id: "power-protein",
    name: "Power Protein",
    category: "Bowls",
    description: "Açaí zero, whey, pasta de amendoim, banana e nibs de cacau.",
    price: 34.9,
    image: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=900&q=85",
    badge: "22g proteína",
    rating: 4.7,
    prep: "12–18 min",
  },
  {
    id: "smoothie-amazonia",
    name: "Smoothie Amazônia",
    category: "Bebidas",
    description: "Açaí, banana, água de coco e toque de guaraná natural.",
    price: 18.9,
    image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=900&q=85",
    rating: 4.8,
    prep: "8–12 min",
  },
  {
    id: "combo-dois-amores",
    name: "Combo Dois Amores",
    category: "Combos",
    description: "2 açaís clássicos 500ml + 2 águas de coco geladas.",
    price: 54.9,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85",
    badge: "Economize 15%",
    rating: 4.9,
    prep: "18–25 min",
  },
];

export const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

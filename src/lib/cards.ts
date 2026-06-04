export type Rarity = "Comum" | "Rara" | "Ultra Rara" | "Lendária" | "Única";
export type FrameStyle = "classic" | "neon" | "gold" | "minimal" | "holo";

export interface CardData {
  id: string;
  name: string;
  category: string;
  rarity: Rarity;
  hp: number;
  description: string;
  specialAttack: string;
  ability: string;
  secretMessage: string;
  displayValue: string;
  imageDataUrl: string;
  primaryColor: string;
  secondaryColor?: string;
  frame?: FrameStyle;
  createdAt: string;
  footer?: string;
  gallery?: string[];
  timeline?: { date: string; title: string; text: string }[];
  romanticText?: string;
  finalMessage?: string;
}

const KEY = "lais-ex-cards-v1";

function read(): CardData[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(cards: CardData[]) {
  localStorage.setItem(KEY, JSON.stringify(cards));
}

export function listCards(): CardData[] {
  return read();
}
export function getCard(id: string): CardData | undefined {
  return read().find((c) => c.id === id);
}
export function saveCard(card: CardData) {
  const all = read();
  const i = all.findIndex((c) => c.id === card.id);
  if (i >= 0) all[i] = card;
  else all.unshift(card);
  write(all);
}
export function deleteCard(id: string) {
  write(read().filter((c) => c.id !== id));
}

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export const SAMPLE_CARD: Omit<CardData, "id" | "createdAt"> = {
  name: "Laís EX",
  category: "Namorada Lendária",
  rarity: "Única",
  hp: 9999,
  description:
    "Uma presença rara, impossível de duplicar. Brilha com intensidade própria e desestabiliza qualquer leitura de mercado.",
  specialAttack: "Sorriso Devastador — causa 9999 de dano emocional. Ignora qualquer defesa.",
  ability: "Aura Encantadora — todos ao redor recebem +∞ de felicidade enquanto ela estiver em campo.",
  secretMessage:
    "Existe apenas uma unidade desta carta em todo o universo. Ela não está disponível para venda. Seu proprietário é oficialmente uma das pessoas mais sortudas do mundo.",
  displayValue: "INESTIMÁVEL",
  imageDataUrl: "",
  primaryColor: "#ff4d6d",
  secondaryColor: "#a4508b",
  frame: "holo",
  footer: "Edição Coração — 1 de 1",
  gallery: [],
  timeline: [],
  romanticText:
    "Cada dia ao seu lado é uma página rara nesta coleção que estamos montando juntos.",
  finalMessage: "Feliz Dia dos Namorados, meu amor. Você é a minha carta lendária.",
};

export const BLANK_CARD: Omit<CardData, "id" | "createdAt"> = {
  name: "",
  category: "",
  rarity: "Rara",
  hp: 100,
  description: "",
  specialAttack: "",
  ability: "",
  secretMessage: "",
  displayValue: "",
  imageDataUrl: "",
  primaryColor: "#ff4d6d",
  secondaryColor: "#a4508b",
  frame: "holo",
  footer: "",
  gallery: [],
  timeline: [],
  romanticText: "",
  finalMessage: "",
};

// URL encoding so QR codes work across devices without backend
export function encodeCardToUrl(card: CardData): string {
  // Try with full payload (including image)
  const tryEncode = (c: CardData) => {
    const json = JSON.stringify(c);
    if (typeof window === "undefined") return Buffer.from(json).toString("base64");
    return btoa(unescape(encodeURIComponent(json)));
  };
  let payload = tryEncode(card);
  // QR codes start failing reliably around ~2000 chars. Strip image as fallback.
  if (payload.length > 1800 && card.imageDataUrl) {
    payload = tryEncode({ ...card, imageDataUrl: "" });
  }
  return payload;
}

export function decodeCardFromUrl(payload: string): CardData | undefined {
  try {
    const json =
      typeof window === "undefined"
        ? Buffer.from(payload, "base64").toString()
        : decodeURIComponent(escape(atob(payload)));
    return JSON.parse(json) as CardData;
  } catch {
    return undefined;
  }
}

export function isRare(rarity: Rarity) {
  return rarity === "Lendária" || rarity === "Ultra Rara" || rarity === "Única";
}
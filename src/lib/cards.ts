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
  updatedAt?: string;
  packageName?: string;
  footer?: string;
  gallery?: string[];
  timeline?: { date: string; title: string; text: string }[];
  romanticText?: string;
  finalMessage?: string;
}

const KEY = "lais-ex-cards-v1";

export function normalizeCard(card: Partial<CardData>): CardData {
  return {
    ...BLANK_CARD,
    ...card,
    id: card.id || newId(),
    hp: Number.isFinite(Number(card.hp)) ? Number(card.hp) : BLANK_CARD.hp,
    rarity: (card.rarity as Rarity) || BLANK_CARD.rarity,
    createdAt: card.createdAt || new Date().toISOString(),
    updatedAt: card.updatedAt || card.createdAt || new Date().toISOString(),
    gallery: Array.isArray(card.gallery) ? card.gallery : [],
    timeline: Array.isArray(card.timeline) ? card.timeline : [],
  };
}

function read(): CardData[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map((card) => normalizeCard(card)) : [];
  } catch {
    return [];
  }
}
function write(cards: CardData[]) {
  localStorage.setItem(KEY, JSON.stringify(cards.map((card) => normalizeCard(card))));
}

export function listCards(): CardData[] {
  return read();
}
export function getCard(id: string): CardData | undefined {
  return read().find((c) => c.id === id);
}
export function saveCard(card: CardData) {
  const next = normalizeCard({ ...card, updatedAt: new Date().toISOString() });
  const all = read();
  const i = all.findIndex((c) => c.id === next.id);
  if (i >= 0) all[i] = next;
  else all.unshift(next);
  write(all);
  return next;
}
export function deleteCard(id: string) {
  write(read().filter((c) => c.id !== id));
}

export function replaceCards(cards: CardData[]) {
  write(cards);
}

export function removeCardReferences(id: string) {
  deleteCard(id);
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(`scan-${id}`);
    sessionStorage.removeItem(`card-${id}`);
    localStorage.removeItem(`scan-${id}`);
    localStorage.removeItem(`card-${id}`);
  } catch {}
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
  packageName: "Pacote Coração",
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
  packageName: "",
  footer: "",
  gallery: [],
  timeline: [],
  romanticText: "",
  finalMessage: "",
};

export function encodeCardToUrl(card: CardData): string {
  const tryEncode = (c: CardData) => {
    const json = JSON.stringify(c);
    if (typeof window === "undefined") return Buffer.from(json).toString("base64");
    return btoa(unescape(encodeURIComponent(json)));
  };
  return tryEncode(normalizeCard(card));
}

export function decodeCardFromUrl(payload: string): CardData | undefined {
  try {
    const json =
      typeof window === "undefined"
        ? Buffer.from(payload, "base64").toString()
        : decodeURIComponent(escape(atob(payload)));
    return normalizeCard(JSON.parse(json) as CardData);
  } catch {
    return undefined;
  }
}

export function resolveScannedCard(id: string, payload?: string): CardData | undefined {
  const fromUrl = payload ? decodeCardFromUrl(payload) : undefined;
  const fromLocal = getCard(id);

  if (!fromUrl) return fromLocal;
  if (!fromLocal || fromLocal.id !== fromUrl.id) return fromUrl;

  const localTime = new Date(fromLocal.updatedAt || fromLocal.createdAt).getTime();
  const urlTime = new Date(fromUrl.updatedAt || fromUrl.createdAt).getTime();

  if (localTime > urlTime) return fromLocal;
  if (!fromUrl.imageDataUrl && fromLocal.imageDataUrl) {
    return normalizeCard({ ...fromUrl, imageDataUrl: fromLocal.imageDataUrl });
  }

  return fromUrl;
}

export function isRare(rarity: Rarity) {
  return rarity === "Lendária" || rarity === "Ultra Rara" || rarity === "Única";
}
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { normalizeCard, type CardData } from "./cards";

const CardInput = z.object({
  id: z.string().min(1).max(80),
  name: z.string().optional(),
  category: z.string().optional(),
  rarity: z.enum(["Comum", "Rara", "Ultra Rara", "Lendária", "Única"]).optional(),
  hp: z.coerce.number().optional(),
  description: z.string().optional(),
  specialAttack: z.string().optional(),
  ability: z.string().optional(),
  secretMessage: z.string().optional(),
  displayValue: z.string().optional(),
  imageDataUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  frame: z.enum(["classic", "neon", "gold", "minimal", "holo"]).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  packageName: z.string().optional(),
  footer: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  timeline: z.array(z.object({ date: z.string(), title: z.string(), text: z.string() })).optional(),
  romanticText: z.string().optional(),
  finalMessage: z.string().optional(),
});

export const publishCardSnapshot = createServerFn({ method: "POST" })
  .inputValidator((input) => CardInput.parse(input))
  .handler(async ({ data }) => {
    const { upsertCardSnapshot } = await import("./card-sync.server");
    const card = normalizeCard(data as Partial<CardData>);
    return { card: await upsertCardSnapshot(card) };
  });

export const getPublishedCard = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { fetchCardSnapshot } = await import("./card-sync.server");
    return { card: await fetchCardSnapshot(data.id) };
  });

export const getPackageCards = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z.object({ id: z.string().min(1).max(80) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { fetchCardSnapshot, fetchCardsByPackage } = await import("./card-sync.server");
    const card = await fetchCardSnapshot(data.id);
    if (!card) return { cards: [] };
    const pkg = (card.packageName || "").trim();
    if (!pkg) return { cards: [card] };
    const siblings = await fetchCardsByPackage(pkg);
    // Ensure the scanned card is first; dedupe by id.
    const all = [card, ...siblings.filter((c) => c.id !== card.id)];
    const seen = new Set<string>();
    return { cards: all.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true))) };
  });

export const deletePublishedCard = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { deleteCardSnapshot } = await import("./card-sync.server");
    return deleteCardSnapshot(data.id);
  });
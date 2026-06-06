import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeCard, type CardData } from "./cards";

const TABLE = "collectible_cards";

export async function upsertCardSnapshot(card: CardData) {
  const normalized = normalizeCard(card);
  const { error } = await (supabaseAdmin as any).from(TABLE).upsert({
    id: normalized.id,
    card_data: normalized,
    updated_at: normalized.updatedAt || new Date().toISOString(),
  });

  if (error) throw new Error(error.message || "Não foi possível salvar a carta.");
  return normalized;
}

export async function syncCardSnapshots(cards: CardData[]) {
  const normalized = cards.map((card) => normalizeCard(card));

  if (normalized.length > 0) {
    const { error } = await (supabaseAdmin as any).from(TABLE).upsert(
      normalized.map((card) => ({
        id: card.id,
        card_data: card,
        updated_at: card.updatedAt || new Date().toISOString(),
      })),
    );

    if (error) throw new Error(error.message || "Não foi possível sincronizar as cartas.");
  }

  const pruned = await pruneCardSnapshots(normalized.map((card) => card.id));
  return { ok: true, cards: normalized, removed: pruned.removed };
}

export async function fetchCardSnapshot(id: string) {
  const { data, error } = await (supabaseAdmin as any)
    .from(TABLE)
    .select("card_data")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message || "Não foi possível carregar a carta.");
  if (!data?.card_data) return undefined;

  return normalizeCard(data.card_data as Partial<CardData>);
}

export async function fetchCardsByPackage(packageName: string) {
  const { data, error } = await (supabaseAdmin as any)
    .from(TABLE)
    .select("card_data")
    .eq("card_data->>packageName", packageName);

  if (error) throw new Error(error.message || "Não foi possível carregar o pacote.");
  if (!Array.isArray(data)) return [];
  return data
    .map((row: any) => normalizeCard(row.card_data as Partial<CardData>))
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

export async function deleteCardSnapshot(id: string) {
  const { error } = await (supabaseAdmin as any).from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message || "Não foi possível excluir a carta.");
  return { ok: true };
}

export async function pruneCardSnapshots(activeIds: string[]) {
  const active = new Set(activeIds);
  const { data, error } = await (supabaseAdmin as any).from(TABLE).select("id");

  if (error) throw new Error(error.message || "Não foi possível limpar cartas antigas.");

  const staleIds = (Array.isArray(data) ? data : [])
    .map((row: { id?: string }) => row.id)
    .filter(
      (id: string | undefined): id is string =>
        typeof id === "string" && id.length > 0 && !active.has(id),
    );

  for (let i = 0; i < staleIds.length; i += 100) {
    const chunk = staleIds.slice(i, i + 100);
    const { error: deleteError } = await (supabaseAdmin as any).from(TABLE).delete().in("id", chunk);
    if (deleteError) throw new Error(deleteError.message || "Não foi possível limpar cartas antigas.");
  }

  return { ok: true, removed: staleIds.length };
}
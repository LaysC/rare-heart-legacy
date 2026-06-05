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
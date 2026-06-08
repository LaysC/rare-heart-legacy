import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizeCard, type CardData } from "./cards";

export const addToCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ cardId: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("user_collections")
      .upsert({ user_id: userId, card_id: data.cardId }, { onConflict: "user_id,card_id" });
    if (error) throw error;
    return { ok: true };
  });

export const removeFromCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ cardId: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("user_collections")
      .delete()
      .eq("user_id", userId)
      .eq("card_id", data.cardId);
    if (error) throw error;
    return { ok: true };
  });

export const getMyCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("user_collections")
      .select("card_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const ids = (rows ?? []).map((r) => r.card_id);
    if (ids.length === 0) return { cards: [] as CardData[] };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: snaps, error: snapErr } = await supabaseAdmin
      .from("collectible_cards")
      .select("id, card_data")
      .in("id", ids);
    if (snapErr) throw snapErr;

    const byId = new Map<string, CardData>();
    for (const row of snaps ?? []) {
      byId.set(row.id, normalizeCard(row.card_data as Partial<CardData>));
    }
    // preserve collection order, drop deleted cards
    const cards = ids.map((id) => byId.get(id)).filter((c): c is CardData => !!c);
    return { cards };
  });
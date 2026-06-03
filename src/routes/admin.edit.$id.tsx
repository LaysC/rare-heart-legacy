import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CardEditor } from "@/components/CardEditor";
import { getCard, type CardData } from "@/lib/cards";

export const Route = createFileRoute("/admin/edit/$id")({
  head: () => ({ meta: [{ title: "Editar carta" }] }),
  component: EditCard,
});

function EditCard() {
  const { id } = useParams({ from: "/admin/edit/$id" });
  const [card, setCard] = useState<CardData | undefined>();
  useEffect(() => setCard(getCard(id)), [id]);

  return (
    <main className="min-h-screen px-6 py-10 max-w-6xl mx-auto">
      <Link to="/admin" className="text-xs text-muted-foreground">← Painel</Link>
      <h1 className="text-3xl font-bold mt-1 mb-6">Editar Carta</h1>
      {card ? <CardEditor initial={card} /> : <p className="text-muted-foreground">Carregando…</p>}
    </main>
  );
}
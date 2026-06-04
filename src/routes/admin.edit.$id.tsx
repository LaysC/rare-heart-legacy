import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CardEditor } from "@/components/CardEditor";
import { getCard, type CardData } from "@/lib/cards";
import { AdminGate } from "@/components/AdminGate";

export const Route = createFileRoute("/admin/edit/$id")({
  head: () => ({ meta: [{ title: "Editar carta" }] }),
  component: () => (
    <AdminGate>
      <EditCard />
    </AdminGate>
  ),
});

function EditCard() {
  const { id } = useParams({ from: "/admin/edit/$id" });
  const [card, setCard] = useState<CardData | undefined>();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setCard(getCard(id));
    setLoaded(true);
  }, [id]);

  return (
    <main className="min-h-screen px-6 py-10 max-w-6xl mx-auto">
      <Link to="/admin" className="text-xs text-muted-foreground">← Painel</Link>
      <h1 className="text-3xl font-bold mt-1 mb-6">Editar Carta</h1>
      {!loaded ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : card ? (
        <CardEditor initial={card} />
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted-foreground mb-3">Carta não encontrada.</p>
          <Link to="/admin" className="text-sm text-rose-300">Voltar ao painel</Link>
        </div>
      )}
    </main>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { CardEditor } from "@/components/CardEditor";
import { AdminGate } from "@/components/AdminGate";

export const Route = createFileRoute("/admin/new")({
  head: () => ({ meta: [{ title: "Nova carta" }] }),
  component: () => (
    <AdminGate>
      <NewCard />
    </AdminGate>
  ),
});

function NewCard() {
  return (
    <main className="min-h-screen px-6 py-10 max-w-6xl mx-auto">
      <Link to="/admin" className="text-xs text-muted-foreground">← Painel</Link>
      <h1 className="text-3xl font-bold mt-1 mb-6">Nova Carta</h1>
      <CardEditor />
    </main>
  );
}
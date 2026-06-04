import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listCards, deleteCard, type CardData, SAMPLE_CARD, saveCard, newId, isRare } from "@/lib/cards";
import { Plus, Trash2, Edit3, ExternalLink, Sparkles, Copy, QrCode, Layers, Heart, LogOut } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";
import { logoutAdmin } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel — Cartas" }] }),
  component: () => (
    <AdminGate>
      <AdminShell />
    </AdminGate>
  ),
});

function AdminShell() {
  const isAdminHome = useRouterState({
    select: (state) => state.location.pathname === "/admin" || state.location.pathname === "/admin/",
  });

  return isAdminHome ? <AdminPage /> : <Outlet />;
}

function AdminPage() {
  const [cards, setCards] = useState<CardData[]>([]);
  const nav = useNavigate();

  useEffect(() => setCards(listCards()), []);

  function refresh() {
    setCards(listCards());
  }

  function seedSample() {
    const id = newId();
    saveCard({ ...SAMPLE_CARD, id, createdAt: new Date().toISOString() });
    refresh();
    nav({ to: "/admin/edit/$id", params: { id } });
  }

  function duplicate(c: CardData) {
    const id = newId();
    saveCard({ ...c, id, name: c.name + " (cópia)", createdAt: new Date().toISOString() });
    refresh();
  }

  const total = cards.length;
  const rareCount = cards.filter((c) => isRare(c.rarity)).length;
  const last = cards[0];

  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <Link to="/" className="text-xs text-muted-foreground">← Início</Link>
          <h1 className="text-3xl font-bold mt-1">Painel de Cartas</h1>
          <p className="text-muted-foreground text-sm">Crie, edite e gere QR codes.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={seedSample}
            className="glass px-4 py-2 rounded-full text-sm inline-flex items-center gap-2"
          >
            <Sparkles size={14} /> Usar modelo Laís EX
          </button>
          <Link
            to="/admin/new"
            className="bg-gradient-romance text-white px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2"
          >
            <Plus size={14} /> Nova carta
          </Link>
          <button
            onClick={() => {
              logoutAdmin();
              nav({ to: "/" });
            }}
            className="glass px-3 py-2 rounded-full text-sm inline-flex items-center gap-2"
            title="Sair do painel"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Dashboard */}
      <section className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat icon={Layers} label="Cartas criadas" value={total} />
        <Stat icon={QrCode} label="QR Codes gerados" value={total} />
        <Stat icon={Heart} label="Cartas raras" value={rareCount} accent />
      </section>

      {last && (
        <div className="glass rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-16 rounded-lg shrink-0" style={{ background: `linear-gradient(135deg, ${last.primaryColor}, ${last.secondaryColor || "#000"})` }} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Última criada</p>
            <p className="font-semibold truncate">{last.name}</p>
            <p className="text-xs text-muted-foreground">{new Date(last.createdAt).toLocaleString()}</p>
          </div>
          <Link to="/card/$id" params={{ id: last.id }} className="text-xs glass px-3 py-1.5 rounded-full">
            Ver QR
          </Link>
        </div>
      )}

      {cards.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-muted-foreground mb-4">Nenhuma carta criada ainda.</p>
          <button
            onClick={seedSample}
            className="bg-gradient-romance text-white px-5 py-2.5 rounded-full text-sm font-semibold"
          >
            Criar primeira carta
          </button>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {cards.map((c) => (
            <li key={c.id} className="glass rounded-2xl p-5 flex gap-4 items-center">
              <div
                className="w-14 h-20 rounded-lg shrink-0 bg-cover bg-center"
                style={{
                  background: c.imageDataUrl
                    ? `url(${c.imageDataUrl}) center/cover`
                    : `linear-gradient(135deg, ${c.primaryColor}, ${c.secondaryColor || "#000"})`,
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.rarity} · HP {c.hp}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">/scan/{c.id}</p>
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                <Link
                  to="/card/$id"
                  params={{ id: c.id }}
                  className="glass px-3 py-1.5 rounded-full inline-flex items-center gap-1"
                >
                  <ExternalLink size={12} /> QR / Imprimir
                </Link>
                <Link
                  to="/admin/edit/$id"
                  params={{ id: c.id }}
                  className="glass px-3 py-1.5 rounded-full inline-flex items-center gap-1"
                >
                  <Edit3 size={12} /> Editar
                </Link>
                <button
                  onClick={() => duplicate(c)}
                  className="glass px-3 py-1.5 rounded-full inline-flex items-center gap-1"
                >
                  <Copy size={12} /> Duplicar
                </button>
                <button
                  onClick={() => {
                    if (confirm("Apagar carta?")) {
                      deleteCard(c.id);
                      refresh();
                    }
                  }}
                  className="text-rose-300/80 px-3 py-1.5 inline-flex items-center gap-1"
                >
                  <Trash2 size={12} /> Apagar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Layers;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className={`glass rounded-2xl p-5 ${accent ? "shadow-glow" : ""}`}>
      <Icon className={accent ? "text-rose-300 mb-2" : "text-muted-foreground mb-2"} size={18} />
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent ? "text-gradient-romance" : ""}`}>{value}</p>
    </div>
  );
}
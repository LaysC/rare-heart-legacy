import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyCollection, removeFromCollection } from "@/lib/collection.functions";
import { HoloCard } from "@/components/HoloCard";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Share2, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { AuthButton } from "@/components/AuthButton";

export const Route = createFileRoute("/collection")({
  ssr: false,
  head: () => ({ meta: [{ title: "Minha coleção" }] }),
  component: CollectionPage,
});

function CollectionPage() {
  const { user, loading } = useAuth();
  const fetchCollection = useServerFn(getMyCollection);
  const removeFn = useServerFn(removeFromCollection);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-collection", user?.id],
    queryFn: () => fetchCollection(),
    enabled: !!user,
  });

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center">
        <div className="w-10 h-10 rounded-full border-2 border-rose-400/40 border-t-rose-400 animate-spin" />
      </main>
    );
  }

  // Tela de quando ele ainda não colocou a data
  if (!user) {
    return (
      <main className="min-h-screen grid place-items-center px-6 text-center">
        <div className="glass rounded-2xl p-8 max-w-sm">
          <Heart className="mx-auto text-rose-300 mb-3" size={32} />
          <h1 className="text-xl font-bold mb-2">Sua coleção</h1>
          <p className="text-sm text-muted-foreground mb-5">
            Coloque a nossa data para acessar as suas cartas.
          </p>
          
          <div className="flex justify-center">
            <AuthButton />
          </div>

          <div className="mt-4">
            <Link to="/" className="text-xs text-muted-foreground">← voltar</Link>
          </div>
        </div>
      </main>
    );
  }

  const cards = data?.cards ?? [];

  async function share(id: string) {
    const url = `${window.location.origin}/scan/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ url, title: "Minha carta colecionável" });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }

  async function remove(id: string) {
    await removeFn({ data: { cardId: id } });
    await refetch();
    toast.success("Removida da coleção");
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 py-10 max-w-6xl mx-auto">
      <Toaster position="top-center" richColors />
      <header className="flex items-center justify-between mb-8">
        <div>
          <Link to="/" className="text-xs text-muted-foreground">← início</Link>
          <h1 className="text-3xl font-bold text-gradient-romance mt-1">Minha coleção</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {cards.length} {cards.length === 1 ? "carta" : "cartas"} guardadas
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="grid place-items-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-rose-400/40 border-t-rose-400 animate-spin" />
        </div>
      ) : cards.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center max-w-md mx-auto">
          <Sparkles className="mx-auto text-rose-300 mb-3" />
          <p className="text-sm text-muted-foreground">
            Sua coleção está vazia. Escaneie um QR Code para descobrir e guardar suas primeiras cartas.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-8">
          {cards.map((card) => (
            <div key={card.id} className="flex flex-col items-center gap-3">
              <HoloCard card={card} />
              <div className="flex items-center gap-2">
                <Link
                  to="/scan/$id"
                  params={{ id: card.id }}
                  className="glass px-3 py-1.5 rounded-full text-xs inline-flex items-center gap-1.5 hover:bg-white/10"
                >
                  Abrir
                </Link>
                <button
                  onClick={() => share(card.id)}
                  className="glass px-3 py-1.5 rounded-full text-xs inline-flex items-center gap-1.5 hover:bg-white/10"
                >
                  <Share2 size={11} /> Compartilhar
                </button>
                <button
                  onClick={() => remove(card.id)}
                  className="glass p-1.5 rounded-full hover:bg-white/10"
                  title="Remover"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
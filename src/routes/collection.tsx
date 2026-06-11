import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyCollection } from "@/lib/collection.functions";
import { HoloCard } from "@/components/HoloCard";
import { useAuth } from "@/hooks/useAuth";
import { Share2, Sparkles, Heart, ChevronLeft } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/collection")({
  ssr: false,
  head: () => ({ meta: [{ title: "Minha coleção" }] }),
  component: CollectionPage,
});

function CollectionPage() {
  const { user, loading } = useAuth();
  const fetchCollection = useServerFn(getMyCollection);
  const navigate = useNavigate({ from: "/collection" });

  const { data, isLoading } = useQuery({
    queryKey: ["my-collection", user?.id],
    queryFn: () => fetchCollection(),
    enabled: !!user,
  });

  // Só redireciona se o carregamento terminar E o usuário REALMENTE não digitou a senha (não está logado)
  useEffect(() => {
    if (!loading && user === null) {
      navigate({ to: "/", replace: true });
    }
  }, [user, loading, navigate]);

  // Enquanto verifica o acesso, mostra o carregamento
  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center">
        <div className="w-10 h-10 rounded-full border-2 border-rose-400/40 border-t-rose-400 animate-spin" />
      </main>
    );
  }

  // Se não houver usuário (durante o curto processo de redirecionamento), previne renderizar o resto
  if (!user) return null;

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

  return (
    <main className="min-h-screen px-4 sm:px-6 py-10 max-w-6xl mx-auto flex flex-col items-center">
      <Toaster position="top-center" richColors />

      {/* SÓ MOSTRA O CABEÇALHO PADRÃO SE ELE JÁ TIVER CARTAS */}
      {cards.length > 0 && (
        <header className="w-full flex items-center justify-between mb-8 text-left">
          <div>
            <Link to="/" className="text-xs text-muted-foreground flex items-center gap-1 hover:text-rose-300 transition-colors">
              <ChevronLeft size={12} /> início
            </Link>
            <h1 className="text-3xl font-bold text-gradient-romance mt-1">Minha coleção</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {cards.length} {cards.length === 1 ? "carta" : "cartas"} guardadas
            </p>
          </div>
        </header>
      )}

      {isLoading ? (
        <div className="grid place-items-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-rose-400/40 border-t-rose-400 animate-spin" />
        </div>
      ) : cards.length === 0 ? (
        /* TELA DE COLECÃO VAZIA INTENCIONAL E LINDA! */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-10 text-center max-w-md mx-auto shadow-glow flex flex-col items-center gap-4 mt-12"
        >
          <div className="w-16 h-16 rounded-full bg-rose-500/10 grid place-items-center mb-2">
            <Sparkles className="text-amber-300 animate-pulse" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gradient-romance">Sua Coleção está pronta!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Você acessou o seu baú com sucesso! Mas ele ainda está esperando pelos seus momentos. 🥰
            <br /><br />
            Escaneie o QR Code do seu presente físico para revelar e destravar a sua primeira carta colecionável aqui!
          </p>
          <Link
            to="/"
            className="mt-4 bg-gradient-romance text-white px-8 py-3 rounded-full font-semibold text-sm hover:scale-105 transition-transform shadow-glow inline-flex items-center gap-2"
          >
            <Heart size={14} fill="currentColor" /> Voltar ao início
          </Link>
        </motion.div>
      ) : (
        /* GRID DE CARTAS EXIBIDO QUANDO JÁ ESCANEOU */
        <div className="flex flex-wrap justify-center gap-8 w-full">
          {cards.map((card) => (
            <div key={card.id} className="flex flex-col items-center gap-3">
              <HoloCard card={card} />
              <div className="flex items-center gap-2">
                <Link
                  to="/scan/$id"
                  params={{ id: card.id }}
                  className="glass px-3 py-1.5 rounded-full text-xs inline-flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                >
                  Abrir
                </Link>
                <button
                  onClick={() => share(card.id)}
                  className="glass px-3 py-1.5 rounded-full text-xs inline-flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                >
                  <Share2 size={11} /> Compartilhar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
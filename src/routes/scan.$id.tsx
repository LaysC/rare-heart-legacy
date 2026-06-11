import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type CardData } from "@/lib/cards";
import { getPackageCards } from "@/lib/card-sync.functions";
import { addToCollection } from "@/lib/collection.functions";
import { HoloCard, CardFlipper } from "@/components/HoloCard";
import { Heart, Sparkles, ChevronRight, Calendar, Download, Check } from "lucide-react";
import { PackOpening } from "@/components/PackOpening";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/scan/$id")({
  head: () => ({ meta: [{ title: "Análise da carta…" }] }),
  component: ScanPage,
});

type Stage = "pack" | "opening" | "boot" | "scan" | "partial" | "reveal" | "final";

const SCAN_MESSAGES = [
  "Verificando autenticidade…",
  "Consultando banco global de colecionadores…",
  "Comparando vendas históricas…",
  "Analisando raridade…",
  "Processando valor de mercado…",
];

function ScanPage() {
  const { id } = useParams({ from: "/scan/$id" });
  const fetchPackage = useServerFn(getPackageCards);
  const addCard = useServerFn(addToCollection);
  const { user } = useAuth();
  const [cards, setCards] = useState<CardData[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [stage, setStage] = useState<Stage>("pack");
  const [msgIdx, setMsgIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const card = cards[activeIdx];
  const isLast = activeIdx >= cards.length - 1;

  useEffect(() => {
    let alive = true;

    async function loadCard() {
      try {
        const result = await fetchPackage({ data: { id } });
        if (!alive) return;
        setCards(result.cards ?? []);
      } catch {
        if (alive) setCards([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadCard();
    return () => {
      alive = false;
    };
  }, [id, fetchPackage]);

  useEffect(() => {
    if (!user || cards.length === 0) return;
    cards.forEach((c) => {
      addCard({ data: { cardId: c.id } }).catch(() => {});
    });
  }, [user, cards, addCard]);

  useEffect(() => {
    if (stage !== "scan") return;
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % SCAN_MESSAGES.length), 1400);
    return () => clearInterval(t);
  }, [stage]);

  useEffect(() => {
    const next: Partial<Record<Stage, { to: Stage; ms: number }>> = {
      opening: { to: "boot", ms: 2600 },
      boot: { to: "scan", ms: 1600 },
      scan: { to: "partial", ms: 6400 },
      partial: { to: "reveal", ms: 2400 },
    };
    const step = next[stage];
    if (!step) return;
    const t = setTimeout(() => setStage(step.to), step.ms);
    return () => clearTimeout(t);
  }, [stage]);

  if (loading) {
    return <main className="min-h-screen grid place-items-center"><div className="w-10 h-10 rounded-full border-2 border-rose-400/40 border-t-rose-400 animate-spin" /></main>;
  }

  if (!card) {
    return (
      <main className="min-h-screen grid place-items-center px-6 text-center">
        <div className="glass rounded-2xl p-8 max-w-sm">
          <p className="text-muted-foreground mb-3">Carta não encontrada.</p>
          <p className="text-xs text-muted-foreground">
            Esta carta não está mais disponível no painel administrativo.
          </p>
          <Link to="/" className="mt-4 inline-block text-rose-300 text-sm">voltar ao início</Link>
        </div>
      </main>
    );
  }

  function nextCard() {
    if (isLast) {
      setStage("final");
    } else {
      setActiveIdx((i) => i + 1);
      setStage("reveal");
    }
  }

  return (
    // ADICIONAMOS "pb-32" AQUI para dar bastante espaço de rolagem no final da tela do celular!
    <main className="min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto px-2 py-8 pb-32 md:px-4 md:py-12 flex flex-col items-center justify-start md:justify-center">
      <AnimatePresence mode="wait">
        {stage === "pack" && (
          <motion.div
            key="pack"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center mt-auto mb-auto"
          >
            <PackOpening card={card} onOpen={() => setStage("opening")} />
          </motion.div>
        )}

        {stage === "opening" && (
          <motion.div
            key="opening"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative mt-auto mb-auto shrink-0"
          >
            <motion.div
              className="fixed inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.2, 0] }}
              transition={{ duration: 1.4, times: [0, 0.2, 0.5, 1] }}
            />
            <motion.div
              initial={{ scale: 0.2, opacity: 0, rotate: -30 }}
              animate={{ scale: 1.1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative shrink-0"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-romance blur-3xl opacity-70 animate-pulse" />
              <div className="relative"><HoloCard card={card} /></div>
            </motion.div>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-rose-300"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 600,
                  y: (Math.random() - 0.5) * 600,
                  opacity: 0,
                }}
                transition={{ duration: 1.6, delay: 0.2, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}

        {stage === "boot" && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center mt-auto mb-auto"
          >
            <div className="mx-auto w-16 h-16 rounded-full border-2 border-rose-400/40 border-t-rose-400 animate-spin" />
            <p className="mt-6 text-sm tracking-widest uppercase text-muted-foreground">
              Iniciando análise…
            </p>
          </motion.div>
        )}

        {stage === "scan" && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center w-full max-w-md mt-auto mb-auto"
          >
            <div className="relative mx-auto w-[240px] aspect-[2.5/3.5] rounded-2xl glass overflow-hidden shrink-0">
              <div className="absolute inset-0 grid place-items-center text-white/30">
                <Sparkles size={40} />
              </div>
              <div className="scanline" />
            </div>
            <div className="mt-8 h-6">
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-sm text-rose-200/90"
                >
                  {SCAN_MESSAGES[msgIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="mt-6 mx-auto w-full max-w-xs h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-romance"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                  transition={{ duration: 6.4, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {stage === "partial" && (
          <motion.div
            key="partial"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass rounded-2xl p-8 text-center max-w-sm mt-auto mb-auto shrink-0"
          >
            <p className="text-xs uppercase tracking-widest text-rose-300 mb-3">
              Resultado parcial
            </p>
            <ul className="text-sm space-y-2 text-left">
              <li className="flex justify-between"><span className="text-muted-foreground">Carta:</span><span className="font-semibold">Encontrada ✓</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Raridade:</span><span className="font-semibold">desconhecida</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Ocorrências:</span><span className="font-semibold">1</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Status:</span><span className="font-semibold text-amber-300">classificação manual</span></li>
            </ul>
          </motion.div>
        )}

        {stage === "reveal" && (
          <motion.div
            key={`reveal-${activeIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // ADICIONAMOS "shrink-0" AQUI para impedir que a tela comprima a sessão inteira
            className="text-center flex flex-col items-center w-full shrink-0"
          >
            {cards.length > 1 && (
              <p className="text-[11px] uppercase tracking-[0.3em] text-rose-200/80 mb-3">
                Carta {activeIdx + 1} de {cards.length}
              </p>
            )}
            <SaveableCard card={card} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-8 glass rounded-2xl p-6 w-full max-w-md shrink-0"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Valor de mercado</p>
              <p className="text-3xl font-extrabold text-gradient-romance mt-1">{card.displayValue}</p>
              <p className="mt-4 text-sm italic text-rose-100/90">"{card.secretMessage}"</p>
              <button
                onClick={nextCard}
                className="mt-6 bg-gradient-romance text-white px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 shadow-glow hover:scale-105 transition-transform"
              >
                {isLast ? "Ver mensagem final" : "Próxima carta"} <ChevronRight size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}

        {stage === "final" && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl w-full mt-auto mb-auto shrink-0 pb-12"
          >
            <div className="text-center mb-8">
              <Heart className="mx-auto text-rose-300 mb-3" size={32} />
              <h2 className="text-3xl sm:text-4xl font-bold text-gradient-romance">
                {cards.length > 1 ? "Você descobriu toda a coleção" : "Sua carta"}
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                {cards.length > 1
                  ? `${cards.length} cartas reveladas ❤️`
                  : `${card.name} · ${card.rarity}`}
              </p>
            </div>

            {cards.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {cards.map((c, i) => (
                  <div key={c.id} className="glass rounded-2xl p-3 flex flex-col items-center gap-2 shrink-0">
                    <SaveableCard card={c} compact />
                    <p className="text-[11px] text-center text-muted-foreground truncate w-full">
                      {i + 1}. {c.name}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {cards[0].romanticText && (
              <div className="glass rounded-2xl p-6 mb-4">
                <p className="leading-relaxed">{cards[0].romanticText}</p>
              </div>
            )}

            {cards[0].gallery && cards[0].gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {cards[0].gallery.map((g, i) => (
                  <img key={i} src={g} alt="" className="aspect-square object-cover rounded-xl" />
                ))}
              </div>
            )}

            {cards[0].timeline && cards[0].timeline.length > 0 && (
              <div className="glass rounded-2xl p-6 mb-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Calendar size={16} /> Linha do tempo</h3>
                {cards[0].timeline.map((t, i) => (
                  <div key={i} className="border-l-2 border-rose-400/40 pl-4">
                    <p className="text-xs text-muted-foreground">{t.date}</p>
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-sm text-muted-foreground">{t.text}</p>
                  </div>
                ))}
              </div>
            )}

            {(cards[cards.length - 1].finalMessage || cards[0].finalMessage) && (
              <div className="glass rounded-2xl p-8 text-center shadow-glow">
                <Sparkles className="mx-auto text-amber-300 mb-3" />
                <p className="text-lg italic">
                  {cards[cards.length - 1].finalMessage || cards[0].finalMessage}
                </p>
              </div>
            )}

            <div className="text-center mt-8 print:hidden">
              <Link to="/" className="text-xs text-muted-foreground">voltar ao início</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function SaveableCard({ card, compact = false }: { card: CardData; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSave() {
    if (!ref.current || busy) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const node = ref.current;
      const rect = node.getBoundingClientRect();
      const width = Math.ceil(rect.width);
      const height = Math.ceil(rect.height);
      const dataUrl = await toPng(node, {
        pixelRatio: 4,
        cacheBust: true,
        backgroundColor: "transparent",
        width,
        height,
        canvasWidth: width,
        canvasHeight: height,
        style: {
          transform: "none",
          margin: "0",
          overflow: "visible",
        },
      });
      const a = document.createElement("a");
      const safeName = (card.name || "carta").replace(/[^a-z0-9\-_]+/gi, "_").toLowerCase();
      a.href = dataUrl;
      a.download = `${safeName}.png`;
      a.click();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Falha ao salvar carta", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    // ADICIONAMOS "shrink-0" AQUI TAMBÉM para garantir a defesa total da carta!
    <div className="flex flex-col items-center gap-3 w-full shrink-0">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ scale: { type: "spring", stiffness: 80, damping: 14 } }}
        className="w-[92vw] max-w-[360px] shrink-0"
      >
        {compact ? (
          <div style={{ transform: "scale(0.5)", transformOrigin: "top center", marginBottom: -180 }} className="shrink-0">
            <HoloCard card={card} />
          </div>
        ) : (
          <CardFlipper card={card} />
        )}
      </motion.div>
      
      {!compact && (
        <div
          ref={ref}
          aria-hidden
          style={{
            position: "fixed",
            top: 0,
            left: -99999,
            pointerEvents: "none",
            display: "inline-block",
            padding: 4,
          }}
        >
          <HoloCard card={card} />
        </div>
      )}
      {!compact && <button
        type="button"
        onClick={onSave}
        disabled={busy}
        className="glass px-4 py-2 rounded-full text-xs inline-flex items-center gap-1.5 hover:bg-white/10 transition-colors mt-2"
      >
        {saved ? <Check size={12} /> : <Download size={12} />}
        {saved ? "Salva!" : busy ? "Salvando…" : "Salvar carta"}
      </button>}
    </div>
  );
}
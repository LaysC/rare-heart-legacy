import { createFileRoute, useParams, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getCard, decodeCardFromUrl, isRare, type CardData } from "@/lib/cards";
import { HoloCard } from "@/components/HoloCard";
import { Heart, Sparkles, ChevronRight, Calendar, Gift } from "lucide-react";
import { PackOpening } from "@/components/PackOpening";

export const Route = createFileRoute("/scan/$id")({
  head: () => ({ meta: [{ title: "Análise da carta…" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    d: typeof search.d === "string" ? search.d : undefined,
  }),
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
  const { d } = useSearch({ from: "/scan/$id" });
  const [card, setCard] = useState<CardData | undefined>();
  const [stage, setStage] = useState<Stage>("pack");
  const [msgIdx, setMsgIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) try URL payload (works cross-device when scanned)
    // 2) fall back to local storage (works on the device that created it)
    const fromUrl = d ? decodeCardFromUrl(d) : undefined;
    const fromLocal = getCard(id);
    setCard(fromUrl ?? fromLocal);
    setLoading(false);
  }, [id, d]);

  useEffect(() => {
    if (stage !== "scan") return;
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % SCAN_MESSAGES.length), 1400);
    return () => clearInterval(t);
  }, [stage]);

  // Sequenced stage transitions — each stage schedules the next one.
  // Chaining prevents the "infinite analysis" bug (when a single effect set
  // multiple timers, switching stage cleared the remaining ones).
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
            O QR pode ter sido gerado num link curto. Peça para gerar novamente
            ou abra no mesmo dispositivo onde foi criada.
          </p>
          <Link to="/" className="mt-4 inline-block text-rose-300 text-sm">voltar ao início</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 flex flex-col items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === "pack" && (
          <motion.div
            key="pack"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
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
            className="relative"
          >
            {/* Burst flash */}
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
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-romance blur-3xl opacity-70 animate-pulse" />
              <div className="relative"><HoloCard card={card} /></div>
            </motion.div>
            {/* Particles */}
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
            className="text-center"
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
            className="text-center w-full max-w-md"
          >
            <div className="relative mx-auto w-[240px] aspect-[2.5/3.5] rounded-2xl glass overflow-hidden">
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
            className="glass rounded-2xl p-8 text-center max-w-sm"
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
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0.6, rotateY: -90, opacity: 0 }}
              animate={{
                scale: 1,
                rotateY: isRare(card.rarity) ? [0, 8, -8, 6, -6, 0] : 0,
                opacity: 1,
              }}
              transition={{
                scale: { type: "spring", stiffness: 80, damping: 14 },
                rotateY: isRare(card.rarity)
                  ? { duration: 6, repeat: Infinity, ease: "easeInOut" }
                  : undefined,
              }}
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            >
              <HoloCard card={card} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-8 glass rounded-2xl p-6 max-w-md"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Valor de mercado</p>
              <p className="text-3xl font-extrabold text-gradient-romance mt-1">{card.displayValue}</p>
              <p className="mt-4 text-sm italic text-rose-100/90">"{card.secretMessage}"</p>
              <button
                onClick={() => setStage("final")}
                className="mt-6 bg-gradient-romance text-white px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 shadow-glow hover:scale-105 transition-transform"
              >
                Acessar Relatório Completo <ChevronRight size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}

        {stage === "final" && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl w-full"
          >
            <div className="text-center mb-8">
              <Heart className="mx-auto text-rose-300 mb-3" size={32} />
              <h2 className="text-3xl sm:text-4xl font-bold text-gradient-romance">
                Relatório Completo
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                Carta {card.name} · {card.rarity}
              </p>
            </div>

            {card.romanticText && (
              <div className="glass rounded-2xl p-6 mb-4">
                <p className="leading-relaxed">{card.romanticText}</p>
              </div>
            )}

            {card.gallery && card.gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {card.gallery.map((g, i) => (
                  <img key={i} src={g} alt="" className="aspect-square object-cover rounded-xl" />
                ))}
              </div>
            )}

            {card.timeline && card.timeline.length > 0 && (
              <div className="glass rounded-2xl p-6 mb-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Calendar size={16} /> Linha do tempo</h3>
                {card.timeline.map((t, i) => (
                  <div key={i} className="border-l-2 border-rose-400/40 pl-4">
                    <p className="text-xs text-muted-foreground">{t.date}</p>
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-sm text-muted-foreground">{t.text}</p>
                  </div>
                ))}
              </div>
            )}

            {card.finalMessage && (
              <div className="glass rounded-2xl p-8 text-center shadow-glow">
                <Sparkles className="mx-auto text-amber-300 mb-3" />
                <p className="text-lg italic">{card.finalMessage}</p>
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
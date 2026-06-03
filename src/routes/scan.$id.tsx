import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getCard, type CardData } from "@/lib/cards";
import { HoloCard } from "@/components/HoloCard";
import { Heart, Sparkles, ChevronRight, Calendar } from "lucide-react";

export const Route = createFileRoute("/scan/$id")({
  head: () => ({ meta: [{ title: "Análise da carta…" }] }),
  component: ScanPage,
});

type Stage = "boot" | "scan" | "partial" | "reveal" | "cta" | "final";

const SCAN_MESSAGES = [
  "Verificando autenticidade…",
  "Consultando banco global de colecionadores…",
  "Comparando vendas históricas…",
  "Analisando raridade…",
  "Processando valor de mercado…",
];

function ScanPage() {
  const { id } = useParams({ from: "/scan/$id" });
  const [card, setCard] = useState<CardData | undefined>();
  const [stage, setStage] = useState<Stage>("boot");
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => setCard(getCard(id)), [id]);

  useEffect(() => {
    if (stage !== "scan") return;
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % SCAN_MESSAGES.length), 1400);
    return () => clearInterval(t);
  }, [stage]);

  useEffect(() => {
    const seq: { s: Stage; ms: number }[] = [
      { s: "boot", ms: 1800 },
      { s: "scan", ms: 6500 },
      { s: "partial", ms: 2800 },
      { s: "reveal", ms: 0 },
    ];
    let i = 0;
    setStage(seq[0].s);
    const tick = () => {
      const cur = seq[i];
      if (i < seq.length - 1) {
        setTimeout(() => {
          i++;
          setStage(seq[i].s);
          if (i < seq.length - 1) tick();
        }, cur.ms);
      }
    };
    tick();
  }, []);

  if (!card) {
    return (
      <main className="min-h-screen grid place-items-center px-6">
        <p className="text-muted-foreground">Carta não encontrada.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 flex flex-col items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
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
                transition={{ duration: 6.5, ease: "easeInOut" }}
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
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 80, damping: 14 }}
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
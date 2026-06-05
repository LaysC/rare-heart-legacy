import { motion } from "framer-motion";
import { Gift, Sparkles } from "lucide-react";
import { type CardData } from "@/lib/cards";

export function PackOpening({ card, onOpen }: { card: CardData; onOpen: () => void }) {
  const accent = card.primaryColor || "#ff4d6d";
  const accent2 = card.secondaryColor || "#a4508b";

  return (
    <div className="relative flex flex-col items-center">
      {/* Soft ambient glow */}
      <motion.div
        className="absolute inset-0 -z-10 blur-3xl opacity-60"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Floating sparkles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/80"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{ opacity: [0, 1, 0], y: [-10, -40] }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-rose-200/80">
          Pacote especial
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-gradient-romance">
          Você recebeu uma carta
        </h2>
      </motion.div>

      {/* Pack */}
      <motion.div
        initial={{ rotate: -2, y: 0 }}
        animate={{ rotate: [-2, 2, -2], y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-[240px] h-[336px] rounded-2xl overflow-hidden shadow-glow"
        style={{
          background: `linear-gradient(135deg, ${accent}, ${accent2})`,
          border: "2px solid rgba(255,255,255,0.2)",
        }}
      >
        {/* Foil shimmer */}
        <motion.div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)",
          }}
          animate={{ backgroundPosition: ["-200% 0", "200% 0"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        {/* Tear line */}
        <div className="absolute top-12 left-0 right-0 border-t border-dashed border-white/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Gift size={56} className="drop-shadow-lg" />
          <p className="mt-4 text-[10px] tracking-[0.3em] uppercase opacity-80">
            {card.packageName || "Edição Coração"}
          </p>
          <p className="text-lg font-bold mt-1">1 / 1</p>
          <div className="absolute bottom-6 flex items-center gap-1 text-[10px] opacity-70">
            <Sparkles size={10} /> selado especialmente para você
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={onOpen}
        className="mt-10 bg-gradient-romance text-white px-8 py-4 rounded-full font-bold text-lg inline-flex items-center gap-2 shadow-glow"
      >
        <Gift size={18} /> Abrir Pacote
      </motion.button>
      <p className="mt-3 text-xs text-muted-foreground">toque para revelar</p>
    </div>
  );
}
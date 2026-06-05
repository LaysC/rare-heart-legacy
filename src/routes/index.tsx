import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Heart, Sparkles, QrCode, Gift } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Você recebeu um presente especial" },
      { name: "description", content: "Escaneie o QR Code da sua carta e descubra o que está esperando por você." },
      { property: "og:title", content: "Você recebeu um presente especial" },
      { property: "og:description", content: "Escaneie o QR Code da sua carta e descubra o que está esperando por você." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen px-6 py-16 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(255,77,109,0.35), transparent 60%)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      {/* Floating particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute w-1 h-1 rounded-full bg-rose-200/70"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ y: [-10, -60], opacity: [0, 1, 0] }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 4,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="glass rounded-3xl p-8 sm:p-12 max-w-xl shadow-glow"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs uppercase tracking-widest text-rose-200 mb-6">
          <Sparkles size={14} /> Algo especial te espera
        </div>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-romance grid place-items-center shadow-glow"
        >
          <Gift className="text-white" />
        </motion.div>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          Você recebeu um <span className="text-gradient-romance">presente especial</span>.
        </h1>
        <p className="mt-5 text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
          Escaneie o QR Code da sua carta e descubra o que está esperando
          por você.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            to="/scan"
            className="bg-gradient-romance text-white px-8 py-4 rounded-full font-semibold inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-glow text-base"
          >
            <QrCode size={20} /> Escanear QR Code
          </Link>
          <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
            <Heart size={10} className="text-rose-300" /> feito com carinho para você
          </p>
        </div>
      </motion.div>
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Heart, Sparkles, QrCode, Wand2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Laís EX — Carta Colecionável Única" },
      { name: "description", content: "Uma carta colecionável de Dia dos Namorados. Escaneie e descubra." },
      { property: "og:title", content: "Laís EX — Carta Colecionável Única" },
      { property: "og:description", content: "Uma carta colecionável de Dia dos Namorados. Escaneie e descubra." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen px-6 py-16 flex flex-col items-center justify-center text-center">
      <div className="glass rounded-3xl p-8 sm:p-12 max-w-2xl shadow-glow">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs uppercase tracking-widest text-rose-200 mb-6">
          <Sparkles size={14} /> Edição Dia dos Namorados
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
          Cartas <span className="text-gradient-romance">Colecionáveis</span><br />de Amor
        </h1>
        <p className="mt-6 text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
          Crie cartas raras, gere QR codes únicos e entregue uma experiência
          inesquecível. Quando escaneada, a carta revela sua história.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            to="/admin"
            className="bg-gradient-romance text-white px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-glow"
          >
            <Wand2 size={18} /> Abrir Painel
          </Link>
          <a
            href="#como-funciona"
            className="glass px-6 py-3 rounded-full font-medium inline-flex items-center gap-2"
          >
            <Heart size={18} /> Como funciona
          </a>
        </div>
      </div>

      <section id="como-funciona" className="mt-20 grid sm:grid-cols-3 gap-4 max-w-4xl w-full">
        {[
          { icon: Wand2, t: "Crie a carta", d: "Preencha nome, raridade, ataque e habilidade." },
          { icon: QrCode, t: "Imprima", d: "Gere o layout de impressão com QR code único." },
          { icon: Heart, t: "Revele", d: "Ao escanear, ele vive a análise e a revelação." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="glass rounded-2xl p-6 text-left">
            <Icon className="text-rose-300 mb-3" />
            <h3 className="font-semibold mb-1">{t}</h3>
            <p className="text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

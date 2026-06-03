import { type CardData, isRare } from "@/lib/cards";
import { Heart, Sparkles, Shield, Zap } from "lucide-react";

interface Props {
  card: CardData;
  className?: string;
  printable?: boolean;
}

const rarityBadge: Record<string, string> = {
  "Comum": "bg-zinc-500/30 text-zinc-100",
  "Rara": "bg-blue-500/30 text-blue-100",
  "Ultra Rara": "bg-purple-500/30 text-purple-100",
  "Lendária": "bg-amber-500/30 text-amber-100",
  "Única": "bg-gradient-romance text-white",
};

export function HoloCard({ card, className = "", printable = false }: Props) {
  const accent = card.primaryColor || "#ff4d6d";
  const accent2 = card.secondaryColor || "#a4508b";
  const rare = isRare(card.rarity);
  const frame = card.frame || "holo";

  const frameStyles: Record<string, React.CSSProperties> = {
    classic: { background: `linear-gradient(160deg, ${accent}, ${accent2})`, padding: 10 },
    neon: { background: `linear-gradient(160deg, ${accent}, #000 70%)`, padding: 8, boxShadow: `0 0 30px ${accent}` },
    gold: { background: `linear-gradient(160deg, #f6d365, #b8860b)`, padding: 12 },
    minimal: { background: `#0a0a0a`, padding: 6 },
    holo: {
      background: `linear-gradient(160deg, ${accent}, ${accent2} 50%, #1a0d1f)`,
      padding: 12,
    },
  };

  return (
    <div
      className={`${rare || frame === "holo" ? "holo-card" : ""} relative w-[320px] sm:w-[360px] aspect-[2.5/3.5] shadow-glow ${className}`}
      style={{ ...frameStyles[frame], borderRadius: "1.25rem" }}
    >
      <div
        className="relative h-full w-full rounded-[1rem] p-3 flex flex-col gap-2"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.75))",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between text-white relative z-[4]">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-70">
              {card.category}
            </span>
            <h3 className="text-xl font-bold leading-tight drop-shadow">
              {card.name}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-right">
            <span className="text-[10px] opacity-70">HP</span>
            <span className="text-2xl font-extrabold text-gradient-romance">
              {card.hp}
            </span>
          </div>
        </div>

        {/* Image */}
        <div
          className="relative flex-1 rounded-md overflow-hidden border border-white/10"
          style={{
            background: card.imageDataUrl
              ? "rgba(255,255,255,0.04)"
              : `linear-gradient(135deg, ${accent}, ${accent2})`,
          }}
        >
          {card.imageDataUrl ? (
            <img
              src={card.imageDataUrl}
              alt={card.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-white/60">
              <Heart size={56} className="drop-shadow-lg" />
            </div>
          )}
          <div className="absolute top-2 right-2 z-[4]">
            <span
              className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${rarityBadge[card.rarity]}`}
            >
              {card.rarity.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="text-white/90 text-[11px] space-y-1.5 relative z-[4]">
          <p className="italic opacity-80 line-clamp-2">{card.description}</p>
          <div className="flex items-start gap-1.5">
            <Zap size={12} className="mt-0.5 text-amber-300 shrink-0" />
            <p>
              <span className="font-bold">Ataque:</span> {card.specialAttack}
            </p>
          </div>
          <div className="flex items-start gap-1.5">
            <Shield size={12} className="mt-0.5 text-rose-300 shrink-0" />
            <p>
              <span className="font-bold">Habilidade:</span> {card.ability}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-white/70 text-[10px] pt-1 border-t border-white/10 relative z-[4]">
          <span className="flex items-center gap-1">
            <Sparkles size={10} /> {card.footer || "Edição Coração"}
          </span>
          <span className="font-mono">
            #{card.id.slice(0, 6).toUpperCase()}
          </span>
        </div>

        {printable && (
          <div className="absolute bottom-1 left-1 right-1 text-center text-white/40 text-[8px]">
            {new Date(card.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
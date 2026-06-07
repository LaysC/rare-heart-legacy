import { type CardData, isRare } from "@/lib/cards";
import { Heart, Sparkles, Shield, Zap, RotateCw } from "lucide-react";
import { useState, type CSSProperties } from "react";

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
      className={`${rare || frame === "holo" ? "holo-card" : ""} relative aspect-[2.5/3.5] shadow-glow ${className}`}
      style={{
        ...frameStyles[frame],
        borderRadius: "1.25rem",
        width: "min(340px, calc(100vw - 1.5rem))",
        containerType: "inline-size",
      } as CSSProperties}
    >
      <div
        className="relative h-full w-full rounded-[1rem] flex flex-col"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.75))",
          border: "1px solid rgba(255,255,255,0.15)",
          padding: "4cqw",
          gap: "2cqw",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 text-white relative z-[4]">
          <div className="flex flex-col">
            <span
              className="uppercase tracking-[0.2em] opacity-70 leading-tight"
              style={{ fontSize: "clamp(0.55rem, 2.6cqw, 0.7rem)" }}
            >
              {card.category}
            </span>
            <h3
              className="font-bold leading-tight drop-shadow"
              style={{ fontSize: "clamp(1rem, 5.5cqw, 1.5rem)" }}
            >
              {card.name}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-right">
            <span
              className="opacity-70"
              style={{ fontSize: "clamp(0.55rem, 2.6cqw, 0.7rem)" }}
            >HP</span>
            <span
              className="font-extrabold text-gradient-romance leading-none"
              style={{ fontSize: "clamp(1.1rem, 6.5cqw, 1.85rem)" }}
            >
              {card.hp}
            </span>
          </div>
        </div>

        {/* Image */}
        <div
          className="relative flex-1 rounded-md overflow-hidden border border-white/10 z-[5]"
          style={{
            background: card.imageDataUrl
              ? "rgba(255,255,255,0.04)"
              : `linear-gradient(135deg, ${accent}, ${accent2})`,
            isolation: "isolate",
          }}
        >
          {card.imageDataUrl ? (
            <img
              src={card.imageDataUrl}
              alt={card.name}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-white/60">
              <Heart size={56} className="drop-shadow-lg" />
            </div>
          )}
          <div className="absolute top-2 right-2 z-[6]">
            <span
              className={`px-2 py-1 rounded-full font-bold tracking-wider ${rarityBadge[card.rarity]}`}
              style={{ fontSize: "clamp(0.5rem, 2.4cqw, 0.65rem)" }}
            >
              {card.rarity.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Body */}
        <div
          className="text-white/90 relative z-[4] leading-snug"
          style={{ fontSize: "clamp(0.58rem, 2.55cqw, 0.78rem)" }}
        >
          {card.description && (
            <p className="italic opacity-80 mb-[1.5cqw]">{card.description}</p>
          )}
          {card.specialAttack && (
            <div className="flex items-start gap-[1.5cqw] mb-[1cqw]">
              <Zap className="text-amber-300 shrink-0" style={{ width: "3cqw", height: "3cqw", marginTop: "0.4cqw", minWidth: 10, minHeight: 10 }} />
              <p>
                <span className="font-bold">Ataque:</span> {card.specialAttack}
              </p>
            </div>
          )}
          {card.ability && (
            <div className="flex items-start gap-[1.5cqw]">
              <Shield className="text-rose-300 shrink-0" style={{ width: "3cqw", height: "3cqw", marginTop: "0.4cqw", minWidth: 10, minHeight: 10 }} />
              <p>
                <span className="font-bold">Habilidade:</span> {card.ability}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="mt-auto flex items-center justify-between text-white/70 border-t border-white/10 relative z-[4]"
          style={{ fontSize: "clamp(0.5rem, 2.3cqw, 0.65rem)", paddingTop: "1.5cqw" }}
        >
          <span className="flex items-center gap-1 min-w-0">
            <Sparkles style={{ width: "2.6cqw", height: "2.6cqw", minWidth: 9, minHeight: 9 }} />
            <span className="truncate-none">{card.footer || "Edição Coração"}</span>
          </span>
          <span className="font-mono">
            #{card.id.slice(0, 6).toUpperCase()}
          </span>
        </div>

        {printable && (
          <div className="absolute bottom-1 left-1 right-1 text-center text-white/40" style={{ fontSize: "2cqw" }}>
            {new Date(card.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------- Card Back ----------------- */

export function CardBack({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative aspect-[2.5/3.5] shadow-glow ${className}`}
      style={{
        width: "min(340px, calc(100vw - 1.5rem))",
        borderRadius: "1.25rem",
        padding: 10,
        background:
          "linear-gradient(135deg, #d4af37 0%, #b8860b 30%, #8b1a3d 60%, #5b0e1a 100%)",
        containerType: "inline-size",
      } as CSSProperties}
    >
      <div
        className="relative h-full w-full overflow-hidden grid place-items-center"
        style={{
          borderRadius: "1rem",
          background:
            "radial-gradient(ellipse at 30% 20%, #c41e4a 0%, #7a1430 45%, #3a0612 100%)",
          border: "2px solid rgba(229, 185, 106, 0.55)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.6), inset 0 0 12px rgba(229,185,106,0.25)",
        }}
      >
        {/* holo sheen */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            background:
              "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)",
            mixBlendMode: "overlay",
          }}
        />
        {/* radial sparkle pattern */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0 1px, transparent 2px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.4) 0 1px, transparent 2px), radial-gradient(circle at 60% 20%, rgba(255,215,150,0.6) 0 1px, transparent 2px), radial-gradient(circle at 30% 80%, rgba(255,215,150,0.4) 0 1px, transparent 2px)",
          }}
        />

        {/* gold rim circle behind heart */}
        <div
          className="absolute"
          style={{
            width: "60cqw",
            height: "60cqw",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
            boxShadow:
              "0 0 0 2px rgba(229,185,106,0.6), 0 0 40px rgba(255,215,150,0.4)",
          }}
        />

        {/* heart */}
        <Heart
          fill="#fff5f7"
          stroke="#d4af37"
          strokeWidth={1.5}
          className="relative drop-shadow-[0_4px_20px_rgba(255,200,210,0.6)]"
          style={{ width: "44cqw", height: "44cqw" }}
        />

        {/* Top label */}
        <div
          className="absolute top-[6cqw] left-0 right-0 text-center uppercase tracking-[0.4em] text-amber-100/80"
          style={{ fontSize: "clamp(0.55rem, 2.4cqw, 0.75rem)" }}
        >
          Edição
        </div>
        {/* Bottom label */}
        <div
          className="absolute bottom-[6cqw] left-0 right-0 text-center font-bold tracking-[0.35em] text-amber-100"
          style={{
            fontSize: "clamp(0.75rem, 4cqw, 1.1rem)",
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
          }}
        >
          CORAÇÃO
        </div>
      </div>
    </div>
  );
}

/* ----------------- Card Flipper ----------------- */

export function CardFlipper({ card, className = "" }: { card: CardData; className?: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className="relative"
        style={{
          perspective: 1400,
          width: "min(340px, calc(100vw - 1.5rem))",
        }}
      >
        <div
          className="relative w-full aspect-[2.5/3.5] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <HoloCard card={card} />
          </div>
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <CardBack />
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="glass px-4 py-2 rounded-full text-xs inline-flex items-center gap-1.5 hover:bg-white/10 transition-colors"
      >
        <RotateCw size={12} /> {flipped ? "Ver frente" : "Ver verso"}
      </button>
    </div>
  );
}
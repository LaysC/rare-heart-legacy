import { useRef, useState } from "react";
import { Download, Check, ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { HoloCard } from "@/components/HoloCard";
import type { CardData } from "@/lib/cards";

interface AdminCardViewProps {
  card: CardData;
}

export function AdminCardPreview({ card }: AdminCardViewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onDownload() {
    if (!cardRef.current || busy) return;
    
    setBusy(true);
    try {
      // Importa a biblioteca de imagem dinamicamente
      const { toPng } = await import("html-to-image");
      const node = cardRef.current;
      
      // Pequeno delay para garantir a renderização estável
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(node, {
        pixelRatio: 3, // Alta definição para impressão
        cacheBust: true,
        backgroundColor: "rgba(255, 255, 255, 0)", // Fundo transparente limpo
        width: 315, 
        height: 440, 
        style: {
          transform: "none",
          margin: "0",
          animation: "none", 
        },
      });
      
      // Força o download do arquivo no navegador
      const a = document.createElement("a");
      const safeName = (card.name || "carta").replace(/[^a-z0-9\-_]+/gi, "_").toLowerCase();
      a.href = dataUrl;
      a.download = `admin-${safeName}.png`;
      a.click();
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Falha ao baixar carta pelo admin", err);
      alert("Ops! O navegador não conseguiu gerar a imagem dessa vez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 glass rounded-3xl max-w-sm mx-auto mt-6">
      {/* Container invisível ou controlado para a foto sair perfeita */}
      <div 
        ref={cardRef} 
        style={{ 
          width: "315px", 
          height: "440px", 
          display: "flex", 
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {/* Passamos printable={true} para desativar sombras pesadas que quebram o PNG */}
        <HoloCard card={card} printable={true} className="!w-[315px] !h-[440px] !m-0" />
      </div>

      {/* Botão de Ação */}
      <button
        type="button"
        onClick={onDownload}
        disabled={busy}
        className="bg-gradient-romance text-white px-6 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-glow w-full justify-center"
      >
        {saved ? <Check size={16} /> : <Download size={16} />}
        {saved ? "Carta Baixada!" : "Baixar PNG para Impressão"}
      </button>
    </div>
  );
}
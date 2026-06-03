import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCard, encodeCardToUrl, type CardData } from "@/lib/cards";
import { HoloCard } from "@/components/HoloCard";
import { Printer, ArrowLeft, QrCode, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/card/$id")({
  head: () => ({ meta: [{ title: "Carta" }] }),
  component: CardView,
});

function CardView() {
  const { id } = useParams({ from: "/card/$id" });
  const [card, setCard] = useState<CardData | undefined>();
  const [qr, setQr] = useState<string>("");
  const [scanUrl, setScanUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const c = getCard(id);
    setCard(c);
    if (typeof window === "undefined" || !c) return;
    const payload = encodeCardToUrl(c);
    const url = `${window.location.origin}/scan/${id}?d=${payload}`;
    setScanUrl(url);
    import("qrcode").then(({ default: QRCode }) =>
      QRCode.toDataURL(url, {
        width: 360,
        margin: 1,
        errorCorrectionLevel: "L",
        color: { dark: "#1a0d1f", light: "#ffffff" },
      })
        .then(setQr)
        .catch(() => {
          // Fallback: tiny URL with just id (works if user opens on same device)
          QRCode.toDataURL(`${window.location.origin}/scan/${id}`, {
            width: 360,
            margin: 1,
            color: { dark: "#1a0d1f", light: "#ffffff" },
          }).then(setQr);
        }),
    );
  }, [id]);

  if (!card) {
    return (
      <main className="min-h-screen grid place-items-center px-6">
        <p className="text-muted-foreground">Carta não encontrada.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link to="/admin" className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <ArrowLeft size={12} /> Painel
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-gradient-romance text-white px-5 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-2"
        >
          <Printer size={14} /> Imprimir
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center justify-items-center print:grid-cols-2">
        <HoloCard card={card} printable />
        <div className="glass rounded-2xl p-8 text-center max-w-xs">
          <div className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground mb-3">
            <QrCode size={12} /> Escaneie
          </div>
          {qr && <img src={qr} alt="QR Code" className="w-full rounded-xl bg-white p-2" />}
          <button
            onClick={() => {
              navigator.clipboard.writeText(scanUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="mt-4 text-[10px] text-muted-foreground break-all inline-flex items-center gap-1 hover:text-foreground print:hidden"
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
            {copied ? "Copiado!" : "Copiar link completo"}
          </button>
          <p className="mt-3 text-sm font-semibold text-gradient-romance">
            Aponte a câmera para revelar a carta.
          </p>
          <p className="mt-2 text-[10px] text-muted-foreground">
            O QR contém a carta completa — funciona em qualquer celular.
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .glass { background: white !important; box-shadow: none !important; border-color: #ddd !important; }
        }
      `}</style>
    </main>
  );
}
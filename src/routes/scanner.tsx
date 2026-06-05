import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Image as ImageIcon, X } from "lucide-react";

export const Route = createFileRoute("/scanner")({
  head: () => ({ meta: [{ title: "Escanear QR Code" }] }),
  component: ScannerPage,
});

function ScannerPage() {
  const nav = useNavigate();
  const containerId = "qr-reader";
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string>("");
  const [starting, setStarting] = useState(true);

  function handleResult(text: string) {
    try {
      const url = new URL(text);
      // Same-origin /scan/:id (with optional ?d=)
      if (url.pathname.startsWith("/scan/")) {
        const id = url.pathname.split("/")[2];
        const d = url.searchParams.get("d") || undefined;
        nav({ to: "/scan/$id", params: { id }, search: { d } });
        return;
      }
      // Fallback: navigate to the URL directly
      window.location.href = text;
    } catch {
      setError("QR Code inválido. Tente novamente.");
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            scanner.stop().then(() => handleResult(decoded)).catch(() => handleResult(decoded));
          },
          () => {},
        );
        setStarting(false);
      } catch (e: any) {
        setError(
          "Não conseguimos acessar a câmera. Você pode enviar uma foto do QR Code abaixo.",
        );
        setStarting(false);
      }
    })();
    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s && s.isScanning) s.stop().catch(() => undefined);
    };
  }, []);

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const tmp = new Html5Qrcode(containerId);
      const decoded = await tmp.scanFile(file, true);
      handleResult(decoded);
    } catch {
      setError("Não foi possível ler o QR Code dessa imagem.");
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link to="/" className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <ArrowLeft size={12} /> Voltar
        </Link>
        <span className="text-xs uppercase tracking-widest text-rose-200 inline-flex items-center gap-1">
          <Camera size={12} /> Escanear
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-center">
        Aponte a câmera para o <span className="text-gradient-romance">QR Code</span>
      </h1>
      <p className="text-sm text-muted-foreground text-center mt-2 max-w-sm">
        Permita o acesso à câmera para revelar a sua carta.
      </p>

      <div className="mt-6 w-full max-w-sm aspect-square rounded-3xl overflow-hidden glass relative shadow-glow">
        <div id={containerId} className="absolute inset-0 [&_video]:object-cover [&_video]:!w-full [&_video]:!h-full" />
        {starting && (
          <div className="absolute inset-0 grid place-items-center text-rose-200/80 text-sm">
            iniciando câmera…
          </div>
        )}
        {/* Decorative frame */}
        <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-white/30" />
      </div>

      {error && (
        <div className="mt-4 glass rounded-xl p-3 text-sm text-rose-200 flex items-start gap-2 max-w-sm">
          <X size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <label className="mt-6 glass px-5 py-3 rounded-full text-sm inline-flex items-center gap-2 cursor-pointer">
        <ImageIcon size={14} /> Enviar foto do QR Code
        <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
      </label>
    </main>
  );
}
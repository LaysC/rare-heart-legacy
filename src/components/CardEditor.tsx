import { useEffect, useState } from "react";
import { type CardData, type Rarity, type FrameStyle, saveCard, newId, BLANK_CARD } from "@/lib/cards";
import { HoloCard } from "./HoloCard";
import { useNavigate } from "@tanstack/react-router";
import { Upload, Save, Trash2 } from "lucide-react";

const RARITIES: Rarity[] = ["Comum", "Rara", "Ultra Rara", "Lendária", "Única"];
const FRAMES: { value: FrameStyle; label: string }[] = [
  { value: "holo", label: "Holográfica" },
  { value: "classic", label: "Clássica" },
  { value: "neon", label: "Neon" },
  { value: "gold", label: "Ouro" },
  { value: "minimal", label: "Minimalista" },
];

export function CardEditor({ initial }: { initial?: CardData }) {
  const nav = useNavigate();
  const [card, setCard] = useState<CardData>(
    initial ?? {
      ...BLANK_CARD,
      id: newId(),
      createdAt: new Date().toISOString(),
    }
  );

  useEffect(() => {
    if (initial) setCard(initial);
  }, [initial]);

  function update<K extends keyof CardData>(k: K, v: CardData[K]) {
    setCard((p) => ({ ...p, [k]: v }));
  }

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => update("imageDataUrl", String(reader.result));
    reader.readAsDataURL(f);
  }

  function onSave() {
    saveCard(card);
    nav({ to: "/card/$id", params: { id: card.id } });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start">
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-lg mb-2">Dados da carta</h2>
        <Grid>
          <Field label="Nome">
            <input className={inp} value={card.name} onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="Categoria">
            <input className={inp} value={card.category} onChange={(e) => update("category", e.target.value)} />
          </Field>
          <Field label="Raridade">
            <select className={inp} value={card.rarity} onChange={(e) => update("rarity", e.target.value as Rarity)}>
              {RARITIES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="HP">
            <input type="number" className={inp} value={card.hp} onChange={(e) => update("hp", Number(e.target.value))} />
          </Field>
          <Field label="Cor principal">
            <input type="color" className="h-10 w-full rounded-lg bg-transparent" value={card.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} />
          </Field>
          <Field label="Cor secundária">
            <input type="color" className="h-10 w-full rounded-lg bg-transparent" value={card.secondaryColor || "#a4508b"} onChange={(e) => update("secondaryColor", e.target.value)} />
          </Field>
          <Field label="Moldura">
            <select className={inp} value={card.frame || "holo"} onChange={(e) => update("frame", e.target.value as FrameStyle)}>
              {FRAMES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </Field>
          <Field label="Valor exibido">
            <input className={inp} value={card.displayValue} onChange={(e) => update("displayValue", e.target.value)} />
          </Field>
        </Grid>
        <Field label="Descrição">
          <textarea className={inp + " min-h-20"} value={card.description} onChange={(e) => update("description", e.target.value)} />
        </Field>
        <Field label="Ataque Especial">
          <textarea className={inp + " min-h-16"} value={card.specialAttack} onChange={(e) => update("specialAttack", e.target.value)} />
        </Field>
        <Field label="Habilidade">
          <textarea className={inp + " min-h-16"} value={card.ability} onChange={(e) => update("ability", e.target.value)} />
        </Field>
        <Field label="Mensagem secreta (revelação)">
          <textarea className={inp + " min-h-24"} value={card.secretMessage} onChange={(e) => update("secretMessage", e.target.value)} />
        </Field>
        <Field label="Rodapé">
          <input className={inp} value={card.footer || ""} onChange={(e) => update("footer", e.target.value)} />
        </Field>
        <Field label="Texto romântico (relatório completo)">
          <textarea className={inp + " min-h-24"} value={card.romanticText || ""} onChange={(e) => update("romanticText", e.target.value)} />
        </Field>
        <Field label="Mensagem final">
          <textarea className={inp + " min-h-16"} value={card.finalMessage || ""} onChange={(e) => update("finalMessage", e.target.value)} />
        </Field>
        <Field label="Imagem da carta">
          <div className="flex items-center gap-2">
            {card.imageDataUrl && (
              <img src={card.imageDataUrl} alt="" className="w-14 h-14 rounded-lg object-cover border border-border" />
            )}
            <label className={inp + " cursor-pointer inline-flex items-center gap-2 text-sm flex-1"}>
              <Upload size={14} /> {card.imageDataUrl ? "Trocar imagem" : "Enviar imagem"}
              <input type="file" accept="image/*" className="hidden" onChange={onImage} />
            </label>
            {card.imageDataUrl && (
              <button
                type="button"
                onClick={() => update("imageDataUrl", "")}
                className="px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-500/10"
                title="Remover imagem"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Dica: imagens grandes serão omitidas do QR code para garantir leitura. Use até ~300KB.
          </p>
        </Field>

        <button
          onClick={onSave}
          className="mt-2 bg-gradient-romance text-white w-full py-3 rounded-full font-semibold inline-flex items-center justify-center gap-2 shadow-glow"
        >
          <Save size={16} /> Salvar e gerar QR Code
        </button>
      </div>

      <div className="sticky top-6 flex flex-col items-center gap-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Preview</p>
        <HoloCard card={card} />
      </div>
    </div>
  );
}

const inp = "w-full px-3 py-2 rounded-lg bg-input/60 border border-border text-sm outline-none focus:border-rose-400";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-3">{children}</div>;
}
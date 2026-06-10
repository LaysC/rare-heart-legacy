import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { LogIn, User, Mail, Check } from "lucide-react";

export function AuthButton() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/admin" },
    });
    setSending(false);
    if (!error) {
      setSent(true);
    } else {
      console.error("Erro ao enviar email:", error.message);
      alert("Erro ao enviar o link. Verifique o console.");
    }
  }

  // Já está logado
  if (session) {
    return (
      <button onClick={() => navigate({ to: "/admin" })} className="glass px-4 py-2 rounded-full text-sm font-medium text-rose-200 hover:bg-white/10 flex items-center gap-2 shadow-glow">
        <User size={16} /> Painel Admin
      </button>
    );
  }

  // Mostra o campo de email depois de clicar em Login
  if (showForm) {
    if (sent) {
      return (
        <div className="glass px-4 py-2 rounded-full text-sm font-medium text-emerald-300 flex items-center gap-2 shadow-glow border-emerald-500/30">
          <Check size={16} /> Link enviado pro seu email!
        </div>
      );
    }
    return (
      <form onSubmit={handleMagicLink} className="flex items-center gap-2">
        <input 
          type="email" 
          placeholder="Digite seu email..." 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          className="px-4 py-2 rounded-full bg-black/40 border border-white/10 text-sm text-white outline-none w-48 focus:border-rose-400 transition-colors" 
        />
        <button type="submit" disabled={sending} className="glass px-4 py-2 rounded-full text-sm font-medium text-rose-200 hover:bg-white/10 flex items-center gap-2 shadow-glow">
          {sending ? "Enviando..." : <><Mail size={16} /> Enviar</>}
        </button>
      </form>
    );
  }

  // Botão inicial
  return (
    <button onClick={() => setShowForm(true)} className="glass px-4 py-2 rounded-full text-sm font-medium text-rose-200 hover:bg-white/10 flex items-center gap-2 shadow-glow">
      <LogIn size={16} /> Login
    </button>
  );
}
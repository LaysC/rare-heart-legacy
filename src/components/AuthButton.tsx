import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { User, Heart } from "lucide-react";

export function AuthButton() {
  const [session, setSession] = useState<any>(null);
  
  // O e-mail falso fica escondido aqui, ele nunca vai ver!
  const emailFixo = "surpresa@1206.com"; 
  const [senhaData, setSenhaData] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // TRUQUE MÁGICO 2: Garante que o botão também saiba que o cache foi limpo
    if (!sessionStorage.getItem("botao_cache_limpo")) {
      sessionStorage.setItem("botao_cache_limpo", "true");
      supabase.auth.signOut();
    }

    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Mandamos o e-mail invisível e a data que ele digitou para o cofre
    const { error } = await supabase.auth.signInWithPassword({
      email: emailFixo,
      password: senhaData,
    });
    setLoading(false);
    
    if (error) {
      alert(`Ops, data incorreta! Tente novamente, amor. ❤️`);
    } else {
      // Redirecionando direto para a coleção!
      navigate({ to: "/collection" }); 
    }
  }

  // Se já estiver logado, mostra o botão para ir direto para a coleção
  if (session) {
    return (
      <button onClick={() => navigate({ to: "/collection" })} className="glass px-4 py-2 rounded-full text-sm font-medium text-rose-200 hover:bg-white/10 flex items-center gap-2 shadow-glow">
        <User size={16} /> Ver Cartas
      </button>
    );
  }

  // A tela fofa só pedindo a data
  if (showForm) {
    return (
      <form onSubmit={handleLogin} className="flex flex-col gap-3 bg-black/60 p-5 rounded-xl border border-white/10 shadow-xl backdrop-blur-md">
        <p className="text-sm font-medium text-rose-200 text-center">Qual é a nossa data?</p>
        <input 
          type="text" 
          placeholder="Pense bem.... demorou 8 meses" 
          value={senhaData} 
          onChange={(e) => setSenhaData(e.target.value)} 
          required 
          className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-center text-white outline-none w-48 focus:border-rose-400" 
        />
        <button type="submit" disabled={loading} className="bg-gradient-romance text-white px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition-transform shadow-glow">
          {loading ? "Abrindo..." : "Acessar Coleção"}
        </button>
      </form>
    );
  }

  // O botão inicial
  return (
    <button onClick={() => setShowForm(true)} className="glass px-4 py-2 rounded-full text-sm font-medium text-rose-200 hover:bg-white/10 flex items-center gap-2 shadow-glow">
      <Heart size={16} /> Acessar Presente
    </button>
  );
}
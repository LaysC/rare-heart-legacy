import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { LogIn, User } from "lucide-react";

export function AuthButton() {
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se já tem alguém logado quando a página carrega
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Fica de olho se o usuário fizer login ou logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleGoogleLogin() {
    // O login oficial do Supabase, ignorando a rota falsa do Lovable
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Redireciona de volta para a Vercel corretamente
        redirectTo: window.location.origin + "/admin",
      },
    });

    if (error) {
      console.error("Erro no login com Google:", error.message);
    }
  }

  // Se já estiver logado, mostra o botão para ir pro painel Admin
  if (session) {
    return (
      <button
        onClick={() => navigate({ to: "/admin" })}
        className="glass px-4 py-2 rounded-full text-sm font-medium text-rose-200 hover:bg-white/10 flex items-center gap-2 shadow-glow"
      >
        <User size={16} /> Painel Admin
      </button>
    );
  }

  // Se não estiver logado, mostra o botão de login
  return (
    <button
      onClick={handleGoogleLogin}
      className="glass px-4 py-2 rounded-full text-sm font-medium text-rose-200 hover:bg-white/10 flex items-center gap-2 shadow-glow"
    >
      <LogIn size={16} /> Login
    </button>
  );
}
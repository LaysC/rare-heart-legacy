import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Library } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export function AuthButton() {
  const { user, loading } = useAuth();

  if (loading) return null;

  async function signIn() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + window.location.pathname,
    });
    if (result.error) console.error(result.error);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="glass px-4 py-2 rounded-full text-xs inline-flex items-center gap-1.5 hover:bg-white/10 transition-colors"
      >
        <LogIn size={12} /> Entrar com Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/collection"
        className="glass px-4 py-2 rounded-full text-xs inline-flex items-center gap-1.5 hover:bg-white/10 transition-colors"
      >
        <Library size={12} /> Minha coleção
      </Link>
      <button
        onClick={signOut}
        title="Sair"
        className="glass p-2 rounded-full text-xs inline-flex items-center hover:bg-white/10 transition-colors"
      >
        <LogOut size={12} />
      </button>
    </div>
  );
}
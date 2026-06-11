import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function checkSession() {
      // TRUQUE MÁGICO: Se for uma nova aba/visita, desloga para forçar a surpresa da data!
      if (!sessionStorage.getItem("cache_limpo")) {
        sessionStorage.setItem("cache_limpo", "true");
        await supabase.auth.signOut();
      }

      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      setUser(data.user ?? null);
      setLoading(false);
    }

    checkSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (alive) setUser(session?.user ?? null);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
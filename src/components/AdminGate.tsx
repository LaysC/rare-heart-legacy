import { useEffect, useState } from "react";
import { isAdminAuthed, loginAdmin } from "@/lib/admin-auth";
import { Lock } from "lucide-react";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setOk(isAdminAuthed());
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!ok) {
    return (
      <main className="min-h-screen grid place-items-center px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (loginAdmin(password)) {
              setOk(true);
              setError("");
            } else {
              setError("Senha incorreta.");
            }
          }}
          className="glass rounded-2xl p-8 w-full max-w-sm text-center"
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 grid place-items-center mb-4">
            <Lock className="text-rose-300" size={20} />
          </div>
          <h1 className="text-xl font-bold">Área restrita</h1>
          <p className="text-xs text-muted-foreground mt-1 mb-6">
            Informe a senha para acessar o painel.
          </p>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full px-3 py-2 rounded-lg bg-input/60 border border-border text-sm outline-none focus:border-rose-400 text-center tracking-widest"
          />
          {error && <p className="text-xs text-rose-300 mt-2">{error}</p>}
          <button
            type="submit"
            className="mt-5 w-full bg-gradient-romance text-white py-2.5 rounded-full font-semibold text-sm shadow-glow"
          >
            Entrar
          </button>
        </form>
      </main>
    );
  }

  return <>{children}</>;
}
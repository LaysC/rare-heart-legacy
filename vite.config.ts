import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      // Aqui nós forçamos o Lovable a esquecer o Cloudflare e focar 100% na Vercel
      nitro({
        preset: "vercel",
      }),
    ],
  },
});
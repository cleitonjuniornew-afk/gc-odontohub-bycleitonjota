import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

// Nota: usamos a pilha de fontes do sistema (definida em globals.css) em vez de
// next/font/google, para o app não depender de acesso à rede do Google Fonts
// em tempo de build/deploy. Para usar Geist via Google Fonts, basta reativar
// `import { Geist, Geist_Mono } from "next/font/google"` em ambiente com internet.

export const metadata: Metadata = {
  title: "GC OdontoHub",
  description: "O hub acadêmico completo para estudantes de Odontologia.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#090909",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased">
        <QueryProvider>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "#181818",
                border: "1px solid #2A2A2A",
                color: "#FFFFFF",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}

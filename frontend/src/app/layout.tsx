import { Metadata, Viewport } from "next";
import "../app.css";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "EntregaMais | Sua bebida gelada em minutos",
  description: "O jeito mais rápido de receber sua cerveja, destilado ou petiscos. Preço de mercado e entrega em até 25 minutos. Peça agora!",
  keywords: ["entrega de bebidas", "cerveja gelada", "delivery de bebidas", "entregamais"],
  openGraph: {
    title: "EntregaMais | Sua bebida gelada em minutos",
    description: "Sua gelada na porta de casa em tempo recorde.",
    type: "website",
    locale: "pt_BR",
    siteName: "EntregaMais",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFC107",
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

import { MSWProvider } from "@/components/providers/MSWProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CartProvider } from "@/lib/CartContext";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen font-sans text-slate-800">
        <MSWProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <div className="min-h-screen bg-slate-50 relative selection:bg-brand-sky selection:text-white flex flex-col">
                  <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-brand-teal/5 to-transparent -z-10 pointer-events-none" />
                  <Navbar />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </div>
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </MSWProvider>
      </body>
    </html>
  );
}

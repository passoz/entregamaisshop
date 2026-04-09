import "../app.css";
import type { ReactNode } from "react";

import { MSWProvider } from "@/components/providers/MSWProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen font-sans text-slate-800">
        <MSWProvider>
          <AuthProvider>
            <div className="min-h-screen bg-slate-50 relative selection:bg-brand-sky selection:text-white">
              <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-brand-teal/5 to-transparent -z-10 pointer-events-none" />
              <Navbar />
              {children}
            </div>
          </AuthProvider>
        </MSWProvider>
      </body>
    </html>
  );
}

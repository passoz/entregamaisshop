"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import Link from "next/link";
import { X, CheckCircle, Info, ShoppingCart, ArrowRight } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success", title?: string) => {
    const id = `${Date.now()}`;
    
    setToasts((prev) => [...prev, { id, message, type, title }]);
    
    // Increased to 6s for interactive toasts
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {mounted && (
        <div 
          id="ze-toast-container"
          className="fixed bottom-6 right-6 z-[100000] flex flex-col gap-4 pointer-events-none"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto flex flex-col p-5 rounded-3xl border-[4px] border-ze-black bg-ze-yellow shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] min-w-[360px] max-w-[420px] transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="mt-1 p-2 bg-ze-black text-ze-yellow rounded-2xl shadow-lg">
                  {toast.type === "success" ? <CheckCircle className="h-6 w-6 stroke-[3]" /> :
                   toast.type === "error" ? <X className="h-6 w-6 stroke-[3]" /> :
                   <Info className="h-6 w-6 stroke-[3]" />}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-black text-ze-black uppercase tracking-tighter italic text-lg leading-none mb-1">
                    {toast.title || "Item Adicionado"}
                  </h4>
                  <p className="font-bold text-ze-black/90 text-sm leading-tight uppercase">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-ze-black/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 stroke-[3]" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => removeToast(toast.id)}
                  className="bg-white text-ze-black border-2 border-ze-black px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-ze-gray transition-all active:scale-95"
                >
                  Escolher mais
                </button>
                <Link
                  href="/cart"
                  onClick={() => removeToast(toast.id)}
                  className="bg-ze-black text-ze-yellow border-2 border-ze-black px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-ze-black/90 transition-all active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                >
                  Ir p/ Carrinho
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

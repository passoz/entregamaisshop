"use client";

import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useCart } from "@/lib/CartContext";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  const fee = items.length > 0 ? 7.90 : 0;
  const total = subtotal + fee;

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push("/checkout");
  };

  return (
    <main className="container mx-auto px-4 py-8 pb-32 max-w-5xl">
      <h1 className="text-3xl md:text-5xl font-black text-ze-black mb-6 md:mb-8 flex items-center uppercase italic tracking-tighter drop-shadow-sm">
        <ShoppingBag className="mr-3 h-8 w-8 md:h-12 md:w-12 text-ze-black fill-ze-yellow" />
        Sua Rodada
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.length > 0 ? (
            items.map((item) => (
              <Card key={item.product_id} className="overflow-hidden border-2 border-ze-black/10 rounded-2xl md:rounded-3xl bg-white shadow-sm hover:border-ze-yellow transition-colors group">
                <CardContent className="p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                  <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-ze-gray rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl md:text-4xl group-hover:scale-105 transition-transform">
                      {item.name.toLowerCase().includes("cerveja") || item.name.toLowerCase().includes("chopp") ? "🍺" 
                        : item.name.toLowerCase().includes("vinho") ? "🍷"
                        : item.name.toLowerCase().includes("destilado") || item.name.toLowerCase().includes("whisky") || item.name.toLowerCase().includes("gin") ? "🥃"
                        : item.name.toLowerCase().includes("gelo") ? "🧊"
                        : item.name.toLowerCase().includes("petisco") ? "🥨"
                        : "🥤"}
                    </div>
                    <div>
                      <h3 className="font-black text-base md:text-xl text-ze-black uppercase tracking-tight leading-none mb-1">{item.name}</h3>
                      <p className="text-[10px] md:text-xs font-bold text-ze-black/40 uppercase tracking-widest">{item.seller_name}</p>
                      <div className="font-black text-lg md:text-xl text-ze-red mt-1 md:mt-2">R$ {item.price.toFixed(2).replace('.', ',')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
                    <div className="flex items-center border-2 border-ze-black rounded-xl bg-white overflow-hidden shadow-sm h-10">
                      <button onClick={() => updateQuantity(item.product_id, -1)} className="px-3 md:px-4 py-2 font-black text-ze-black hover:bg-ze-yellow transition-colors text-base md:text-lg focus:outline-none">-</button>
                      <span className="flex-1 h-full flex items-center justify-center font-black text-ze-black bg-ze-yellow border-x-2 border-ze-black min-w-[2.5rem] md:min-w-[3rem] text-center text-sm md:text-base">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, 1)} className="px-3 md:px-4 py-2 font-black text-ze-black hover:bg-ze-yellow transition-colors text-base md:text-lg focus:outline-none">+</button>
                    </div>
                    <Button onClick={() => removeItem(item.product_id)} variant="ghost" size="icon" className="text-ze-black/20 hover:text-ze-red hover:bg-ze-red/10 rounded-xl w-10 h-10 md:w-12 md:h-12">
                      <Trash2 className="h-5 w-5 md:h-6 md:w-6" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-ze-black/10">
              <div className="text-6xl mb-4 opacity-50 grayscale">🛍️</div>
              <h3 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter">Sua rodada está vazia</h3>
              <p className="text-ze-black/40 mt-2 font-bold uppercase tracking-widest text-sm">Navegue pelos depósitos e garanta a gelada.</p>
              <Button onClick={() => router.push('/')} variant="ze-dark" className="mt-8 rounded-2xl h-14 font-black tracking-widest uppercase shadow-lg">
                Procurar Bebidas
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-2 border-ze-black shadow-[6px_6px_0px_#1B1B1B] md:shadow-[8px_8px_0px_#1B1B1B] rounded-[2rem] md:rounded-3xl bg-ze-yellow overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <h3 className="text-xl md:text-2xl font-black text-ze-black mb-6 md:mb-8 uppercase italic tracking-tighter bg-white inline-block px-3 md:px-4 py-1 md:py-1.5 rounded-xl border-2 border-ze-black -rotate-2">
                Resumo
              </h3>
              
              <div className="space-y-3 md:space-y-4 text-[10px] md:text-sm font-bold text-ze-black/60 mb-6 md:mb-8 uppercase tracking-widest">
                <div className="flex justify-between items-center bg-white/50 p-2.5 md:p-3 rounded-xl border border-ze-black/10">
                  <span>Subtotal</span>
                  <span className="text-ze-black">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between items-center bg-white/50 p-2.5 md:p-3 rounded-xl border border-ze-black/10">
                  <span>Entrega</span>
                  <span className="text-ze-black">R$ {fee.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <div className="pt-4 md:pt-6 border-t-2 md:border-t-4 border-ze-black mt-4 md:mt-6 flex justify-between items-center bg-white px-3 md:px-4 py-3 md:py-4 rounded-xl md:rounded-2xl">
                  <span className="font-black text-ze-black text-base md:text-lg uppercase italic tracking-tighter">Total</span>
                  <span className="font-black text-2xl md:text-3xl text-ze-black tracking-tighter">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="mb-4 md:mb-6">
                <Input placeholder="CUPOM" className="mb-2 h-12 md:h-14 border-2 border-ze-black focus-visible:ring-0 rounded-xl md:rounded-2xl font-black uppercase tracking-widest placeholder:text-ze-black/20 text-center" />
              </div>

              <Button 
                onClick={handleCheckout} 
                disabled={items.length === 0}
                variant="ze-dark" 
                size="lg" 
                className="w-full h-14 md:h-16 text-base md:text-lg font-black uppercase italic tracking-tighter shadow-xl group border-2 border-ze-black rounded-xl md:rounded-2xl disabled:opacity-50">
                Finalizar
                <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

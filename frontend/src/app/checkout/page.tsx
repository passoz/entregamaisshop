"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { MapPin, CreditCard, Banknote, Smartphone, ChevronLeft, ShieldCheck, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, subtotal, totalItems, clearCart, isLoading } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "cash">("pix");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<string>("Buscando endereço...");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Redirect if cart is empty and not loading
    if (!isLoading && items.length === 0 && !isSuccess) {
      router.push("/");
    }
    
    // Get location from localStorage (saved from Home)
    const savedLocation = localStorage.getItem("last_selected_location");
    if (savedLocation) {
      setLocation(savedLocation);
    } else {
      setLocation("Endereço não selecionado");
    }
  }, [items, router, isLoading, isSuccess]);

  const handleConfirmOrder = async () => {
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Group items by seller (backend supports one seller per order)
      const sellerId = items[0].seller_id;
      
      const payload = {
        seller_id: sellerId,
        total_amount: subtotal + 5.0, // Subtotal + fixed delivery fee
        delivery_address: location,
        items: items.map(it => ({
          product_id: it.product_id,
          quantity: it.quantity,
          price: it.price
        }))
      };

      await apiFetch("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      // Success
      setIsSuccess(true);
      await clearCart();
      
      // Automatic redirect after 3 seconds
      setTimeout(() => {
        router.push("/orders");
      }, 3000);

    } catch (e) {
      console.error("Erro ao fechar pedido:", e);
      alert("Erro ao processar o seu pedido. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-ze-yellow flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 text-center space-y-8 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] border-4 border-ze-black animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Check className="w-12 h-12 text-white stroke-[4px]" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-ze-black">Pedido Sucesso!</h1>
            <p className="text-ze-black/60 font-bold uppercase text-xs tracking-widest">Já estamos preparando sua gelada</p>
          </div>
          <div className="bg-ze-gray p-6 rounded-2xl border-2 border-dashed border-ze-black/10">
            <p className="text-sm font-bold text-ze-black/80">Você será redirecionado para seus pedidos em instantes...</p>
          </div>
          <Button variant="ze-dark" className="w-full h-14 rounded-2xl" asChild>
            <Link href="/orders">Ver meus pedidos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ze-gray pb-20">
      {/* Immersive Header */}
      <div className="bg-ze-yellow border-b-4 border-ze-black sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-ze-black/5 rounded-xl transition-colors">
            <ChevronLeft className="w-6 h-6 text-ze-black" />
          </button>
          <h1 className="text-xl font-black uppercase italic tracking-tighter text-ze-black">Pagamento</h1>
          <div className="w-10 h-10 bg-ze-black text-white rounded-full flex items-center justify-center font-black text-sm border-2 border-white shadow-lg">
            {totalItems}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sections */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Address Section */}
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-ze-black/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-ze-yellow rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-ze-black" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-ze-black">Endereço de Entrega</h2>
            </div>
            
            <div className="bg-ze-gray p-6 rounded-2xl border-2 border-ze-black/5 flex items-center justify-between group hover:border-ze-yellow transition-all cursor-pointer">
              <div className="flex-1">
                <p className="text-sm font-black text-ze-black mb-1">{location}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-ze-black/40 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  <span>Entrega em 15-25 min</span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-black border-ze-black/10">Alterar</Badge>
            </div>
          </section>

          {/* Payment Section */}
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-ze-black/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-ze-red rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-ze-black">Método de Pagamento</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "pix", icon: Smartphone, label: "PIX", sub: "Confirmação rápida" },
                { id: "card", icon: CreditCard, label: "Cartão na Entrega", sub: "Débito ou Crédito" },
                { id: "cash", icon: Banknote, label: "Dinheiro", sub: "No ato da entrega" }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`flex flex-col items-center gap-4 p-6 rounded-2xl border-4 transition-all ${
                    paymentMethod === method.id 
                      ? "bg-ze-yellow/5 border-ze-yellow shadow-xl -translate-y-1" 
                      : "bg-ze-gray border-transparent hover:border-ze-black/5"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === method.id ? "bg-ze-yellow text-ze-black" : "bg-white text-ze-black/40"}`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-ze-black uppercase tracking-tighter">{method.label}</p>
                    <p className="text-[10px] font-bold text-ze-black/40 uppercase tracking-widest leading-none mt-1">{method.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Order Summary */}
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-ze-black/5">
            <h2 className="text-xl font-black uppercase tracking-tighter text-ze-black mb-6">Resumo do Pedido</h2>
            <div className="divide-y-2 divide-ze-black/5">
              {items.map((it) => (
                <div key={it.product_id} className="py-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-ze-gray rounded-2xl relative shrink-0 overflow-hidden border-2 border-ze-black/5">
                    {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-ze-black uppercase leading-tight">{it.name}</p>
                    <p className="text-xs font-bold text-ze-black/40 uppercase tracking-widest inline-block mt-1">Qtde: {it.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-ze-black">R$ {(it.price * it.quantity).toFixed(2).replace(".", ",")}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Checkout Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <Card className="rounded-3xl border-4 border-ze-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-xl font-black uppercase tracking-tighter text-ze-black mb-6">Total Geral</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm font-bold text-ze-black/60 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-ze-black/60 uppercase tracking-widest">
                    <span>Taxa de Entrega</span>
                    <span className="text-green-600 font-black">R$ 5,00</span>
                  </div>
                  <div className="pt-4 border-t-2 border-ze-black/5 flex justify-between items-end">
                    <span className="text-sm font-black uppercase tracking-tighter text-ze-black">Valor Total</span>
                    <span className="text-3xl font-black text-ze-black">R$ {(subtotal + 5.0).toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="w-full h-16 rounded-2xl bg-ze-black text-white hover:bg-ze-yellow hover:text-ze-black font-black uppercase tracking-widest text-base shadow-xl transform active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                       Processando...
                    </div>
                  ) : (
                    "Finalizar Pedido"
                  )}
                </Button>
                
                <div className="mt-6 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-green-600 font-bold uppercase text-[10px] tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pagamento 100% Seguro</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-ze-black text-white p-6 rounded-3xl border-4 border-white shadow-xl">
               <div className="flex gap-4">
                 <div className="shrink-0 w-10 h-10 bg-ze-yellow rounded-xl flex items-center justify-center text-ze-black">
                   <Clock className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="text-xs font-black uppercase tracking-tight">Tempo Estimado</p>
                   <p className="text-xl font-black italic uppercase leading-none mt-1">15-25 MINUTOS</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { 
  Clock, 
  MapPin, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Printer,
  BellRing
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function SellerOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  const fetchOrders = async () => {
    try {
      // In a real app we'd get the seller_id from the session/user profile
      // For the demo, we'll fetch orders for the first available seller if needed
      const data = await apiFetch<any[]>('/api/v1/vendedor/orders?seller_id=seller-1'); 
      setOrders(data);
      
      // Notify on new orders (demo WOW factor)
      const newOrders = data.filter(o => o.status === "created").length;
      if (newOrders > lastOrderCount) {
        // We could play a sound here if browser allows
        console.log("🔔 Novo pedido recebido!");
      }
      setLastOrderCount(newOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const int = setInterval(fetchOrders, 4000); // Polling for demo
    return () => clearInterval(int);
  }, [lastOrderCount]);

  const handleStatus = async (id: string, action: string) => {
    try {
      if (action === "confirm") {
        await apiFetch(`/api/v1/vendedor/orders/${id}/confirm`, { method: "POST" });
      } else if (action === "ready") {
        await apiFetch(`/api/v1/vendedor/orders/${id}/ready`, { method: "POST" });
      }
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const parseAddress = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed.raw || "Endereço não disponível";
    } catch (e) {
      return "Endereço padrão";
    }
  };

  const renderOrderCard = (order: any, nextAction?: string) => (
    <div key={order.id} className="bg-white border-2 border-ze-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all mb-6 group relative overflow-hidden">
      {order.status === "created" && (
        <div className="absolute top-0 right-0 bg-ze-red text-white font-black text-[10px] px-4 py-1 uppercase italic tracking-widest rounded-bl-xl animate-pulse">
           Urgente
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-black text-ze-black text-xl uppercase italic tracking-tighter">#{order.id.split('-')[0]}</h3>
          <p className="text-[10px] font-bold text-ze-black/40 uppercase tracking-widest flex items-center gap-1">
            <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-ze-gray rounded-lg transition-colors text-ze-black/20 hover:text-ze-black">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="flex items-start gap-3 bg-ze-gray p-4 rounded-2xl mb-4 border border-ze-black/5">
        <MapPin className="w-5 h-5 text-ze-red shrink-0 mt-1" />
        <p className="text-sm font-black text-ze-black leading-tight uppercase">
          {parseAddress(order.delivery_address_json)}
        </p>
      </div>

      {/* Items List */}
      <div className="space-y-2 mb-6">
        {order.edges?.items?.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-ze-yellow flex items-center justify-center rounded-lg font-black text-[10px] border border-ze-black/10">
                {item.quantity}
              </span>
              <span className="font-bold text-ze-black uppercase tracking-tight">{item.product?.name || "Produto"}</span>
            </div>
            <span className="font-bold text-ze-black/40">R$ {item.unit_price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t-2 border-ze-black/5 flex items-center justify-between gap-4">
        <div className="text-right">
          <p className="text-[10px] font-bold text-ze-black/40 uppercase tracking-widest">Total</p>
          <p className="font-black text-2xl text-ze-black tracking-tighter">R$ {order.total_amount.toFixed(2)}</p>
        </div>
        
        {nextAction === "confirm" && (
          <Button 
            onClick={() => handleStatus(order.id, "confirm")} 
            className="flex-1 bg-ze-yellow hover:bg-ze-black text-ze-black hover:text-white font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-lg transform active:scale-95 transition-all"
          >
            Aceitar Pedido
          </Button>
        )}
        
        {nextAction === "ready" && (
          <Button 
            onClick={() => handleStatus(order.id, "ready")} 
            className="flex-1 bg-ze-black hover:bg-ze-yellow text-white hover:text-ze-black font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-lg transform active:scale-95 transition-all"
          >
            Pronto p/ Entrega
          </Button>
        )}

        {!nextAction && (
          <Badge className="bg-ze-gray text-ze-black/40 font-black uppercase tracking-widest h-14 flex-1 rounded-2xl border-2 border-ze-black/5">
             Aguardando Coleta
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <PortalLayout title="Painel do Lojista" role="vendedor">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-180px)]">
        
        {/* NOVOS COLUMN */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter flex items-center gap-2">
              <BellRing className="w-6 h-6 text-ze-red animate-bounce" /> Novos
            </h2>
            <Badge className="bg-ze-red text-white font-black rounded-lg">{orders.filter(o => o.status === "created").length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {orders.filter(o => o.status === "created").map(o => renderOrderCard(o, "confirm"))}
            {orders.filter(o => o.status === "created").length === 0 && (
              <div className="h-40 border-4 border-dashed border-ze-black/5 rounded-[2.5rem] flex items-center justify-center text-ze-black/20 font-black uppercase tracking-widest text-sm text-center p-8">
                Nenhum pedido novo no momento
              </div>
            )}
          </div>
        </div>

        {/* EM PREPARO COLUMN */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter flex items-center gap-2">
              <Clock className="w-6 h-6 text-ze-yellow" /> Em Preparo
            </h2>
            <Badge className="bg-ze-yellow text-ze-black font-black rounded-lg">{orders.filter(o => o.status === "confirmed").length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {orders.filter(o => o.status === "confirmed").map(o => renderOrderCard(o, "ready"))}
            {orders.filter(o => o.status === "confirmed").length === 0 && (
              <div className="h-40 border-4 border-dashed border-ze-black/5 rounded-[2.5rem] flex items-center justify-center text-ze-black/20 font-black uppercase tracking-widest text-sm text-center p-8">
                Tudo sob controle por aqui
              </div>
            )}
          </div>
        </div>

        {/* PRONTOS COLUMN */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-green-500" /> Prontos
            </h2>
            <Badge className="bg-green-500 text-white font-black rounded-lg">{orders.filter(o => o.status === "ready").length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar opacity-60">
            {orders.filter(o => o.status === "ready").map(o => renderOrderCard(o))}
             {orders.filter(o => o.status === "ready").length === 0 && (
              <div className="h-40 border-4 border-dashed border-ze-black/5 rounded-[2.5rem] flex items-center justify-center text-ze-black/20 font-black uppercase tracking-widest text-sm text-center p-8">
                Nenhum pronto aguardando
              </div>
            )}
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}

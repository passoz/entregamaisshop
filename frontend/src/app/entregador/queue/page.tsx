"use client";

import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Package, 
  Store, 
  User,
  ExternalLink,
  ArrowRightLeft
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function DriverQueue() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = async () => {
    try {
      const data = await apiFetch<any[]>("/api/v1/entregador/orders");
      setDeliveries(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: string, action: "accept" | "pickup" | "deliver") => {
    try {
      const endpoint = action === "accept" 
        ? `/api/v1/entregador/orders/${id}/accept`
        : action === "pickup"
        ? `/api/v1/entregador/orders/${id}/pickup`
        : `/api/v1/entregador/orders/${id}/deliver`;
        
      await apiFetch(endpoint, { method: "POST" });
      fetchDeliveries();
    } catch (e) {
      console.error(e);
    }
  };

  const parseAddress = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed.raw || "Endereço não disponível";
    } catch (e) {
      return "Localização Manual";
    }
  };

  // Orders available for any driver in the area
  const available = deliveries.filter(d => d.status === 'ready' && !d.driver_id);
  // Orders already assigned to our driver (MOCK: in a real app check d.driver_id === current_uid)
  const active = deliveries.filter(d => d.status === 'accepted' || d.status === 'picked_up');

  return (
    <PortalLayout title="Logística de Entrega" role="entregador">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* AVAILABE REQUESTS */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter flex items-center gap-2">
              <Navigation className="w-6 h-6 text-ze-red animate-pulse" /> Chamadas Próximas
            </h2>
            <Badge className="bg-ze-yellow text-ze-black font-black rounded-lg">{available.length}</Badge>
          </div>

          <div className="space-y-6">
            {available.map((delivery) => (
              <div key={delivery.id} className="bg-white rounded-[2.5rem] border-4 border-ze-black p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-ze-red text-white font-black text-[10px] px-6 py-2 uppercase italic tracking-widest rounded-bl-3xl">
                   Urgente
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-6">
                    {/* Route Info */}
                    <div className="space-y-6 relative before:absolute before:left-2.5 before:top-6 before:bottom-6 before:w-[2px] before:bg-ze-black/10">
                      <div className="flex gap-4 relative">
                        <div className="w-5 h-5 rounded-full bg-ze-yellow border-2 border-ze-black flex items-center justify-center shrink-0 z-10">
                          <div className="w-2 h-2 rounded-full bg-ze-black" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-ze-black/40 uppercase tracking-widest">Coleta</p>
                          <p className="font-black text-ze-black uppercase tracking-tight">{delivery.edges?.seller?.name || "Depósito"}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 relative">
                        <div className="w-5 h-5 rounded-full bg-white border-2 border-ze-red flex items-center justify-center shrink-0 z-10">
                          <div className="w-2 h-2 rounded-full bg-ze-red" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-ze-black/40 uppercase tracking-widest">Entrega</p>
                          <p className="font-black text-ze-black uppercase tracking-tight truncate max-w-[200px]">
                            {parseAddress(delivery.delivery_address_json)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Earnings Sidebar */}
                  <div className="w-full md:w-52 bg-ze-gray rounded-[2rem] p-5 flex flex-col justify-between border-2 border-ze-black/5">
                    <div>
                      <p className="text-[10px] font-black uppercase text-ze-black/40 mb-1">Taxa de Entrega</p>
                      <p className="text-3xl font-black text-ze-red">R$ 5,00</p>
                    </div>
                    <Button 
                      onClick={() => handleAction(delivery.id, "accept")}
                      className="w-full mt-4 h-12 bg-ze-yellow hover:bg-ze-black text-ze-black hover:text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg transform active:scale-95 transition-all">
                      Aceitar Corrida
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {available.length === 0 && (
              <div className="bg-ze-gray text-center p-20 rounded-[3rem] border-4 border-dashed border-ze-black/5">
                <p className="font-black text-ze-black/20 uppercase tracking-widest italic">Aguardando novas chamadas...</p>
              </div>
            )}
          </div>
        </div>

        {/* ACTIVE ROUTE */}
        <div className="space-y-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter">Minha Rota Atual</h2>
            <p className="text-xs font-bold uppercase text-ze-black/40 tracking-widest">Entregas que você está realizando agora</p>
          </div>

          <div className="space-y-6">
            {active.map((delivery) => (
              <div key={delivery.id} className="bg-ze-yellow rounded-[2.5rem] border-4 border-ze-black p-8 shadow-[12px_12px_0px_#1B1B1B] relative overflow-hidden">
                <div className="bg-white p-6 rounded-[2rem] border-2 border-ze-black mb-6 space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-ze-black/5 pb-4">
                    <span className="font-black text-2xl text-ze-black uppercase italic tracking-tighter">#{delivery.id.split('-')[0]}</span>
                    <Badge className="bg-ze-black text-white font-black uppercase text-[10px]">
                      {delivery.status === 'accepted' ? 'Indo Coletar' : 'Indo Entregar'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-ze-gray rounded-xl flex items-center justify-center shrink-0 border border-ze-black/5">
                         <Store className="w-5 h-5 text-ze-black" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-ze-black/40 uppercase tracking-widest">Coletar em</p>
                        <p className="font-black text-ze-black uppercase leading-tight">{delivery.edges?.seller?.name || "Lojista"}</p>
                      </div>
                      <button className="p-2 bg-ze-yellow rounded-lg border border-ze-black/10">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-ze-gray rounded-xl flex items-center justify-center shrink-0 border border-ze-black/5">
                         <User className="w-5 h-5 text-ze-red" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-ze-black/40 uppercase tracking-widest">Entregar para</p>
                        <p className="font-black text-ze-black uppercase leading-tight truncate">
                          {parseAddress(delivery.delivery_address_json)}
                        </p>
                      </div>
                      <button className="p-2 bg-ze-yellow rounded-lg border border-ze-black/10">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {delivery.status === 'accepted' ? (
                  <Button 
                    onClick={() => handleAction(delivery.id, "pickup")}
                    className="w-full h-16 bg-ze-black hover:bg-ze-dark text-white rounded-2xl text-lg font-black uppercase italic tracking-tighter shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-3">
                    <Package className="w-6 h-6" /> Confirmar Coleta
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleAction(delivery.id, "deliver")}
                    className="w-full h-16 bg-ze-red hover:bg-ze-red/90 text-white rounded-2xl text-lg font-black uppercase italic tracking-tighter shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-6 h-6" /> Confirmar Entrega
                  </Button>
                )}
              </div>
            ))}
            {active.length === 0 && (
              <div className="opacity-40">
                <div className="bg-white text-center p-20 rounded-[3rem] border-4 border-dashed border-ze-black shadow-sm">
                  <div className="text-5xl grayscale mb-4">🏍️</div>
                  <p className="font-black text-ze-black/30 uppercase tracking-widest italic">Nenhuma rota ativa no momento</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}

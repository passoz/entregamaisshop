import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MapPin } from "lucide-react";
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

  const handleAction = async (id: string, action: "accept" | "deliver") => {
    try {
      const endpoint = action === "accept" 
        ? `/api/v1/entregador/orders/${id}/accept`
        : `/api/v1/entregador/orders/${id}/deliver`;
        
      await apiFetch(endpoint, { method: "POST" });
      fetchDeliveries();
    } catch (e) {
      console.error(e);
    }
  };

  const pending = deliveries.filter(d => d.status === 'pending' || d.status === 'ready');
  const active = deliveries.filter(d => d.status === 'accepted' || d.status === 'preparing');

  return (
    <PortalLayout title="Fila de Entregas" role="entregador">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Available Deliveries */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter">Corridas Disponíveis</h2>
             <Badge className="bg-ze-yellow text-ze-black hover:bg-ze-yellow animate-pulse py-1 px-3 uppercase font-black text-[10px]">Buscando...</Badge>
          </div>

          <div className="space-y-4">
            {pending.map((delivery) => (
              <div key={delivery.id} className="bg-white rounded-3xl p-5 border-2 border-ze-black/10 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-ze-red" />
                
                <div className="flex flex-col sm:flex-row justify-between gap-6 pl-2">
                  <div className="flex-1">
                    <div className="mb-4">
                      <span className="bg-ze-red text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">Nova Chamada</span>
                    </div>
                    
                    <div className="space-y-4 relative">
                      <div className="flex gap-4">
                        <div className="w-5 h-5 rounded-full bg-ze-gray border-2 border-ze-black flex items-center justify-center shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-ze-black" />
                        </div>
                        <div>
                          <p className="font-black text-ze-black uppercase tracking-tight">Depósito ID: {delivery.seller_id}</p>
                          <p className="text-xs text-ze-black/50 font-bold uppercase flex items-center mt-0.5"><MapPin className="w-3 h-3 mr-1"/> Coleta a 1.2km</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-5 h-5 rounded-full bg-ze-gray border-2 border-ze-red flex items-center justify-center shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-ze-red" />
                        </div>
                        <div>
                          <p className="font-black text-ze-black uppercase tracking-tight">Cliente ID: {delivery.customer_id}</p>
                          <p className="text-xs text-ze-black/50 font-bold uppercase flex items-center mt-0.5"><MapPin className="w-3 h-3 mr-1"/> Entrega a 3.5km</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col justify-between sm:items-end w-full sm:w-48 bg-ze-gray p-4 rounded-2xl border-2 border-ze-black/5">
                     <div>
                       <p className="text-[10px] font-black uppercase text-ze-black/40 mb-1">Ganhos Estimados</p>
                       <p className="text-2xl font-black text-ze-red flex items-center gap-1">
                         R$ {(delivery.total_amount * 0.1).toFixed(2)}
                       </p>
                     </div>
                     <Button 
                       onClick={() => handleAction(delivery.id, "accept")}
                       variant="ze-dark" 
                       className="w-full sm:mt-4 shadow-xl border-0 h-12 text-sm uppercase tracking-widest font-black rounded-xl">
                       Aceitar
                     </Button>
                  </div>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="bg-ze-gray text-center p-12 rounded-3xl border-2 border-dashed border-ze-black/10">
                <p className="font-black text-ze-black/30 uppercase tracking-widest italic">Nenhuma corrida no raio</p>
              </div>
            )}
          </div>
        </div>

        {/* Minha Rota Atual */}
        <div className="space-y-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter">Minha Rota Atual</h2>
            <p className="text-xs font-bold uppercase text-ze-black/40 tracking-widest">Acompanhamento da entrega em andamento</p>
          </div>

          <div className="space-y-4">
            {active.map((delivery) => (
              <div key={delivery.id} className="bg-ze-yellow rounded-3xl p-6 border-4 border-ze-black shadow-[8px_8px_0px_#1B1B1B]">
                <div className="bg-white p-4 rounded-2xl border-2 border-ze-black mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-xl text-ze-black">PEDIDO {delivery.id}</span>
                  </div>
                  <p className="font-bold text-sm text-ze-black/50 uppercase">Indo para: Cliente {delivery.customer_id}</p>
                </div>
                <Button 
                  onClick={() => handleAction(delivery.id, "deliver")}
                  className="w-full h-14 bg-ze-black hover:bg-ze-dark text-white rounded-2xl text-lg font-black uppercase italic tracking-tight relative overflow-hidden group">
                  Marcar como Entregue
                </Button>
              </div>
            ))}
            {active.length === 0 && (
               <div className="opacity-50">
                 <div className="bg-white text-center p-12 rounded-3xl border-4 border-dashed border-ze-black shadow-sm">
                   <p className="font-black text-ze-black/30 uppercase tracking-widest italic">Você não aceitou rotas</p>
                 </div>
               </div>
            )}
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}

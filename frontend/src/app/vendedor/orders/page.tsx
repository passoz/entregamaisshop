import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await apiFetch<any[]>('/api/v1/vendedor/orders?seller_id=seller-1'); // mock seller_id for now
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const int = setInterval(fetchOrders, 3000);
    return () => clearInterval(int);
  }, []);

  const handleStatus = async (id: string, action: string) => {
    try {
      if (action === "accept") {
        await apiFetch(`/api/v1/vendedor/orders/${id}/confirm`, { method: "POST" });
      } else if (action === "ready") {
        await apiFetch(`/api/v1/vendedor/orders/${id}/ready`, { method: "POST" });
      }
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PortalLayout title="Gestão de Pedidos" role="vendedor">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        
        {/* Novos Pedidos (Pending) */}
        <div className="bg-white rounded-3xl shadow-sm border-2 border-ze-black/10 flex flex-col max-h-[80vh]">
          <div className="p-4 border-b-2 border-ze-black/5 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
            <h2 className="font-black text-ze-black uppercase italic tracking-tighter">
              Novos
            </h2>
            <div className="bg-ze-red text-white text-xs font-black px-2 py-1 rounded-lg">
              {orders.filter(o => o.status === "pending").length}
            </div>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto">
            {orders.filter(o => o.status === "pending").map(order => (
              <div key={order.id} className="border-2 border-ze-black rounded-2xl p-4 shadow-lg bg-white relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="absolute top-0 left-0 w-2 h-full bg-ze-red" />
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black text-ze-black text-lg">{order.id}</span>
                  <span className="text-[10px] font-black uppercase text-ze-black/40">Agora</span>
                </div>
                <p className="text-sm font-bold text-ze-black/60 mb-2">Cliente: <span className="text-ze-black">{order.customer_id}</span></p>
                <div className="bg-ze-gray p-3 rounded-xl mb-3">
                  {(order.edges?.items || []).map((item:any, idx:number) => (
                    <div key={idx} className="text-sm font-bold text-ze-black flex justify-between">
                      <span>{item.quantity}x Produto ID: {item.product_id}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-black text-xl text-ze-red">R$ {order.total_amount?.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleStatus(order.id, "accept")} className="flex-1 bg-ze-yellow hover:bg-ze-dark text-ze-black font-black uppercase tracking-widest text-xs h-12 rounded-xl">Aceitar</Button>
                </div>
              </div>
            ))}
            {orders.filter(o => o.status === "pending").length === 0 && (
              <div className="text-center py-10 opacity-40">
                <p className="font-black italic uppercase">Nenhum pedido novo</p>
              </div>
            )}
          </div>
        </div>

        {/* Em Preparo (Accepted) */}
        <div className="bg-white rounded-3xl shadow-sm border-2 border-ze-black/10 flex flex-col max-h-[80vh]">
          <div className="p-4 border-b-2 border-ze-black/5 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
            <h2 className="font-black text-ze-black uppercase italic tracking-tighter">
              Em Preparo
            </h2>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto">
            {orders.filter(o => o.status === "accepted").map(order => (
              <div key={order.id} className="border-2 border-ze-black/20 rounded-2xl p-4 bg-ze-gray">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black text-ze-black text-lg">{order.id}</span>
                  <span className="text-[10px] font-black uppercase text-ze-black/40">Em andamento</span>
                </div>
                <Button onClick={() => handleStatus(order.id, "ready")} className="w-full bg-ze-black hover:bg-ze-dark text-white font-black uppercase tracking-widest text-xs h-12 rounded-xl mt-4">
                  Pronto para Coleta
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Aguardando Coleta (Ready) */}
        <div className="bg-white rounded-3xl shadow-sm border-2 border-ze-black/10 flex flex-col max-h-[80vh] opacity-70">
          <div className="p-4 border-b-2 border-ze-black/5 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
            <h2 className="font-black text-ze-black uppercase italic tracking-tighter">
              Aguardando Coleta
            </h2>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto">
             {orders.filter(o => o.status === "ready").map(order => (
              <div key={order.id} className="border-2 border-dashed border-ze-black/20 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black text-ze-black">{order.id}</span>
                </div>
                <p className="text-xs font-bold text-ze-black/40 uppercase">Motoboy a caminho</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}

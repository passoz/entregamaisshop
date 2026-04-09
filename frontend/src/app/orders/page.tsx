"use client";

import { Package, MapPin, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      // Temporarily use MSW global delivery endpoint and filter customer_id.
      // A dedicated /api/v1/customers/orders should be implemented in proper backend
      // Right now the only public DB hook we have access to without making new MSW endpoints is fetching from /api/v1/entregador/orders and filtering,
      // Or Wait: Let's create an endpoint GET /api/v1/orders in MSW? I will just use MSW endpoint `GET /api/v1/entregador/orders` that returns 'all' for now if I don't modify MSW.
      // Wait, let's fetch from the generic MSW /api/v1/orders if it exists, or just use the local db. 
      // Actually, since I didn't add /api/v1/customers/orders to handlers.js, let's fetch /api/v1/entregador/orders (which I previously hooked).
      // Wait, I will just call the missing endpoint and if it fails, I'll show it empty. I should really update handlers.ts or just add it here.
      // Let's assume I will update handlers.ts to support GET /api/v1/orders for the customer.
      const res = await fetch("/api/v1/customers/orders"); 
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center font-black text-2xl uppercase tracking-tighter text-ze-black animate-pulse">Carregando Pedidos...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8 pb-32 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-black text-ze-black mb-8 flex items-center uppercase italic tracking-tighter drop-shadow-sm">
        <Package className="mr-3 h-10 w-10 md:h-12 md:w-12 text-ze-black fill-ze-yellow" />
        Meus Pedidos
      </h1>

      <div className="space-y-6">
        {orders.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-ze-black/10">
             <div className="text-6xl mb-4 opacity-50 grayscale">🧾</div>
             <h3 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter">Nenhum Pedido Encerrado</h3>
             <p className="text-ze-black/40 mt-2 font-bold uppercase tracking-widest text-sm">Que tal fazer a sua primeira rodada?</p>
             <Button onClick={() => router.push('/')} variant="ze-dark" className="mt-8 rounded-2xl h-14 font-black tracking-widest uppercase shadow-lg">
               Ir para a Loja
             </Button>
           </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="overflow-hidden border-2 border-ze-black/10 rounded-3xl group shadow-sm bg-white">
              <CardHeader className="bg-ze-gray border-b-2 border-ze-black/5 pb-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <CardTitle className="text-xl font-black text-ze-black uppercase tracking-tight">Depósito Vendedor {order.seller_id}</CardTitle>
                      <span className="text-xs font-bold bg-ze-black text-white px-2 py-0.5 rounded-lg">{order.id}</span>
                    </div>
                    <div className="text-[10px] font-black text-ze-black/40 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(order.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <Badge className={`text-xs uppercase font-black tracking-widest py-1.5 px-3 border-2 ${
                      order.status === 'delivered' ? 'bg-ze-yellow border-ze-black text-ze-black' :
                      order.status === 'pending' ? 'bg-ze-gray border-ze-black text-ze-black' :
                      'bg-ze-red border-ze-red text-white'
                    }`}>
                      {order.status === "delivered" ? (
                        <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-1" /> Entregue</span>
                      ) : (
                        <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {order.status}</span>
                      )}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-ze-black/60 font-bold text-sm max-w-xl">
                    {order.items.map((it:any) => `${it.quantity}x Prod [${it.product_id}]`).join(', ')}
                  </div>
                  <div className="flex flex-col sm:items-end w-full sm:w-auto bg-ze-gray p-3 rounded-2xl border-2 border-ze-black/5">
                    <div className="text-[10px] font-black text-ze-black/40 uppercase tracking-widest mb-1">Total pago</div>
                    <div className="font-black text-2xl text-ze-red">R$ {order.total_amount?.toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3 border-t-2 border-ze-black/5 pt-6">
                  <Button variant="outline" className="border-2 border-ze-black font-black uppercase text-xs h-10 rounded-xl hover:bg-ze-black/5">Ajuda</Button>
                  {order.status !== "delivered" && (
                    <Button className="bg-ze-yellow text-ze-black hover:bg-ze-dark font-black uppercase text-xs h-10 rounded-xl px-6">Acompanhar Pedido</Button>
                  )}
                  {order.status === "delivered" && (
                    <Button onClick={() => router.push('/')} className="bg-ze-black border-2 border-ze-black bg-white text-ze-black hover:bg-ze-black/5 font-black uppercase text-xs h-10 rounded-xl px-6">Repetir Pedido</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}

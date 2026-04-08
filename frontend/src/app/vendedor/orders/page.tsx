import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const INCOMING_ORDERS = [
  { id: "#1024", time: "Há 2 min", items: "1x Pizza Calabresa G, 1x Coca-Cola 2L", customer: "Maria Silva", total: "R$ 61,90", status: "Aguardando Aceite" },
  { id: "#1023", time: "Há 15 min", items: "2x Hambúrguer Artesanal", customer: "João Pedro", total: "R$ 45,00", status: "Em Preparo" },
];

export default function SellerOrders() {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="vendedor" currentRoute="/vendedor/orders" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Pedidos em Andamento</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Novos <Badge variant="destructive" className="ml-2">1</Badge></h2>
            </div>
            <div className="p-4 space-y-4">
              {INCOMING_ORDERS.filter(o => o.status === "Aguardando Aceite").map(order => (
                <div key={order.id} className="border border-brand-coral/30 bg-brand-coral/5 rounded-lg p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-coral" />
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-800">{order.id}</span>
                    <span className="text-xs font-semibold text-brand-coral">{order.time}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">{order.customer}</p>
                  <p className="text-xs text-slate-500 mb-3">{order.items}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-brand-teal">{order.total}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-brand-coral hover:bg-brand-coral/90 text-white shadow-md">Aceitar</Button>
                    <Button variant="outline" className="flex-1">Recusar</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Em Preparo <Badge variant="warning" className="ml-2">1</Badge></h2>
            </div>
            <div className="p-4 space-y-4">
              {INCOMING_ORDERS.filter(o => o.status === "Em Preparo").map(order => (
                <div key={order.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-800">{order.id}</span>
                    <span className="text-xs text-slate-400">{order.time}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">{order.customer}</p>
                  <p className="text-xs text-slate-500 mb-4">{order.items}</p>
                  <Button variant="brand" className="w-full">Pronto para Entrega</Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 opacity-70">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Saiu para Entrega <Badge variant="secondary" className="ml-2">0</Badge></h2>
            </div>
            <div className="p-8 text-center text-slate-400 text-sm">
              Nenhum pedido em rota
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

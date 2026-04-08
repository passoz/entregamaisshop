import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Package, MapPin, DollarSign } from "lucide-react";

export default function DriverQueue() {
  const AVAILABLE_DELIVERIES = [
    {
      id: 1,
      store: "Pizza Hut",
      distance_store: "0.5km",
      customer_area: "Centro",
      distance_customer: "2.1km",
      payout: "R$ 8,50"
    },
    {
      id: 2,
      store: "Farmácia Boa Esperança",
      distance_store: "1.2km",
      customer_area: "Jardim Botânico",
      distance_customer: "4.5km",
      payout: "R$ 12,00"
    }
  ];

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar role="entregador" currentRoute="/entregador/queue" />
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-between mb-8">
           <h1 className="text-3xl font-bold text-slate-900">Fila de Entregas</h1>
           <Badge variant="success" className="animate-none py-1.5 px-3">Buscando Corridas...</Badge>
        </div>

        <div className="max-w-3xl space-y-4">
          {AVAILABLE_DELIVERIES.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-sky" />
              
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-brand-sky/10 text-brand-sky border-brand-sky/20">Nova Chamada</Badge>
                  </div>
                  
                  <div className="space-y-4 relative">
                    <div className="absolute left-2.5 top-5 bottom-4 w-px bg-slate-100" />
                    
                    <div className="flex gap-4">
                      <div className="w-5 h-5 rounded-full bg-slate-100 border-2 border-brand-teal flex items-center justify-center relative z-10 shrink-0 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{delivery.store}</p>
                        <p className="text-xs text-slate-500 flex items-center mt-0.5"><MapPin className="w-3 h-3 mr-1"/> A {delivery.distance_store} de você</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-5 h-5 rounded-full bg-slate-100 border-2 border-brand-coral flex items-center justify-center relative z-10 shrink-0 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-coral" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Cliente em {delivery.customer_area}</p>
                        <p className="text-xs text-slate-500 flex items-center mt-0.5"><MapPin className="w-3 h-3 mr-1"/> Percurso total: {delivery.distance_customer}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col justify-between sm:items-end sm:w-48 bg-slate-50 p-4 rounded-lg border border-slate-100">
                   <div>
                     <p className="text-sm font-medium text-slate-500 mb-1">Ganhos Estimados</p>
                     <p className="text-2xl font-black text-brand-teal flex items-center gap-1">
                       {delivery.payout}
                     </p>
                   </div>
                   <Button variant="brand" className="w-full sm:mt-4 shadow-md bg-brand-sky hover:bg-brand-sky/90 shadow-brand-sky/20 border-0 h-12 text-lg">
                     Aceitar
                   </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

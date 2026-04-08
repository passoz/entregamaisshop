import { Package, MapPin, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const ORDERS = [
  { 
    id: "#A7B29", 
    store: "Pizza Hut", 
    date: "Acesso hoje, 19:30", 
    status: "Em entrega", 
    items: "1x Pizza Pepperoni, 2x Refri 2L",
    total: "R$ 69,90"
  },
  { 
    id: "#X9P11", 
    store: "Burger King", 
    date: "Ontem, 14:15", 
    status: "Entregue", 
    items: "2x Whopper, 1x Batata Frita",
    total: "R$ 55,00"
  }
];

export default function CustomerOrdersPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center">
        <Package className="mr-3 h-8 w-8 text-brand-teal" />
        Meus Pedidos
      </h1>

      <div className="space-y-6">
        {ORDERS.map((order) => (
          <Card key={order.id} className="overflow-hidden border-slate-100 hover:border-brand-sky/30 transition-colors">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <CardTitle className="text-lg">{order.store}</CardTitle>
                    <span className="text-sm font-medium text-slate-400">{order.id}</span>
                  </div>
                  <div className="text-sm text-slate-500 font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {order.date}
                  </div>
                </div>
                <div>
                  <Badge variant={order.status === "Em entrega" ? "warning" : "success"} className="text-sm py-1 px-3">
                    {order.status === "Em entrega" ? (
                      <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> Em trânsito</span>
                    ) : (
                      <span className="flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Entregue</span>
                    )}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-slate-600 font-medium max-w-xl">
                  {order.items}
                </div>
                <div className="flex flex-col sm:items-end w-full sm:w-auto">
                  <div className="text-sm text-slate-500 mb-1">Total pago</div>
                  <div className="font-bold text-xl text-slate-800">{order.total}</div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-50 pt-6">
                <Button variant="outline" className="text-slate-600">Ajuda</Button>
                {order.status === "Em entrega" && (
                  <Button variant="brand" className="shadow-brand-teal/20">Acompanhar Pedido</Button>
                )}
                {order.status === "Entregue" && (
                  <Button variant="outline" className="border-brand-sky text-brand-teal hover:bg-brand-sky/10">Repetir Pedido</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const CART_ITEMS = [
  { id: 1, name: "Cerveja Spaten 355ml (Pack c/ 6)", price: 34.90, quantity: 1, store: "Depósito do Zé" },
  { id: 2, name: "Refrigerante Coca-Cola 2L", price: 10.50, quantity: 2, store: "Depósito do Zé" },
];

export default function CartPage() {
  const subtotal = CART_ITEMS.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const fee = 7.90;
  const total = subtotal + fee;

  return (
    <main className="container mx-auto px-4 py-8 pb-20 max-w-5xl">
      <h1 className="text-4xl font-black text-ze-black mb-8 flex items-center uppercase italic tracking-tighter">
        <ShoppingBag className="mr-3 h-10 w-10 text-ze-black" />
        Sua Rodada
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {CART_ITEMS.length > 0 ? (
            CART_ITEMS.map((item) => (
              <Card key={item.id} className="overflow-hidden border-slate-100">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-ze-gray rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl">
                      🍺
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-ze-black uppercase tracking-tight">{item.name}</h3>
                      <p className="text-sm font-bold text-ze-black/40 uppercase tracking-widest">{item.store}</p>
                      <div className="font-black text-ze-red mt-1">R$ {item.price.toFixed(2).replace('.', ',')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center border-2 border-ze-black rounded-xl bg-white overflow-hidden">
                      <button className="px-4 py-2 font-black text-ze-black hover:bg-ze-yellow transition-colors">-</button>
                      <span className="px-4 py-2 font-black text-ze-black bg-ze-yellow border-x-2 border-ze-black">{item.quantity}</span>
                      <button className="px-4 py-2 font-black text-ze-black hover:bg-ze-yellow transition-colors">+</button>
                    </div>
                    <Button variant="ghost" size="icon" className="text-ze-black/20 hover:text-ze-red hover:bg-ze-red/5">
                      <Trash2 className="h-6 w-6" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border-4 border-dashed border-ze-black/10">
              <ShoppingBag className="mx-auto h-16 w-16 text-ze-black/10 mb-6" />
              <h3 className="text-2xl font-black text-ze-black uppercase italic tracking-tighter">Sua rodada está vazia</h3>
              <p className="text-ze-black/40 mt-1 font-bold">Navegue pelos depósitos e garanta a gelada.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-slate-100">
            <CardContent className="p-6">
              <h3 className="text-2xl font-black text-ze-black mb-8 uppercase italic tracking-tighter">Resumo do Pedido</h3>
              
              <div className="space-y-4 text-sm font-bold text-ze-black/60 mb-8 uppercase tracking-widest">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de entrega</span>
                  <span>R$ {fee.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <div className="pt-6 border-t-4 border-ze-black mt-6 flex justify-between items-center bg-ze-yellow -mx-6 px-6 py-6">
                  <span className="font-black text-ze-black text-lg uppercase italic tracking-tighter">Total</span>
                  <span className="font-black text-3xl text-ze-black tracking-tighter">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="mb-8">
                <Input placeholder="Cupom de desconto" className="mb-2 h-12 border-2 border-ze-black focus-visible:ring-0 rounded-xl font-bold uppercase tracking-widest placeholder:text-ze-black/20" />
                <Button variant="outline" className="w-full border-2 border-ze-black hover:bg-ze-black/5 rounded-xl font-black uppercase tracking-widest">Aplicar</Button>
              </div>

              <Button variant="ze-dark" size="lg" className="w-full text-lg font-black uppercase italic tracking-tighter shadow-xl group">
                Finalizar Pedido
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

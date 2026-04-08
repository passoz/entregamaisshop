import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const MOCK_PRODUCTS = [
  { id: 1, name: "Pizza de Calabresa G", price: "R$ 49,90", stock: 15, status: "Ativo" },
  { id: 2, name: "Refrigerante Cola 2L", price: "R$ 12,00", stock: 4, status: "Baixo Estoque" },
  { id: 3, name: "Porção de Fritas", price: "R$ 22,00", stock: 0, status: "Esgotado" },
];

export default function SellerProducts() {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="vendedor" currentRoute="/vendedor/products" />
      <main className="flex-1 p-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Produtos e Estoque</h1>
            <p className="text-slate-500">Gerencie seu cardápio e disponibilidade.</p>
          </div>
          <Button variant="brand" className="shadow-brand-teal/20 gap-2">
            <Plus className="w-4 h-4" /> Novo Produto
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input className="pl-9 h-10 bg-white" placeholder="Buscar produtos..." />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Filtrar</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 font-semibold text-sm text-slate-600">Produto</th>
                  <th className="p-4 font-semibold text-sm text-slate-600">Preço</th>
                  <th className="p-4 font-semibold text-sm text-slate-600">Estoque</th>
                  <th className="p-4 font-semibold text-sm text-slate-600">Status</th>
                  <th className="p-4 font-semibold text-sm text-slate-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PRODUCTS.map((prod) => (
                  <tr key={prod.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-800 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100" />
                      {prod.name}
                    </td>
                    <td className="p-4 text-slate-600">{prod.price}</td>
                    <td className="p-4 text-slate-600">{prod.stock} un.</td>
                    <td className="p-4">
                      <Badge variant={
                        prod.status === "Ativo" ? "success" : 
                        prod.status === "Esgotado" ? "destructive" : "warning"
                      }>
                        {prod.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-brand-teal">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-brand-coral">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

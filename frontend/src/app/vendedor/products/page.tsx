"use client"

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function SellerProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const resp = await fetch('/api/seller/products');
        if (!resp.ok) throw new Error('Falha ao carregar produtos');
        const data = await resp.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const resp = await fetch(`/api/seller/products/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        alert('Erro ao excluir produto');
      }
    } catch (err) {
      alert('Falha na conexão');
    }
  };
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
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="font-medium">Carregando seus produtos...</p>
              </div>
            ) : error ? (
              <div className="p-20 text-center text-red-500 font-bold">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="p-20 text-center text-slate-400 font-medium">
                Nenhum produto cadastrado.
              </div>
            ) : (
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
                  {products.map((prod) => (
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
                        <Button variant="ghost" size="icon" title="Editar" className="text-slate-400 hover:text-brand-teal">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Excluir"
                          onClick={() => handleDelete(prod.id)}
                          className="text-slate-400 hover:text-brand-coral"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

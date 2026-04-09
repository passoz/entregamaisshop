"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Star, Clock, ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/lib/CartContext";

export default function StorePage() {
  const params = useParams();
  const id = params.id as string;
  const { addItem } = useCart();
  
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [storeRes, productsRes] = await Promise.all([
          fetch(`/api/v1/sellers/${id}`),
          fetch(`/api/v1/sellers/${id}/products`)
        ]);
        
        if (storeRes.ok) setStore(await storeRes.json());
        if (productsRes.ok) setProducts(await productsRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center font-black text-2xl uppercase tracking-tighter text-ze-black animate-pulse">Carregando...</div>;
  }

  if (!store) {
    return <div className="min-h-[50vh] flex items-center justify-center font-black text-4xl text-ze-red uppercase tracking-tighter">Depósito não encontrado</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8 pb-32">
      <div className="relative w-full h-[300px] md:h-[400px] rounded-[3rem] overflow-hidden border-8 border-ze-black bg-ze-dark mb-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <div className="absolute inset-0 bg-gradient-to-r from-ze-black/80 to-transparent p-12 flex flex-col justify-end">
          <Badge className="bg-ze-yellow text-ze-black font-black uppercase text-sm mb-4 w-fit px-4 py-1 animate-bounce">
            {store.category || "Depósito"}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-xl">
            {store.name}
          </h1>
          <div className="flex gap-6 mt-6 items-center flex-wrap">
            <span className="flex items-center text-ze-yellow font-bold bg-ze-black/50 px-4 py-2 rounded-xl backdrop-blur-sm text-lg border border-ze-yellow/20">
              <Star className="w-6 h-6 mr-2 fill-current" /> {store.rating || '--'}
            </span>
            <span className="flex items-center text-white font-bold bg-ze-black/50 px-4 py-2 rounded-xl backdrop-blur-sm text-lg">
              <Clock className="w-6 h-6 mr-2 text-ze-yellow" /> {store.time || 'Calculando...'}
            </span>
            <span className="flex items-center text-white uppercase tracking-widest font-black bg-ze-red px-4 py-2 rounded-xl text-lg shadow-lg">
              Frete: {store.fee || 'MOCK'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-ze-black uppercase tracking-tighter">
          Produtos Gelados
        </h2>
      </div>

      {products.length === 0 ? (
        <p className="text-ze-black/60 font-bold uppercase text-center py-12 text-xl">Este depósito ainda não tem produtos listados.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map(product => (
            <Card key={product.id} className="overflow-hidden border-2 border-ze-black/10 rounded-3xl hover:border-ze-yellow transition-all hover:-translate-y-2 hover:shadow-2xl bg-white group flex flex-col">
              <div className="aspect-square bg-slate-50 flex items-center justify-center p-6 relative">
                <div className="text-6xl group-hover:scale-110 transition-transform duration-500">
                  {product.category?.includes("Cerveja") ? "🍻" 
                    : product.category?.includes("Vinho") ? "🍷"
                    : product.category?.includes("Destilado") ? "🥃"
                    : product.category?.includes("Gelo") ? "🧊"
                    : "🥤"}
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {product.category}
                </p>
                <h3 className="font-black text-lg text-slate-800 leading-tight mb-4 flex-1 group-hover:text-ze-black">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-black text-2xl text-ze-red tracking-tight">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <Button 
                    onClick={() => addItem({
                      product_id: product.id,
                      name: product.name,
                      price: product.price,
                      seller_id: store.id,
                      seller_name: store.name,
                      image: product.image
                    })}
                    size="icon" 
                    className="h-12 w-12 rounded-2xl bg-ze-yellow text-ze-black hover:bg-ze-dark hover:text-ze-yellow shadow-lg group-hover:rotate-12 transition-transform">
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

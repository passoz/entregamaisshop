"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/product/ProductCard";

export default function StorePage() {
  const params = useParams();
  const id = params.id as string;
  
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
    <main className="container mx-auto px-4 py-6 md:py-8 pb-32">
      <div className="relative w-full min-h-[200px] md:h-[400px] rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 md:border-8 border-ze-black bg-ze-dark mb-8 md:mb-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] md:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <div className="absolute inset-0 bg-gradient-to-r from-ze-black/90 to-transparent p-6 md:p-12 flex flex-col justify-end">
          <Badge className="bg-ze-yellow text-ze-black font-black uppercase text-[10px] md:text-sm mb-2 md:mb-4 w-fit px-3 md:px-4 py-1 animate-bounce">
            {store.category || "Depósito"}
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-xl leading-none">
            {store.name}
          </h1>
          <div className="flex gap-2 md:gap-6 mt-4 md:mt-6 items-center flex-wrap">
            <span className="flex items-center text-ze-yellow font-bold bg-ze-black/50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl backdrop-blur-sm text-sm md:text-lg border border-ze-yellow/20">
              <Star className="w-4 h-4 md:w-6 md:h-6 mr-1.5 md:mr-2 fill-current" /> {store.rating || '--'}
            </span>
            <span className="flex items-center text-white font-bold bg-ze-black/50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl backdrop-blur-sm text-sm md:text-lg">
              <Clock className="w-4 h-4 md:w-6 md:h-6 mr-1.5 md:mr-2 text-ze-yellow" /> {store.time || 'Calculando...'}
            </span>
            <span className="flex items-center text-white uppercase tracking-widest font-black bg-ze-red px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-lg shadow-lg">
              Frete: {store.fee || 'MOCK'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-xl md:text-3xl font-black text-ze-black uppercase tracking-tighter">
          Produtos Gelados
        </h2>
      </div>

      {products.length === 0 ? (
        <p className="text-ze-black/60 font-bold uppercase text-center py-12 text-xl">Este depósito ainda não tem produtos listados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={{
                ...product,
                seller_id: store.id,
                seller_name: store.name
              }} 
            />
          ))}
        </div>
      )}
    </main>
  );
}

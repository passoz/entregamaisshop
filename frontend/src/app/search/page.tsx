"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search as SearchIcon, FilterX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCart } from "@/lib/CartContext";
import { ProductCard } from "@/components/product/ProductCard";

function SearchResults() {
  const { addItem } = useCart();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(q);

  useEffect(() => {
    async function fetchSearch() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (q) queryParams.set("q", q);
        if (category) queryParams.set("category", category);
        
        const res = await fetch(`/api/v1/products?${queryParams.toString()}`);
        if (res.ok) {
          setProducts(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSearch();
    setSearchQuery(q); // sync input
  }, [q, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-ze-black -mt-6 relative z-10 mx-auto max-w-4xl">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-ze-black/40 w-6 h-6" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar produtos..." 
              className="pl-14 h-14 text-xl font-bold rounded-2xl border-2 border-ze-black/10 focus-visible:ring-ze-yellow"
            />
          </div>
          <Button type="submit" variant="ze-dark" className="h-14 px-8 rounded-2xl text-lg font-black shrink-0 w-full md:w-auto">
            Buscar
          </Button>
          {(q || category) && (
            <Link href="/search" className="shrink-0">
              <Button type="button" variant="ghost" className="h-14 px-6 text-ze-red hover:bg-ze-red/10 rounded-2xl">
                <FilterX className="w-5 h-5 mr-2" /> Limpar
              </Button>
            </Link>
          )}
        </form>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-black text-ze-black uppercase tracking-tight mb-6 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
          <span className="truncate">
            {category ? `Categoria: ${category}` : q ? `Resultados para "${q}"` : "Todos os Produtos"}
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-400 lowercase tracking-normal">({products.length} encontrados)</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-3xl" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-300">
            <div className="text-6xl mb-4 opacity-50">🏜️</div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Nenhum produto encontrado</h3>
            <p className="text-slate-500 mt-2 font-bold">Tente usar outros termos de busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
             {products.map(product => (
                <ProductCard key={product.id} product={product} showStoreLink />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12 pb-32">
      <div className="mb-8 md:mb-12 text-center bg-ze-yellow py-8 md:py-12 px-4 rounded-[2rem] md:rounded-[3rem] border-4 md:border-8 border-ze-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] md:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-ze-black uppercase italic tracking-tighter drop-shadow-sm leading-tight">Busca Gelada</h1>
        <p className="text-sm sm:text-lg md:text-xl font-bold uppercase tracking-widest text-ze-black/70 mt-2">Encontre sua bebida favorita</p>
      </div>
      
      <Suspense fallback={<div className="h-32 bg-slate-100 rounded-3xl animate-pulse max-w-4xl mx-auto -mt-6 border-4 border-dashed border-slate-300"></div>}>
        <SearchResults />
      </Suspense>
    </main>
  );
}

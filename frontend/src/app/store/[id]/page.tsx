"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import type { Seller } from "@/lib/nearbySellers";

interface StoreProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  seller_id: string;
  seller_name?: string;
  image?: string;
}

export default function StorePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [store, setStore] = useState<Seller | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScore, setSelectedScore] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      try {
        const [storeData, productsData] = await Promise.all([
          apiFetch<Seller>(`/api/v1/sellers/${id}`),
          apiFetch<StoreProduct[]>(`/api/v1/sellers/${id}/products`)
        ]);
        
        setStore(storeData);
        setProducts(productsData);
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

  async function handleSubmitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingReview(true);
    setReviewFeedback("");

    try {
      await apiFetch(`/api/v1/sellers/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: selectedScore,
          comment,
        }),
      });

      const updatedStore = await apiFetch<Seller>(`/api/v1/sellers/${id}`);
      setStore(updatedStore);
      setComment("");
      setSelectedScore(5);
      setReviewFeedback("Avaliacao enviada com sucesso.");
    } catch (error) {
      setReviewFeedback("Nao foi possivel enviar sua avaliacao. Verifique se voce esta autenticado como cliente.");
    } finally {
      setIsSubmittingReview(false);
    }
  }

  return (
    <main className="container mx-auto px-4 py-6 md:py-8 pb-32">
      <div className="relative w-full min-h-[200px] md:h-[400px] rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 md:border-8 border-ze-black bg-ze-dark mb-8 md:mb-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] md:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
        <div className="absolute inset-0 bg-gradient-to-r from-ze-black/90 to-transparent p-6 md:p-12 flex flex-col justify-end">
          <Badge className="bg-ze-yellow text-ze-black hover:bg-ze-yellow hover:text-ze-black font-black uppercase text-[10px] md:text-sm mb-2 md:mb-4 w-fit px-3 md:px-4 py-1 animate-bounce">
            {store.category || "Depósito"}
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-xl leading-none">
            {store.name}
          </h1>
          <div className="flex gap-2 md:gap-6 mt-4 md:mt-6 items-center flex-wrap">
            <span className="flex items-center text-ze-yellow font-bold bg-ze-black/50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl backdrop-blur-sm text-sm md:text-lg border border-ze-yellow/20">
              <Star className="w-4 h-4 md:w-6 md:h-6 mr-1.5 md:mr-2 fill-current" /> {(store.rating ?? 5).toFixed(1)}
            </span>
            <span className="flex items-center text-white font-bold bg-ze-black/50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl backdrop-blur-sm text-sm md:text-lg">
              <Clock className="w-4 h-4 md:w-6 md:h-6 mr-1.5 md:mr-2 text-ze-yellow" /> {store.time || 'Calculando...'}
            </span>
            <span className="flex items-center text-white uppercase tracking-widest font-black bg-ze-red px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-lg shadow-lg">
              {store.fee_label || `A partir de R$ ${(store.min_delivery_fee ?? 0).toFixed(2).replace(".", ",")}`}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 mb-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className="rounded-[2rem] border-2 border-ze-black/10 bg-white p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-ze-red">Locais atendidos</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(store.delivery_areas || []).map((area) => (
              <div key={area.id} className="rounded-2xl border border-ze-black/10 bg-ze-gray px-4 py-4">
                <div className="flex items-center gap-2 text-ze-black">
                  <MapPin className="h-4 w-4 text-ze-red" />
                  <span className="font-black uppercase tracking-tight">{area.label}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-ze-black/65">Frete {area.fee_label || `R$ ${area.fee.toFixed(2).replace(".", ",")}`}</p>
              </div>
            ))}
            {(store.delivery_areas || []).length === 0 && (
              <p className="text-sm font-bold text-ze-black/60">Este deposito ainda nao cadastrou areas de entrega. O frete minimo atual e R$ 0,00.</p>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border-2 border-ze-black/10 bg-white p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-ze-red">Sua avaliacao</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-ze-black">Avalie este deposito</h2>
          <p className="mt-2 text-sm font-bold text-ze-black/60">
            Media atual {(store.rating ?? 5).toFixed(1)} com {store.review_count ?? 0} avaliacoes.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleSubmitReview}>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setSelectedScore(score)}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 text-lg transition ${
                    selectedScore === score
                      ? "border-ze-black bg-ze-yellow text-ze-black"
                      : "border-ze-black/10 bg-ze-gray text-ze-black/50 hover:border-ze-black"
                  }`}
                  aria-label={`Selecionar nota ${score}`}
                >
                  <Star className={`h-5 w-5 ${selectedScore >= score ? "fill-current" : ""}`} />
                </button>
              ))}
            </div>

            <Input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Conte rapidamente como foi sua experiencia"
              className="h-12 rounded-2xl border-2 border-ze-black/10 px-4 font-bold"
            />

            {reviewFeedback && (
              <p className="text-sm font-bold text-ze-black/70">{reviewFeedback}</p>
            )}

            <Button type="submit" variant="ze-dark" className="w-full uppercase" disabled={isSubmittingReview}>
              {isSubmittingReview ? "Enviando..." : "Enviar avaliacao"}
            </Button>
          </form>
        </section>
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

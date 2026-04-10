"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Star,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { LocationModal } from "@/components/modals/LocationModal";
import {
  findCityOption,
  findNearbySellers,
  formatLocationLabel,
  SellerWithLocation,
  type Seller,
  findClosestNeighborhood
} from "@/lib/nearbySellers";

export default function Home() {
  const [allSellers, setAllSellers] = useState<Seller[]>([]);
  const [nearbySellers, setNearbySellers] = useState<SellerWithLocation[]>([]);
  const [locationLabel, setLocationLabel] = useState<string>("");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLoadingNearby, setIsLoadingNearby] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadNearbySellers = async () => {
      setIsLoadingNearby(true);

      try {
        const sellers = await apiFetch<Seller[]>("/api/v1/sellers");
        if (!isMounted) return;

        setAllSellers(sellers);

        const savedLocation =
          typeof window !== "undefined"
            ? localStorage.getItem("last_selected_location")
            : null;

        if (savedLocation) {
          // Keep previous manual selection across sessions.
          setLocationLabel(savedLocation);
          setNearbySellers(sellers);
          setIsLoadingNearby(false);
          return;
        }

        // Try automatic geolocation
        if (typeof window !== "undefined" && "geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              if (!isMounted) return;
              
              const { latitude: lat, longitude: lng } = position.coords;

              const sellersByDistance = findNearbySellers(sellers, { lat, lng });
              setNearbySellers(sellersByDistance);

              // Find closest neighborhood for label
              try {
                const res = await fetch("/data/neighborhoods.json");
                const neighborhoods = await res.json();
                const name = findClosestNeighborhood(lat, lng, neighborhoods);
                const resolvedLocation = name || "Sua localização";
                setLocationLabel(resolvedLocation);
                localStorage.setItem("last_selected_location", resolvedLocation);
              } catch (e) {
                console.error("Erro ao identificar bairro:", e);
                const fallbackLocation = "Sua localização atual";
                setLocationLabel(fallbackLocation);
                localStorage.setItem("last_selected_location", fallbackLocation);
              }
              
              setIsLoadingNearby(false);
            },
            () => {
              if (!isMounted) return;
              if (!savedLocation) setIsLocationModalOpen(true);
              setIsLoadingNearby(false);
            },
            { enableHighAccuracy: true, timeout: 5000 }
          );
        } else {
          if (!savedLocation) setIsLocationModalOpen(true);
          setIsLoadingNearby(false);
        }
      } catch (error) {
        console.error(error);
        setIsLoadingNearby(false);
      }
    };

    loadNearbySellers();
    return () => { isMounted = false; };
  }, []);

  const handleLocationSelect = (selectedLabel: string, coords?: { lat: number, lng: number }) => {
    let locationToUse: { lat: number, lng: number, label: string } | undefined;

    if (coords) {
      locationToUse = { ...coords, label: selectedLabel };
    } else {
      const selectedCity = findCityOption(selectedLabel);
      if (selectedCity) {
        locationToUse = { ...selectedCity, label: selectedCity.label };
      }
    }

    if (locationToUse) {
      const sellersByDistance = findNearbySellers(allSellers, locationToUse);
      setNearbySellers(sellersByDistance);
      setLocationLabel(locationToUse.label);
      localStorage.setItem("last_selected_location", locationToUse.label);
    }
    
    setIsLocationModalOpen(false);
  };

  return (
    <main className="container mx-auto px-4 py-6 md:py-8 pb-20">
      {/* Immersive Hero Section */}
      <div className="relative w-full min-h-[450px] md:h-[700px] rounded-[2rem] md:rounded-[4rem] overflow-hidden border-4 md:border-8 border-ze-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] md:shadow-[30px_30px_0px_0px_rgba(0,0,0,1)] bg-ze-yellow mb-12 md:mb-20 group">
        <Image 
          src="/assets/hero-beverage.png" 
          alt="Bebidas Geladas" 
          fill 
          className="object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"
          priority
        />
        
        {/* Deep Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-ze-black/90 via-ze-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-20 space-y-4 md:space-y-6 max-w-4xl">
          <Badge className="bg-ze-yellow hover:bg-ze-yellow text-ze-black font-black uppercase tracking-[0.2em] md:tracking-[0.4em] px-3 md:px-6 py-1 md:py-2 w-fit text-[10px] md:text-sm animate-bounce cursor-default">
            Sua Bebida em Minutos
          </Badge>
          
          <h1 className="text-3xl sm:text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.9] md:leading-[0.85] drop-shadow-2xl">
            Bebida gelada, <br className="hidden sm:block" />
            <span className="text-ze-yellow inline-block mt-2 sm:mt-0">
              preço de mercado.
            </span>
          </h1>
          
          <p className="text-white/90 max-w-xl text-base md:text-2xl font-black uppercase tracking-tight drop-shadow-lg leading-tight">
            Cervejas, vinhos e muito mais. <br className="hidden sm:block"/>
            Sem sair de casa, sem estresse.
          </p>

          <div className="pt-4 md:pt-8 w-full">
             <form action="/search" className="max-w-2xl relative flex items-center bg-white rounded-2xl md:rounded-3xl shadow-2xl hover:shadow-ze-yellow/40 transition-all p-2 md:p-3 border-4 border-ze-black transform -rotate-1 hover:rotate-0">
              <div className="pl-2 md:pl-4 pr-1 md:pr-2 text-ze-black">
                <Search className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <Input 
                name="q"
                className="border-0 shadow-none focus-visible:ring-0 px-2 md:px-4 h-10 md:h-14 text-sm md:text-xl rounded-none font-black placeholder:text-ze-black/20 uppercase italic w-full" 
                placeholder="O que vamos beber?" 
              />
              <Button type="submit" variant="ze-dark" className="rounded-xl md:rounded-2xl px-4 md:px-12 h-10 md:h-14 ml-1 md:ml-2 text-sm md:text-lg shadow-xl shrink-0">
                Buscar
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-ze-black uppercase tracking-tighter">Categorias</h2>
        </div>
        <div className="flex gap-2 min-[400px]:gap-4 overflow-x-auto pb-4 pt-4 scrollbar-hide">
          {[
            { name: "Cervejas", emoji: "🍺" },
            { name: "Vinhos", emoji: "🍷" },
            { name: "Destilados", emoji: "🥃" },
            { name: "Refrigerantes", emoji: "🥤" },
            { name: "Gelo e Carvão", emoji: "🧊" },
            { name: "Energéticos", emoji: "⚡" },
            { name: "Sucos", emoji: "🧃" },
            { name: "Petiscos", emoji: "🥨" }
          ].map((item, i) => (
            <Link 
              href={`/search?category=${encodeURIComponent(item.name)}`} 
              key={i} 
              className="flex-shrink-0 flex flex-col items-center gap-3 group cursor-pointer hover:no-underline w-24"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-white shadow-sm border-2 border-ze-black/5 flex items-center justify-center group-hover:border-ze-yellow group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-3 shadow-black/5">
                <div className="w-14 h-14 rounded-full bg-ze-yellow/10 flex items-center justify-center group-hover:bg-ze-yellow/20 transition-colors">
                  <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                    {item.emoji}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black text-ze-black/60 group-hover:text-ze-black transition-colors uppercase tracking-widest text-center px-1">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl md:text-3xl font-black text-ze-black uppercase tracking-tighter">Depósitos Próximos</h2>
              <button 
                onClick={() => setIsLocationModalOpen(true)}
                aria-label="Alterar localização"
                className="w-10 h-10 rounded-xl bg-ze-gray flex items-center justify-center hover:bg-ze-yellow transition-all shadow-sm border border-ze-black/5"
              >
                <MapPin className="w-5 h-5 text-ze-black" />
              </button>
            </div>
            {locationLabel && (
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ze-black/40 mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ze-yellow animate-pulse" />
                Buscando em {locationLabel}
              </p>
            )}
          </div>
          <Link href="/search" className="hover:no-underline hidden sm:block">
            <Button variant="ghost" className="text-ze-black hover:text-ze-black/80 font-black uppercase text-xs tracking-[0.2em]">
              Ver todos <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {!isLoadingNearby &&
            nearbySellers.map((store) => (
              <Link href={`/store/${store.id}`} key={store.id} className="hover:no-underline">
                <Card className="cursor-pointer group overflow-hidden border-2 border-ze-black/5 rounded-3xl ze-card-hover bg-white h-full">
                  <div className="h-40 bg-ze-gray w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-ze-black/80 to-transparent flex items-end p-6">
                      <Badge className="bg-ze-yellow text-ze-black font-black uppercase text-[10px] tracking-widest">
                        {store.category || "Bebidas"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6 pt-8 relative">
                    <div className="absolute -top-12 right-6 w-20 h-20 bg-white rounded-3xl shadow-xl border-4 border-ze-yellow flex items-center justify-center transform rotate-3 group-hover:rotate-0 transition-transform">
                      <img 
                        src="/branding/entregamais-shop/moto.png" 
                        alt="Entrega" 
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <h3 className="font-black text-xl text-ze-black mb-1 group-hover:text-ze-red transition-colors uppercase tracking-tighter">
                      {store.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-ze-black/60 mb-4 font-bold">
                      <div className="flex items-center text-ze-yellow bg-ze-black px-2 py-0.5 rounded-md">
                        <Star className="w-4 h-4 mr-1 fill-current" /> {(store.rating ?? 5).toFixed(1)}
                      </div>
                      <span>•</span>
                      <span>{formatLocationLabel(store.city, store.state) || "Sem localizacao"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-black text-ze-black/80 bg-ze-gray rounded-2xl px-4 py-3 border border-ze-black/5">
                      <MapPin className="w-4 h-4 text-ze-red" />
                      <span>
                        {store.distanceKm != null
                          ? `${store.distanceKm.toFixed(1)} km de distancia`
                          : "Distancia indisponivel"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-black text-ze-black/80 bg-ze-gray rounded-2xl p-4 border border-ze-black/5 mt-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" /> {store.time || "15-25 min"}
                      </div>
                      <div className="flex items-center text-ze-red uppercase tracking-widest">
                        {store.fee_label || `A partir de R$ ${(store.min_delivery_fee ?? 0).toFixed(2).replace(".", ",")}`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

          {!isLoadingNearby && nearbySellers.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-4 rounded-[2.5rem] border-4 border border-ze-black border-dashed bg-white shadow-[12px_12px_0px_0px_rgba(34,34,34,0.05)]">
              <CardContent className="p-12 text-center space-y-6">
                <div className="w-24 h-24 bg-ze-gray rounded-[2rem] flex items-center justify-center mx-auto text-5xl grayscale opacity-50">
                  📍
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-ze-black">Nenhum depósito por aqui...</h3>
                  <p className="text-ze-black/60 font-bold uppercase text-xs tracking-widest">
                    Não encontramos lojas próximas a {locationLabel || "sua localização"}.
                  </p>
                </div>
                <Button 
                  onClick={() => setIsLocationModalOpen(true)}
                  variant="ze-dark" 
                  className="px-10 h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl transform hover:-rotate-1 transition-transform"
                >
                  Alterar Localização
                </Button>
              </CardContent>
            </Card>
          )}

          {isLoadingNearby && (
            <div className="md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-80 bg-ze-gray rounded-3xl" />
              ))}
            </div>
          )}
        </div>
      </div>

      <LocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        onSelect={handleLocationSelect}
      />
    </main>
  );
}

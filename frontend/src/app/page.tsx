import Image from "next/image";
import Link from "next/link";
import { Search, Star, Clock, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const MOCK_STORES = [
  { id: 1, name: "Depósito do Zé", category: "Cervejas e Gelo", rating: 4.9, time: "15-25 min", fee: "Grátis" },
  { id: 2, name: "Conveniência 24h", category: "Bebidas Variadas", rating: 4.5, time: "20-35 min", fee: "R$ 4,90" },
  { id: 3, name: "Distribuidora Imperial", category: "Vinhos e Destilados", rating: 4.7, time: "30-50 min", fee: "R$ 6,90" },
  { id: 4, name: "Gelo e Carvão Express", category: "Essenciais", rating: 4.8, time: "10-20 min", fee: "R$ 3,00" },
];

export default function Home() {
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
        
        {/* Deep Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-ze-black/90 via-ze-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-20 space-y-4 md:space-y-6 max-w-4xl">
          <Badge className="bg-ze-yellow text-ze-black font-black uppercase tracking-[0.2em] md:tracking-[0.4em] px-3 md:px-6 py-1 md:py-2 w-fit text-[10px] md:text-sm animate-bounce">
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
          <h2 className="text-2xl font-bold text-slate-800">Categorias</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide py-1">
          {["Cervejas", "Vinhos", "Destilados", "Refrigerantes", "Gelo e Carvão", "Energéticos", "Sucos", "Petiscos"].map((item, i) => (
            <Link href={`/search?category=${encodeURIComponent(item)}`} key={i} className="flex-shrink-0 flex flex-col items-center gap-3 group cursor-pointer hover:no-underline">
              <div className="w-20 h-20 rounded-3xl bg-white shadow-sm border-2 border-ze-black/5 flex items-center justify-center group-hover:border-ze-yellow group-hover:shadow-lg transition-all group-hover:-translate-y-2">
                <div className="w-12 h-12 rounded-full bg-ze-yellow/20 flex items-center justify-center">
                  <span className="text-2xl">🍺</span>
                </div>
              </div>
              <span className="text-sm font-black text-ze-black/70 group-hover:text-ze-black transition-colors uppercase tracking-tight">
                {item}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-ze-black uppercase tracking-tighter">Depósitos Próximos</h2>
          <Link href="/search" className="hover:no-underline">
            <Button variant="ghost" className="text-ze-black hover:text-ze-black/80 font-bold uppercase text-xs tracking-widest">
              Ver todos <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_STORES.map((store) => (
            <Link href={`/store/${store.id}`} key={store.id} className="hover:no-underline">
              <Card className="cursor-pointer group overflow-hidden border-2 border-ze-black/5 rounded-3xl ze-card-hover bg-white h-full">
                <div className="h-40 bg-ze-gray w-full relative">
                  {/* Mock image banner with beverage color overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ze-black/80 to-transparent flex items-end p-6">
                    <Badge className="bg-ze-yellow text-ze-black font-black uppercase text-[10px] tracking-widest">
                      {store.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6 pt-8 relative">
                  <div className="absolute -top-12 right-6 w-20 h-20 bg-white rounded-3xl shadow-xl border-4 border-ze-yellow flex items-center justify-center transform rotate-3 group-hover:rotate-0 transition-transform">
                    <div className="w-16 h-16 bg-ze-gray rounded-2xl flex items-center justify-center text-3xl">
                      🏪
                    </div>
                  </div>
                  <h3 className="font-black text-xl text-ze-black mb-1 group-hover:text-ze-red transition-colors uppercase tracking-tighter">
                    {store.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-ze-black/60 mb-4 font-bold">
                    <div className="flex items-center text-ze-yellow bg-ze-black px-2 py-0.5 rounded-md">
                      <Star className="w-4 h-4 mr-1 fill-current" /> {store.rating}
                    </div>
                    <span>•</span>
                    <span>{store.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-black text-ze-black/80 bg-ze-gray rounded-2xl p-4 border border-ze-black/5 mt-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" /> {store.time}
                    </div>
                    <div className="flex items-center text-ze-red uppercase tracking-widest">
                      {store.fee === "Grátis" ? "Frete ZERO" : store.fee}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

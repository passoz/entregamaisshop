"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useCart } from "@/lib/CartContext";
import { useToast } from "@/components/providers/ToastProvider";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  seller_id: string;
  seller_name?: string;
  image?: string;
}

interface ProductCardProps {
  product: Product;
  showStoreLink?: boolean;
}

export function ProductCard({ product, showStoreLink = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleAddToCart = async () => {
    await addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      seller_id: product.seller_id,
      seller_name: product.seller_name || "Depósito",
      image: product.image
    }, quantity);
    
    showToast(`${quantity}x ${product.name} adicionado ao carrinho!`, "success", "Item Adicionado");
    setQuantity(1); // Reset after adding
  };

  const getEmoji = (category: string) => {
    if (category?.includes("Cerveja")) return "🍻";
    if (category?.includes("Vinho")) return "🍷";
    if (category?.includes("Destilado")) return "🥃";
    if (category?.includes("Gelo")) return "🧊";
    if (category?.includes("Petisco")) return "🥨";
    return "🥤";
  };

  return (
    <Card className="overflow-hidden border-2 border-ze-black/10 rounded-3xl hover:border-ze-yellow transition-all hover:-translate-y-2 hover:shadow-2xl bg-white group flex flex-col relative h-full">
      {showStoreLink && (
        <Link href={`/store/${product.seller_id}`} className="absolute top-3 left-3 z-10">
          <span className="text-[10px] font-black uppercase bg-ze-black text-white px-2 py-1 rounded-lg hover:bg-ze-yellow hover:text-ze-black transition-colors cursor-pointer shadow-md">
            Ver Loja
          </span>
        </Link>
      )}
      
      <div className="aspect-square bg-slate-50 flex items-center justify-center p-6 relative">
        <div className="text-6xl group-hover:scale-110 transition-transform duration-500">
          {getEmoji(product.category)}
        </div>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col bg-white">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          {product.category}
        </p>
        <h3 className="font-black text-lg text-slate-800 leading-tight mb-4 flex-1 group-hover:text-ze-black line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex flex-col gap-4 mt-auto pt-4 border-t border-ze-black/5">
          <div className="flex items-center justify-between">
            <span className="font-black text-2xl text-ze-red tracking-tight">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center border-2 border-ze-black rounded-2xl bg-white overflow-hidden shadow-sm h-12 w-full">
              <button 
                onClick={handleDecrement} 
                className="flex-1 h-full font-black text-ze-black hover:bg-ze-yellow transition-colors text-xl focus:outline-none border-none disabled:opacity-10"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="flex-[0.5] h-full flex items-center justify-center font-black text-ze-black bg-ze-yellow border-x-2 border-ze-black text-base">
                {quantity}
              </span>
              <button 
                onClick={handleIncrement} 
                className="flex-1 h-full font-black text-ze-black hover:bg-ze-yellow transition-colors text-xl focus:outline-none border-none"
              >
                +
              </button>
            </div>
            
            <Button 
              onClick={handleAddToCart}
              variant="brand"
              type="button"
              className="h-12 min-w-0 !rounded-2xl shadow-lg font-black uppercase text-xs tracking-[0.08em] border-2 border-ze-black w-full inline-flex items-center justify-center"
            >
              <ShoppingBag className="w-4 h-4 mr-1.5 shrink-0" />
              <span className="whitespace-nowrap leading-none">Adicionar</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

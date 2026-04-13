"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth/client";
import { apiFetch } from "./api";

export interface CartItem {
  id?: string; // Database ID for the cart item
  product_id: string;
  name: string;
  price: number;
  seller_id: string;
  seller_name: string;
  quantity: number;
  image?: string;
  product?: any; // To handle nested product data from backend
}

interface CartContextProps {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => Promise<void>;
  removeItem: (product_id: string) => Promise<void>;
  updateQuantity: (product_id: string, delta: number) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  totalItems: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = status === "authenticated";

  const mapCartItems = useCallback((cart: any): CartItem[] => {
    const rawItems = cart?.items || cart?.edges?.items || [];

    return rawItems.map((it: any) => {
      const product = it.product || it.edges?.product;

      return {
        id: it.id,
        product_id: it.product_id,
        name: product?.name || "Produto",
        price: it.unit_price,
        seller_id: product?.seller_id || "",
        seller_name: product?.seller_name || "",
        quantity: it.quantity,
        image: product?.image_url,
        product,
      };
    });
  }, []);

  // Initial load
  useEffect(() => {
    const loadCart = async () => {
      if (status === "loading") return;

      if (isAuthenticated) {
        try {
          const cart = await apiFetch<any>("/api/v1/cart");
          const mappedItems = mapCartItems(cart);
          if (mappedItems.length > 0) {
            setItems(mappedItems);
          }
          
          // Sync local items to DB if any exist
          const savedLocal = localStorage.getItem("@Entregamais:cart");
          if (savedLocal) {
            const localItems = JSON.parse(savedLocal) as CartItem[];
            if (localItems.length > 0) {
              for (const item of localItems) {
                await apiFetch("/api/v1/cart/items", {
                  method: "POST",
                  body: JSON.stringify({ product_id: item.product_id, quantity: item.quantity }),
                });
              }
              localStorage.removeItem("@Entregamais:cart");
              // Refresh again
              const refreshed = await apiFetch<any>("/api/v1/cart");
              const refreshedItems = mapCartItems(refreshed);
              if (refreshedItems.length > 0) {
                setItems(refreshedItems);
              }
            }
          }
        } catch (e) {
          console.error("Erro ao carregar carrinho do DB:", e);
        }
      } else {
        const saved = localStorage.getItem("@Entregamais:cart");
        if (saved) {
          setItems(JSON.parse(saved));
        }
      }
      setIsLoading(false);
      setMounted(true);
    };

    loadCart();
  }, [status, isAuthenticated, mapCartItems]);

  // Save to local storage only if NOT authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      localStorage.setItem("@Entregamais:cart", JSON.stringify(items));
    }
  }, [items, mounted, isAuthenticated]);

  const addItem = async (item: Omit<CartItem, "quantity">, quantity = 1) => {
    // Optimistic local update
    setItems((prev) => {
      const exists = prev.find((i) => i.product_id === item.product_id);
      if (exists) {
        return prev.map((i) =>
          i.product_id === item.product_id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });

    if (isAuthenticated) {
      try {
        await apiFetch("/api/v1/cart/items", {
          method: "POST",
          body: JSON.stringify({ product_id: item.product_id, quantity }),
        });
      } catch (e) {
        console.error("Erro ao persistir item no DB:", e);
      }
    }
  };

  const removeItem = async (product_id: string) => {
    const item = items.find(i => i.product_id === product_id);
    const dbId = item?.id;

    setItems((prev) => prev.filter((i) => i.product_id !== product_id));

    if (isAuthenticated && dbId) {
      try {
        await apiFetch(`/api/v1/cart/items/${dbId}`, { method: "DELETE" });
      } catch (e) {
        console.error("Erro ao remover item do DB:", e);
      }
    }
  };

  const updateQuantity = async (product_id: string, delta: number) => {
    const item = items.find(i => i.product_id === product_id);
    if (!item) return;

    const newQ = Math.max(1, item.quantity + delta);
    const dbId = item.id;

    setItems((prev) =>
      prev.map((i) => (i.product_id === product_id ? { ...i, quantity: newQ } : i))
    );

    if (isAuthenticated && dbId) {
      try {
        await apiFetch(`/api/v1/cart/items/${dbId}`, {
          method: "PUT",
          body: JSON.stringify({ quantity: newQ }),
        });
      } catch (e) {
        console.error("Erro ao atualizar quantidade no DB:", e);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    if (isAuthenticated) {
      // Logic for clearing whole cart in DB could be a DELETE /cart or iterate DELETE items
      // For now, let's keep it simple locally as DB clear isn't explicitly in handlers yet
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart, 
        subtotal, 
        totalItems,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    console.warn("useCart was called outside of a CartProvider. Returning default empty state.");
    return {
      items: [],
      addItem: async () => {},
      removeItem: async () => {},
      updateQuantity: async () => {},
      clearCart: async () => {},
      subtotal: 0,
      totalItems: 0,
      isLoading: false
    };
  }
  return context;
}

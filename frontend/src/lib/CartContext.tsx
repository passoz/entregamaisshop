"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  seller_id: string;
  seller_name: string;
  quantity: number;
  image?: string;
}

interface CartContextProps {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (product_id: string) => void;
  updateQuantity: (product_id: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("@Entregamais:cart");
    if (saved) {
      setItems(JSON.parse(saved));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("@Entregamais:cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.product_id === item.product_id);
      if (exists) {
        return prev.map((i) =>
          i.product_id === item.product_id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (product_id: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== product_id));
  };

  const updateQuantity = (product_id: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.product_id === product_id) {
          const newQ = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQ };
        }
        return i;
      })
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

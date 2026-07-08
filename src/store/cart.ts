"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Photo } from "@/types/photo";

interface CartStore {
    items: Photo[];
    toast: string | null;
    addItem: (photo: Photo) => void;
    removeItem: (id: string | number) => void;
    clearCart: () => void;
    showToast: (message: string) => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
        items: [],
        toast: null,
        addItem: (photo) => set((state) => {
            const exist = state.items.find(
                item => item.id === photo.id
            );
            if (exist) {
                return state;
            }
            // Set toast message
            setTimeout(() => set({ toast: null }), 3000);
            return {
                items: [...state.items, photo],
                toast: "Photo added to cart.",
            };
        }),
        removeItem: (id) => set((state) => {
            setTimeout(() => set({ toast: null }), 3000);
            return {
                items: state.items.filter(item => item.id !== id),
                toast: "Photo removed from cart.",
            };
        }),
        clearCart: () => set((state) => {
            setTimeout(() => set({ toast: null }), 3000);
            return {
                items: [],
                toast: "Cart cleared.",
            };
        }),
        showToast: (message) => set((state) => {
            setTimeout(() => set({ toast: null }), 3000);
            return { toast: message };
        }),
    }),
    {
      name: "jejak-photo-cart", // localStorage key
      partialize: (state) => ({ items: state.items }), // only persist items
    }
  )
);
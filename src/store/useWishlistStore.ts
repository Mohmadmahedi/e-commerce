"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  items: string[]; // Product IDs
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (productId: string) => {
        const current = get().items;
        if (current.includes(productId)) {
          set({ items: current.filter((id) => id !== productId) });
        } else {
          set({ items: [...current, productId] });
        }
      },
      isInWishlist: (productId: string) => {
        return get().items.includes(productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "avanya-wishlist",
    }
  )
);

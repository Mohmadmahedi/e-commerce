"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartStoreState {
  isOpen: boolean;
  itemCount: number;
  guestToken: string;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setItemCount: (count: number) => void;
  incrementCount: (delta?: number) => void;
  decrementCount: (delta?: number) => void;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set) => ({
      isOpen: false,
      itemCount: 0,
      guestToken: typeof window !== "undefined" ? `gst_${Math.random().toString(36).substring(2, 12)}` : "",
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setItemCount: (count: number) => set({ itemCount: Math.max(0, count) }),
      incrementCount: (delta = 1) => set((state) => ({ itemCount: state.itemCount + delta })),
      decrementCount: (delta = 1) => set((state) => ({ itemCount: Math.max(0, state.itemCount - delta) })),
    }),
    {
      name: "avanya-cart-ui",
      partialize: (state) => ({ guestToken: state.guestToken }),
    }
  )
);

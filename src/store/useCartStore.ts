'use client'


import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type{ Product } from '@/lib/types/product'

interface CartItem extends Product {
  quantity: number
  custom_data?: object
}

interface CartStore {
  items: CartItem[]
  addToCart: (product: Product, quantity: number) => void
  removeFromCart: (productId: string) => void;
  removeAllItems: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product, quantity) => {
        set((state) => {
          const existingItem = state.items.find(item => item._id === product._id)
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item._id === product._id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }
          return {
            items: [...state.items, { ...product, quantity }],
          }
        })
      },
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item._id !== productId),
        }))
      },
      removeAllItems: () => {
        set({ items: [] })
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map(item =>
            item._id === productId
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          ).filter(item => item.quantity > 0),
        }))
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)


import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Product, ProductVariant } from './types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  toggleCart: (open?: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart
  useEffect(() => {
    const savedCart = localStorage.getItem('pd360_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pd360_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, variant?: ProductVariant, quantity = 1) => {
    setItems(prev => {
      // Robust check: Must match Product ID AND Variant ID (handling undefined/null)
      const existingIndex = prev.findIndex(i => {
        const sameProduct = i.id === product.id;
        const sameVariant = i.variantId === (variant?.id || undefined);
        return sameProduct && sameVariant;
      });

      if (existingIndex > -1) {
        const newItems = [...prev];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity
        };
        return newItems;
      }

      const newItem: CartItem = {
        ...product,
        variantId: variant?.id,
        variantName: variant?.name,
        finalPrice: variant ? variant.price : product.basePrice,
        quantity
      };
      
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    // Rely on the composite key generated in UI (Product ID or ProductID:::VariantID)
    // Or simpler: filter based on reconstructing the ID on the fly
    setItems(prev => {
       return prev.filter(i => {
          // Construct composite ID for the current item to match against passed ID
          const currentId = i.variantId ? `${i.id}:::${i.variantId}` : i.id;
          return currentId !== cartItemId;
       });
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems(prev => prev.map(i => {
        const currentId = i.variantId ? `${i.id}:::${i.variantId}` : i.id;
        if (currentId === itemId) {
            return { ...i, quantity: Math.max(0, i.quantity + delta) };
        }
        return i;
    }).filter(i => i.quantity > 0));
  };

  const clearCart = () => setItems([]);

  const cartTotal = useMemo(() => items.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0), [items]);
  const cartCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

  const toggleCart = (open?: boolean) => setIsCartOpen(open !== undefined ? open : !isCartOpen);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isCartOpen, toggleCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

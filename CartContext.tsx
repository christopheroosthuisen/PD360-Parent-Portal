
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
      // Create a unique ID for cart item based on product + variant
      const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;
      const existing = prev.find(i => (variant ? i.variantId === variant.id : i.id === product.id));

      if (existing) {
        return prev.map(i => i.id === product.id && i.variantId === variant?.id 
          ? { ...i, quantity: i.quantity + quantity } 
          : i
        );
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
    // Note: In our logic, cartItemId for removal needs to match how we identify items.
    // For simplicity, let's assume we filter by checking product.id AND variantId match, 
    // OR we assign a unique guid to every cart item. 
    // Let's stick to filtering by the composite key logic used in addToCart.
    // BUT `removeFromCart` receives an ID. Let's assume the UI passes the product ID or we add a `cartId` to `CartItem`.
    // Refactor: Add cartId to CartItem? Or just filter carefully.
    // Let's filter by checking if the item matches.
    // Wait, the simplest way is to just pass the index or assign a unique ID.
    // Let's generate a unique `cartId` for each item in `addToCart`? No, `types.ts` doesn't have it.
    // Let's just rebuild `items` excluding the specific product+variant combo.
    
    // Actually, simpler: The `removeFromCart` in the UI will likely pass the specific item object or we can just pass the index?
    // Let's iterate and remove.
    
    // Hack for now: Assume itemId passed is the product ID, but if variants exist this removes all variants.
    // Better: Pass a composite ID.
    
    // Let's update `removeFromCart` to take the index? No, safer to take composite ID.
    // Let's change `types.ts` later or just assume unique composite ID string is passed.
    
    // Correction: Let's update the logic to filter based on a composite check.
    // Actually, let's just filter out the exact object reference if passed? No.
    
    // Implementation: We will trust the caller passes a constructed ID like "prodId-varId" or "prodId".
    // See addToCart logic: `const cartItemId = variant ? ...` -> This isn't stored on the item though.
    // Let's just filter:
    
    setItems(prev => {
       // We need to know specifically which item.
       // Let's rely on the UI passing the index for safety in this simple implementation, 
       // OR add a temporary `uuid` to CartItem.
       // I'll assume `cartItemId` passed is `product.id` for simple items, or `product.id:::variant.id` for variants.
       
       return prev.filter(i => {
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

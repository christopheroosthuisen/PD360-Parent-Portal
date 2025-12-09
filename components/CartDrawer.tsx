
import React, { useState } from 'react';
import { ShoppingBag, X, ShoppingCart, CreditCard } from 'lucide-react';
import { useCart } from '../CartContext';
import { Button } from './UI';
import { DataService } from '../services/dataService';

export const CartDrawer: React.FC = () => {
  const { items, cartTotal, cartCount, isCartOpen, toggleCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
      setIsCheckingOut(true);
      try {
          await DataService.createShopOrder('user_1', items, cartTotal);
          clearCart();
          toggleCart(false);
          // In a real app, use a proper Toast
          alert("Order placed successfully! Check your email.");
      } catch (e) {
          console.error(e);
          alert("Failed to place order.");
      } finally {
          setIsCheckingOut(false);
      }
  };

  return (
    <>
        {isCartOpen && <div className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm" onClick={() => toggleCart(false)}></div>}
        
        <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-[101] transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <div className="p-6 bg-pd-darkblue text-white flex justify-between items-center shrink-0">
                    <h2 className="font-impact text-2xl tracking-wide uppercase flex items-center gap-2">
                        <ShoppingBag className="text-pd-yellow" /> Your Cart ({cartCount})
                    </h2>
                    <button onClick={() => toggleCart(false)} className="hover:bg-white/10 p-1 rounded transition-colors"><X /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="text-center py-12 text-pd-softgrey flex flex-col items-center">
                            <div className="w-20 h-20 bg-pd-lightest rounded-full flex items-center justify-center mb-4">
                                <ShoppingCart size={32} className="opacity-50" />
                            </div>
                            <p className="font-medium text-lg">Your cart is empty.</p>
                            <Button variant="secondary" className="mt-6" onClick={() => toggleCart(false)}>Keep Browsing</Button>
                        </div>
                    ) : (
                        items.map((item) => {
                            // Composite key handling
                            const itemId = item.variantId ? `${item.id}:::${item.variantId}` : item.id;
                            return (
                                <div key={itemId} className="flex gap-4 items-start border-b border-pd-lightest pb-4">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-pd-lightest shrink-0">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-pd-darkblue text-sm leading-tight mb-1">{item.title}</p>
                                        {item.variantName && <p className="text-[10px] text-pd-softgrey font-bold uppercase tracking-wider mb-2">{item.variantName}</p>}
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center bg-pd-lightest rounded-lg border border-pd-lightest/50">
                                                <button onClick={() => updateQuantity(itemId, -1)} className="w-8 h-8 flex items-center justify-center text-pd-darkblue hover:bg-white rounded-l-lg transition-colors">-</button>
                                                <span className="text-xs font-bold px-2 w-6 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(itemId, 1)} className="w-8 h-8 flex items-center justify-center text-pd-darkblue hover:bg-white rounded-r-lg transition-colors">+</button>
                                            </div>
                                            <span className="font-impact text-lg text-pd-darkblue">${(item.finalPrice * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFromCart(itemId)} className="text-pd-lightest hover:text-rose-500 p-1 transition-colors"><X size={18} /></button>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-6 border-t-2 border-pd-lightest bg-pd-lightest/10 shrink-0">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-pd-slate font-bold uppercase text-xs tracking-wider">Subtotal</span>
                        <span className="font-impact text-3xl text-pd-darkblue">${cartTotal.toFixed(2)}</span>
                    </div>
                    <Button 
                        variant="primary" 
                        className="w-full !py-4 text-lg shadow-xl" 
                        icon={CreditCard} 
                        disabled={items.length === 0 || isCheckingOut}
                        onClick={handleCheckout}
                    >
                        {isCheckingOut ? 'Processing...' : 'Secure Checkout'}
                    </Button>
                </div>
            </div>
        </div>
    </>
  );
};

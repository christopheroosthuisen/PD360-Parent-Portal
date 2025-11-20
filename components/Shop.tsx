
import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { Card, Button, Modal } from './UI';
import { ShoppingBag, Search, Filter, Check, Plus, Minus, X, ShoppingCart, CreditCard, Star, Info } from 'lucide-react';
import { useCart } from '../CartContext';

// --- SHOP INVENTORY CONSTANT ---
export const SHOP_INVENTORY: Product[] = [
  {
    id: 'ecollar_mini',
    title: 'Mini-Educator E-Collar',
    categoryId: 'training',
    basePrice: 209.99,
    description: 'The Mini-Educator ET-300 is a 1/2 mile remote trainer loaded with unique features making it the most humane and effective trainer available.',
    brand: 'E-Collar Technologies',
    hasVariants: true,
    variants: [
      { id: '1dog', name: '1-Dog System', price: 209.99, inStock: true },
      { id: '2dog', name: '2-Dog System', price: 309.99, inStock: true }
    ],
    image: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=800&q=80' // Placeholder
  },
  {
    id: 'prong_herm',
    title: 'Herm Sprenger Prong Collar',
    categoryId: 'training',
    basePrice: 29.99,
    description: 'High-quality German steel. Features a center plate for balanced fit and limited traction chain for correction. Crucial for communication.',
    brand: 'Herm Sprenger',
    hasVariants: true,
    variants: [
      { id: 'chrome', name: 'Chrome (2.25mm)', price: 29.99, inStock: true },
      { id: 'black', name: 'Black Stainless (2.25mm)', price: 49.99, inStock: true },
      { id: 'curogan', name: 'Curogan (Hypoallergenic)', price: 59.99, inStock: true }
    ],
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80' // Placeholder
  },
  {
    id: 'biothane_slip',
    title: 'Rolled Biothane Slip Collar',
    categoryId: 'collars',
    basePrice: 18.99,
    description: 'Waterproof, stink-proof, and gentle on fur. The rolled design prevents matting and provides a smooth release during corrections.',
    brand: 'Partners Dogs',
    hasVariants: false,
    image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80' // Placeholder
  },
  {
    id: 'pro_leash',
    title: 'Pro Trainer Slip + Snap Leash',
    categoryId: 'collars',
    basePrice: 59.99,
    description: 'Two tools in one. Features a backup snap clip for safety and a sliding leather stopper for the slip function. Premium leather.',
    brand: 'Partners Dogs',
    hasVariants: false,
    image: 'https://images.unsplash.com/photo-1551856392-f07d5203001e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ubbe',
    title: 'The Ubbe',
    categoryId: 'toys',
    basePrice: 24.99,
    description: 'Fillable enrichment toy. Perfect for freezing meals to extend eating time and provide mental stimulation.',
    brand: 'Fable',
    hasVariants: false,
    image: 'https://images.unsplash.com/photo-1585846416120-3a7354ed7d39?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'odin',
    title: 'The Odin',
    categoryId: 'toys',
    basePrice: 22.99,
    description: 'Modular puzzle toy. Connect multiple Odins to increase difficulty. Great for nose work and problem solving.',
    brand: 'Up Dog',
    hasVariants: false,
    image: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=800&q=80'
  }
];

export const Shop: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'training' | 'collars' | 'toys'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, items, cartTotal, cartCount, isCartOpen, toggleCart, removeFromCart, updateQuantity } = useCart();

  const filteredProducts = SHOP_INVENTORY.filter(p => {
    const matchCat = activeCategory === 'all' || p.categoryId === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    // Default to first variant if exists
    if (product.hasVariants && product.variants) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, selectedVariant || undefined);
      setSelectedProduct(null); // Close modal
    }
  };

  // Cart Drawer Component
  const CartDrawer = () => (
    <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-[60] transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
       <div className="flex flex-col h-full">
          <div className="p-6 bg-pd-darkblue text-white flex justify-between items-center">
             <h2 className="font-impact text-2xl tracking-wide uppercase flex items-center gap-2">
               <ShoppingBag /> Your Cart ({cartCount})
             </h2>
             <button onClick={() => toggleCart(false)}><X /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             {items.length === 0 ? (
                <div className="text-center py-12 text-pd-softgrey">
                   <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                   <p className="font-medium">Your cart is empty.</p>
                   <Button variant="secondary" className="mt-4" onClick={() => toggleCart(false)}>Start Shopping</Button>
                </div>
             ) : (
                items.map((item) => {
                   const itemId = item.variantId ? `${item.id}:::${item.variantId}` : item.id;
                   return (
                      <div key={itemId} className="flex gap-4 items-start border-b border-pd-lightest pb-4">
                         <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover border border-pd-lightest" />
                         <div className="flex-1">
                            <p className="font-bold text-pd-darkblue text-sm">{item.title}</p>
                            {item.variantName && <p className="text-xs text-pd-softgrey font-bold uppercase">{item.variantName}</p>}
                            <div className="flex justify-between items-center mt-2">
                               <div className="flex items-center bg-pd-lightest rounded-lg">
                                  <button onClick={() => updateQuantity(itemId, -1)} className="px-2 py-1 text-pd-darkblue hover:bg-pd-softgrey/20 rounded-l-lg">-</button>
                                  <span className="text-xs font-bold px-2">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(itemId, 1)} className="px-2 py-1 text-pd-darkblue hover:bg-pd-softgrey/20 rounded-r-lg">+</button>
                               </div>
                               <span className="font-impact text-pd-darkblue">${(item.finalPrice * item.quantity).toFixed(2)}</span>
                            </div>
                         </div>
                         <button onClick={() => removeFromCart(itemId)} className="text-pd-lightest hover:text-rose-500"><X size={16} /></button>
                      </div>
                   );
                })
             )}
          </div>

          <div className="p-6 border-t-2 border-pd-lightest bg-pd-lightest/10">
             <div className="flex justify-between items-end mb-4">
                <span className="text-pd-slate font-bold uppercase text-xs tracking-wider">Total</span>
                <span className="font-impact text-3xl text-pd-darkblue">${cartTotal.toFixed(2)}</span>
             </div>
             <Button variant="primary" className="w-full !py-4" icon={CreditCard} disabled={items.length === 0}>
                Checkout
             </Button>
          </div>
       </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 relative">
      {/* Overlay for Cart */}
      {isCartOpen && <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => toggleCart(false)}></div>}
      <CartDrawer />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
         <div>
            <h1 className="font-impact text-5xl text-pd-darkblue tracking-wide uppercase mb-2">PRO SHOP</h1>
            <p className="text-pd-slate text-lg font-medium">Curated professional tools for your training journey.</p>
         </div>
         <div className="flex items-center gap-3">
            <div className="relative">
               <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-pd-softgrey" />
               <input 
                 type="text" 
                 placeholder="Search gear..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-10 pr-4 py-2.5 bg-white border-2 border-pd-lightest rounded-xl focus:outline-none focus:border-pd-teal text-pd-darkblue font-medium w-full md:w-64"
               />
            </div>
            <button 
               onClick={() => toggleCart(true)}
               className="relative p-3 bg-pd-darkblue text-white rounded-xl hover:bg-pd-teal transition-colors shadow-lg"
            >
               <ShoppingBag size={24} />
               {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pd-yellow text-pd-darkblue text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                     {cartCount}
                  </span>
               )}
            </button>
         </div>
      </div>

      {/* Categories */}
      <div className="flex gap-4 overflow-x-auto pb-2">
         {[
            { id: 'all', label: 'All Products' },
            { id: 'training', label: 'Training & Behavior' },
            { id: 'collars', label: 'Collars & Leashes' },
            { id: 'toys', label: 'Health & Enrichment' }
         ].map(cat => (
            <button 
               key={cat.id}
               onClick={() => setActiveCategory(cat.id as any)}
               className={`px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase whitespace-nowrap transition-all border-2 ${
                  activeCategory === cat.id 
                  ? 'bg-pd-darkblue text-white border-pd-darkblue shadow-md' 
                  : 'bg-white text-pd-softgrey border-pd-lightest hover:text-pd-darkblue hover:border-pd-darkblue'
               }`}
            >
               {cat.label}
            </button>
         ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {filteredProducts.map(product => (
            <Card 
               key={product.id} 
               onClick={() => handleProductClick(product)}
               className="group bg-white border-2 border-pd-lightest hover:border-pd-teal hover:shadow-xl transition-all cursor-pointer !p-0 overflow-hidden flex flex-col h-full"
            >
               <div className="relative h-64 overflow-hidden bg-pd-lightest">
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {product.hasVariants && (
                     <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase px-2 py-1 rounded-lg">
                        Options Available
                     </div>
                  )}
               </div>
               <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-1">{product.brand}</p>
                  <h3 className="font-impact text-xl text-pd-darkblue tracking-wide leading-tight mb-2">{product.title}</h3>
                  <p className="text-sm text-pd-slate mb-4 line-clamp-2 flex-1">{product.description}</p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-pd-lightest mt-auto">
                     <div>
                        <p className="text-[10px] font-bold text-pd-softgrey uppercase tracking-wider">Starting at</p>
                        <p className="font-impact text-2xl text-pd-teal">${product.basePrice}</p>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-pd-lightest group-hover:bg-pd-darkblue group-hover:text-white flex items-center justify-center transition-colors text-pd-darkblue">
                        <Plus size={20} strokeWidth={3} />
                     </div>
                  </div>
               </div>
            </Card>
         ))}
      </div>

      {/* Product Modal */}
      <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} title="Product Details">
         {selectedProduct && (
            <div className="space-y-6">
               <div className="rounded-2xl overflow-hidden border-2 border-pd-lightest">
                  <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-64 object-cover" />
               </div>
               
               <div>
                  <div className="flex justify-between items-start mb-2">
                     <div>
                        <p className="text-xs font-bold text-pd-teal uppercase tracking-wider mb-1">{selectedProduct.brand}</p>
                        <h2 className="font-impact text-3xl text-pd-darkblue uppercase">{selectedProduct.title}</h2>
                     </div>
                     <div className="text-right">
                        <p className="font-impact text-3xl text-pd-darkblue">
                           ${selectedVariant ? selectedVariant.price : selectedProduct.basePrice}
                        </p>
                     </div>
                  </div>
                  <p className="text-pd-slate font-medium leading-relaxed text-sm mb-6">
                     {selectedProduct.description}
                  </p>

                  {/* Variants */}
                  {selectedProduct.hasVariants && selectedProduct.variants && (
                     <div className="space-y-3 mb-8">
                        <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wider">Select Configuration</p>
                        <div className="grid gap-3">
                           {selectedProduct.variants.map(variant => (
                              <div 
                                 key={variant.id}
                                 onClick={() => setSelectedVariant(variant)}
                                 className={`flex justify-between items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                    selectedVariant?.id === variant.id 
                                    ? 'border-pd-teal bg-pd-teal/5 shadow-sm' 
                                    : 'border-pd-lightest hover:border-pd-softgrey'
                                 }`}
                              >
                                 <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedVariant?.id === variant.id ? 'border-pd-teal' : 'border-pd-softgrey'}`}>
                                       {selectedVariant?.id === variant.id && <div className="w-2.5 h-2.5 bg-pd-teal rounded-full"></div>}
                                    </div>
                                    <span className={`text-sm font-bold ${selectedVariant?.id === variant.id ? 'text-pd-darkblue' : 'text-pd-slate'}`}>
                                       {variant.name}
                                    </span>
                                 </div>
                                 <span className="font-mono text-sm font-bold text-pd-slate">${variant.price}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  <Button variant="primary" className="w-full !py-4 !text-lg shadow-lg" icon={ShoppingBag} onClick={handleAddToCart}>
                     Add to Cart - ${(selectedVariant ? selectedVariant.price : selectedProduct.basePrice).toFixed(2)}
                  </Button>
               </div>
            </div>
         )}
      </Modal>
    </div>
  );
};

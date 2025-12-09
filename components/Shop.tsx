
import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types';
import { Card, Button, Modal } from './UI';
import { ShoppingBag, Search, Plus, Loader, Filter } from 'lucide-react';
import { useCart } from '../CartContext';
import { DataService } from '../services/dataService';

export const Shop: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'training' | 'collars' | 'toys'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inventory State (Async)
  const [inventory, setInventory] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart, cartCount, toggleCart } = useCart();

  // Fetch Data on Mount
  useEffect(() => {
    const loadShop = async () => {
      setIsLoading(true);
      try {
        const products = await DataService.fetchShopItems();
        setInventory(products);
      } catch (error) {
        console.error("Failed to load shop", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadShop();
  }, []);

  const filteredProducts = inventory.filter(p => {
    const matchCat = activeCategory === 'all' || p.categoryId === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    if (product.hasVariants && product.variants) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, selectedVariant || undefined);
      setSelectedProduct(null); 
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
         <div>
            <h1 className="font-impact text-5xl text-pd-darkblue tracking-wide uppercase mb-2">SHOP</h1>
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
                 className="pl-10 pr-4 py-3 bg-white border-2 border-pd-lightest rounded-xl focus:outline-none focus:border-pd-teal text-pd-darkblue font-medium w-full md:w-64"
               />
            </div>
            <button 
               onClick={() => toggleCart(true)}
               className="relative p-3 bg-pd-darkblue text-white rounded-xl hover:bg-pd-teal transition-colors shadow-lg group"
            >
               <ShoppingBag size={24} />
               {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pd-yellow text-pd-darkblue text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
                     {cartCount}
                  </span>
               )}
            </button>
         </div>
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
         {[
            { id: 'all', label: 'All Products' },
            { id: 'training', label: 'Training' },
            { id: 'collars', label: 'Collars & Leashes' },
            { id: 'toys', label: 'Health' }
         ].map(cat => (
            <button 
               key={cat.id}
               onClick={() => setActiveCategory(cat.id as any)}
               className={`px-5 py-2.5 rounded-xl font-impact text-base tracking-wide uppercase whitespace-nowrap transition-all border-2 ${
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
      {isLoading ? (
         <div className="min-h-[400px] flex items-center justify-center">
            <Loader size={40} className="text-pd-teal animate-spin" />
         </div>
      ) : (
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
                           Options
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
      )}

      {/* Product Modal */}
      <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} title="Product Details">
         {selectedProduct && (
            <div className="space-y-6">
               <div className="rounded-2xl overflow-hidden border-2 border-pd-lightest relative">
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

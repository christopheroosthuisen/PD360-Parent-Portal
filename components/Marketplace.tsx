
import React, { useState, useEffect } from 'react';
import { DogData } from '../types';
import { Shop } from './Shop';
import { Coaching } from './Coaching';
import { Booking } from './Booking';
import { ShoppingBag, User, Ticket, Store } from 'lucide-react';

interface MarketplaceProps {
  dogData: DogData;
  initialTab?: 'shop' | 'pros' | 'spots';
}

export const Marketplace: React.FC<MarketplaceProps> = ({ dogData, initialTab = 'spots' }) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'pros' | 'spots'>(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Navigation */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b-2 border-pd-lightest pb-6">
         <div>
            <h1 className="font-impact text-4xl text-pd-darkblue tracking-wide uppercase mb-1">THE MARKETPLACE</h1>
            <p className="text-pd-slate font-medium text-lg">Everything you need for the journey. Gear, guidance, and getaways.</p>
         </div>

        {/* Custom Tab Switcher */}
        <div className="bg-white p-1.5 rounded-2xl border-2 border-pd-lightest flex shadow-sm overflow-x-auto max-w-full no-scrollbar">
            <button 
               onClick={() => setActiveTab('spots')}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase transition-all whitespace-nowrap ${
                  activeTab === 'spots' 
                  ? 'bg-pd-darkblue text-white shadow-md' 
                  : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-pd-lightest'
               }`}
            >
               <Ticket size={20} className={activeTab === 'spots' ? 'text-pd-yellow' : ''} />
               Spots
            </button>
            <button 
               onClick={() => setActiveTab('pros')}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase transition-all whitespace-nowrap ${
                  activeTab === 'pros' 
                  ? 'bg-pd-darkblue text-white shadow-md' 
                  : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-pd-lightest'
               }`}
            >
               <User size={20} className={activeTab === 'pros' ? 'text-pd-yellow' : ''} />
               Pros
            </button>
            <button 
               onClick={() => setActiveTab('shop')}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase transition-all whitespace-nowrap ${
                  activeTab === 'shop' 
                  ? 'bg-pd-darkblue text-white shadow-md' 
                  : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-pd-lightest'
               }`}
            >
               <ShoppingBag size={20} className={activeTab === 'shop' ? 'text-pd-yellow' : ''} />
               Shop
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-4">
         {activeTab === 'spots' && <Booking dogData={dogData} />}
         {activeTab === 'pros' && <Coaching />}
         {activeTab === 'shop' && <Shop />}
      </div>
    </div>
  );
};

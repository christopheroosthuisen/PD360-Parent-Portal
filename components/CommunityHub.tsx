
import React, { useState, useEffect } from 'react';
import { DogData } from '../types';
import { Community } from './Community';
import { Coaching } from './Coaching';
import { Booking } from './Booking';
import { Packs } from './Packs';
import { Users, CalendarCheck, Ticket, Tent } from 'lucide-react';

interface CommunityHubProps {
  dogData: DogData;
  defaultTab?: 'feed' | 'coaching' | 'reservations' | 'packs';
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ dogData, defaultTab = 'feed' }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'coaching' | 'reservations' | 'packs'>(defaultTab);

  useEffect(() => {
     if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Unified Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-impact text-5xl text-pd-darkblue tracking-wide uppercase mb-2">COMMUNITY & SUPPORT</h1>
          <p className="text-pd-slate text-lg font-medium">Connect with the pack, find a coach, or book services.</p>
        </div>
        
        {/* Custom Tab Switcher */}
        <div className="bg-white p-1.5 rounded-2xl border-2 border-pd-lightest flex shadow-sm overflow-x-auto max-w-full no-scrollbar">
            <button 
               onClick={() => setActiveTab('feed')}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase transition-all whitespace-nowrap ${
                  activeTab === 'feed' 
                  ? 'bg-pd-darkblue text-white shadow-md' 
                  : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-pd-lightest'
               }`}
            >
               <Users size={20} className={activeTab === 'feed' ? 'text-pd-yellow' : ''} />
               Social Feed
            </button>
            <button 
               onClick={() => setActiveTab('packs')}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase transition-all whitespace-nowrap ${
                  activeTab === 'packs' 
                  ? 'bg-pd-darkblue text-white shadow-md' 
                  : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-pd-lightest'
               }`}
            >
               <Tent size={20} className={activeTab === 'packs' ? 'text-pd-yellow' : ''} />
               The Pack
            </button>
            <button 
               onClick={() => setActiveTab('coaching')}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase transition-all whitespace-nowrap ${
                  activeTab === 'coaching' 
                  ? 'bg-pd-darkblue text-white shadow-md' 
                  : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-pd-lightest'
               }`}
            >
               <CalendarCheck size={20} className={activeTab === 'coaching' ? 'text-pd-yellow' : ''} />
               Coaching
            </button>
            <button 
               onClick={() => setActiveTab('reservations')}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase transition-all whitespace-nowrap ${
                  activeTab === 'reservations' 
                  ? 'bg-pd-darkblue text-white shadow-md' 
                  : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-pd-lightest'
               }`}
            >
               <Ticket size={20} className={activeTab === 'reservations' ? 'text-pd-yellow' : ''} />
               Reservations
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-8">
         {activeTab === 'feed' && <Community dogData={dogData} />}
         {activeTab === 'packs' && <Packs />}
         {activeTab === 'coaching' && <Coaching />}
         {activeTab === 'reservations' && <Booking dogData={dogData} />}
      </div>
    </div>
  );
};

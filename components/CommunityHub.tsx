
import React, { useState, useEffect } from 'react';
import { DogData } from '../types';
import { Community } from './Community';
import { Packs } from './Packs';
import { Users, Tent } from 'lucide-react';

interface CommunityHubProps {
  dogData: DogData;
  defaultTab?: 'feed' | 'packs';
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ dogData, defaultTab = 'feed' }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'packs'>(defaultTab);

  useEffect(() => {
     if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Streamlined Header & Nav */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b-2 border-pd-lightest pb-6">
        <div>
            <h1 className="font-impact text-4xl text-pd-darkblue tracking-wide uppercase mb-1">SOCIALS</h1>
            <p className="text-pd-slate font-medium text-lg">Connect with the pack, share wins, and find your tribe.</p>
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
               Feed
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
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-2">
         {activeTab === 'feed' && <Community dogData={dogData} />}
         {activeTab === 'packs' && <Packs />}
      </div>
    </div>
  );
};

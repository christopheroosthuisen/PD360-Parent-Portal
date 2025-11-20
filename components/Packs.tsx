
import React, { useState } from 'react';
import { Pack } from '../types';
import { Card, Button, Modal } from './UI';
import { 
  Tent, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  Lock, 
  Globe, 
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Settings
} from 'lucide-react';

// --- Mock Data for Packs ---
const MOCK_PACKS: Pack[] = [
  {
    id: 'p1',
    name: 'Scottsdale Retrievers',
    category: 'Breed',
    image: 'https://images.unsplash.com/photo-1558929996-da64ba858315?auto=format&fit=crop&w=400&q=80',
    membersCount: 142,
    location: 'Scottsdale, AZ',
    isPrivate: false,
    isMember: true,
    description: 'A group for Goldens, Labs, and doodles to meet up for play dates and swim sessions.',
    nextEvent: 'Sunday Swim @ 10am'
  },
  {
    id: 'p2',
    name: 'Agility All-Stars',
    category: 'Training',
    image: 'https://images.unsplash.com/photo-1535008652995-e95986556e32?auto=format&fit=crop&w=400&q=80',
    membersCount: 56,
    location: 'Phoenix Campus',
    isPrivate: true,
    isMember: false,
    description: 'Competitive agility team. Focus on weave poles, A-frame, and advanced handling.',
  },
  {
    id: 'p3',
    name: 'Puppy Class of \'24',
    category: 'Training',
    image: 'https://images.unsplash.com/photo-1591160690555-5debfba600f2?auto=format&fit=crop&w=400&q=80',
    membersCount: 28,
    isPrivate: true,
    isMember: true,
    description: 'Support group for all puppy parents graduating in 2024. Share wins and potty training woes.',
  },
  {
    id: 'p4',
    name: 'Hiking Hounds',
    category: 'Interest',
    image: 'https://images.unsplash.com/photo-1551651767-d50727b54f4b?auto=format&fit=crop&w=400&q=80',
    membersCount: 315,
    location: 'Arizona',
    isPrivate: false,
    isMember: false,
    description: 'Exploring the best trails in AZ. Leashes required. Rattlesnake avoidance training recommended.',
  },
  {
    id: 'p5',
    name: 'Frenchie Friends',
    category: 'Breed',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
    membersCount: 89,
    location: 'Tempe, AZ',
    isPrivate: false,
    isMember: false,
    description: 'Snorts, snacks, and short walks. The official French Bulldog club of Tempe.',
  }
];

export const Packs: React.FC = () => {
  const [view, setView] = useState<'discover' | 'detail'>('discover');
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Form State
  const [newPackName, setNewPackName] = useState('');
  const [newPackCategory, setNewPackCategory] = useState('Interest');

  const myPacks = MOCK_PACKS.filter(p => p.isMember);
  const discoverPacks = MOCK_PACKS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePackClick = (pack: Pack) => {
    setSelectedPack(pack);
    setView('detail');
  };

  const handleJoinToggle = (packId: string) => {
    // In a real app, this would make an API call
    // For now, we just toggle local state in the mock (visually)
    if (selectedPack && selectedPack.id === packId) {
        setSelectedPack({ ...selectedPack, isMember: !selectedPack.isMember });
    }
  };

  const handleCreatePack = () => {
      setIsCreateModalOpen(false);
      // Logic to create pack would go here
      setNewPackName('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       
       {/* MAIN VIEW: DISCOVER & MY PACKS */}
       {view === 'discover' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* LEFT: Discover */}
             <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                   <h2 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide">Discover Packs</h2>
                   <Button variant="primary" icon={Plus} onClick={() => setIsCreateModalOpen(true)} className="!py-2 !px-4 !text-sm">Create Pack</Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <input 
                       type="text" 
                       placeholder="Search for breeds, activities, or locations..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-12 pr-4 py-3 bg-white border-2 border-pd-lightest rounded-xl focus:outline-none focus:border-pd-teal text-pd-darkblue font-medium placeholder-pd-softgrey shadow-sm"
                    />
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-pd-softgrey" />
                </div>

                {/* Pack Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {discoverPacks.map(pack => (
                      <Card 
                         key={pack.id} 
                         onClick={() => handlePackClick(pack)}
                         className="!p-0 overflow-hidden border-2 border-pd-lightest hover:border-pd-teal hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full bg-white"
                      >
                         <div className="h-32 bg-pd-lightest relative overflow-hidden">
                            <img src={pack.image} alt={pack.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-pd-darkblue/80 to-transparent"></div>
                            <div className="absolute bottom-3 left-4 text-white">
                               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider mb-1">
                                  <span className="bg-pd-teal px-2 py-0.5 rounded">{pack.category}</span>
                                  {pack.isPrivate && <span className="flex items-center gap-1"><Lock size={10} /> Private</span>}
                               </div>
                               <h3 className="font-impact text-xl tracking-wide">{pack.name}</h3>
                            </div>
                         </div>
                         <div className="p-4 flex flex-col flex-1">
                            <p className="text-pd-slate text-sm font-medium line-clamp-2 mb-4 flex-1">{pack.description}</p>
                            <div className="flex items-center justify-between text-xs font-bold text-pd-softgrey uppercase tracking-wide border-t border-pd-lightest pt-3">
                               <div className="flex items-center gap-1">
                                  <Users size={14} /> {pack.membersCount} Members
                               </div>
                               {pack.location && (
                                  <div className="flex items-center gap-1">
                                     <MapPin size={14} /> {pack.location}
                                  </div>
                               )}
                            </div>
                         </div>
                      </Card>
                   ))}
                </div>
             </div>

             {/* RIGHT: My Packs Sidebar */}
             <div className="space-y-6">
                <Card className="bg-pd-darkblue text-white border-none relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-pd-teal rounded-full opacity-10 -mr-10 -mt-10 blur-2xl"></div>
                   <div className="relative z-10 flex items-center gap-3 mb-6">
                      <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                         <Tent size={24} className="text-pd-yellow" />
                      </div>
                      <h3 className="font-impact text-2xl tracking-wide uppercase">MY PACKS</h3>
                   </div>
                   
                   <div className="space-y-3 relative z-10">
                      {myPacks.map(pack => (
                         <div 
                            key={pack.id} 
                            onClick={() => handlePackClick(pack)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
                         >
                            <img src={pack.image} alt={pack.name} className="w-10 h-10 rounded-lg object-cover border border-white/20" />
                            <div className="flex-1 min-w-0">
                               <p className="font-bold text-sm truncate group-hover:text-pd-teal transition-colors">{pack.name}</p>
                               {pack.nextEvent ? (
                                  <p className="text-[10px] text-pd-yellow font-medium truncate">Upcoming: {pack.nextEvent}</p>
                               ) : (
                                  <p className="text-[10px] text-pd-lightest/60 font-medium truncate">{pack.membersCount} Members</p>
                               )}
                            </div>
                            <ChevronRight size={16} className="text-pd-lightest/30 group-hover:text-white" />
                         </div>
                      ))}
                      {myPacks.length === 0 && (
                         <div className="text-center py-4 text-pd-lightest/50 text-sm italic">
                            You haven't joined any packs yet.
                         </div>
                      )}
                   </div>
                </Card>

                <div className="bg-white rounded-2xl p-6 border-2 border-pd-lightest text-center">
                   <h4 className="font-impact text-xl text-pd-darkblue uppercase mb-2">Start a Movement</h4>
                   <p className="text-pd-slate text-sm font-medium mb-4">Can't find your tribe? Create a new pack for your breed or interest.</p>
                   <Button variant="secondary" className="w-full" onClick={() => setIsCreateModalOpen(true)}>Create New Pack</Button>
                </div>
             </div>
          </div>
       )}

       {/* DETAIL VIEW */}
       {view === 'detail' && selectedPack && (
          <div className="animate-in slide-in-from-right duration-300">
             <Button variant="ghost" icon={ArrowLeft} onClick={() => setView('discover')} className="mb-4 pl-0 hover:bg-transparent">Back to Discover</Button>
             
             <div className="bg-white rounded-3xl border-2 border-pd-lightest overflow-hidden">
                {/* Banner */}
                <div className="h-64 relative">
                   <img src={selectedPack.image} alt={selectedPack.name} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-pd-darkblue to-transparent opacity-90"></div>
                   <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
                      <div>
                         <div className="flex items-center gap-3 mb-2">
                            <span className="bg-pd-teal text-pd-darkblue text-xs font-black uppercase px-3 py-1 rounded-lg">{selectedPack.category}</span>
                            {selectedPack.isPrivate ? (
                               <span className="flex items-center gap-1 text-white/80 text-xs font-bold uppercase tracking-wide"><Lock size={12} /> Private Group</span>
                            ) : (
                               <span className="flex items-center gap-1 text-white/80 text-xs font-bold uppercase tracking-wide"><Globe size={12} /> Public Group</span>
                            )}
                         </div>
                         <h1 className="font-impact text-5xl text-white tracking-wide uppercase mb-2">{selectedPack.name}</h1>
                         <div className="flex items-center gap-4 text-pd-lightest font-medium text-sm">
                             <span className="flex items-center gap-1"><Users size={16} /> {selectedPack.membersCount} Members</span>
                             {selectedPack.location && <span className="flex items-center gap-1"><MapPin size={16} /> {selectedPack.location}</span>}
                         </div>
                      </div>
                      <Button 
                         variant={selectedPack.isMember ? "secondary" : "primary"} 
                         className={selectedPack.isMember ? "!bg-white/20 !text-white !border-transparent hover:!bg-white/30" : "!px-8 !py-3 !text-lg shadow-lg"}
                         onClick={() => handleJoinToggle(selectedPack.id)}
                      >
                         {selectedPack.isMember ? "Leave Pack" : "Join Pack"}
                      </Button>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3">
                   <div className="lg:col-span-2 p-8 border-r-2 border-pd-lightest">
                      <h3 className="font-impact text-2xl text-pd-darkblue uppercase mb-4">About This Pack</h3>
                      <p className="text-pd-slate font-medium leading-relaxed mb-8">{selectedPack.description}</p>
                      
                      <h3 className="font-impact text-2xl text-pd-darkblue uppercase mb-4">Pack Rules</h3>
                      <ul className="space-y-3 mb-8">
                         {['Respect all members and their dogs.', 'No aggressive behavior allowed.', 'Clean up after your dog during meetups.'].map((rule, i) => (
                            <li key={i} className="flex items-start gap-3 text-pd-slate font-medium">
                               <CheckCircle2 size={20} className="text-pd-teal shrink-0" />
                               {rule}
                            </li>
                         ))}
                      </ul>
                   </div>
                   <div className="p-8 bg-pd-lightest/10">
                      <h3 className="font-impact text-2xl text-pd-darkblue uppercase mb-4">Members</h3>
                      <div className="flex flex-wrap gap-2 mb-6">
                         {[1,2,3,4,5,6,7,8].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full bg-pd-lightest border-2 border-white overflow-hidden">
                               <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="Member" className="w-full h-full object-cover" />
                            </div>
                         ))}
                         <div className="w-10 h-10 rounded-full bg-pd-lightest border-2 border-white flex items-center justify-center text-xs font-bold text-pd-softgrey">
                            +100
                         </div>
                      </div>
                      
                      {selectedPack.isMember && (
                          <div className="p-4 bg-white rounded-xl border-2 border-pd-lightest text-center">
                              <Settings size={24} className="mx-auto text-pd-softgrey mb-2" />
                              <p className="text-xs font-bold text-pd-slate uppercase tracking-wide mb-3">Admin Tools</p>
                              <p className="text-xs text-pd-softgrey">You are a member.</p>
                          </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
       )}

       {/* CREATE MODAL */}
       <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Start a Pack">
           <div className="space-y-6">
               <div>
                   <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Pack Name</label>
                   <input 
                      type="text" 
                      value={newPackName}
                      onChange={e => setNewPackName(e.target.value)}
                      placeholder="e.g. Downtown Doodles"
                      className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none font-medium text-pd-darkblue"
                   />
               </div>
               <div>
                   <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Category</label>
                   <select 
                      value={newPackCategory}
                      onChange={e => setNewPackCategory(e.target.value)}
                      className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none font-medium text-pd-darkblue"
                   >
                      <option>Interest</option>
                      <option>Breed</option>
                      <option>Location</option>
                      <option>Training</option>
                   </select>
               </div>
               <div>
                   <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Privacy</label>
                   <div className="flex gap-3">
                      <button className="flex-1 p-3 rounded-xl border-2 border-pd-teal bg-pd-teal/10 text-pd-darkblue font-bold text-sm">Public</button>
                      <button className="flex-1 p-3 rounded-xl border-2 border-pd-lightest text-pd-slate font-bold text-sm hover:bg-pd-lightest">Private</button>
                   </div>
               </div>
               <Button variant="primary" className="w-full !py-3" onClick={handleCreatePack}>Create Pack</Button>
           </div>
       </Modal>
    </div>
  );
};

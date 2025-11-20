
import React, { useState, useEffect } from 'react';
import { PHASES } from '../constants';
import { Dog, Activity, Trophy, Calendar, Video, ClipboardList, Menu, X, User, Plus, ChevronDown, Users, BookOpen, CalendarCheck, Settings, Edit3, Ticket, ChevronRight, Target, ImageIcon, Sparkles, Loader } from 'lucide-react';
import { DogData } from '../types';
import { generateImage } from '../services/gemini';

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-pd-lightest rounded-3xl p-6 md:p-8 ${className}`}>
    {children}
  </div>
);

export interface CategoryCardProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  progress?: number;
  stats?: string;
  onClick: () => void;
  color?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ title, subtitle, icon: Icon, progress, stats, onClick, color = "text-pd-darkblue" }) => (
  <div 
    onClick={onClick}
    className="bg-white p-8 rounded-3xl border-2 border-pd-lightest hover:border-pd-teal hover:shadow-xl transition-all cursor-pointer group flex flex-col items-center text-center h-full"
  >
    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 bg-pd-lightest/30 ${color}`}>
       <Icon size={40} strokeWidth={1.5} />
    </div>
    
    <h3 className="font-impact text-2xl text-pd-darkblue tracking-wide uppercase mb-2 group-hover:text-pd-teal transition-colors">{title}</h3>
    
    {subtitle && <p className="text-pd-slate text-sm font-medium mb-4 leading-relaxed line-clamp-2">{subtitle}</p>}
    
    <div className="mt-auto w-full">
      {stats && <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-2">{stats}</p>}
      
      {progress !== undefined && (
        <div className="w-full h-2 bg-pd-lightest rounded-full overflow-hidden">
           <div 
             className="h-full bg-pd-teal rounded-full transition-all duration-500" 
             style={{ width: `${progress}%` }}
           />
        </div>
      )}
    </div>
  </div>
);

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'gemini';
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  icon?: React.ElementType;
  disabled?: boolean;
  as?: 'button' | 'label';
  htmlFor?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = "primary", onClick, className = "", icon: Icon, disabled = false, as = 'button', htmlFor }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-bold font-impact tracking-wide transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer uppercase text-sm md:text-base active:scale-[0.98]";
  
  const variants = {
    primary: "bg-pd-darkblue text-white border-b-4 border-pd-teal hover:border-pd-yellow hover:-translate-y-0.5 hover:shadow-lg active:border-b-0 active:translate-y-1 active:mt-1",
    secondary: "bg-white text-pd-darkblue border-b-4 border-pd-lightest hover:border-pd-darkblue hover:-translate-y-0.5 hover:shadow-md active:border-b-0 active:translate-y-1 active:mt-1 border-2 border-t-transparent border-l-transparent border-r-transparent",
    ghost: "bg-transparent text-pd-slate hover:text-pd-darkblue hover:bg-pd-lightest",
    accent: "bg-pd-teal text-pd-darkblue border-b-4 border-pd-darkblue hover:border-white hover:-translate-y-0.5 hover:shadow-lg hover:text-white active:border-b-0 active:translate-y-1 active:mt-1",
    gemini: "bg-gradient-to-r from-pd-darkblue to-purple-900 text-white border-b-4 border-purple-500 hover:border-pd-yellow hover:-translate-y-0.5 hover:shadow-lg active:border-b-0 active:translate-y-1 active:mt-1"
  };
  
  if (as === 'label') {
    return (
      <label htmlFor={htmlFor} className={`${baseStyle} ${variants[variant]} ${className}`} onClick={onClick}>
        {Icon && <Icon size={20} />}
        {children}
      </label>
    );
  }
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

export const getLevelColor = (level: number) => {
  switch(level) {
    case 1: return "bg-pd-softgrey";
    case 2: return "bg-pd-darkblue";
    case 3: return "bg-pd-yellow";
    case 4: return "bg-pd-teal";
    case 5: return "bg-emerald-500";
    default: return "bg-pd-softgrey";
  }
};

export const PD360PhaseBar: React.FC<{ level: number; type: 'STANDARD' | 'INAPPROPRIATE' }> = ({ level, type }) => {
  const config = PHASES[type];
  const currentPhase = config[level];
  const activeColor = getLevelColor(level);

  return (
    <div className="w-full space-y-2">
      <div className="flex gap-1 h-2.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-full transition-all duration-500 ${i <= level ? activeColor : "bg-pd-lightest border border-pd-softgrey/10"}`} 
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-xs font-sans">
        <span className="font-bold text-pd-darkblue uppercase tracking-wide">
          {currentPhase.label}
        </span>
        <span className="text-pd-slate italic hidden sm:inline font-medium opacity-80">{currentPhase.desc}</span>
      </div>
    </div>
  );
};

export const ProgressBar: React.FC<{ progress: number; label?: string; className?: string }> = ({ progress, label, className = "" }) => (
  <div className={`w-full ${className}`}>
    <div className="flex justify-between mb-2 items-end">
       {label && <span className="text-xs font-bold text-pd-darkblue uppercase tracking-wide animate-pulse">{label}</span>}
       <span className="text-xs font-bold text-pd-teal font-mono">{Math.round(progress)}%</span>
    </div>
    <div className="h-3 w-full bg-pd-lightest rounded-full overflow-hidden border border-pd-lightest">
       <div
         className="h-full bg-gradient-to-r from-pd-teal to-emerald-400 transition-all duration-300 ease-out rounded-full relative"
         style={{ width: `${progress}%` }}
       >
          <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_1s_infinite] skew-x-12" style={{backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem'}}></div>
       </div>
    </div>
  </div>
);

export const SkillVisual: React.FC<{ skillName: string; dogData: DogData; className?: string }> = ({ skillName, dogData, className = "" }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setLoading(true);
    // Use specific description for dog visualization
    const prompt = `Cartoon illustration of a ${dogData.color} ${dogData.breeds.join(' ')} dog performing the "${skillName}" training behavior. Friendly, flat vector style, clean background.`;
    const url = await generateImage(prompt);
    if (url) setImageUrl(url);
    setLoading(false);
  };

  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden rounded-2xl ${className} group`}>
        <img src={imageUrl} alt={skillName} className="w-full h-full object-cover" />
        <button 
          onClick={handleGenerate}
          className="absolute bottom-2 right-2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-pd-darkblue"
          title="Regenerate"
        >
          <Sparkles size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-pd-lightest/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center border-2 border-pd-lightest border-dashed group hover:border-pd-teal/50 transition-colors ${className}`} onClick={(e) => e.stopPropagation()}>
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-pd-softgrey group-hover:text-pd-teal transition-colors">
         {loading ? <Loader size={24} className="animate-spin" /> : <ImageIcon size={24} />}
      </div>
      <p className="text-xs font-bold text-pd-slate uppercase tracking-wide mb-3">No Visual Yet</p>
      <Button variant="secondary" onClick={handleGenerate} disabled={loading} className="!py-2 !px-4 !text-xs">
         {loading ? "Drawing..." : "Visualize"}
      </Button>
    </div>
  );
};

export const AppLoadingScreen: React.FC = () => (
  <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-4">
    <div className="relative w-32 h-32 mb-8">
       <div className="absolute inset-0 bg-pd-teal/10 rounded-full animate-ping duration-1000"></div>
       <div className="absolute inset-4 bg-pd-yellow/20 rounded-full animate-ping delay-300 duration-1000"></div>
       <div className="relative w-full h-full bg-white border-4 border-pd-lightest rounded-full flex items-center justify-center shadow-xl z-10 overflow-hidden">
          <div className="text-6xl animate-bounce">🐕</div>
       </div>
    </div>
    <h1 className="font-impact text-4xl md:text-5xl text-pd-darkblue tracking-wide mb-2 uppercase text-center">
      PARTNERS DOGS <span className="text-pd-teal">360</span>
    </h1>
    <div className="w-48 md:w-64 h-1.5 bg-pd-lightest rounded-full overflow-hidden mt-4">
       <div className="h-full bg-pd-darkblue animate-[loading_1.5s_ease-in-out_infinite] w-1/2 rounded-full origin-left"></div>
    </div>
    <p className="text-pd-softgrey font-bold text-xs md:text-sm mt-4 uppercase tracking-widest animate-pulse">Fetching Profile...</p>
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pd-darkblue/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-4 border-pd-lightest">
        <div className="p-6 bg-pd-darkblue text-white flex justify-between items-center border-b-4 border-pd-teal">
           <h3 className="font-impact text-2xl tracking-wide uppercase">{title}</h3>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition"><X size={20} /></button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
           {children}
        </div>
      </div>
    </div>
  );
};

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  dogs: DogData[];
  selectedDogId: string;
  onSelectDog: (id: string) => void;
  gradeName: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  dogs, 
  selectedDogId, 
  onSelectDog, 
  gradeName, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}) => {
  const [isDogMenuOpen, setIsDogMenuOpen] = useState(false);
  const selectedDog = dogs.find(d => d.id === selectedDogId) || dogs[0];

  const menuItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'training_hub', icon: Target, label: 'Training Hub' },
    { id: 'learning', icon: BookOpen, label: 'Learning Center' },
    { id: 'community', icon: Users, label: 'Community' },
  ];

  const handleNav = (id: string) => {
    setActiveView(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-pd-darkblue/80 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed lg:relative inset-y-0 left-0 w-72 bg-white border-r-2 border-pd-lightest flex flex-col justify-between z-50 transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl lg:shadow-none`}>
        <div>
          <div className="p-8 flex flex-col gap-2">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-pd-darkblue rounded-2xl flex items-center justify-center text-pd-yellow shadow-[4px_4px_0px_0px_#34C6B9] hover:translate-y-[-2px] transition-transform cursor-default">
                <Dog size={28} />
              </div>
              <div className="flex flex-col select-none">
                 <span className="font-impact text-3xl text-pd-darkblue tracking-wide leading-none">PARTNERS</span>
                 <span className="font-impact text-3xl text-pd-darkblue tracking-wide leading-none">DOGS</span>
              </div>
            </div>
            <div className="pl-[3.75rem]">
               <span className="font-impact text-2xl text-pd-teal tracking-widest leading-none select-none">360</span>
            </div>
          </div>

          {/* Dog Switcher */}
          <div className="px-6 relative">
             <button 
                onClick={() => setIsDogMenuOpen(!isDogMenuOpen)}
                className="w-full bg-white hover:bg-pd-lightest border-2 border-pd-lightest rounded-2xl p-3 flex items-center justify-between transition-all shadow-sm hover:shadow-md group"
             >
               <div className="flex items-center gap-3">
                  <img src={selectedDog.avatar} alt={selectedDog.name} className="w-10 h-10 rounded-xl object-cover border border-pd-softgrey/30 group-hover:border-pd-teal transition-colors" />
                  <div className="text-left overflow-hidden">
                     <p className="font-impact text-lg text-pd-darkblue leading-none tracking-wide truncate">{selectedDog.name}</p>
                     <p className="text-xs text-pd-softgrey font-bold uppercase tracking-wider truncate group-hover:text-pd-teal transition-colors">{selectedDog.breeds[0]}</p>
                  </div>
               </div>
               <ChevronDown size={18} className={`text-pd-slate transition-transform ${isDogMenuOpen ? 'rotate-180' : ''}`} />
             </button>

             {isDogMenuOpen && (
                <div className="absolute top-full left-6 right-6 mt-2 bg-white border-2 border-pd-lightest rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 origin-top">
                   <div className="max-h-48 overflow-y-auto custom-scrollbar">
                     {dogs.map(dog => (
                        <button
                           key={dog.id}
                           onClick={() => { onSelectDog(dog.id); setIsDogMenuOpen(false); }}
                           className={`w-full p-3 flex items-center gap-3 hover:bg-pd-lightest/50 transition-colors ${dog.id === selectedDogId ? 'bg-pd-lightest/30' : ''}`}
                        >
                           <img src={dog.avatar} alt={dog.name} className="w-8 h-8 rounded-lg object-cover" />
                           <span className="font-bold text-pd-darkblue text-sm">{dog.name}</span>
                           {dog.id === selectedDogId && <div className="ml-auto w-2 h-2 bg-pd-teal rounded-full"></div>}
                        </button>
                     ))}
                   </div>
                   
                   <div className="border-t-2 border-pd-lightest p-2 space-y-1">
                      <button 
                        onClick={() => { handleNav('profile'); setIsDogMenuOpen(false); }}
                        className="w-full p-2 text-pd-darkblue font-bold text-sm flex items-center gap-2 hover:bg-pd-lightest/50 transition-colors rounded-lg"
                      >
                          <Edit3 size={16} /> Edit {selectedDog.name}
                      </button>
                      <button className="w-full p-2 text-pd-teal font-bold text-sm flex items-center gap-2 hover:bg-pd-lightest/50 transition-colors rounded-lg">
                          <Plus size={16} /> Add New Dog
                      </button>
                   </div>
                </div>
             )}
          </div>

          <nav className="mt-6 px-6 space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 group font-impact tracking-wide text-lg ${
                  activeView === item.id 
                    ? 'bg-pd-darkblue text-white shadow-[0_4px_0_0_#34C6B9] translate-y-[-2px]' 
                    : 'text-pd-softgrey hover:bg-pd-lightest hover:text-pd-darkblue'
                }`}
              >
                <item.icon size={22} className={`transition-colors ${activeView === item.id ? "text-pd-yellow" : "group-hover:text-pd-teal text-pd-softgrey"}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t-2 border-pd-lightest bg-pd-lightest/30">
          <div className="flex items-center justify-center">
             <p className="text-xs text-pd-softgrey font-bold uppercase tracking-widest">
                Current Grade: <span className="text-pd-darkblue font-black">{gradeName}</span>
             </p>
          </div>
        </div>
      </aside>
    </>
  );
};
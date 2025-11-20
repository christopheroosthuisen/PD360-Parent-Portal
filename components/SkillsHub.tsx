
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SKILL_TREE, PHASES, BEHAVIOR_TIPS } from '../constants';
import { PD360PhaseBar, Card, getLevelColor, Button, CategoryCard, SkillVisual } from './UI';
import { Search, LayoutGrid, List, ChevronDown, Check, Calculator, SlidersHorizontal, X, ExternalLink, ArrowUpDown, ChevronUp, MessageCircle, CalendarPlus, ArrowUpCircle, ArrowDownCircle, Info, ChevronRight, Dumbbell, Sparkles, Users, Briefcase, ShieldAlert, Brain, Stethoscope, AlertTriangle, ArrowLeft } from 'lucide-react';
import { DogData } from '../types';

// --- Helper to map category names to icons ---
const getCategoryIcon = (categoryName: string) => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('obedience')) return Dumbbell;
  if (lower.includes('trick')) return Sparkles;
  if (lower.includes('social')) return Users;
  if (lower.includes('service')) return Briefcase;
  if (lower.includes('stress') || lower.includes('trigger')) return ShieldAlert;
  if (lower.includes('inappropriate') || lower.includes('behavior')) return AlertTriangle;
  if (lower.includes('management')) return Brain;
  return Stethoscope; // Default
};

const getCategoryDescription = (categoryName: string) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('obedience')) return "Core commands for control and focus in daily life.";
    if (lower.includes('trick')) return "Fun behaviors to build engagement and bond.";
    if (lower.includes('social')) return "Building neutrality and confidence with people and dogs.";
    if (lower.includes('service')) return "Advanced tasks and helper behaviors.";
    if (lower.includes('stress')) return "Managing reactions to environmental triggers.";
    if (lower.includes('inappropriate')) return "Reducing unwanted behaviors through management.";
    return "General training skills.";
};

// --- MultiSelect Dropdown Component ---
interface Option {
  value: string | number;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  selected: (string | number)[];
  onChange: (selected: any[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string | number) => {
    const newSelected = selected.includes(optionValue)
      ? selected.filter(item => item !== optionValue)
      : [...selected, optionValue];
    onChange(newSelected);
  };

  const selectAll = () => onChange(options.map(o => o.value));
  const clearAll = () => onChange([]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full md:w-48 px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
          isOpen 
            ? 'bg-white border-pd-teal ring-2 ring-pd-teal/10 text-pd-darkblue' 
            : 'bg-white border-pd-lightest hover:border-pd-softgrey text-pd-slate'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-pd-softgrey uppercase text-xs font-bold tracking-wider font-sans">{label}:</span>
          <span className="text-pd-darkblue truncate font-sans">
            {selected.length === 0 
              ? 'None' 
              : selected.length === options.length 
                ? 'All' 
                : `${selected.length}`}
          </span>
        </div>
        <ChevronDown size={16} className={`ml-2 text-pd-softgrey transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-64 bg-white border-2 border-pd-lightest rounded-xl shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex justify-between mb-3 px-1">
            <button onClick={selectAll} className="text-xs font-bold text-pd-teal hover:text-teal-600 transition-colors uppercase">Select All</button>
            <button onClick={clearAll} className="text-xs font-bold text-pd-softgrey hover:text-pd-slate transition-colors uppercase">Clear</button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm transition-colors text-left font-sans ${
                  selected.includes(option.value)
                    ? 'bg-pd-teal/10 text-pd-darkblue font-bold'
                    : 'text-pd-slate hover:bg-pd-lightest/50 font-medium'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors shrink-0 ${
                  selected.includes(option.value) ? 'bg-pd-teal border-pd-teal' : 'border-pd-softgrey bg-white'
                }`}>
                  {selected.includes(option.value) && <Check size={14} className="text-white" strokeWidth={4} />}
                </div>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helper to generate training tips ---
const getTrainingTip = (skillName: string, phase: number, type: 'STANDARD' | 'INAPPROPRIATE') => {
  const tipKey = Object.keys(BEHAVIOR_TIPS).find(key => 
    key.toLowerCase() === skillName.toLowerCase() || 
    skillName.toLowerCase().includes(key.toLowerCase())
  );

  if (tipKey && BEHAVIOR_TIPS[tipKey][phase]) {
    return BEHAVIOR_TIPS[tipKey][phase];
  }

  if (type === 'INAPPROPRIATE') {
    const tips: Record<number, string> = {
        1: "Management is key. Prevent rehearsal of the behavior. Control the environment.",
        2: "Identify triggers. Mark and reward 'quiet' or alternative behaviors before reaction.",
        3: "Work on increasing distance from triggers. Practice 'Leave It' or 'Watch Me'.",
        4: "Generalize to new environments. Keep reinforcement rate high for good choices.",
        5: "Maintenance mode. Occasional rewards for calm behavior in presence of triggers."
    };
    return tips[phase] || "Consult your trainer.";
  } else {
    const tips: Record<number, string> = {
        1: "Unknown phase. Start by luring or capturing the behavior in a quiet room.",
        2: "Teaching phase. Focus on the mechanics. Reward every successful attempt immediately.",
        3: "Reinforcing phase. Build value. Start asking for the behavior in slightly harder spots.",
        4: "Proofing phase. Add distance, duration, and distraction. Variable reward schedule.",
        5: "Maintenance. The dog knows this! Use it in daily life. Reward occasionally."
    };
    return tips[phase] || "Keep practicing!";
  }
};

interface SkillsHubProps {
  dogData?: DogData; // Made optional to support existing calls, but ideally required for visuals
}

export const SkillsHub: React.FC<SkillsHubProps> = ({ dogData }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeView, setActiveView] = useState<'categories' | 'detail'>('categories');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'name-asc' | 'name-desc' | 'level-asc' | 'level-desc'>('name-asc');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    const handleScroll = () => {
        const scrolled = mainContent.scrollTop > 60;
        setIsScrolled(scrolled);
        if (scrolled) {
            setIsFilterExpanded(false);
        } else {
            setIsFilterExpanded(true);
        }
    };

    mainContent.addEventListener('scroll', handleScroll);
    return () => mainContent.removeEventListener('scroll', handleScroll);
  }, []);

  const triggerIzzy = (skillName: string, type: string, level: number) => {
    const prompt = `Can you help me with the "${skillName}" behavior? It's currently at Level ${level} (${type === 'INAPPROPRIATE' ? 'Frequency' : 'Phase'}). What specific steps should I take to improve?`;
    const event = new CustomEvent('ask-izzy', { detail: { message: prompt, autoSend: true } });
    window.dispatchEvent(event);
  };

  const addToHomework = (skillName: string) => {
    const event = new CustomEvent('ask-izzy', { detail: { message: `Add "${skillName}" to my homework plan for this week.`, autoSend: false } });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If search is active, we should show the list view automatically to show matches
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setActiveView('detail');
    } else if (!activeCategory && searchQuery.trim().length === 0) {
      setActiveView('categories');
    }
  }, [searchQuery]);

  const allCategories = useMemo(() => Array.from(new Set(SKILL_TREE.map(c => c.category))).sort(), []);
  const categoryOptions = allCategories.map(c => ({ value: c, label: c }));
  
  const levelOptions = [
    { value: 1, label: 'Level 1 (Unknown/Freq)' },
    { value: 2, label: 'Level 2 (Teaching/Often)' },
    { value: 3, label: 'Level 3 (Reinf./Occas.)' },
    { value: 4, label: 'Level 4 (Proofing/Rare)' },
    { value: 5, label: 'Level 5 (Maint./Never)' },
  ];

  const [selectedCategories, setSelectedCategories] = useState<string[]>(allCategories);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([1, 2, 3, 4, 5]);

  const scores = useMemo(() => {
    let current = 0;
    let max = 0;
    let count = 0;
    let mastered = 0;

    SKILL_TREE.forEach(cat => {
      cat.skills.forEach(skill => {
        current += skill.level;
        max += 5;
        count++;
        if (skill.level === 5) mastered++;
      });
    });

    return { current, max, count, mastered, percentage: Math.round((current / max) * 100) };
  }, []);

  // Calculate category stats for the Grid View
  const categoryStats = useMemo(() => {
    return SKILL_TREE.map(cat => {
      const totalLevels = cat.skills.reduce((acc, s) => acc + s.level, 0);
      const maxLevels = cat.skills.length * 5;
      const percent = Math.round((totalLevels / maxLevels) * 100);
      const masteredCount = cat.skills.filter(s => s.level === 5).length;
      
      return {
        category: cat.category,
        icon: getCategoryIcon(cat.category),
        description: getCategoryDescription(cat.category),
        skillCount: cat.skills.length,
        masteredCount,
        percent
      };
    }).sort((a, b) => a.category.localeCompare(b.category));
  }, []);

  const filteredData = useMemo(() => {
    const flatSkills = SKILL_TREE.flatMap(cat => 
      cat.skills.map(skill => ({
        ...skill,
        category: cat.category,
        type: cat.type
      }))
    );

    // If activeCategory is set, filter by it exclusively first (unless searching globally)
    const effectiveCategories = activeCategory && !searchQuery ? [activeCategory] : selectedCategories;

    const filtered = flatSkills.filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = effectiveCategories.includes(skill.category);
      const matchesLevel = selectedLevels.includes(skill.level);
      return matchesSearch && matchesCategory && matchesLevel;
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'level-asc': return a.level - b.level;
        case 'level-desc': return b.level - a.level;
        default: return 0;
      }
    });
  }, [searchQuery, selectedCategories, selectedLevels, sortOption, activeCategory]);

  const groupedData = useMemo(() => {
    const groups: Record<string, typeof filteredData> = {};
    filteredData.forEach(skill => {
      if (!groups[skill.category]) groups[skill.category] = [];
      groups[skill.category].push(skill);
    });
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as typeof groups);
  }, [filteredData]);

  const activeFilterCount = (allCategories.length - selectedCategories.length) + (5 - selectedLevels.length) + (searchQuery ? 1 : 0);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setActiveView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCategories = () => {
    setActiveCategory(null);
    setActiveView('categories');
    setSearchQuery('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-screen">
      
      {/* Header Section with Score Module */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch pt-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
             {activeView === 'detail' && (
                <button onClick={handleBackToCategories} className="p-2 bg-pd-lightest rounded-full hover:bg-pd-darkblue hover:text-white transition-colors">
                   <ArrowLeft size={24} />
                </button>
             )}
             <h1 className="font-impact text-5xl text-pd-darkblue tracking-wide uppercase">SKILLS & PROGRESS</h1>
          </div>
          <p className="text-pd-slate text-lg font-sans max-w-2xl leading-relaxed">
            {activeView === 'categories' 
              ? "Track your journey. Select a category below to view detailed skill breakdowns."
              : activeCategory 
                 ? `Viewing skills in ${activeCategory}.`
                 : "Search results for all skills."
            }
          </p>
        </div>

        {/* Total Score Module */}
        <Card className="relative overflow-hidden bg-pd-darkblue text-white border-none shadow-xl lg:w-96 shrink-0 !p-0 hidden sm:block">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pd-teal rounded-full opacity-10 -mr-10 -mt-10 blur-2xl"></div>
          <div className="p-8 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Calculator size={24} className="text-pd-teal" />
                </div>
                <span className="font-impact tracking-wide text-2xl">TOTAL SCORE</span>
              </div>
              <span className="font-impact text-4xl text-pd-teal">{scores.current}</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold text-pd-lightest/90 uppercase tracking-wide">
                <span>Curriculum Complete</span>
                <span>{scores.percentage}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm">
                <div 
                  className="h-3 rounded-full bg-pd-teal shadow-[0_0_15px_rgba(52,198,185,0.6)] transition-all duration-1000"
                  style={{ width: `${scores.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs font-medium text-pd-lightest/60 mt-1">
                <span>{scores.mastered} Mastered</span>
                <span>{scores.max} Max</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* CATEGORY GRID VIEW */}
      {activeView === 'categories' && (
        <div className="space-y-6">
           <div className="relative w-full max-w-md mx-auto lg:mx-0 mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pd-softgrey" size={20} />
              <input
                type="text"
                placeholder="Search specific skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-pd-lightest rounded-2xl focus:outline-none focus:border-pd-teal transition-all font-medium text-pd-darkblue placeholder-pd-softgrey shadow-sm"
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryStats.map(cat => (
                 <CategoryCard
                    key={cat.category}
                    title={cat.category}
                    subtitle={cat.description}
                    icon={cat.icon}
                    progress={cat.percent}
                    stats={`${cat.masteredCount}/${cat.skillCount} Mastered`}
                    onClick={() => handleCategoryClick(cat.category)}
                 />
              ))}
           </div>
        </div>
      )}

      {/* DETAIL LIST VIEW */}
      {activeView === 'detail' && (
        <>
          {/* Filter Bar Container */}
          <div className={`sticky top-4 z-30 transition-all duration-300 flex justify-end ${isScrolled ? 'pointer-events-none' : ''}`}>
            
            {/* Collapsed Floating Button */}
            <div className={`pointer-events-auto transition-all duration-300 ${isScrolled && !isFilterExpanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 absolute'}`}>
              <button 
                onClick={() => setIsFilterExpanded(true)}
                className="bg-pd-darkblue text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 hover:bg-slate-800 transition-colors border-2 border-white/20 backdrop-blur-md"
              >
                  <SlidersHorizontal size={20} className="text-pd-teal" />
                  <span className="font-impact tracking-wide uppercase">Tune Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-pd-yellow text-pd-darkblue text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
              </button>
            </div>

            {/* Expanded Main Filter Bar */}
            <div className={`bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-pd-lightest shadow-2xl w-full pointer-events-auto transition-all duration-300 origin-top ${isScrolled && !isFilterExpanded ? 'opacity-0 scale-95 -translate-y-4 absolute pointer-events-none' : 'opacity-100 scale-100 translate-y-0'}`}>
                <div className="flex flex-col xl:flex-row gap-4 items-center">
                
                {isScrolled && (
                    <button onClick={() => setIsFilterExpanded(false)} className="absolute top-3 right-3 p-2 bg-pd-lightest rounded-full text-pd-slate hover:text-pd-darkblue transition-colors">
                        <X size={16} />
                    </button>
                )}

                {/* Search & Sort Group */}
                <div className="flex items-center gap-2 w-full xl:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 xl:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pd-softgrey" size={20} />
                    <input
                        type="text"
                        placeholder="Search skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-pd-lightest/50 border-2 border-transparent rounded-xl focus:outline-none focus:border-pd-teal focus:bg-white transition-all font-medium text-pd-darkblue placeholder-pd-softgrey"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-pd-softgrey hover:text-pd-slate">
                        <X size={16} />
                        </button>
                    )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative" ref={sortRef}>
                    <button 
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className="p-3 border-2 border-pd-lightest rounded-xl hover:border-pd-softgrey text-pd-slate transition-colors"
                        title="Sort By"
                    >
                        <ArrowUpDown size={20} />
                    </button>
                    {isSortOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border-2 border-pd-lightest rounded-xl shadow-xl z-50 p-1 animate-in fade-in zoom-in-95 duration-150">
                        {[
                            { label: 'Name (A-Z)', value: 'name-asc' },
                            { label: 'Name (Z-A)', value: 'name-desc' },
                            { label: 'Level (Low-High)', value: 'level-asc' },
                            { label: 'Level (High-Low)', value: 'level-desc' },
                        ].map(opt => (
                            <button
                            key={opt.value}
                            onClick={() => { setSortOption(opt.value as any); setIsSortOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg font-medium ${sortOption === opt.value ? 'bg-pd-teal/10 text-pd-darkblue font-bold' : 'text-pd-slate hover:bg-pd-lightest/50'}`}
                            >
                            {opt.label}
                            </button>
                        ))}
                        </div>
                    )}
                    </div>
                </div>

                <div className="hidden xl:block w-0.5 h-10 bg-pd-lightest mx-2"></div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row w-full xl:w-auto gap-4">
                    <MultiSelect 
                    label="Category" 
                    options={categoryOptions} 
                    selected={selectedCategories} 
                    onChange={(val) => setSelectedCategories(val as string[])} 
                    />
                    <MultiSelect 
                    label="Stage" 
                    options={levelOptions} 
                    selected={selectedLevels} 
                    onChange={(val) => setSelectedLevels(val as number[])} 
                    />
                </div>

                {/* View Toggle */}
                <div className="flex bg-pd-lightest rounded-xl p-1.5 border-2 border-pd-lightest shrink-0 ml-auto">
                    <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-pd-darkblue shadow-sm' : 'text-pd-softgrey hover:text-pd-slate'}`}
                    title="Grid View"
                    >
                    <LayoutGrid size={20} />
                    </button>
                    <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white text-pd-darkblue shadow-sm' : 'text-pd-softgrey hover:text-pd-slate'}`}
                    title="List View"
                    >
                    <List size={20} />
                    </button>
                </div>
                </div>

                {/* Active Filters Summary */}
                {activeFilterCount > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-pd-lightest flex items-center gap-3 overflow-x-auto">
                    <span className="text-xs font-bold text-pd-softgrey flex items-center gap-1 shrink-0 uppercase tracking-wide">
                    <SlidersHorizontal size={12} />
                    Active Filters:
                    </span>
                    {activeFilterCount > 0 && (
                        <button 
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCategories(allCategories);
                            setSelectedLevels([1,2,3,4,5]);
                        }}
                        className="text-xs text-pd-teal font-bold hover:text-pd-darkblue uppercase tracking-wide transition-colors"
                        >
                        Reset All
                        </button>
                    )}
                    {!selectedLevels.includes(1) && (
                    <span className="px-3 py-1 bg-pd-lightest rounded-full text-xs text-pd-slate font-bold border border-pd-softgrey/20 uppercase tracking-wide">
                        Hidden: Level 1
                    </span>
                    )}
                </div>
                )}
            </div>
          </div>

          {/* Results Area */}
          {Object.keys(groupedData).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border-4 border-pd-lightest border-dashed">
              <div className="w-20 h-20 bg-pd-lightest rounded-full flex items-center justify-center mb-6">
                <Search size={40} className="text-pd-softgrey" />
              </div>
              <h3 className="font-impact text-2xl text-pd-darkblue tracking-wide uppercase">No skills found</h3>
              <p className="text-pd-slate mt-2 font-sans">Try adjusting your filters or search terms.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategories(allCategories);
                  setSelectedLevels([1,2,3,4,5]);
                }}
                className="mt-6 text-pd-teal font-bold hover:text-pd-darkblue uppercase tracking-wide transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-12 pb-24">
              {Object.entries(groupedData).map(([category, skills]) => (
                <div key={category} className="animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-0.5 flex-1 bg-pd-lightest"></div>
                    <div className="flex items-center gap-3 px-6 py-2 bg-white rounded-full border-2 border-pd-lightest shadow-sm">
                      <span className="font-impact text-xl text-pd-darkblue uppercase tracking-wide">{category}</span>
                      <span className="bg-pd-yellow text-pd-darkblue text-sm font-bold px-2.5 py-0.5 rounded-md">{skills.length}</span>
                    </div>
                    <div className="h-0.5 flex-1 bg-pd-lightest"></div>
                  </div>

                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
                    {skills.map(skill => (
                      <div key={skill.id} className="transition-all duration-300">
                        <div 
                            className={`bg-pd-lightest rounded-3xl overflow-hidden transition-all duration-300 
                            ${expandedSkillId === skill.id ? 'ring-4 ring-pd-teal shadow-xl bg-white' : 'hover:shadow-lg bg-white'}
                            `}
                        >
                            {/* Card Header / Row */}
                            <div 
                                className={`p-5 cursor-pointer ${viewMode === 'list' ? 'flex items-center gap-6' : ''}`}
                                onClick={() => setExpandedSkillId(expandedSkillId === skill.id ? null : skill.id)}
                            >
                                {viewMode === 'grid' ? (
                                    <>
                                        <div className="flex justify-between items-start mb-5">
                                            <span className="font-impact text-2xl text-pd-darkblue tracking-wide leading-none">{skill.name}</span>
                                            {skill.link && (
                                                <a href={skill.link} target="_blank" rel="noreferrer" className="text-pd-softgrey hover:text-pd-teal bg-pd-lightest p-1.5 rounded-lg transition-colors" onClick={e => e.stopPropagation()}>
                                                    <ExternalLink size={18} />
                                                </a>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <PD360PhaseBar level={skill.level} type={skill.type as any} />
                                        </div>
                                        <div className="flex justify-center mt-2">
                                            {expandedSkillId === skill.id 
                                              ? <ChevronUp size={24} className="text-pd-teal" /> 
                                              : <div className="text-pd-softgrey hover:text-pd-darkblue transition-colors flex flex-col items-center gap-1">
                                                  <span className="text-[10px] font-bold uppercase tracking-widest">Details</span>
                                                  <ChevronDown size={20} />
                                                </div>
                                            }
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1 flex items-center gap-4">
                                            <button className={`p-2 rounded-full transition ${expandedSkillId === skill.id ? 'bg-pd-darkblue text-white' : 'bg-pd-lightest text-pd-darkblue hover:bg-pd-softgrey/20'}`}>
                                                {expandedSkillId === skill.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                            </button>
                                            <div className={`w-4 h-4 rounded-full shadow-sm shrink-0 ${getLevelColor(skill.level)}`}></div>
                                            <span className="font-impact text-xl text-pd-darkblue tracking-wide">{skill.name}</span>
                                            {skill.link && (
                                                <a href={skill.link} target="_blank" rel="noreferrer" className="text-pd-softgrey hover:text-pd-teal transition-colors" onClick={e => e.stopPropagation()}>
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                        </div>
                                        <div className="w-full md:w-1/2 max-w-md hidden sm:block px-4">
                                            <PD360PhaseBar level={skill.level} type={skill.type as any} />
                                        </div>
                                        <div className="w-24 font-impact text-right text-pd-darkblue text-lg bg-pd-lightest px-3 py-1 rounded-xl shrink-0 uppercase tracking-wide">
                                            Lvl {skill.level}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Expanded Accordion Content */}
                            {expandedSkillId === skill.id && (
                                <div className="border-t-2 border-pd-lightest p-6 animate-in slide-in-from-top-2 duration-300 bg-pd-lightest/20">
                                    <div className="grid md:grid-cols-3 gap-8">
                                        {/* Visual */}
                                        <div className="md:col-span-1">
                                            {/* Use SkillVisual for AI generated image if dogData is available */}
                                            {dogData ? (
                                                <SkillVisual 
                                                    skillName={skill.name} 
                                                    dogData={dogData} 
                                                    className="aspect-video rounded-2xl bg-white shadow-sm"
                                                />
                                            ) : (
                                                <div className="aspect-video rounded-2xl bg-pd-darkblue flex items-center justify-center overflow-hidden shadow-inner relative group">
                                                    <div className="relative z-10 text-white text-center p-4">
                                                        <p className="font-impact tracking-widest text-2xl mb-1">LEVEL {skill.level}</p>
                                                        <p className="text-sm font-bold text-pd-teal uppercase tracking-wide">{PHASES[skill.type as keyof typeof PHASES][skill.level].label}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tips & Actions */}
                                        <div className="md:col-span-2 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-impact text-xl text-pd-darkblue flex items-center gap-2 mb-3 uppercase tracking-wide">
                                                    <Info size={20} className="text-pd-teal" />
                                                    Trainer Tip
                                                </h4>
                                                <div className="bg-white p-5 rounded-2xl border-l-4 border-pd-yellow shadow-sm">
                                                  <p className="text-pd-slate leading-relaxed font-medium font-sans">
                                                      <span className="text-pd-yellow text-2xl float-left mr-2 leading-none">"</span>
                                                      {getTrainingTip(skill.name, skill.level, skill.type as any)}
                                                      <span className="text-pd-yellow text-2xl float-right ml-2 leading-none">"</span>
                                                  </p>
                                                </div>
                                            </div>

                                            <div className="mt-8 flex flex-wrap gap-4 items-end">
                                                {/* Level Controls */}
                                                <div className="flex items-center bg-white rounded-xl border-2 border-pd-lightest shadow-sm mr-auto overflow-hidden">
                                                    <button className="p-3 hover:bg-pd-lightest text-pd-slate transition-colors border-r-2 border-pd-lightest disabled:opacity-30" disabled={skill.level <= 1}>
                                                        <ArrowDownCircle size={22} />
                                                    </button>
                                                    <span className="px-4 text-sm font-impact text-pd-darkblue uppercase tracking-wider">Stage</span>
                                                    <button className="p-3 hover:bg-pd-lightest text-pd-slate transition-colors border-l-2 border-pd-lightest disabled:opacity-30" disabled={skill.level >= 5}>
                                                        <ArrowUpCircle size={22} />
                                                    </button>
                                                </div>

                                                {/* Action Buttons */}
                                                <Button 
                                                    variant="secondary" 
                                                    className="!py-2.5 !px-5 !text-sm" 
                                                    icon={MessageCircle}
                                                    onClick={() => triggerIzzy(skill.name, skill.type, skill.level)}
                                                >
                                                    Ask Izzy
                                                </Button>
                                                <Button 
                                                    variant="accent" 
                                                    className="!py-2.5 !px-5 !text-sm" 
                                                    icon={CalendarPlus}
                                                    onClick={() => addToHomework(skill.name)}
                                                >
                                                    Add to Plan
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
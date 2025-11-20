
import React, { useState, useMemo } from 'react';
import { DogData } from '../types';
import { KnowledgeBase } from './KnowledgeBase';
import { MediaAnalysis } from './MediaAnalysis';
import { BookOpen, Video, Sparkles, ExternalLink, Search, ArrowLeft, Dumbbell, Users, Briefcase, ShieldAlert, Brain, Stethoscope, AlertTriangle } from 'lucide-react';
import { SKILL_TREE } from '../constants';
import { CategoryCard, Button } from './UI';

interface LearningCenterProps {
  dogData: DogData;
}

// Reuse logic from SkillsHub for consistency
const getCategoryIcon = (categoryName: string) => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('obedience')) return Dumbbell;
  if (lower.includes('trick')) return Sparkles;
  if (lower.includes('social')) return Users;
  if (lower.includes('service')) return Briefcase;
  if (lower.includes('stress') || lower.includes('trigger')) return ShieldAlert;
  if (lower.includes('inappropriate') || lower.includes('behavior')) return AlertTriangle;
  if (lower.includes('management')) return Brain;
  return Stethoscope;
};

const getCategoryDescription = (categoryName: string) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('obedience')) return "Core commands and guides.";
    if (lower.includes('trick')) return "Fun behaviors to build engagement.";
    if (lower.includes('social')) return "Neutrality and confidence building.";
    if (lower.includes('service')) return "Advanced tasks guides.";
    if (lower.includes('stress')) return "Managing reactions protocols.";
    if (lower.includes('inappropriate')) return "Behavior modification guides.";
    return "General training resources.";
};

export const LearningCenter: React.FC<LearningCenterProps> = ({ dogData }) => {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'analysis'>('knowledge');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Flattened list for search
  const allResources = useMemo(() => 
    SKILL_TREE.flatMap(cat => cat.skills.filter(s => s.link).map(s => ({...s, category: cat.category}))), 
  []);

  // Grouped for Grid
  const categories = useMemo(() => {
    return SKILL_TREE
        .filter(cat => cat.skills.some(s => s.link))
        .map(cat => ({
            name: cat.category,
            icon: getCategoryIcon(cat.category),
            description: getCategoryDescription(cat.category),
            resourceCount: cat.skills.filter(s => s.link).length,
            skills: cat.skills.filter(s => s.link)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredResources = useMemo(() => {
      if (selectedCategory) {
          const cat = categories.find(c => c.name === selectedCategory);
          return cat ? cat.skills.map(s => ({...s, category: cat.name})) : [];
      }
      return allResources.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [selectedCategory, searchQuery, categories, allResources]);

  const handleCategoryClick = (catName: string) => {
      setSelectedCategory(catName);
      setView('list');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetView = () => {
      setSelectedCategory(null);
      setView('grid');
      setSearchQuery('');
  };

  // Auto switch to list on search
  useMemo(() => {
      if (searchQuery.length > 0) setView('list');
      else if (!selectedCategory) setView('grid');
  }, [searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Unified Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-impact text-5xl text-pd-darkblue tracking-wide uppercase mb-2">LEARNING CENTER</h1>
          <p className="text-pd-slate text-lg font-medium">Master the method and analyze your mechanics.</p>
        </div>
        
        {/* Custom Tab Switcher */}
        <div className="bg-white p-1.5 rounded-2xl border-2 border-pd-lightest flex shadow-sm">
            <button 
               onClick={() => setActiveTab('knowledge')}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase transition-all ${
                  activeTab === 'knowledge' 
                  ? 'bg-pd-darkblue text-white shadow-md' 
                  : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-pd-lightest'
               }`}
            >
               <BookOpen size={20} className={activeTab === 'knowledge' ? 'text-pd-yellow' : ''} />
               University
            </button>
            <button 
               onClick={() => setActiveTab('analysis')}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase transition-all ${
                  activeTab === 'analysis' 
                  ? 'bg-pd-darkblue text-white shadow-md' 
                  : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-pd-lightest'
               }`}
            >
               <Video size={20} className={activeTab === 'analysis' ? 'text-pd-yellow' : ''} />
               AI Analysis
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-8">
         {activeTab === 'knowledge' && (
             <div className="space-y-12">
                <KnowledgeBase />
                
                {/* Behavior Library Section */}
                <div>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 border-t-2 border-pd-lightest pt-8">
                        <div className="flex items-center gap-3">
                            {view === 'list' && (
                                <button onClick={resetView} className="p-2 bg-pd-lightest rounded-full hover:bg-pd-darkblue hover:text-white transition-colors">
                                    <ArrowLeft size={20} />
                                </button>
                            )}
                            <div>
                                <h2 className="font-impact text-3xl text-pd-darkblue tracking-wide uppercase">BEHAVIOR LIBRARY</h2>
                                <p className="text-pd-slate mt-1 font-medium">
                                    {selectedCategory ? `Viewing ${selectedCategory} resources` : "Quick guides for specific training behaviors."}
                                </p>
                            </div>
                        </div>
                        <div className="relative w-full md:w-64">
                            <input 
                                type="text" 
                                placeholder="Search library..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border-2 border-pd-lightest rounded-xl text-pd-darkblue placeholder-pd-softgrey font-medium focus:border-pd-teal focus:outline-none w-full"
                            />
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-pd-softgrey" />
                        </div>
                    </div>

                    {view === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map(cat => (
                                <CategoryCard 
                                    key={cat.name}
                                    title={cat.name}
                                    subtitle={cat.description}
                                    icon={cat.icon}
                                    stats={`${cat.resourceCount} Articles`}
                                    onClick={() => handleCategoryClick(cat.name)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {filteredResources.map(skill => (
                                <a 
                                    key={skill.id} 
                                    href={skill.link} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-4 bg-white border-2 border-pd-lightest rounded-xl hover:border-pd-teal hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="p-2 bg-pd-lightest/50 rounded-lg text-pd-teal group-hover:bg-pd-teal group-hover:text-white transition-colors">
                                            <BookOpen size={16} />
                                        </span>
                                        <div>
                                            <p className="font-bold text-pd-darkblue group-hover:text-pd-teal transition-colors">{skill.name}</p>
                                            {!selectedCategory && <p className="text-[10px] uppercase font-bold text-pd-softgrey tracking-wide">{skill.category}</p>}
                                        </div>
                                    </div>
                                    <ExternalLink size={16} className="text-pd-softgrey group-hover:text-pd-teal" />
                                </a>
                            ))}
                            {filteredResources.length === 0 && (
                                <div className="col-span-full text-center py-12 text-pd-softgrey italic font-medium">
                                    No articles found matching your search.
                                </div>
                            )}
                        </div>
                    )}
                </div>
             </div>
         )}
         {activeTab === 'analysis' && <MediaAnalysis dogData={dogData} />}
      </div>
    </div>
  );
};

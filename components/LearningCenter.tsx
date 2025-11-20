
import React, { useState, useMemo } from 'react';
import { DogData, StudyModule } from '../types';
import { 
  BookOpen, 
  ExternalLink, 
  Search, 
  ArrowLeft, 
  Dumbbell, 
  Users, 
  Briefcase, 
  ShieldAlert, 
  Brain, 
  Stethoscope, 
  AlertTriangle, 
  Sparkles,
  GraduationCap,
  FileText,
  Library,
  Loader,
  Lightbulb,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import { SKILL_TREE, getCurrentGrade } from '../constants';
import { CategoryCard, Button, Card, ProgressBar } from './UI';
import { generateContent } from '../services/gemini';

interface LearningCenterProps {
  dogData: DogData;
}

// --- Helper: Icon Mapping ---
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

export const LearningCenter: React.FC<LearningCenterProps> = ({ dogData }) => {
  // --- State: View Management ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // --- State: AI Study Plan ---
  const [studyPlan, setStudyPlan] = useState<StudyModule[] | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planProgress, setPlanProgress] = useState(0);
  const [expandedModule, setExpandedModule] = useState<number | null>(0);

  // --- Helpers ---
  const gradeInfo = getCurrentGrade(dogData.currentScore);

  // Flattened resources for search
  const allResources = useMemo(() => 
    SKILL_TREE.flatMap(cat => cat.skills.filter(s => s.link).map(s => ({...s, category: cat.category})))
    .sort((a, b) => a.name.localeCompare(b.name)), 
  []);

  const categories = useMemo(() => {
    return SKILL_TREE
        .filter(cat => cat.skills.some(s => s.link))
        .map(cat => ({
            name: cat.category,
            icon: getCategoryIcon(cat.category),
            resourceCount: cat.skills.filter(s => s.link).length,
            skills: cat.skills.filter(s => s.link)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredResources = useMemo(() => {
      if (searchQuery.trim().length > 0) {
         return allResources.filter(r => 
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            r.category.toLowerCase().includes(searchQuery.toLowerCase())
         );
      }
      if (selectedCategory) {
          const cat = categories.find(c => c.name === selectedCategory);
          return cat ? cat.skills.map(s => ({...s, category: cat.name})) : [];
      }
      return [];
  }, [searchQuery, selectedCategory, categories, allResources]);

  // --- AI Logic: Generate Study Plan ---
  const generateStudyPlan = async () => {
    setIsGeneratingPlan(true);
    setPlanProgress(10);
    
    // Simulate progress
    const interval = setInterval(() => {
      setPlanProgress(prev => (prev >= 90 ? prev : prev + 10));
    }, 300);

    try {
      const prompt = `
        Create a personalized learning curriculum for the owner of a ${dogData.breeds.join(' ')} named ${dogData.name}.
        Context:
        - Current Grade: ${gradeInfo.current.name}
        - Age: ${new Date().getFullYear() - new Date(dogData.birthDate).getFullYear()} years old
        - Issues/Goals: Based on standard breed traits (e.g. herding/energy for Collies, retrieving for Goldens).
        
        Output JSON Format:
        [
          {
            "title": "Module Name",
            "focus": "Why this matters",
            "resources": [
              { "title": "Article Title", "type": "Article", "description": "Brief summary", "estimatedTime": "5 min" },
              { "title": "Video Title", "type": "Video", "description": "Brief summary", "estimatedTime": "10 min" }
            ]
          }
        ]
        Generate 3 modules. Use real dog training concepts (Markers, Thresholds, Drive, Engagement).
      `;

      const response = await generateContent(prompt, "gemini-3-pro-preview", "You are an expert dog training curriculum developer. Return strictly valid JSON.");
      const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      setStudyPlan(parsed);
    } catch (e) {
      console.error("Failed to gen study plan", e);
    } finally {
      clearInterval(interval);
      setPlanProgress(100);
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="font-impact text-5xl text-pd-darkblue tracking-wide uppercase mb-2">Learning Center</h1>
          <p className="text-pd-slate text-lg font-medium">Educational resources for the human end of the leash.</p>
        </div>
      </div>

      {/* 1. AI Parent Study Plan */}
      <section>
        <div className="bg-white rounded-3xl border-2 border-pd-lightest p-8 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-pd-teal rounded-full opacity-5 -mr-10 -mt-10 blur-3xl"></div>
           
           {!studyPlan ? (
             <div className="text-center py-8 relative z-10">
                <div className="w-20 h-20 bg-pd-lightest rounded-2xl flex items-center justify-center mx-auto mb-6 text-pd-darkblue">
                   <Lightbulb size={40} />
                </div>
                <h2 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide mb-3">Personalized Curriculum</h2>
                <p className="text-pd-slate font-medium max-w-2xl mx-auto mb-8">
                   Get a custom study plan tailored to {dogData.name}'s breed, age, and current training grade. 
                   Learn exactly what you need to know to support their progress.
                </p>
                
                {isGeneratingPlan ? (
                   <div className="max-w-md mx-auto">
                      <p className="text-pd-teal font-bold text-sm uppercase tracking-widest mb-2 animate-pulse">Designing Curriculum...</p>
                      <ProgressBar progress={planProgress} className="h-2" />
                   </div>
                ) : (
                   <Button variant="gemini" onClick={generateStudyPlan} icon={Sparkles} className="!px-8 !py-4 shadow-lg text-lg">
                      Build My Plan
                   </Button>
                )}
             </div>
           ) : (
             <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                   <div>
                      <h2 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide">Your Study Plan</h2>
                      <p className="text-pd-slate text-sm font-bold uppercase tracking-wider">Focus: {gradeInfo.current.name} Grade Mastery</p>
                   </div>
                   <Button variant="secondary" onClick={() => setStudyPlan(null)} className="!py-2 !px-4 !text-xs">Reset Plan</Button>
                </div>

                <div className="space-y-4">
                   {studyPlan.map((module, idx) => (
                      <div key={idx} className="bg-pd-lightest/20 rounded-2xl border-2 border-pd-lightest overflow-hidden">
                         <button 
                            onClick={() => setExpandedModule(expandedModule === idx ? null : idx)}
                            className="w-full flex items-center justify-between p-5 hover:bg-white transition-colors"
                         >
                            <div className="flex items-center gap-4">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${expandedModule === idx ? 'bg-pd-darkblue border-pd-darkblue text-white' : 'bg-white border-pd-lightest text-pd-slate'}`}>
                                  {idx + 1}
                               </div>
                               <div className="text-left">
                                  <h3 className="font-impact text-xl text-pd-darkblue tracking-wide">{module.title}</h3>
                                  <p className="text-xs text-pd-slate font-medium">{module.focus}</p>
                               </div>
                            </div>
                            {expandedModule === idx ? <ChevronUp size={20} className="text-pd-teal" /> : <ChevronDown size={20} className="text-pd-softgrey" />}
                         </button>

                         {expandedModule === idx && (
                            <div className="p-5 pt-0 bg-white border-t-2 border-pd-lightest">
                               <div className="space-y-3 mt-4">
                                  {module.resources.map((res, rIdx) => (
                                     <div key={rIdx} className="flex items-start gap-4 p-3 rounded-xl hover:bg-pd-lightest/30 transition-colors cursor-pointer group">
                                        <div className="mt-1">
                                           {res.type === 'Video' ? <PlayCircle size={20} className="text-pd-teal" /> : <FileText size={20} className="text-pd-yellow" />}
                                        </div>
                                        <div className="flex-1">
                                           <div className="flex justify-between">
                                              <p className="font-bold text-pd-darkblue text-sm group-hover:text-pd-teal transition-colors">{res.title}</p>
                                              <span className="text-[10px] font-bold bg-pd-lightest px-2 py-0.5 rounded text-pd-softgrey uppercase">{res.estimatedTime}</span>
                                           </div>
                                           <p className="text-xs text-pd-slate mt-1">{res.description}</p>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         )}
                      </div>
                   ))}
                </div>
             </div>
           )}
        </div>
      </section>

      {/* 2. The Three Pillars */}
      <section>
         <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide mb-6 flex items-center gap-2">
            <Library size={24} className="text-pd-yellow" /> Core Resources
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Partners University */}
            <a href="https://university.partnersdogs.org" target="_blank" rel="noreferrer" className="group">
               <Card className="h-full bg-pd-darkblue text-white border-none hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-pd-teal/20 transition-colors"></div>
                  <div className="relative z-10 flex flex-col h-full">
                     <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10 text-pd-yellow">
                        <GraduationCap size={28} />
                     </div>
                     <h3 className="font-impact text-2xl tracking-wide uppercase mb-2">Partners University</h3>
                     <p className="text-pd-lightest/80 text-sm font-medium leading-relaxed mb-6 flex-1">
                        Comprehensive video courses, certification paths, and deep-dive modules for every grade level.
                     </p>
                     <div className="flex items-center gap-2 text-xs font-bold text-pd-teal uppercase tracking-wider group-hover:text-white transition-colors">
                        Access Courses <ExternalLink size={14} />
                     </div>
                  </div>
               </Card>
            </a>

            {/* Pet Parent Guide */}
            <a href="https://partnersdogs.com/guide" target="_blank" rel="noreferrer" className="group">
               <Card className="h-full bg-white border-2 border-pd-lightest hover:border-pd-teal hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex flex-col h-full">
                     <div className="w-14 h-14 bg-pd-lightest rounded-2xl flex items-center justify-center mb-6 text-pd-darkblue group-hover:bg-pd-darkblue group-hover:text-white transition-colors">
                        <BookOpen size={28} />
                     </div>
                     <h3 className="font-impact text-2xl text-pd-darkblue tracking-wide uppercase mb-2">Pet Parent Guide</h3>
                     <p className="text-pd-slate text-sm font-medium leading-relaxed mb-6 flex-1">
                        The essential handbook. Learn the philosophy, vocabulary, and core rules of the Partners Method.
                     </p>
                     <div className="flex items-center gap-2 text-xs font-bold text-pd-teal uppercase tracking-wider group-hover:text-pd-darkblue transition-colors">
                        Read Guide <ExternalLink size={14} />
                     </div>
                  </div>
               </Card>
            </a>

            {/* Knowledge Base */}
            <a href="https://knowledge.partnersdogs.com" target="_blank" rel="noreferrer" className="group">
               <Card className="h-full bg-white border-2 border-pd-lightest hover:border-pd-yellow hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex flex-col h-full">
                     <div className="w-14 h-14 bg-pd-lightest rounded-2xl flex items-center justify-center mb-6 text-pd-darkblue group-hover:bg-pd-yellow transition-colors">
                        <FileText size={28} />
                     </div>
                     <h3 className="font-impact text-2xl text-pd-darkblue tracking-wide uppercase mb-2">Knowledge Base</h3>
                     <p className="text-pd-slate text-sm font-medium leading-relaxed mb-6 flex-1">
                        Searchable database of articles, troubleshooting guides, and specific behavior protocols.
                     </p>
                     <div className="flex items-center gap-2 text-xs font-bold text-pd-teal uppercase tracking-wider group-hover:text-pd-darkblue transition-colors">
                        Search Articles <ExternalLink size={14} />
                     </div>
                  </div>
               </Card>
            </a>
         </div>
      </section>

      {/* 3. Quick Reference Library (Categorized) */}
      <section>
         <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
               <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide flex items-center gap-2">
                  <Search size={24} className="text-pd-teal" /> Quick Reference
               </h3>
               <p className="text-pd-slate mt-1 font-medium">Browse specific behavior guides by category.</p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
                <input 
                    type="text" 
                    placeholder="Filter behaviors..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-white border-2 border-pd-lightest rounded-xl text-pd-darkblue placeholder-pd-softgrey font-medium focus:border-pd-teal focus:outline-none w-full shadow-sm"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-pd-softgrey" />
            </div>
         </div>

         {!selectedCategory && !searchQuery ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {categories.map(cat => (
                  <CategoryCard 
                     key={cat.name}
                     title={cat.name}
                     icon={cat.icon}
                     stats={`${cat.resourceCount} Articles`}
                     onClick={() => setSelectedCategory(cat.name)}
                  />
               ))}
            </div>
         ) : (
            // List View
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <Button variant="ghost" icon={ArrowLeft} onClick={() => { setSelectedCategory(null); setSearchQuery(''); }} className="mb-4 pl-0 hover:bg-transparent">
                  Back to Categories
               </Button>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResources.map((skill, idx) => (
                      <a 
                          key={`${skill.id}-${idx}`}
                          href={skill.link} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-between p-5 bg-white border-2 border-pd-lightest rounded-xl hover:border-pd-teal hover:shadow-md transition-all group"
                      >
                          <div className="flex items-center gap-4">
                              <div className="p-2 bg-pd-lightest/50 rounded-lg text-pd-teal group-hover:bg-pd-teal group-hover:text-white transition-colors">
                                  <BookOpen size={20} />
                              </div>
                              <div>
                                  <p className="font-impact text-lg text-pd-darkblue group-hover:text-pd-teal transition-colors tracking-wide">{skill.name}</p>
                                  <p className="text-[10px] uppercase font-bold text-pd-softgrey tracking-wider">{skill.category}</p>
                              </div>
                          </div>
                          <ExternalLink size={18} className="text-pd-lightest group-hover:text-pd-teal transition-colors" />
                      </a>
                  ))}
                  {filteredResources.length === 0 && (
                      <div className="col-span-full text-center py-12 text-pd-softgrey italic font-medium border-2 border-dashed border-pd-lightest rounded-xl">
                          No articles found matching your search.
                      </div>
                  )}
               </div>
            </div>
         )}
      </section>
    </div>
  );
};

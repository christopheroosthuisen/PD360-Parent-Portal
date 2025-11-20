


import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Upload, 
  X, 
  Loader, 
  ChevronRight, 
  CheckCircle2, 
  Tag, 
  FileText, 
  PlayCircle,
  Clock,
  AlertCircle,
  User,
  MessageCircle,
  Search,
  Filter,
  ArrowLeft,
  Save,
  Calendar
} from 'lucide-react';
import { Button, Card, ProgressBar } from './UI';
import { DogData, MediaItem } from '../types';
import { generateContent } from '../services/gemini';
import { BEHAVIOR_TAGS, MOCK_MEDIA_LIBRARY } from '../constants';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

const parseAnalysisResult = (text: string) => {
  try {
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return null;
  }
};

export const MediaAnalysis: React.FC<{ dogData: DogData }> = ({ dogData }) => {
  const [view, setView] = useState<'library' | 'upload' | 'detail'>('library');
  const [activeTab, setActiveTab] = useState<'video' | 'photo'>('video'); 
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Library State
  const [library, setLibrary] = useState<MediaItem[]>(MOCK_MEDIA_LIBRARY);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);

  // Upload/Analysis State
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userNotes, setUserNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [rawAnalysis, setRawAnalysis] = useState<string | null>(null);
  const [skillSearch, setSkillSearch] = useState('');

  const filteredLibrary = library.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTags = selectedFilterTags.length === 0 || selectedFilterTags.every(t => item.tags.includes(t));
    return matchesSearch && matchesTags; 
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setAnalysisResult(null);
      setRawAnalysis(null);
      setStep(2);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const toggleFilterTag = (tag: string) => {
    setSelectedFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress(prev => (prev >= 95 ? prev : prev + (Math.random() * 4)));
      }, 400);
    } else {
      setLoadingProgress(100);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setStep(3);

    try {
      const base64Data = await fileToBase64(file);
      let prompt = "";
      let systemPrompt = "";

      if (activeTab === 'photo') {
        prompt = `Analyze this image of ${dogData.name}. Identify: Emotional State, Body Language Cues, Environment context. Provide a summary.`;
        systemPrompt = "You are a professional dog behaviorist.";
      } else {
        prompt = `Analyze this training video of ${dogData.name}. Behaviors: ${selectedTags.join(', ')}. Notes: ${userNotes}. Provide detailed JSON with timeline, mechanics, engagement score, posture feedback, and recommendations.`;
        systemPrompt = "You are an expert dog trainer analyzing video mechanics and timing.";
      }
      
      const result = await generateContent(prompt, "gemini-3-pro-preview", systemPrompt, { mimeType: file.type, data: base64Data });
      
      if (activeTab === 'video') {
        const parsed = parseAnalysisResult(result);
        if (parsed) setAnalysisResult(parsed);
        else setRawAnalysis(result);
      } else {
        setRawAnalysis(result);
      }
    } catch (error) {
      setRawAnalysis("Failed to analyze media. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToLibrary = () => {
    if (!file || !preview) return;
    const newItem: MediaItem = {
        id: Date.now().toString(),
        type: activeTab,
        url: preview,
        thumbnail: preview, 
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        title: `${activeTab === 'video' ? 'Video' : 'Photo'} Analysis`,
        tags: selectedTags,
        notes: userNotes,
        analysis: analysisResult || { mechanics: rawAnalysis }
    };
    setLibrary([newItem, ...library]);
    setSelectedItem(newItem);
    setView('detail');
    // Reset upload state
    setFile(null);
    setStep(1);
    setSelectedTags([]);
    setUserNotes('');
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setAnalysisResult(null);
    setRawAnalysis(null);
    setSelectedTags([]);
    setUserNotes('');
    setStep(1);
    setView('library');
  };

  const triggerIzzy = (topic: string) => {
    const context = selectedItem?.analysis?.mechanics || rawAnalysis || "this media";
    const prompt = `Based on my recent analysis of ${dogData.name}, I need help with ${topic}. Context: ${context}`;
    const event = new CustomEvent('ask-izzy', { detail: { message: prompt, autoSend: true } });
    window.dispatchEvent(event);
  };

  const renderTimelineItem = (item: any, idx: number) => {
    let icon = <PlayCircle size={18} />;
    let color = "text-pd-slate";
    let bg = "bg-pd-lightest";
    let border = "border-pd-lightest";

    if (item.type === 'command') {
      icon = <User size={18} />;
      color = "text-pd-darkblue";
      bg = "bg-pd-lightest";
      border = "border-pd-darkblue";
    } else if (item.type?.includes('behavior')) {
      icon = <CheckCircle2 size={18} />;
      color = "text-pd-teal";
      bg = "bg-white";
      border = "border-pd-teal";
    } else if (item.type === 'marker') {
      icon = <Sparkles size={18} />;
      color = "text-pd-darkblue";
      bg = "bg-pd-yellow";
      border = "border-pd-yellow";
    }

    return (
      <div key={idx} className="flex gap-4 items-start relative pb-8 last:pb-0 group">
        {idx !== (analysisResult?.timeline?.length || 0) - 1 && (
          <div className="absolute left-[20px] top-10 bottom-0 w-0.5 bg-pd-lightest group-hover:bg-pd-teal transition-colors"></div>
        )}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg} ${color} z-10 shadow-md border-2 ${border}`}>
          {icon}
        </div>
        <div className="flex-1 pt-1">
          <div className="flex justify-between items-center mb-1">
             <span className={`font-impact tracking-wide text-lg ${color}`}>{item.event}</span>
             <span className="text-xs font-bold text-pd-slate bg-pd-lightest border border-pd-lightest px-2 py-1 rounded-lg flex items-center gap-1 font-sans">
               <Clock size={12} /> {item.time}s
             </span>
          </div>
          <p className="text-pd-slate leading-relaxed font-sans">{item.detail}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* Search added here */}
           {view === 'library' && (
              <div className="flex gap-2 max-w-md mt-2">
                 <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pd-softgrey" size={20} />
                    <input
                        type="text"
                        placeholder="Search library..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-pd-lightest rounded-xl focus:outline-none focus:border-pd-teal transition-all font-medium text-pd-darkblue placeholder-pd-softgrey shadow-sm"
                    />
                 </div>
              </div>
           )}
        </div>
        
        <div className="flex gap-3">
           {view === 'library' && (
              <Button variant="primary" icon={Upload} onClick={() => setView('upload')}>
                Analyze New
              </Button>
           )}
           {view !== 'library' && (
              <Button variant="secondary" icon={ArrowLeft} onClick={() => { setView('library'); resetUpload(); }}>
                Back to Library
              </Button>
           )}
        </div>
      </div>

      {/* LIBRARY VIEW */}
      {view === 'library' && (
         <div className="space-y-6">
            {/* Filters */}
            <Card className="bg-white border-2 border-pd-lightest">
               <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0">
                  {BEHAVIOR_TAGS.slice(0, 8).map(tag => (
                     <button
                        key={tag}
                        onClick={() => toggleFilterTag(tag)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border-2 whitespace-nowrap ${
                           selectedFilterTags.includes(tag)
                           ? 'bg-pd-darkblue text-white border-pd-darkblue'
                           : 'bg-white text-pd-slate border-pd-lightest hover:border-pd-teal'
                        }`}
                     >
                        {tag}
                     </button>
                  ))}
               </div>
            </Card>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredLibrary.map(item => (
                  <div 
                     key={item.id}
                     onClick={() => { setSelectedItem(item); setView('detail'); }}
                     className="bg-white rounded-3xl border-2 border-pd-lightest overflow-hidden cursor-pointer hover:shadow-xl hover:border-pd-teal transition-all group"
                  >
                     <div className="aspect-video bg-pd-lightest relative">
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border-2 border-white/50">
                              {item.type === 'video' ? <PlayCircle size={24} /> : <ImageIcon size={24} />}
                           </div>
                        </div>
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide text-pd-darkblue border border-pd-lightest/50">
                           {item.date}
                        </div>
                     </div>
                     <div className="p-5">
                        <h3

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
  const [activeTab, setActiveTab] = useState<'video' | 'photo'>('video'); // Used for upload type or filter
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

  const filteredLibrary = library.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTags = selectedFilterTags.length === 0 || selectedFilterTags.every(t => item.tags.includes(t));
    const matchesType = activeTab === item.type; // Filter by current tab (Photo/Video) or remove this if you want mixed grid
    return matchesSearch && matchesTags; // && matchesType
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
        thumbnail: preview, // In real app, generate thumb
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
          <h2 className="font-impact text-5xl text-pd-darkblue tracking-wide uppercase mb-2">MEDIA LIBRARY</h2>
          <p className="text-pd-slate text-lg">Track progress, analyze mechanics, and improve timing.</p>
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
               <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pd-softgrey" size={20} />
                     <input 
                        type="text" 
                        placeholder="Search by title or tag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-pd-lightest/30 border-2 border-pd-lightest rounded-xl focus:border-pd-teal focus:bg-white transition-all text-pd-darkblue font-medium outline-none"
                     />
                  </div>
                  <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0">
                     {BEHAVIOR_TAGS.slice(0, 6).map(tag => (
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
                        <h3 className="font-impact text-xl text-pd-darkblue tracking-wide mb-2 truncate">{item.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                           {item.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] font-bold bg-pd-lightest text-pd-slate px-2 py-1 rounded-md uppercase">{tag}</span>
                           ))}
                           {item.tags.length > 3 && <span className="text-[10px] font-bold text-pd-softgrey px-1">+{item.tags.length - 3}</span>}
                        </div>
                        {item.analysis?.engagement_score && (
                           <div className="flex items-center gap-2 text-xs font-bold text-pd-teal uppercase tracking-wide">
                              <Sparkles size={14} /> Engagement: {item.analysis.engagement_score}/10
                           </div>
                        )}
                     </div>
                  </div>
               ))}
               {filteredLibrary.length === 0 && (
                  <div className="col-span-full py-12 text-center text-pd-softgrey italic font-medium">
                     No media found. Try adjusting your filters or upload a new clip.
                  </div>
               )}
            </div>
         </div>
      )}

      {/* UPLOAD VIEW */}
      {view === 'upload' && (
         <Card className="min-h-[600px] relative overflow-hidden !p-0 flex flex-col bg-white border-none shadow-xl">
            <div className="bg-pd-lightest/20 border-b-2 border-pd-lightest p-6 flex justify-center items-center gap-4 md:gap-12">
               {[1, 2, 3].map(s => (
                  <React.Fragment key={s}>
                     <div className={`flex items-center gap-3 ${step >= s ? 'text-pd-darkblue' : 'text-pd-softgrey'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= s ? 'bg-pd-darkblue text-white border-pd-darkblue' : 'bg-white border-pd-lightest'}`}>{s}</div>
                        <span className="hidden md:inline font-impact tracking-wide uppercase text-lg">{s === 1 ? 'Upload' : s === 2 ? 'Tag' : 'Analyze'}</span>
                     </div>
                     {s < 3 && <div className="w-12 h-0.5 bg-pd-lightest"></div>}
                  </React.Fragment>
               ))}
            </div>

            <div className="flex-1 p-8">
               {step === 1 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-8">
                     <div className="flex gap-4 mb-4">
                        <button onClick={() => setActiveTab('video')} className={`px-6 py-3 rounded-xl font-impact uppercase tracking-wide transition-all border-2 ${activeTab === 'video' ? 'bg-pd-darkblue text-white border-pd-darkblue' : 'border-pd-lightest text-pd-slate hover:border-pd-teal'}`}>Video</button>
                        <button onClick={() => setActiveTab('photo')} className={`px-6 py-3 rounded-xl font-impact uppercase tracking-wide transition-all border-2 ${activeTab === 'photo' ? 'bg-pd-darkblue text-white border-pd-darkblue' : 'border-pd-lightest text-pd-slate hover:border-pd-teal'}`}>Photo</button>
                     </div>
                     <div className="w-32 h-32 bg-pd-lightest/30 rounded-full flex items-center justify-center mx-auto border-4 border-pd-lightest text-pd-darkblue">
                        {activeTab === 'photo' ? <ImageIcon size={48} /> : <VideoIcon size={48} />}
                     </div>
                     <p className="text-pd-slate max-w-md font-medium">Upload media to analyze behavior, mechanics, and timing.</p>
                     <Button as="label" htmlFor="media-upload" variant="primary" icon={Upload} className="text-lg px-8 py-4">
                        Select File
                     </Button>
                     <input id="media-upload" type="file" accept={activeTab === 'photo' ? "image/*" : "video/mp4,video/webm"} className="hidden" onChange={handleFileSelect} />
                  </div>
               )}

               {step === 2 && (
                  <div className="grid lg:grid-cols-2 gap-10 h-full">
                     <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-xl border-4 border-pd-lightest">
                        {activeTab === 'photo' ? <img src={preview!} alt="Preview" className="w-full h-full object-contain" /> : <video src={preview!} controls className="w-full h-full" />}
                     </div>
                     <div className="flex flex-col h-full space-y-6">
                        <div>
                           <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-3 block">Tags</label>
                           <div className="flex flex-wrap gap-2">
                              {BEHAVIOR_TAGS.map(tag => (
                                 <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 ${selectedTags.includes(tag) ? 'bg-pd-darkblue text-white border-pd-darkblue' : 'bg-white text-pd-slate border-pd-lightest hover:border-pd-teal'}`}>{tag}</button>
                              ))}
                           </div>
                        </div>
                        <div className="flex-1">
                           <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-3 block">Notes</label>
                           <textarea value={userNotes} onChange={(e) => setUserNotes(e.target.value)} className="w-full h-32 bg-pd-lightest/30 border-2 border-pd-lightest rounded-xl p-4 text-pd-darkblue focus:border-pd-teal outline-none resize-none font-medium" placeholder="Add context..." />
                        </div>
                        <Button variant="gemini" onClick={handleAnalyze} disabled={isAnalyzing} icon={isAnalyzing ? Loader : Sparkles} className={`w-full py-4 text-lg ${isAnalyzing ? 'animate-pulse' : ''}`}>
                           {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
                        </Button>
                     </div>
                  </div>
               )}

               {step === 3 && (
                  <div className="h-full flex flex-col lg:flex-row gap-10">
                     {isAnalyzing ? (
                        <div className="w-full flex flex-col items-center justify-center py-20">
                           <Loader size={48} className="text-pd-teal animate-spin mb-4" />
                           <h3 className="font-impact text-2xl text-pd-darkblue uppercase mb-2">Processing Media</h3>
                           <ProgressBar progress={loadingProgress} className="max-w-md" />
                        </div>
                     ) : (
                        <>
                           {/* Analysis Results Content (Reused for both view modes essentially) */}
                           <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                              <div className="flex items-center justify-between bg-pd-lightest/30 p-4 rounded-xl border border-pd-lightest">
                                 <h3 className="font-impact text-2xl text-pd-darkblue uppercase">Analysis Complete</h3>
                                 <Button variant="primary" icon={Save} onClick={saveToLibrary}>Save to Library</Button>
                              </div>
                              <div className="prose max-w-none text-pd-slate font-medium">
                                 {analysisResult?.mechanics || rawAnalysis}
                              </div>
                              {/* ... Other analysis displays ... */}
                           </div>
                        </>
                     )}
                  </div>
               )}
            </div>
         </Card>
      )}

      {/* DETAIL VIEW */}
      {view === 'detail' && selectedItem && (
         <Card className="bg-white border-none shadow-xl !p-0 overflow-hidden">
            <div className="flex flex-col lg:flex-row h-full min-h-[700px]">
               <div className="lg:w-1/2 bg-black relative flex items-center justify-center">
                  {selectedItem.type === 'photo' ? (
                     <img src={selectedItem.url} alt={selectedItem.title} className="w-full h-full object-contain" />
                  ) : (
                     <video src={selectedItem.url} controls className="w-full max-h-full" />
                  )}
                  <button onClick={() => setView('library')} className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black transition backdrop-blur-sm">
                     <ArrowLeft size={20} />
                  </button>
               </div>
               <div className="lg:w-1/2 p-8 overflow-y-auto custom-scrollbar bg-white">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h2 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide leading-none mb-2">{selectedItem.title}</h2>
                        <div className="flex items-center gap-2 text-sm font-bold text-pd-softgrey uppercase tracking-wide">
                           <Calendar size={14} /> {selectedItem.date}
                        </div>
                     </div>
                     <div className="flex gap-2">
                        {selectedItem.tags.map(tag => (
                           <span key={tag} className="text-[10px] font-bold bg-pd-teal/10 text-pd-teal px-2 py-1 rounded uppercase border border-pd-teal/20">{tag}</span>
                        ))}
                     </div>
                  </div>

                  {selectedItem.analysis?.engagement_score && (
                     <div className="bg-pd-darkblue text-white p-6 rounded-2xl mb-8 flex items-center justify-between shadow-lg relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-pd-teal rounded-full opacity-10 -mr-10 -mt-10"></div>
                         <div>
                            <p className="text-xs font-bold text-pd-teal uppercase tracking-wider mb-1">Engagement Score</p>
                            <p className="font-impact text-5xl">{selectedItem.analysis.engagement_score}/10</p>
                         </div>
                         <div className="text-right z-10">
                            <Button variant="secondary" className="!py-2 !px-4 !text-xs" onClick={() => triggerIzzy('score improvement')}>
                               Improve Score
                            </Button>
                         </div>
                     </div>
                  )}

                  <div className="space-y-8">
                     {selectedItem.analysis?.mechanics && (
                        <div>
                           <h4 className="font-impact text-xl text-pd-darkblue uppercase tracking-wide mb-3 flex items-center gap-2">
                              <User size={20} className="text-pd-teal" /> Mechanics
                           </h4>
                           <p className="text-pd-slate leading-relaxed font-medium bg-pd-lightest/30 p-4 rounded-xl border border-pd-lightest">
                              {selectedItem.analysis.mechanics}
                           </p>
                        </div>
                     )}

                     {selectedItem.analysis?.timeline && (
                        <div>
                           <h4 className="font-impact text-xl text-pd-darkblue uppercase tracking-wide mb-4 flex items-center gap-2">
                              <Clock size={20} className="text-pd-teal" /> Timeline
                           </h4>
                           <div className="pl-2 border-l-2 border-pd-lightest ml-2 space-y-6">
                              {selectedItem.analysis.timeline.map((item: any, idx: number) => renderTimelineItem(item, idx))}
                           </div>
                        </div>
                     )}
                     
                     {selectedItem.notes && (
                        <div className="bg-pd-yellow/10 p-4 rounded-xl border border-pd-yellow/30">
                           <h4 className="font-bold text-pd-darkblue text-xs uppercase tracking-wider mb-2">My Notes</h4>
                           <p className="text-pd-slate italic text-sm">"{selectedItem.notes}"</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </Card>
      )}
    </div>
  );
};

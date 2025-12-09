
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
import { BEHAVIOR_TAGS } from '../constants';
import { DataService } from '../services/dataService';

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
  const [library, setLibrary] = useState<MediaItem[]>([]);
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

  useEffect(() => {
      const loadLibrary = async () => {
          const assets = await DataService.fetchMediaAssets(dogData.id);
          setLibrary(assets);
      };
      loadLibrary();
  }, [dogData.id]);

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

  const saveToLibrary = async () => {
    if (!file || !preview) return;
    const newItem: MediaItem = {
        id: `media_${Date.now()}`,
        dogId: dogData.id,
        type: activeTab,
        url: preview,
        thumbnail: preview, 
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        title: `${activeTab === 'video' ? 'Video' : 'Photo'} Analysis`,
        tags: selectedTags,
        notes: userNotes,
        analysis: analysisResult || { mechanics: rawAnalysis }
    };
    
    await DataService.uploadMediaAsset(newItem);
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
                        <h3 className="font-impact text-xl text-pd-darkblue truncate tracking-wide mb-2 group-hover:text-pd-teal transition-colors">{item.title}</h3>
                        <div className="flex flex-wrap gap-2">
                           {item.tags.slice(0, 3).map(t => (
                              <span key={t} className="text-[10px] font-bold bg-pd-lightest px-2 py-1 rounded text-pd-slate uppercase">{t}</span>
                           ))}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* UPLOAD VIEW */}
      {view === 'upload' && (
         <div className="max-w-4xl mx-auto">
            {step === 1 && (
               <Card className="min-h-[400px] flex flex-col items-center justify-center border-2 border-pd-lightest border-dashed hover:border-pd-teal/50 transition-colors bg-white">
                  <div className="w-24 h-24 bg-pd-lightest rounded-full flex items-center justify-center mb-6 text-pd-darkblue">
                     <Upload size={40} />
                  </div>
                  <h2 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide mb-2">Upload Media</h2>
                  <p className="text-pd-slate font-medium mb-8">Select a training video or photo to analyze.</p>
                  
                  <div className="flex gap-4">
                     <Button as="label" htmlFor="file-upload" variant="primary" icon={VideoIcon}>
                        Select File
                     </Button>
                     <input id="file-upload" type="file" accept="video/*,image/*" className="hidden" onChange={handleFileSelect} />
                  </div>
               </Card>
            )}

            {(step === 2 || step === 3) && preview && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <div className="bg-black rounded-3xl overflow-hidden shadow-xl border-4 border-pd-darkblue aspect-video flex items-center justify-center relative">
                        {file?.type.startsWith('video') ? (
                           <video src={preview} controls className="w-full h-full" />
                        ) : (
                           <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                        )}
                        
                        {isAnalyzing && (
                           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 p-8">
                              <Loader size={48} className="animate-spin text-pd-teal mb-4" />
                              <h3 className="font-impact text-2xl tracking-wide uppercase mb-2">Analyzing Mechanics</h3>
                              <p className="text-sm font-medium opacity-80 mb-6 text-center max-w-xs">AI is breaking down engagement, timing, and posture...</p>
                              <ProgressBar progress={loadingProgress} className="w-64 h-2 bg-white/20" />
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="space-y-6">
                     {step === 2 && (
                        <Card className="bg-white border-2 border-pd-lightest h-full flex flex-col">
                           <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide mb-6">Details</h3>
                           
                           <div className="space-y-6 flex-1">
                              <div>
                                 <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">What skills are shown?</label>
                                 <div className="flex flex-wrap gap-2">
                                    {BEHAVIOR_TAGS.map(tag => (
                                       <button 
                                          key={tag} 
                                          onClick={() => toggleTag(tag)}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all uppercase tracking-wide ${
                                             selectedTags.includes(tag) 
                                             ? 'bg-pd-darkblue text-white border-pd-darkblue' 
                                             : 'bg-white text-pd-slate border-pd-lightest hover:border-pd-teal'
                                          }`}
                                       >
                                          {tag}
                                       </button>
                                    ))}
                                 </div>
                              </div>

                              <div>
                                 <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Notes for AI</label>
                                 <textarea 
                                    value={userNotes}
                                    onChange={(e) => setUserNotes(e.target.value)}
                                    placeholder="e.g. He seems slow to sit today..."
                                    className="w-full h-32 bg-pd-lightest/30 rounded-xl p-4 border-2 border-pd-lightest focus:border-pd-teal outline-none font-medium text-pd-darkblue resize-none"
                                 />
                              </div>
                           </div>

                           <Button variant="gemini" onClick={handleAnalyze} icon={Sparkles} className="w-full mt-6 !py-4 shadow-lg">
                              Run Analysis
                           </Button>
                        </Card>
                     )}

                     {step === 3 && !isAnalyzing && (
                        <Card className="bg-white border-2 border-pd-lightest h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-pd-lightest">
                              <div className="p-2 bg-pd-lightest rounded-xl text-pd-teal">
                                 <CheckCircle2 size={24} />
                              </div>
                              <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide">Analysis Complete</h3>
                           </div>

                           <div className="flex-1 space-y-4 mb-6 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                              {analysisResult?.engagement_score && (
                                 <div className="flex items-center justify-between p-4 bg-pd-lightest/30 rounded-xl border border-pd-lightest">
                                    <span className="font-bold text-pd-darkblue">Engagement Score</span>
                                    <span className="font-impact text-2xl text-pd-teal">{analysisResult.engagement_score}/10</span>
                                 </div>
                              )}
                              
                              {analysisResult?.posture_feedback && (
                                 <div className="p-4 bg-pd-lightest/30 rounded-xl border border-pd-lightest">
                                    <p className="text-xs font-bold text-pd-softgrey uppercase mb-1">Posture Feedback</p>
                                    <p className="text-sm font-medium text-pd-slate">{analysisResult.posture_feedback}</p>
                                 </div>
                              )}

                              {rawAnalysis && (
                                 <div className="p-4 bg-pd-lightest/30 rounded-xl border border-pd-lightest">
                                    <p className="text-sm font-medium text-pd-slate whitespace-pre-wrap">{rawAnalysis}</p>
                                 </div>
                              )}
                           </div>

                           <Button variant="primary" onClick={saveToLibrary} icon={Save} className="w-full !py-4 shadow-lg">
                              Save to Library
                           </Button>
                        </Card>
                     )}
                  </div>
               </div>
            )}
         </div>
      )}

      {/* DETAIL VIEW */}
      {view === 'detail' && selectedItem && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right duration-300">
            {/* Media Player / Viewer */}
            <div className="space-y-6">
               <div className="bg-black rounded-3xl overflow-hidden shadow-xl border-4 border-pd-darkblue aspect-video flex items-center justify-center">
                  {selectedItem.type === 'video' ? (
                     <video src={selectedItem.url} controls className="w-full h-full" />
                  ) : (
                     <img src={selectedItem.url} alt={selectedItem.title} className="w-full h-full object-contain" />
                  )}
               </div>
               
               <Card className="bg-white border-2 border-pd-lightest">
                  <h2 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide mb-2">{selectedItem.title}</h2>
                  <div className="flex items-center gap-3 text-sm font-bold text-pd-softgrey uppercase tracking-wide mb-4">
                     <span className="flex items-center gap-1"><Calendar size={14} /> {selectedItem.date}</span>
                     <span>•</span>
                     <span className="text-pd-teal">{selectedItem.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {selectedItem.tags.map(t => (
                        <span key={t} className="text-xs font-bold bg-pd-lightest px-3 py-1 rounded-lg text-pd-darkblue uppercase">{t}</span>
                     ))}
                  </div>
               </Card>
            </div>

            {/* Analysis Breakdown */}
            <div className="space-y-6">
               <Card className="bg-white border-2 border-pd-lightest h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-pd-lightest">
                     <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide flex items-center gap-2">
                        <Sparkles size={24} className="text-pd-teal" /> Breakdown
                     </h3>
                     {selectedItem.analysis?.engagement_score && (
                        <div className="bg-pd-teal/10 text-pd-teal px-3 py-1 rounded-lg font-impact text-xl border border-pd-teal/20">
                           {selectedItem.analysis.engagement_score}/10
                        </div>
                     )}
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8 max-h-[500px]">
                     {/* Timeline */}
                     {selectedItem.analysis?.timeline && (
                        <div>
                           <h4 className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-4">Event Timeline</h4>
                           <div className="space-y-0 pl-2">
                              {selectedItem.analysis.timeline.map((item, i) => renderTimelineItem(item, i))}
                           </div>
                        </div>
                     )}

                     {/* Mechanics & Recs */}
                     {(selectedItem.analysis?.mechanics || selectedItem.analysis?.recommendations) && (
                        <div className="space-y-4">
                           {selectedItem.analysis.mechanics && (
                              <div className="bg-pd-lightest/30 p-4 rounded-xl border border-pd-lightest">
                                 <h4 className="font-impact text-lg text-pd-darkblue uppercase mb-2">Mechanics</h4>
                                 <p className="text-pd-slate font-medium text-sm leading-relaxed">{selectedItem.analysis.mechanics}</p>
                              </div>
                           )}
                           {selectedItem.analysis.recommendations && (
                              <div className="bg-pd-yellow/10 p-4 rounded-xl border border-pd-yellow/30">
                                 <h4 className="font-impact text-lg text-pd-darkblue uppercase mb-2 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-pd-yellow" /> Recommendations
                                 </h4>
                                 <ul className="space-y-2">
                                    {selectedItem.analysis.recommendations.map((rec, i) => (
                                       <li key={i} className="flex items-start gap-2 text-sm font-medium text-pd-slate">
                                          <div className="w-1.5 h-1.5 rounded-full bg-pd-yellow mt-1.5 shrink-0"></div>
                                          {rec}
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           )}
                        </div>
                     )}
                  </div>

                  <div className="pt-6 border-t-2 border-pd-lightest mt-4">
                     <Button variant="secondary" className="w-full" icon={MessageCircle} onClick={() => triggerIzzy('this breakdown')}>
                        Ask AI about this
                     </Button>
                  </div>
               </Card>
            </div>
         </div>
      )}
    </div>
  );
};

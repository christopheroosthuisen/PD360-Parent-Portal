
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronRight, Loader, BookOpen, Image as ImageIcon, Video as VideoIcon, Upload, X, Calendar, RefreshCw, Sun, Moon, Tv, Trash2, LayoutTemplate } from 'lucide-react';
import { Button, Card, ProgressBar } from './UI';
import { DogData, DailyPlan } from '../types';
import { getCurrentGrade, SKILL_TREE, TRAINER_NOTES } from '../constants';
import { generateContent } from '../services/gemini';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data-URL prefix (e.g. "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// --- AI Assistant Component ---
export const AIAssistant: React.FC<{ dogData: DogData }> = ({ dogData }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi! I'm the PD360 Assistant. I can explain ${dogData.name}'s current phases or answer questions about dog training.` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input;
    const newMsg = { role: 'user', text: userText };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    const gradeInfo = getCurrentGrade(dogData.currentScore);

    const context = `
      Dog: ${dogData.name}
      Current Score: ${dogData.currentScore}
      Current Grade: ${gradeInfo.current.name} (Min Score: ${gradeInfo.current.minScore})
      Next Grade: ${gradeInfo.next.name} (Threshold: ${gradeInfo.next.minScore})
      
      Standard Phases (1-5):
      1=Unknown, 2=Teaching, 3=Reinforcing, 4=Proofing, 5=Maintenance.
      
      Inappropriate Behavior Scale (1-5):
      1=Frequent, 2=Often, 3=Occasional, 4=Rarely, 5=Never (Goal).
      
      Skill Data: ${JSON.stringify(SKILL_TREE)}
      Recent Notes: ${JSON.stringify(TRAINER_NOTES)}
    `;
    
    const systemPrompt = `You are the AI assistant for Partners Dogs 360. 
    Strictly adhere to the PD360 definitions found in the context.
    Reference the specific School Grade (${gradeInfo.current.name}) when talking about progress.
    
    Context: ${context}`;

    // Use Gemini 3 Pro Preview for the chatbot
    const responseText = await generateContent(userText, "gemini-3-pro-preview", systemPrompt);

    setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl overflow-hidden border-2 border-pd-lightest shadow-xl">
      <div className="p-6 bg-pd-darkblue text-white flex items-center gap-4 border-b-4 border-pd-teal">
        <div className="bg-white/10 p-3 rounded-2xl text-pd-yellow backdrop-blur-sm">
          <Sparkles size={24} />
        </div>
        <div>
          <h3 className="font-impact text-2xl tracking-wide leading-none">PD360 AI EXPERT</h3>
          <p className="text-xs text-pd-teal font-bold uppercase tracking-wider mt-1">Powered by Gemini 3 Pro</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-pd-lightest/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed font-medium ${
              msg.role === 'user' 
                ? 'bg-pd-darkblue text-white rounded-tr-none shadow-md' 
                : 'bg-white border-2 border-pd-lightest text-pd-slate rounded-tl-none shadow-sm'
            }`}>
              <div className="markdown-prose">
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border-2 border-pd-lightest">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-pd-slate rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pd-slate rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-pd-slate rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-5 bg-white border-t-2 border-pd-lightest">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about phases, scoring, or grades..."
            disabled={isTyping}
            className="flex-1 bg-pd-lightest/30 border-2 border-pd-lightest rounded-xl px-5 py-4 focus:outline-none focus:border-pd-teal focus:bg-white transition-all text-pd-darkblue font-medium placeholder-pd-softgrey"
          />
          <Button onClick={handleSend} className="!px-5 !bg-pd-darkblue" disabled={isTyping}>
            {isTyping ? <Loader size={20} className="animate-spin" /> : <ChevronRight size={24} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Image Analyzer Component ---
export const ImageAnalyzer: React.FC<{ dogData: DogData }> = ({ dogData }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) return;
    setIsAnalyzing(true);

    try {
      const base64Data = await fileToBase64(imageFile);
      const prompt = `Analyze this image of a dog. Identify the breed if possible, their body language (tail position, ears, posture), and suggest what emotional state they might be in (e.g. relaxed, alert, stressed). If it looks like a training scenario, provide feedback.`;
      
      const result = await generateContent(
        prompt, 
        "gemini-3-pro-preview", 
        "You are a professional dog behaviorist and trainer.", 
        { mimeType: imageFile.type, data: base64Data }
      );
      
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      setAnalysis("Failed to analyze the image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setImageFile(null);
    setAnalysis(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide">Behavior Analysis</h2>
        <p className="text-pd-slate font-medium">Upload a photo of {dogData.name} to get insights on body language.</p>
      </div>

      <Card className="min-h-[400px] flex flex-col items-center justify-center border-2 border-pd-lightest">
        {!selectedImage ? (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-pd-lightest/50 rounded-full flex items-center justify-center mx-auto text-pd-darkblue border-2 border-pd-lightest">
              <ImageIcon size={48} />
            </div>
            <div>
              <p className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide">Upload a photo</p>
              <p className="text-pd-softgrey font-bold text-sm uppercase tracking-wider mt-1">JPG or PNG up to 5MB</p>
            </div>
            <div className="pt-2">
              <Button as="label" htmlFor="image-upload" variant="secondary" icon={Upload}>
                Choose File
              </Button>
              <input 
                id="image-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageSelect}
              />
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <div className="relative max-w-md mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-pd-lightest">
              <img src={selectedImage} alt="Selected" className="w-full h-auto" />
              <button 
                onClick={reset}
                className="absolute top-3 right-3 bg-pd-darkblue text-white p-2 rounded-full hover:bg-pd-slate transition border-2 border-white/20"
              >
                <X size={20} />
              </button>
            </div>

            {!analysis && (
              <div className="flex justify-center">
                <Button 
                  variant="gemini" 
                  onClick={analyzeImage} 
                  disabled={isAnalyzing}
                  icon={isAnalyzing ? Loader : Sparkles}
                  className={isAnalyzing ? "animate-pulse" : ""}
                >
                  {isAnalyzing ? "Analyzing Body Language..." : "Analyze with Gemini Pro"}
                </Button>
              </div>
            )}

            {analysis && (
              <div className="bg-white rounded-3xl border-2 border-pd-lightest p-8 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-pd-lightest">
                  <div className="p-2 bg-pd-lightest rounded-xl">
                    <Sparkles className="text-pd-teal" size={24} />
                  </div>
                  <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide">Analysis Result</h3>
                </div>
                <div className="markdown-prose text-pd-slate font-medium leading-relaxed whitespace-pre-wrap">
                  {analysis}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

// --- Training Plan Generator Component ---
export const TrainingPlanGenerator: React.FC<{ dogData: DogData }> = ({ dogData }) => {
  const [plan, setPlan] = useState<DailyPlan[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isRegeneratingDay, setIsRegeneratingDay] = useState<number | null>(null);

  // Prepare skill list for Gemini context
  const availableSkills = SKILL_TREE.flatMap(cat => cat.skills.map(s => s.name));

  // Load plan from localStorage on mount
  useEffect(() => {
    const savedPlan = localStorage.getItem(`pd360_homework_${dogData.id}`);
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error("Failed to parse saved plan", e);
      }
    }
  }, [dogData.id]);

  // Save plan to localStorage whenever it updates
  useEffect(() => {
    if (plan) {
      localStorage.setItem(`pd360_homework_${dogData.id}`, JSON.stringify(plan));
    }
  }, [plan, dogData.id]);

  // Simulate progress
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + (Math.random() * 5);
        });
      }, 300);
    } else {
      setLoadingProgress(100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const generatePlan = async () => {
    setIsLoading(true);
    const gradeInfo = getCurrentGrade(dogData.currentScore);
    
    // Prompt engineering with actual app skills
    const prompt = `Generate a 7-day structured training plan for ${dogData.name}, a ${dogData.breeds.join(', ')} currently in ${gradeInfo.current.name} grade.
    
    CRITICAL: You must select exercises ONLY from the following list of known skills. Do not invent new names.
    Available Skills: ${availableSkills.join(', ')}.

    Constraints:
    1. Format: JSON array of objects. Each object represents a day.
    2. Sessions per day: Morning (10-15m), Evening (10-15m), and Optional "Life Skills" Bonus.
    3. Structure: Morning/Evening sessions should ideally integrate with potty breaks (e.g., Start in crate -> Session -> Potty).
    4. Content: Each session must focus on 2-3 specific behaviors from the list provided above. Rotate categories (Obedience, Tricks, Management) to keep it fresh.
    
    Required JSON Schema per day object:
    {
      "day": "Day 1",
      "focus": "String (e.g., 'Focus & Engagement')",
      "morning": { "title": "String", "duration": "String", "exercises": ["Exact Skill Name 1", "Exact Skill Name 2"] },
      "evening": { "title": "String", "duration": "String", "exercises": ["Exact Skill Name 3", "Exact Skill Name 4"] },
      "bonus": { "title": "String", "exercises": ["Exact Skill Name 5"] }
    }
    
    Strictly return ONLY the JSON array.`;

    const systemPrompt = "You are a PD360 Certified Trainer. You create concise, actionable, and balanced training schedules using the official PD360 skill curriculum.";

    try {
      const responseText = await generateContent(prompt, "gemini-3-pro-preview", systemPrompt);
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsedPlan = JSON.parse(cleanJson);
      setPlan(parsedPlan);
    } catch (e) {
      console.error("Failed to generate/parse plan", e);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateDay = async (dayIndex: number) => {
    if (!plan) return;
    setIsRegeneratingDay(dayIndex);
    const gradeInfo = getCurrentGrade(dogData.currentScore);

    const prompt = `Regenerate a single day of training for ${dogData.name} (${gradeInfo.current.name}).
    Day: ${plan[dayIndex].day}.
    
    CRITICAL: Select exercises ONLY from: ${availableSkills.join(', ')}.

    Required JSON Schema:
    {
      "day": "${plan[dayIndex].day}",
      "focus": "String",
      "morning": { "title": "String", "duration": "String", "exercises": ["String", "String"] },
      "evening": { "title": "String", "duration": "String", "exercises": ["String", "String"] },
      "bonus": { "title": "String", "exercises": ["String"] }
    }
    Strictly return ONLY the JSON object for this day.`;

    try {
       const responseText = await generateContent(prompt, "gemini-3-pro-preview", "You are a PD360 Trainer.");
       const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
       const newDay = JSON.parse(cleanJson);
       
       const newPlan = [...plan];
       newPlan[dayIndex] = newDay;
       setPlan(newPlan);
    } catch (e) {
       console.error("Failed to regenerate day", e);
    } finally {
       setIsRegeneratingDay(null);
    }
  };

  const clearPlan = () => {
     setPlan(null);
     localStorage.removeItem(`pd360_homework_${dogData.id}`);
  };

  const triggerIzzyDetail = (exercise: string) => {
    const event = new CustomEvent('ask-izzy', { detail: { message: `How do I train "${exercise}"?`, autoSend: true } });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-impact text-5xl text-pd-darkblue tracking-wide uppercase mb-2">WEEKLY TRAINING PLAN</h1>
          <p className="text-pd-slate text-lg font-medium">Custom 7-day plan tailored to {dogData.name}'s grade.</p>
        </div>
        
        <div className="flex gap-3">
            {plan && (
                <Button variant="secondary" onClick={clearPlan} icon={Trash2} className="!px-6">
                    Clear
                </Button>
            )}
            <Button 
            variant="gemini" 
            onClick={generatePlan} 
            disabled={isLoading}
            icon={isLoading ? undefined : Sparkles}
            className={`!px-10 !py-4 !text-lg shadow-xl hover:shadow-2xl transition-all ${isLoading ? "cursor-not-allowed opacity-80" : ""}`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader size={20} className="animate-spin" /> Building Plan...
                </span>
              ) : plan ? "Regenerate Week" : "Generate Plan"}
            </Button>
        </div>
      </div>

      {!plan && !isLoading && (
        <div className="bg-white border-4 border-pd-lightest border-dashed rounded-3xl p-16 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm group hover:border-pd-teal/30 transition-colors">
          <div className="w-32 h-32 bg-pd-lightest/50 rounded-full flex items-center justify-center mb-8 text-pd-softgrey group-hover:text-pd-teal group-hover:bg-pd-teal/10 transition-colors">
            <LayoutTemplate size={64} strokeWidth={1.5} />
          </div>
          <h3 className="font-impact text-4xl text-pd-darkblue tracking-wide uppercase mb-3">Ready for the week?</h3>
          <p className="text-pd-slate text-xl max-w-lg mx-auto font-medium leading-relaxed">
            Click <span className="font-bold text-pd-darkblue">Generate Plan</span> to build a custom 7-day schedule integrated with your routine.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="min-h-[400px] flex items-center justify-center bg-white rounded-3xl border-2 border-pd-lightest shadow-sm">
          <div className="text-center space-y-8 w-full max-w-md px-6">
             <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-pd-lightest rounded-full"></div>
                <div className="absolute inset-0 border-4 border-pd-teal rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Sparkles className="text-pd-yellow" size={32} />
                </div>
             </div>
             <div>
               <h3 className="font-impact text-3xl text-pd-darkblue tracking-wide uppercase mb-2">Structuring Sessions</h3>
               <p className="text-pd-slate font-medium">Analyzing {dogData.name}'s skill tree...</p>
             </div>
             <ProgressBar progress={loadingProgress} className="w-full" />
          </div>
        </div>
      )}

      {plan && !isLoading && (
        <div className="grid grid-cols-1 gap-10">
           {plan.map((day, idx) => (
             <div key={idx} className="relative">
                {/* Day Header */}
                <div className="flex items-center gap-4 mb-6">
                   <div className="bg-pd-darkblue text-white px-6 py-2.5 rounded-2xl font-impact text-2xl tracking-wide uppercase shadow-lg flex items-center gap-3 border-b-4 border-pd-teal">
                     {day.day}
                     {isRegeneratingDay === idx && <Loader size={20} className="animate-spin text-pd-teal" />}
                   </div>
                   <div className="h-0.5 bg-pd-lightest flex-1 rounded-full"></div>
                   <div className="flex items-center gap-4">
                        <span className="text-pd-softgrey font-bold uppercase text-sm tracking-wider hidden sm:inline bg-white px-4 py-2 rounded-xl border-2 border-pd-lightest shadow-sm">
                           Focus: <span className="text-pd-darkblue">{day.focus}</span>
                        </span>
                        <button 
                            onClick={() => regenerateDay(idx)}
                            disabled={isRegeneratingDay !== null}
                            className="p-2.5 bg-white border-2 border-pd-lightest rounded-xl hover:border-pd-teal text-pd-slate hover:text-pd-teal transition-all hover:shadow-md"
                            title="Regenerate this day"
                        >
                            <RefreshCw size={20} className={isRegeneratingDay === idx ? "animate-spin" : ""} />
                        </button>
                   </div>
                </div>

                {/* Sessions Grid */}
                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isRegeneratingDay === idx ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                   {/* Morning */}
                   <Card className="bg-white border-t-8 border-t-pd-teal border-2 border-pd-lightest hover:shadow-xl transition-shadow duration-300 group hover:-translate-y-1">
                      <div className="flex items-center gap-4 mb-5">
                         <div className="p-3 bg-pd-teal/10 rounded-xl text-pd-teal group-hover:bg-pd-teal group-hover:text-white transition-colors">
                           <Sun size={28} />
                         </div>
                         <div>
                            <h4 className="font-impact text-2xl text-pd-darkblue tracking-wide uppercase">MORNING</h4>
                            <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wider">{day.morning.duration}</p>
                         </div>
                      </div>
                      <p className="text-sm font-bold text-pd-darkblue mb-4 italic border-l-4 border-pd-lightest pl-3 py-1">"{day.morning.title}"</p>
                      <ul className="space-y-3">
                        {day.morning.exercises.map((ex, i) => (
                          <li key={i} className="flex items-start gap-3">
                             <div className="w-2 h-2 rounded-full bg-pd-teal mt-2 shrink-0 shadow-sm"></div>
                             <button 
                               onClick={() => triggerIzzyDetail(ex)} 
                               className="text-left text-pd-slate font-medium hover:text-pd-teal hover:underline decoration-2 underline-offset-2 transition-colors"
                             >
                               {ex}
                             </button>
                          </li>
                        ))}
                      </ul>
                   </Card>

                   {/* Evening */}
                   <Card className="bg-white border-t-8 border-t-pd-darkblue border-2 border-pd-lightest hover:shadow-xl transition-shadow duration-300 group hover:-translate-y-1">
                      <div className="flex items-center gap-4 mb-5">
                         <div className="p-3 bg-pd-darkblue/10 rounded-xl text-pd-darkblue group-hover:bg-pd-darkblue group-hover:text-white transition-colors">
                           <Moon size={28} />
                         </div>
                         <div>
                            <h4 className="font-impact text-2xl text-pd-darkblue tracking-wide uppercase">EVENING</h4>
                            <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wider">{day.evening.duration}</p>
                         </div>
                      </div>
                      <p className="text-sm font-bold text-pd-darkblue mb-4 italic border-l-4 border-pd-lightest pl-3 py-1">"{day.evening.title}"</p>
                      <ul className="space-y-3">
                        {day.evening.exercises.map((ex, i) => (
                          <li key={i} className="flex items-start gap-3">
                             <div className="w-2 h-2 rounded-full bg-pd-darkblue mt-2 shrink-0 shadow-sm"></div>
                             <button 
                               onClick={() => triggerIzzyDetail(ex)} 
                               className="text-left text-pd-slate font-medium hover:text-pd-teal hover:underline decoration-2 underline-offset-2 transition-colors"
                             >
                               {ex}
                             </button>
                          </li>
                        ))}
                      </ul>
                   </Card>

                   {/* Bonus */}
                   <Card className="bg-pd-lightest/30 border-t-8 border-t-pd-yellow border-2 border-pd-lightest hover:bg-white hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                      <div className="flex items-center gap-4 mb-5">
                         <div className="p-3 bg-pd-yellow/20 rounded-xl text-pd-darkblue group-hover:bg-pd-yellow transition-colors">
                           <Tv size={28} />
                         </div>
                         <div>
                            <h4 className="font-impact text-2xl text-pd-darkblue tracking-wide uppercase">LIFE SKILLS</h4>
                            <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wider">Passive / Bonus</p>
                         </div>
                      </div>
                      <p className="text-sm font-bold text-pd-darkblue mb-4 italic border-l-4 border-pd-lightest pl-3 py-1">"{day.bonus.title}"</p>
                      <ul className="space-y-3">
                        {day.bonus.exercises.map((ex, i) => (
                          <li key={i} className="flex items-start gap-3">
                             <div className="w-2 h-2 rounded-full bg-pd-yellow mt-2 shrink-0 shadow-sm border border-black/5"></div>
                             <span className="text-pd-slate font-medium">{ex}</span>
                          </li>
                        ))}
                      </ul>
                   </Card>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

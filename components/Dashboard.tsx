
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  RefreshCw, 
  TrendingUp, 
  Share2,
  Flame,
  Award,
  Calendar,
  Video,
  ClipboardList,
  PlayCircle,
  GraduationCap,
  Users,
  ArrowUpRight,
  Send,
  Target,
  AlertTriangle,
  Brain,
  ShoppingBag,
  Heart,
  Activity,
  Utensils,
  Syringe,
  Weight,
  Droplets,
  Check,
  MessageCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { Card, Button, Modal } from './UI';
import { DogData, Grade, Note } from '../types';
import { FULL_HISTORY_DATA, RADAR_DATA, TRAINER_NOTES, ACHIEVEMENTS_MOCK } from '../constants';

interface DashboardProps {
  dogData: DogData;
  gradeInfo: { current: Grade; next: Grade };
  isSyncing: boolean;
  onSync: () => void;
  navigate: (view: string, tab?: string) => void;
}

type TimeRange = 7 | 14 | 30 | 60 | 90;

export const Dashboard: React.FC<DashboardProps> = ({ dogData, gradeInfo, isSyncing, onSync, navigate }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  
  const chartData = useMemo(() => {
    return FULL_HISTORY_DATA.slice(-timeRange);
  }, [timeRange]);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Note[]>(TRAINER_NOTES);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  
  // Quick Log State
  const [quickLogStatus, setQuickLogStatus] = useState<{id: string, label: string} | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSendMessage = () => {
     if (!chatInput.trim()) return;
     
     const newMessage: Note = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: 'You',
        content: chatInput,
        type: 'message'
     };
     
     setChatHistory(prev => [...prev, newMessage]);
     setChatInput('');

     setTimeout(() => {
         const response: Note = {
             id: Date.now() + 1,
             date: 'Just now',
             author: 'Mike (Senior Trainer)',
             content: "Thanks for the update! Keep up the consistency with the 'Place' command. You're doing great.",
             type: 'session'
         };
         setChatHistory(prev => [...prev, response]);
     }, 2000);
  };
  
  const handleQuickLog = (type: string, label: string) => {
      setQuickLogStatus({ id: type, label });
      setTimeout(() => setQuickLogStatus(null), 2000);
  };

  const triggerIzzyShare = () => {
    const event = new CustomEvent('ask-izzy', { detail: { message: "How can I share my dog's progress report with my family?", autoSend: true } });
    window.dispatchEvent(event);
  };

  const nextReservation = dogData.reservations?.find(r => r.status === 'Upcoming');

  const { strongestSkill, weakestSkill } = useMemo(() => {
     const sorted = [...RADAR_DATA].sort((a, b) => b.A - a.A);
     return {
         strongestSkill: sorted[0],
         weakestSkill: sorted[sorted.length - 1]
     };
  }, []);

  // Calculate age
  const age = useMemo(() => {
      const today = new Date();
      const birth = new Date(dogData.birthDate);
      let years = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
      return years;
  }, [dogData.birthDate]);

  const nextVax = useMemo(() => {
      return [...dogData.vaccinations].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];
  }, [dogData.vaccinations]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      
      {/* --- GRID SYSTEM --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* 1. Welcome Header (Full Width) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-pd-darkblue p-8 md:p-10 rounded-3xl text-white shadow-xl shadow-pd-darkblue/20 relative overflow-hidden border-b-8 border-pd-teal">
              <div className="absolute top-0 right-0 w-96 h-96 bg-pd-teal rounded-full opacity-10 -mr-20 -mt-20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-pd-yellow rounded-full opacity-5 -ml-20 -mb-20 blur-3xl"></div>
              <img src="logo_3.png" className="absolute top-1/2 right-10 w-64 h-64 object-contain opacity-10 -translate-y-1/2 rotate-12 pointer-events-none mix-blend-overlay" />
              
              <div className="relative z-10">
                <h1 className="font-impact text-5xl md:text-7xl tracking-wide text-white mb-3 drop-shadow-lg">
                  GOOD MORNING, <span className="text-pd-yellow">TEAM {dogData.name.toUpperCase()}</span>
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-pd-teal font-sans text-lg font-medium">
                  <span>{dogData.name} is crushing it in <span className="font-bold text-white underline decoration-pd-yellow underline-offset-4 decoration-4">{gradeInfo.current.name}</span>.</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-pd-teal hidden sm:block"></div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm text-white font-bold backdrop-blur-md border border-white/10 shadow-sm">
                    <Flame size={18} className="text-orange-500 fill-orange-500" />
                    {dogData.streak} Day Streak!
                  </div>
                </div>
              </div>
              <div className="relative z-10 flex gap-3">
                <Button variant="secondary" icon={Share2} className="!px-5 shadow-lg hover:shadow-xl" onClick={triggerIzzyShare}>
                  Share
                </Button>
                <Button 
                  variant="accent"
                  onClick={onSync} 
                  icon={isSyncing ? RefreshCw : undefined}
                  className={`${isSyncing ? "animate-pulse" : ""} shadow-lg hover:shadow-xl`}
                  disabled={isSyncing}
                >
                  {isSyncing ? "Syncing..." : "CRM Synced"}
                </Button>
              </div>
            </div>
        </div>

        {/* 2. Mobile Quick Log (Hidden on Desktop) */}
        <div className="md:hidden col-span-1">
           <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleQuickLog('pee', 'Pee Logged')} className="bg-white p-3 rounded-2xl border-2 border-pd-lightest shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
                {quickLogStatus?.id === 'pee' ? <Check size={24} className="text-emerald-500" /> : <Droplets size={24} className="text-pd-teal" />}
                <span className="text-[10px] font-bold text-pd-darkblue uppercase tracking-wide">Log Pee</span>
              </button>
              <button onClick={() => handleQuickLog('poop', 'Poop Logged')} className="bg-white p-3 rounded-2xl border-2 border-pd-lightest shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
                {quickLogStatus?.id === 'poop' ? <Check size={24} className="text-emerald-500" /> : <div className="text-2xl">💩</div>}
                <span className="text-[10px] font-bold text-pd-darkblue uppercase tracking-wide">Log Poop</span>
              </button>
              <button onClick={() => handleQuickLog('meal', 'Meal Logged')} className="bg-white p-3 rounded-2xl border-2 border-pd-lightest shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
                {quickLogStatus?.id === 'meal' ? <Check size={24} className="text-emerald-500" /> : <Utensils size={24} className="text-orange-500" />}
                <span className="text-[10px] font-bold text-pd-darkblue uppercase tracking-wide">Log Meal</span>
              </button>
           </div>
        </div>

        {/* 3. Command Center (Navigation Grid) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'session', icon: PlayCircle, label: 'Start Session', sub: 'Log reps & mechanics', color: 'text-pd-teal', nav: ['training_hub', 'session'] },
                  { id: 'schedule', icon: Calendar, label: 'Schedule', sub: 'View training plan', color: 'text-pd-darkblue', nav: ['training_hub', 'schedule'] },
                  { id: 'skills', icon: ClipboardList, label: 'Skills Tree', sub: 'Track progress', color: 'text-pd-yellow', nav: ['training_hub', 'skills'] },
                  { id: 'socials', icon: Users, label: 'Socials', sub: 'Feed & packs', color: 'text-emerald-500', nav: ['community'] },
                  { id: 'media', icon: Video, label: 'AI Analysis', sub: 'Review clips', color: 'text-pd-darkblue', nav: ['training_hub', 'analysis'] },
                  { id: 'university', icon: GraduationCap, label: 'University', sub: 'Access courses', color: 'text-pd-teal', nav: ['learning'] },
                  { id: 'market', icon: ShoppingBag, label: 'Marketplace', sub: 'Spots, Pros & Shop', color: 'text-pd-yellow', nav: ['marketplace', 'spots'], span: 2 },
                ].map((widget) => (
                  <div 
                      key={widget.id}
                      onClick={() => navigate(widget.nav[0], widget.nav[1])}
                      className={`bg-white p-5 rounded-2xl border-2 border-pd-lightest hover:border-pd-teal hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-32 ${widget.span ? 'col-span-2' : ''}`}
                  >
                      <div className="flex justify-between items-start relative z-10">
                          <div className={`p-2.5 rounded-xl ${widget.color === 'text-pd-yellow' ? 'bg-pd-yellow/20' : widget.color === 'text-pd-teal' ? 'bg-pd-teal/10' : widget.color === 'text-emerald-500' ? 'bg-emerald-50' : 'bg-pd-lightest'} ${widget.color} group-hover:scale-110 transition-transform`}>
                              <widget.icon size={24} />
                          </div>
                          <ArrowUpRight size={18} className="text-pd-lightest group-hover:text-pd-darkblue transition-colors" />
                      </div>
                      <div className="relative z-10">
                          <p className="font-impact text-lg text-pd-darkblue leading-none mb-1 uppercase tracking-wide">{widget.label}</p>
                          <p className="text-[10px] text-pd-slate font-bold uppercase tracking-wider">{widget.sub}</p>
                      </div>
                      {/* Decorative Background Shapes */}
                      <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full transition-transform group-hover:scale-150 -mr-4 -mt-4 opacity-10 ${widget.color === 'text-pd-teal' ? 'bg-pd-teal' : widget.color === 'text-pd-yellow' ? 'bg-pd-yellow' : 'bg-pd-darkblue'}`}></div>
                  </div>
                ))}
            </div>
        </div>

        {/* 4. Daily Mission (2 Columns) */}
        <div className="col-span-1 md:col-span-2 h-full">
            <Card className="bg-gradient-to-r from-pd-darkblue to-slate-900 text-white border-none relative overflow-hidden shadow-lg h-full flex flex-col justify-center group min-h-[180px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pd-teal rounded-full opacity-10 -mr-16 -mt-16 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 shrink-0">
                        <Target size={32} className="text-pd-yellow" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-impact text-2xl text-pd-teal uppercase tracking-wide mb-1">Today's Mission</h3>
                        <p className="text-white text-xl font-bold leading-tight mb-2">Focus Area: {weakestSkill.subject}</p>
                        <p className="text-pd-lightest text-sm font-medium opacity-80 leading-relaxed mb-4 sm:mb-0">
                            Consistency score is low ({weakestSkill.A}/5). 
                            Try a 10-minute session focusing on duration.
                        </p>
                    </div>
                    <Button variant="accent" onClick={() => navigate('training_hub', 'session')} icon={PlayCircle} className="whitespace-nowrap shadow-lg shrink-0">
                        Start
                    </Button>
                </div>
            </Card>
        </div>

        {/* 5. Vitals (1 Column) */}
        <div className="col-span-1 h-full">
             <Card className="bg-white border-2 border-pd-lightest p-5 h-full flex flex-col justify-between min-h-[180px]">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-impact text-lg text-pd-darkblue uppercase flex items-center gap-2">
                        <Heart className="text-rose-500 fill-rose-500" size={18} /> Vitals
                    </h3>
                    <button onClick={() => navigate('profile')} className="text-[10px] font-bold text-pd-softgrey hover:text-pd-darkblue uppercase transition-colors">Edit</button>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-3">
                    <div className="flex items-center justify-between text-sm p-2 bg-pd-lightest/10 rounded-lg">
                        <span className="text-pd-softgrey font-bold uppercase text-xs flex items-center gap-2"><Weight size={14}/> Weight</span>
                        <span className="font-bold text-pd-darkblue">{dogData.weight} lbs</span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 bg-pd-lightest/10 rounded-lg">
                        <span className="text-pd-softgrey font-bold uppercase text-xs flex items-center gap-2"><Activity size={14}/> Age</span>
                        <span className="font-bold text-pd-darkblue">{age} Yrs</span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 bg-pd-lightest/10 rounded-lg">
                        <span className="text-pd-softgrey font-bold uppercase text-xs flex items-center gap-2"><Syringe size={14}/> Vax</span>
                        <span className={`font-bold ${nextVax?.status === 'valid' ? 'text-emerald-600' : 'text-orange-500'}`}>
                           {nextVax?.status === 'valid' ? 'Valid' : 'Check'}
                        </span>
                    </div>
                </div>
            </Card>
        </div>

        {/* 6. Badges (1 Column) */}
        <div className="col-span-1 h-full">
            <Card className="bg-gradient-to-br from-pd-darkblue to-slate-900 text-white border-none shadow-md relative overflow-hidden h-full flex flex-col min-h-[180px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pd-teal rounded-full opacity-10 -mr-10 -mt-10 blur-3xl"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="font-impact text-lg tracking-wide uppercase flex items-center gap-2">
                        <Award className="text-pd-yellow" size={18} /> Badges
                    </h3>
                    <button onClick={() => setShowBadgesModal(true)} className="text-[10px] font-bold text-pd-teal uppercase hover:text-white transition-colors">View All</button>
                </div>
                <div className="flex-1 flex items-center justify-between gap-2 relative z-10">
                    {dogData.achievements.filter(a => !a.isLocked).slice(0, 3).map(ach => (
                        <div key={ach.id} className="flex flex-col items-center gap-2 group cursor-pointer p-2 rounded-xl hover:bg-white/10 transition-colors w-full" title={ach.title}>
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl border border-white/10 group-hover:bg-white/20 transition-colors shadow-sm">
                                {ach.icon}
                            </div>
                            <p className="text-[8px] font-bold uppercase tracking-wider text-pd-lightest text-center leading-tight">{ach.title}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>

        {/* 7. Skill Radar (2 Columns) */}
        <div className="col-span-1 md:col-span-2 min-h-[420px]">
            <Card className="bg-white border-2 border-pd-lightest h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-impact text-xl text-pd-darkblue tracking-wide uppercase flex items-center gap-2">
                        <Activity size={20} className="text-pd-teal" /> Skill Proficiency
                    </h2>
                    <Button variant="ghost" className="!py-1 !px-3 !text-xs" onClick={() => navigate('training_hub', 'skills')}>Details</Button>
                </div>
                <div className="flex-1 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                            <PolarGrid stroke="#ebeded" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#022D41', fontSize: 11, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.5px' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                            <Radar name={dogData.name} dataKey="A" stroke="#34C6B9" strokeWidth={3} fill="#34C6B9" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>

        {/* 8. Trainer Chat (2 Columns) */}
        <div className="col-span-1 md:col-span-2 min-h-[420px]">
            <Card className="bg-white border-2 border-pd-lightest h-full flex flex-col shadow-sm p-0 overflow-hidden">
                <div className="p-5 border-b-2 border-pd-lightest flex items-center justify-between bg-pd-lightest/10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Trainer" className="w-10 h-10 rounded-full object-cover border-2 border-pd-teal" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
                        </div>
                        <div>
                            <h2 className="font-impact text-xl text-pd-darkblue tracking-wide uppercase">Trainer Chat</h2>
                            <p className="text-xs text-pd-slate font-bold uppercase">Mike (Senior Trainer)</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white custom-scrollbar">
                    {chatHistory.map((note) => (
                        <div key={note.id} className={`flex flex-col ${note.author === 'You' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[85%] p-3 rounded-xl text-sm font-medium shadow-sm ${
                                note.author === 'You' 
                                ? 'bg-pd-teal text-pd-darkblue rounded-tr-none' 
                                : note.type === 'system' 
                                    ? 'bg-pd-lightest/50 text-pd-softgrey italic border border-pd-lightest w-full text-center'
                                    : 'bg-pd-lightest text-pd-slate rounded-tl-none'
                            }`}>
                                {note.type !== 'system' && note.author !== 'You' && <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-pd-darkblue/70">{note.author}</p>}
                                {note.content}
                            </div>
                            {note.type !== 'system' && <span className="text-[10px] text-pd-softgrey mt-1 px-1">{note.date}</span>}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-pd-lightest/20 border-t-2 border-pd-lightest">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Message Mike..."
                            className="flex-1 bg-white border-2 border-pd-lightest rounded-xl px-4 py-2 text-sm font-medium focus:border-pd-teal outline-none text-pd-darkblue placeholder-pd-softgrey transition-colors"
                        />
                        <Button variant="primary" className="!px-4" onClick={handleSendMessage}>
                            <Send size={18} />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>

        {/* 9. Score History (3 Columns) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 min-h-[350px]">
            <Card className="bg-white border-2 border-pd-lightest h-full flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h2 className="font-impact text-xl text-pd-darkblue tracking-wide uppercase flex items-center gap-2">
                        <TrendingUp size={20} className="text-pd-teal" /> Score History
                    </h2>
                    <div className="flex gap-2 items-center overflow-x-auto pb-2 md:pb-0">
                        {[7, 14, 30, 60, 90].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range as TimeRange)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${timeRange === range ? 'bg-pd-darkblue text-white border-pd-darkblue shadow-sm' : 'bg-white text-pd-slate border-pd-lightest hover:border-pd-softgrey'}`}
                        >
                            {range}D
                        </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#022D41" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#022D41" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ebeded" vertical={false} />
                        <XAxis dataKey="date" stroke="#9ea5a9" fontSize={12} tickLine={false} axisLine={false} tick={{fontFamily: 'Oswald', letterSpacing: '0.5px', fill: '#9ea5a9'}} dy={10} />
                        <YAxis stroke="#9ea5a9" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} tick={{fontFamily: 'Roboto', fontWeight: 'bold', fill: '#9ea5a9'}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgb(0 0 0 / 0.15)', fontFamily: 'Roboto', backgroundColor: '#ffffff', color: '#022D41', padding: '16px' }}
                            itemStyle={{padding: '4px 0', fontSize: '13px', fontWeight: 600}}
                            cursor={{stroke: '#ebeded', strokeWidth: 2}}
                        />
                        <Line name="Total Score" type="monotone" dataKey="score" stroke="#022D41" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#022D41', stroke: '#fff', strokeWidth: 2 }} />
                        <Line name="Obedience" type="monotone" dataKey="obedience" stroke="#34C6B9" strokeWidth={2} dot={false} />
                        <Line name="Social" type="monotone" dataKey="social" stroke="#FFDE59" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>

        {/* 10. Next Stay (1 Column) */}
        <div className="col-span-1 min-h-[350px]">
            <Card className="bg-white border-2 border-pd-lightest h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-rose-50 p-2 rounded-lg text-rose-500">
                        <Calendar size={20} />
                    </div>
                    <h2 className="font-impact text-xl tracking-wide text-pd-darkblue uppercase">Next Stay</h2>
                </div>
                <div className="flex-1 space-y-4">
                    {nextReservation ? (
                        <div className="p-4 bg-pd-lightest/30 rounded-xl border border-pd-lightest h-full flex flex-col justify-center">
                            <p className="font-bold text-pd-darkblue font-impact text-lg tracking-wide">{nextReservation.serviceName}</p>
                            <p className="text-xs text-pd-teal font-bold uppercase mt-1 mb-4 bg-pd-teal/10 w-fit px-2 py-0.5 rounded">{nextReservation.status}</p>
                            <div className="space-y-2 text-sm text-pd-slate">
                                <p className="flex items-center gap-2 font-medium"><Calendar size={14} /> {new Date(nextReservation.startDate).toLocaleDateString()}</p>
                                <p className="text-xs text-pd-softgrey uppercase font-bold tracking-wide">to</p>
                                <p className="flex items-center gap-2 font-medium"><Calendar size={14} /> {new Date(nextReservation.endDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center p-6 text-pd-softgrey font-medium italic border-2 border-dashed border-pd-lightest rounded-xl bg-pd-lightest/10">
                            No upcoming reservations found.
                        </div>
                    )}
                </div>
                <Button variant="secondary" className="w-full mt-4 !py-3 !text-xs font-bold uppercase tracking-wider" onClick={() => navigate('marketplace', 'spots')}>
                    Book New Stay
                </Button>
            </Card>
        </div>

      </div>

      {/* Badges Modal */}
      <Modal isOpen={showBadgesModal} onClose={() => setShowBadgesModal(false)} title="Achievements">
         <div className="space-y-6">
            <div className="text-center mb-6">
               <div className="inline-flex items-center justify-center p-4 bg-pd-yellow/10 rounded-full mb-3 border border-pd-yellow/20">
                  <Award size={32} className="text-pd-yellow" />
               </div>
               <p className="text-pd-slate text-sm font-medium">Earn badges by maintaining streaks, mastering skills, and completing courses.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {ACHIEVEMENTS_MOCK.map((ach) => {
                  const isEarned = !ach.isLocked;
                  return (
                     <div 
                        key={ach.id} 
                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                           isEarned 
                           ? 'bg-white border-pd-teal shadow-sm' 
                           : 'bg-pd-lightest/20 border-pd-lightest opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:bg-white hover:shadow-md hover:border-pd-lightest'
                        }`}
                     >
                        <div className="flex items-start gap-4">
                           <div className={`text-3xl ${isEarned ? '' : 'opacity-50'}`}>{ach.icon}</div>
                           <div>
                              <h4 className={`font-impact text-lg tracking-wide uppercase ${isEarned ? 'text-pd-darkblue' : 'text-pd-slate'}`}>
                                 {ach.title}
                              </h4>
                              <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mt-1 mb-2">{ach.description}</p>
                              {isEarned ? (
                                 <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pd-teal bg-pd-teal/10 px-2 py-0.5 rounded-full uppercase tracking-wide border border-pd-teal/20">
                                    ✓ Earned {ach.dateEarned ? `on ${new Date(ach.dateEarned).toLocaleDateString()}` : ''}
                                 </span>
                              ) : (
                                 <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pd-slate bg-pd-lightest px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    Locked
                                 </span>
                              )}
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </Modal>
    </div>
  );
};

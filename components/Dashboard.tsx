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

  const assignedTrainerName = dogData.assignedTrainer?.name.split(' ')[0] || 'Trainer';
  const trainerRole = dogData.assignedTrainer?.role || 'Support Team';

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
             author: `${assignedTrainerName} (${trainerRole})`,
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-pd-darkblue p-8 md:p-10 rounded-3xl text-white shadow-xl shadow-pd-darkblue/20 relative overflow-hidden border-b-8 border-pd-teal">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pd-teal rounded-full opacity-10 -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pd-yellow rounded-full opacity-5 -ml-20 -mb-20 blur-3xl"></div>
        <img src="logo_3.png" className="absolute top-1/2 right-10 w-64 h-64 object-contain opacity-5 -translate-y-1/2 rotate-12 pointer-events-none mix-blend-overlay" />
        
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

      {/* 2. Quick Log (Mobile Only) */}
      <div className="lg:hidden">
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

      {/* 3. Command Center */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { id: 'session', icon: PlayCircle, label: 'Start Session', sub: 'Log reps', color: 'text-pd-teal', nav: ['training_hub', 'session'] },
            { id: 'schedule', icon: Calendar, label: 'Schedule', sub: 'View plan', color: 'text-pd-darkblue', nav: ['training_hub', 'schedule'] },
            { id: 'skills', icon: ClipboardList, label: 'Skills Tree', sub: 'Progress', color: 'text-pd-yellow', nav: ['training_hub', 'skills'] },
            { id: 'socials', icon: Users, label: 'Socials', sub: 'Feed & packs', color: 'text-emerald-500', nav: ['community'] },
            { id: 'media', icon: Video, label: 'AI Analysis', sub: 'Review clips', color: 'text-pd-darkblue', nav: ['training_hub', 'analysis'] },
            { id: 'university', icon: GraduationCap, label: 'University', sub: 'Courses', color: 'text-pd-teal', nav: ['learning'] },
            { id: 'market', icon: ShoppingBag, label: 'Marketplace', sub: 'Shop & Book', color: 'text-pd-yellow', nav: ['marketplace', 'spots'] },
          ].map((widget) => (
            <div 
                key={widget.id}
                onClick={() => navigate(widget.nav[0], widget.nav[1])}
                className="bg-white p-4 rounded-2xl border-2 border-pd-lightest hover:border-pd-teal hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[120px]"
            >
                <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className={`p-2 rounded-xl ${widget.color === 'text-pd-yellow' ? 'bg-pd-yellow/20' : widget.color === 'text-pd-teal' ? 'bg-pd-teal/10' : widget.color === 'text-emerald-500' ? 'bg-emerald-50' : 'bg-pd-lightest'} ${widget.color} group-hover:scale-110 transition-transform`}>
                        <widget.icon size={24} />
                    </div>
                    <ArrowUpRight size={18} className="text-pd-lightest group-hover:text-pd-darkblue transition-colors" />
                </div>
                <div>
                  <p className="font-impact text-lg text-pd-darkblue leading-none mb-1 relative z-10 uppercase tracking-wide truncate">{widget.label}</p>
                  <p className="text-[10px] text-pd-slate font-bold uppercase tracking-wider relative z-10">{widget.sub}</p>
                </div>
            </div>
          ))}
      </div>

      {/* 4. Main Layout Grid (3 + 1 Columns) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* LEFT COLUMN (Main) */}
          <div className="xl:col-span-3 space-y-8">
              
              {/* Daily Mission */}
              <Card className="bg-gradient-to-r from-pd-darkblue to-slate-900 text-white border-none relative overflow-hidden shadow-lg group p-8">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-pd-teal rounded-full opacity-10 -mr-16 -mt-16 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                      <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 shrink-0">
                          <Target size={40} className="text-pd-yellow" />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                          <div className="inline-flex items-center gap-2 bg-pd-teal/20 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-pd-teal mb-3 border border-pd-teal/20">
                             Priority Focus
                          </div>
                          <h3 className="font-impact text-4xl text-white uppercase tracking-wide mb-2">{weakestSkill.subject}</h3>
                          <p className="text-pd-lightest text-lg font-medium opacity-90 leading-relaxed">
                              Consistency score is low ({weakestSkill.A}/5). 
                              Complete a 10-minute session focusing on duration to boost your grade.
                          </p>
                      </div>
                      <Button variant="accent" onClick={() => navigate('training_hub', 'session')} icon={PlayCircle} className="whitespace-nowrap shadow-lg shrink-0 !py-4 !px-8 !text-xl">
                          Start Mission
                      </Button>
                  </div>
              </Card>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[450px]">
                  {/* Skills Radar */}
                  <Card className="bg-white border-2 border-pd-lightest h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4 shrink-0">
                          <h2 className="font-impact text-xl text-pd-darkblue tracking-wide uppercase flex items-center gap-2">
                              <Activity size={20} className="text-pd-teal" /> Skill Proficiency
                          </h2>
                          <Button variant="ghost" className="!py-1 !px-3 !text-xs" onClick={() => navigate('training_hub', 'skills')}>Details</Button>
                      </div>
                      <div className="flex-1 relative w-full min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                                  <PolarGrid stroke="#ebeded" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#022D41', fontSize: 12, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.5px' }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                  <Radar name={dogData.name} dataKey="A" stroke="#34C6B9" strokeWidth={3} fill="#34C6B9" fillOpacity={0.4} />
                              </RadarChart>
                          </ResponsiveContainer>
                      </div>
                  </Card>

                  {/* Score History */}
                  <Card className="bg-white border-2 border-pd-lightest h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4 shrink-0">
                          <h2 className="font-impact text-xl text-pd-darkblue tracking-wide uppercase flex items-center gap-2">
                              <TrendingUp size={20} className="text-pd-teal" /> Score History
                          </h2>
                          <div className="flex gap-1">
                              {[7, 30, 90].map(range => (
                                  <button
                                      key={range}
                                      onClick={() => setTimeRange(range as TimeRange)}
                                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${timeRange === range ? 'bg-pd-darkblue text-white border-pd-darkblue' : 'bg-white text-pd-slate border-pd-lightest hover:border-pd-softgrey'}`}
                                  >
                                      {range}D
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div className="flex-1 w-full min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#ebeded" vertical={false} />
                                  <XAxis dataKey="date" stroke="#9ea5a9" fontSize={12} tickLine={false} axisLine={false} tick={{fontFamily: 'Oswald', letterSpacing: '0.5px', fill: '#9ea5a9'}} dy={10} />
                                  <YAxis stroke="#9ea5a9" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} tick={{fontFamily: 'Roboto', fontWeight: 'bold', fill: '#9ea5a9'}} />
                                  <Tooltip 
                                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -5px rgb(0 0 0 / 0.15)', fontFamily: 'Roboto', backgroundColor: '#ffffff', color: '#022D41', padding: '12px' }}
                                      cursor={{stroke: '#ebeded', strokeWidth: 2}}
                                  />
                                  <Line name="Score" type="monotone" dataKey="score" stroke="#022D41" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#022D41', stroke: '#fff', strokeWidth: 2 }} />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                  </Card>
              </div>
          </div>

          {/* RIGHT COLUMN (Sidebar) */}
          <div className="xl:col-span-1 space-y-6">
              
              {/* Trainer Chat */}
              <Card className="bg-white border-2 border-pd-lightest flex flex-col h-[500px] shadow-sm overflow-hidden !p-0">
                  <div className="p-5 border-b-2 border-pd-lightest flex items-center justify-between bg-pd-lightest/10">
                      <div className="flex items-center gap-3">
                          <div className="relative">
                              <img src={dogData.assignedTrainer?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"} alt="Trainer" className="w-10 h-10 rounded-full object-cover border-2 border-pd-teal" />
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div>
                              <h2 className="font-impact text-lg text-pd-darkblue tracking-wide uppercase">Coach Chat</h2>
                              <p className="text-xs text-pd-slate font-bold uppercase">{assignedTrainerName}</p>
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white custom-scrollbar">
                      {chatHistory.map((note) => (
                          <div key={note.id} className={`flex flex-col ${note.author === 'You' ? 'items-end' : 'items-start'}`}>
                              <div className={`max-w-[90%] p-3 rounded-xl text-sm font-medium shadow-sm ${
                                  note.author === 'You' 
                                  ? 'bg-pd-teal text-pd-darkblue rounded-tr-none' 
                                  : note.type === 'system' 
                                      ? 'bg-pd-lightest/50 text-pd-softgrey italic border border-pd-lightest w-full text-center text-xs'
                                      : 'bg-pd-lightest text-pd-slate rounded-tl-none'
                              }`}>
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
                              placeholder="Message..."
                              className="flex-1 bg-white border-2 border-pd-lightest rounded-xl px-3 py-2 text-sm font-medium focus:border-pd-teal outline-none text-pd-darkblue"
                          />
                          <Button variant="primary" className="!px-3" onClick={handleSendMessage}>
                              <Send size={16} />
                          </Button>
                      </div>
                  </div>
              </Card>

              {/* Vitals Widget */}
              <Card className="bg-white border-2 border-pd-lightest p-5">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-impact text-lg text-pd-darkblue uppercase flex items-center gap-2">
                          <Heart className="text-rose-500 fill-rose-500" size={18} /> Vitals
                      </h3>
                      <button onClick={() => navigate('profile')} className="text-[10px] font-bold text-pd-softgrey hover:text-pd-darkblue uppercase transition-colors">Edit</button>
                  </div>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm pb-2 border-b border-pd-lightest">
                          <span className="text-pd-softgrey font-bold uppercase text-xs">Weight</span>
                          <span className="font-bold text-pd-darkblue">{dogData.weight} lbs</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pb-2 border-b border-pd-lightest">
                          <span className="text-pd-softgrey font-bold uppercase text-xs">Age</span>
                          <span className="font-bold text-pd-darkblue">{age} Yrs</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-pd-softgrey font-bold uppercase text-xs">Vax Status</span>
                          <span className={`font-bold ${nextVax?.status === 'valid' ? 'text-emerald-600' : 'text-orange-500'}`}>
                             {nextVax?.status === 'valid' ? 'Valid' : 'Check'}
                          </span>
                      </div>
                  </div>
              </Card>

              {/* Next Stay Widget */}
              <Card className="bg-white border-2 border-pd-lightest p-5">
                  <div className="flex items-center gap-2 mb-4">
                      <div className="bg-rose-50 p-1.5 rounded-lg text-rose-500">
                          <Calendar size={16} />
                      </div>
                      <h3 className="font-impact text-lg tracking-wide text-pd-darkblue uppercase">Next Stay</h3>
                  </div>
                  {nextReservation ? (
                      <div className="p-3 bg-pd-lightest/30 rounded-xl border border-pd-lightest">
                          <p className="font-bold text-pd-darkblue text-sm">{nextReservation.serviceName}</p>
                          <p className="text-[10px] text-pd-teal font-bold uppercase mt-1 mb-2">{nextReservation.status}</p>
                          <p className="text-xs text-pd-slate flex items-center gap-2 font-medium">
                             {new Date(nextReservation.startDate).toLocaleDateString()}
                          </p>
                      </div>
                  ) : (
                      <div className="text-center py-4 text-pd-softgrey font-medium italic border-2 border-dashed border-pd-lightest rounded-xl text-xs">
                          No upcoming reservations.
                      </div>
                  )}
                  <Button variant="secondary" className="w-full mt-3 !py-2 !text-xs font-bold uppercase tracking-wider" onClick={() => navigate('marketplace', 'spots')}>
                      Book Now
                  </Button>
              </Card>

              {/* Badges Widget */}
              <Card className="bg-gradient-to-br from-pd-darkblue to-slate-900 text-white border-none shadow-md relative overflow-hidden p-5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pd-teal rounded-full opacity-10 -mr-10 -mt-10 blur-3xl"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                      <h3 className="font-impact text-lg tracking-wide uppercase flex items-center gap-2">
                          <Award className="text-pd-yellow" size={18} /> Badges
                      </h3>
                      <button onClick={() => setShowBadgesModal(true)} className="text-[10px] font-bold text-pd-teal uppercase hover:text-white transition-colors">View All</button>
                  </div>
                  <div className="flex justify-between items-center gap-2 relative z-10">
                      {dogData.achievements.filter(a => !a.isLocked).slice(0, 3).map(ach => (
                          <div key={ach.id} className="flex flex-col items-center group cursor-pointer" title={ach.title}>
                              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-lg border border-white/10 group-hover:bg-white/20 transition-colors">
                                  {ach.icon}
                              </div>
                          </div>
                      ))}
                  </div>
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
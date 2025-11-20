


import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  RefreshCw, 
  CheckCircle, 
  TrendingUp, 
  Settings,
  User,
  Download,
  Share2,
  Flame,
  Award,
  ChevronRight,
  Calendar,
  Video,
  ClipboardList,
  PlayCircle,
  GraduationCap,
  Users,
  ArrowUpRight,
  Send,
  MessageCircle,
  X,
  Target,
  AlertTriangle,
  Brain
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
import { DogData, Grade, Note, Achievement } from '../types';
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
  
  // Filter history based on selected range
  const chartData = useMemo(() => {
    return FULL_HISTORY_DATA.slice(-timeRange);
  }, [timeRange]);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Note[]>(TRAINER_NOTES);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Badges Modal
  const [showBadgesModal, setShowBadgesModal] = useState(false);

  // Scroll chat to bottom
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

     // Simulate trainer response
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

  const nextReservation = dogData.reservations?.find(r => r.status === 'Upcoming');

  // Determine Insights from Radar Data
  const { strongestSkill, weakestSkill } = useMemo(() => {
     const sorted = [...RADAR_DATA].sort((a, b) => b.A - a.A);
     return {
         strongestSkill: sorted[0],
         weakestSkill: sorted[sorted.length - 1]
     };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-pd-darkblue p-8 md:p-10 rounded-3xl text-white shadow-xl shadow-pd-darkblue/10 relative overflow-hidden border-b-8 border-pd-teal">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pd-teal rounded-full opacity-10 -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pd-yellow rounded-full opacity-5 -ml-20 -mb-20 blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="font-impact text-5xl md:text-6xl tracking-wide text-white mb-3">
            GOOD MORNING, <span className="text-pd-yellow">TEAM {dogData.name.toUpperCase()}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-pd-teal font-sans text-lg font-medium">
            <span>{dogData.name} is crushing it in <span className="font-bold text-white underline decoration-pd-yellow underline-offset-4 decoration-4">{gradeInfo.current.name}</span>.</span>
            <div className="h-1.5 w-1.5 rounded-full bg-pd-teal hidden sm:block"></div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm text-white font-bold backdrop-blur-md border border-white/10">
               <Flame size={18} className="text-orange-500 fill-orange-500" />
               {dogData.streak} Day Streak!
            </div>
          </div>
        </div>
        <div className="relative z-10 flex gap-3">
          <Button variant="secondary" icon={Share2} className="!px-5 shadow-lg" onClick={() => alert("Sharing progress...")}>
            Share
          </Button>
          <Button 
            variant="accent"
            onClick={onSync} 
            icon={isSyncing ? RefreshCw : CheckCircle}
            className={`${isSyncing ? "animate-pulse" : ""} shadow-lg`}
            disabled={isSyncing}
          >
            {isSyncing ? "Syncing..." : "CRM Synced"}
          </Button>
        </div>
      </div>

      {/* Command Center Grid - Updated Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
         
         {/* Active Training Widget */}
         <div 
            onClick={() => navigate('training_hub', 'session')}
            className="bg-white p-5 rounded-2xl border-2 border-pd-lightest hover:border-pd-teal hover:shadow-md transition-all cursor-pointer group col-span-1"
         >
             <div className="flex justify-between items-start mb-4">
                 <div className="p-2.5 bg-pd-teal/10 rounded-xl text-pd-teal group-hover:bg-pd-teal group-hover:text-white transition-colors">
                    <PlayCircle size={24} />
                 </div>
                 <ArrowUpRight size={20} className="text-pd-lightest group-hover:text-pd-darkblue transition-colors" />
             </div>
             <p className="font-impact text-xl text-pd-darkblue leading-tight mb-1">Start Session</p>
             <p className="text-xs text-pd-slate font-medium">Log reps & mechanics</p>
         </div>

         {/* Skills Widget */}
         <div 
            onClick={() => navigate('training_hub', 'skills')}
            className="bg-white p-5 rounded-2xl border-2 border-pd-lightest hover:border-pd-yellow hover:shadow-md transition-all cursor-pointer group col-span-1"
         >
             <div className="flex justify-between items-start mb-4">
                 <div className="p-2.5 bg-pd-yellow/20 rounded-xl text-pd-darkblue group-hover:bg-pd-yellow transition-colors">
                    <ClipboardList size={24} />
                 </div>
                 <ArrowUpRight size={20} className="text-pd-lightest group-hover:text-pd-darkblue transition-colors" />
             </div>
             <p className="font-impact text-xl text-pd-darkblue leading-tight mb-1">Skills Tree</p>
             <p className="text-xs text-pd-slate font-medium">Track progress levels</p>
         </div>

         {/* Calendar Widget */}
         <div 
            onClick={() => navigate('training_hub', 'schedule')}
            className="bg-white p-5 rounded-2xl border-2 border-pd-lightest hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group col-span-1"
         >
             <div className="flex justify-between items-start mb-4">
                 <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Calendar size={24} />
                 </div>
                 <ArrowUpRight size={20} className="text-pd-lightest group-hover:text-pd-darkblue transition-colors" />
             </div>
             <p className="font-impact text-xl text-pd-darkblue leading-tight mb-1">Schedule</p>
             <p className="text-xs text-pd-slate font-medium">View training plan</p>
         </div>

         {/* Media Widget */}
         <div 
            onClick={() => navigate('training_hub', 'analysis')}
            className="bg-white p-5 rounded-2xl border-2 border-pd-lightest hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group col-span-1"
         >
             <div className="flex justify-between items-start mb-4">
                 <div className="p-2.5 bg-purple-50 rounded-xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <Video size={24} />
                 </div>
                 <ArrowUpRight size={20} className="text-pd-lightest group-hover:text-pd-darkblue transition-colors" />
             </div>
             <p className="font-impact text-xl text-pd-darkblue leading-tight mb-1">AI Analysis</p>
             <p className="text-xs text-pd-slate font-medium">Review video clips</p>
         </div>

         {/* University Widget */}
         <div 
            onClick={() => navigate('learning')}
            className="bg-white p-5 rounded-2xl border-2 border-pd-lightest hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group col-span-1"
         >
             <div className="flex justify-between items-start mb-4">
                 <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <GraduationCap size={24} />
                 </div>
                 <ArrowUpRight size={20} className="text-pd-lightest group-hover:text-pd-darkblue transition-colors" />
             </div>
             <p className="font-impact text-xl text-pd-darkblue leading-tight mb-1">University</p>
             <p className="text-xs text-pd-slate font-medium">Access courses</p>
         </div>

         {/* Community Widget */}
         <div 
            onClick={() => navigate('community')}
            className="bg-white p-5 rounded-2xl border-2 border-pd-lightest hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group col-span-1"
         >
             <div className="flex justify-between items-start mb-4">
                 <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Users size={24} />
                 </div>
                 <ArrowUpRight size={20} className="text-pd-lightest group-hover:text-pd-darkblue transition-colors" />
             </div>
             <p className="font-impact text-xl text-pd-darkblue leading-tight mb-1">Community</p>
             <p className="text-xs text-pd-slate font-medium">Events & support</p>
         </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols Wide): Skill Balance & Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Enhanced Skill Balance Module - Moved to Main Column */}
          <Card className="bg-white border-2 border-pd-lightest">
             <div className="flex items-center justify-between mb-6">
                <h2 className="font-impact text-2xl text-pd-darkblue tracking-wide uppercase flex items-center gap-2">
                   <Target size={24} className="text-pd-teal" /> SKILL PROFICIENCY
                </h2>
                <Button variant="ghost" className="!py-1 !px-3 !text-xs" onClick={() => navigate('training_hub', 'skills')}>View Breakdown</Button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-64 w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={RADAR_DATA}>
                         <PolarGrid stroke="#ebeded" />
                         <PolarAngleAxis dataKey="subject" tick={{ fill: '#022D41', fontSize: 12, fontFamily: 'Impact', letterSpacing: '0.5px' }} />
                         <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                         <Radar
                            name={dogData.name}
                            dataKey="A"
                            stroke="#34C6B9"
                            strokeWidth={3}
                            fill="#34C6B9"
                            fillOpacity={0.4}
                         />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>

                <div className="space-y-6">
                   <div>
                      <div className="flex items-center gap-2 text-pd-softgrey uppercase font-bold text-xs tracking-wider mb-2">
                         <Award size={14} className="text-pd-teal" /> Top Strength
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                         <div className="flex justify-between items-center mb-1">
                            <span className="font-impact text-lg text-emerald-800 uppercase">{strongestSkill.subject}</span>
                            <span className="font-bold text-emerald-600">{strongestSkill.A}/5</span>
                         </div>
                         <p className="text-sm text-emerald-700 font-medium">Excellent consistency. Keep proofing with higher distractions.</p>
                      </div>
                   </div>

                   <div>
                      <div className="flex items-center gap-2 text-pd-softgrey uppercase font-bold text-xs tracking-wider mb-2">
                         <AlertTriangle size={14} className="text-orange-500" /> Focus Area
                      </div>
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                         <div className="flex justify-between items-center mb-1">
                            <span className="font-impact text-lg text-orange-800 uppercase">{weakestSkill.subject}</span>
                            <span className="font-bold text-orange-600">{weakestSkill.A}/5</span>
                         </div>
                         <p className="text-sm text-orange-700 font-medium">Consistency drops with duration. Try shorter, more frequent sessions.</p>
                      </div>
                   </div>

                   <Button variant="secondary" className="w-full" icon={Brain} onClick={() => navigate('training_hub', 'schedule')}>
                      Get Targeted Plan
                   </Button>
                </div>
             </div>
          </Card>

          {/* Score History Chart */}
          <Card className="bg-white border-2 border-pd-lightest">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h2 className="font-impact text-2xl text-pd-darkblue tracking-wide uppercase flex items-center gap-2">
                 <TrendingUp size={24} className="text-pd-teal" /> SCORE HISTORY
              </h2>
              <div className="flex gap-2 items-center overflow-x-auto pb-2 md:pb-0">
                {[7, 14, 30, 60, 90].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range as TimeRange)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all border ${timeRange === range ? 'bg-pd-darkblue text-white border-pd-darkblue shadow-md' : 'bg-white text-pd-slate border-pd-lightest hover:border-pd-softgrey'}`}
                  >
                    {range}D
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ebeded" vertical={false} />
                  <XAxis dataKey="date" stroke="#9ea5a9" fontSize={12} tickLine={false} axisLine={false} tick={{fontFamily: 'Impact', letterSpacing: '0.5px', fill: '#9ea5a9'}} dy={10} />
                  <YAxis stroke="#9ea5a9" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} tick={{fontFamily: 'Roboto', fontWeight: 'bold', fill: '#9ea5a9'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontFamily: 'Roboto', backgroundColor: '#ffffff', color: '#022D41', padding: '12px' }}
                    itemStyle={{padding: '2px 0', fontSize: '13px', fontWeight: 500}}
                    cursor={{stroke: '#ebeded', strokeWidth: 2}}
                  />
                  <Line name="Total Score" type="monotone" dataKey="score" stroke="#022D41" strokeWidth={4} dot={false} activeDot={{ r: 8, fill: '#022D41', stroke: '#fff', strokeWidth: 2 }} />
                  <Line name="Obedience" type="monotone" dataKey="obedience" stroke="#34C6B9" strokeWidth={2} dot={{r: 0}} activeDot={{r: 5, fill: '#34C6B9'}} />
                  <Line name="Social" type="monotone" dataKey="social" stroke="#FFDE59" strokeWidth={2} dot={{r: 0}} activeDot={{r: 5, fill: '#FFDE59'}} />
                  <Line name="Management" type="monotone" dataKey="management" stroke="#F472B6" strokeWidth={2} dot={{r: 0}} activeDot={{r: 5, fill: '#F472B6'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col Wide): Badges, Chat, Reservations */}
        <div className="space-y-6">
          
          {/* Badges Widget */}
          <Card className="bg-gradient-to-br from-pd-darkblue to-slate-900 text-white border-none shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-pd-teal rounded-full opacity-10 -mr-10 -mt-10 blur-3xl"></div>
             <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                        <Award size={24} className="text-pd-yellow" />
                    </div>
                    <h3 className="font-impact text-2xl tracking-wide uppercase">BADGES</h3>
                </div>
                <button onClick={() => setShowBadgesModal(true)} className="text-xs font-bold text-pd-teal uppercase hover:text-white transition-colors">View All</button>
             </div>
             <div className="space-y-3 relative z-10">
                {dogData.achievements.filter(a => !a.isLocked).slice(0, 3).map(ach => (
                   <div key={ach.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20">
                      <div className="text-2xl drop-shadow-md">{ach.icon}</div>
                      <div>
                         <p className="font-bold font-impact tracking-wide text-lg leading-none">{ach.title}</p>
                         <p className="text-xs text-pd-teal uppercase font-bold tracking-wide mt-1">{ach.description}</p>
                      </div>
                   </div>
                ))}
             </div>
          </Card>

          {/* Trainer Chat */}
          <Card className="bg-white border-2 border-pd-lightest flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-pd-lightest shrink-0">
               <div className="flex items-center gap-3">
                  <div className="relative">
                     <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Trainer" className="w-10 h-10 rounded-full object-cover border-2 border-pd-teal" />
                     <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                     <h2 className="font-impact text-xl text-pd-darkblue tracking-wide uppercase">Trainer Chat</h2>
                     <p className="text-xs text-pd-slate font-bold uppercase">Mike (Senior Trainer)</p>
                  </div>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar mb-4">
              {chatHistory.map((note) => (
                <div key={note.id} className={`flex flex-col ${note.author === 'You' ? 'items-end' : 'items-start'}`}>
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

            <div className="mt-auto pt-2 shrink-0">
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Message Mike..."
                    className="flex-1 bg-pd-lightest/30 border-2 border-pd-lightest rounded-xl px-4 py-2 text-sm font-medium focus:border-pd-teal outline-none text-pd-darkblue"
                  />
                  <Button variant="primary" className="!px-4" onClick={handleSendMessage}>
                     <Send size={18} />
                  </Button>
               </div>
            </div>
          </Card>

          {/* Upcoming Reservation */}
          <Card className="bg-white border-2 border-pd-lightest">
             <div className="flex items-center gap-3 mb-6">
                <div className="bg-rose-50 p-2 rounded-xl">
                   <Calendar className="text-rose-500" size={24} />
                </div>
                <h2 className="font-impact text-2xl tracking-wide text-pd-darkblue uppercase">Reservations</h2>
             </div>
             <div className="space-y-3">
                {nextReservation ? (
                    <div className="p-4 bg-pd-lightest/30 rounded-xl border border-pd-lightest">
                        <p className="font-bold text-pd-darkblue font-impact text-lg">{nextReservation.serviceName}</p>
                        <p className="text-xs text-pd-teal font-bold uppercase mt-1 mb-2">{nextReservation.status}</p>
                        <p className="text-sm text-pd-slate flex items-center gap-2">
                           <Calendar size={14} /> {new Date(nextReservation.startDate).toLocaleDateString()}
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-4 text-pd-softgrey font-medium italic">No upcoming stays.</div>
                )}
                <Button variant="secondary" className="w-full !py-2 !text-xs" onClick={() => navigate('community', 'reservations')}>
                    Book Now
                </Button>
             </div>
          </Card>
        </div>
      </div>

      {/* Badges Modal */}
      <Modal isOpen={showBadgesModal} onClose={() => setShowBadgesModal(false)} title="Achievements">
         <div className="space-y-6">
            <div className="text-center mb-6">
               <div className="inline-flex items-center justify-center p-3 bg-pd-yellow/10 rounded-full mb-3">
                  <Award size={32} className="text-pd-yellow" />
               </div>
               <p className="text-pd-slate text-sm">Earn badges by maintaining streaks, mastering skills, and completing courses.</p>
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
                           : 'bg-pd-lightest/20 border-pd-lightest opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:bg-white hover:shadow-md'
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
                                 <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pd-teal bg-pd-teal/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    <CheckCircle size={10} /> Earned {ach.dateEarned ? `on ${new Date(ach.dateEarned).toLocaleDateString()}` : ''}
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
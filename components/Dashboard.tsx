
import React, { useState, useMemo } from 'react';
import { 
  RefreshCw, 
  CheckCircle, 
  GraduationCap, 
  Camera,
  Dumbbell,
  TrendingUp,
  Settings,
  User,
  Download,
  Share2,
  Flame,
  Award,
  Calendar,
  BookOpen,
  Ticket,
  ChevronRight
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
import { Card, Button } from './UI';
import { DogData, Grade } from '../types';
import { FULL_HISTORY_DATA, RADAR_DATA, TRAINER_NOTES, SKILL_TREE } from '../constants';

interface DashboardProps {
  dogData: DogData;
  gradeInfo: { current: Grade; next: Grade };
  isSyncing: boolean;
  onSync: () => void;
  setActiveView: (view: string) => void;
}

type TimeRange = 7 | 14 | 30 | 60 | 90;

export const Dashboard: React.FC<DashboardProps> = ({ dogData, gradeInfo, isSyncing, onSync, setActiveView }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  
  // Filter history based on selected range
  const chartData = useMemo(() => {
    return FULL_HISTORY_DATA.slice(-timeRange);
  }, [timeRange]);

  // Find skills that need attention
  const attentionSkills = SKILL_TREE
    .flatMap(cat => cat.skills)
    .filter(s => s.level <= 2)
    .sort(() => 0.5 - Math.random()) 
    .slice(0, 3);

  // Mock Achievements display
  const displayAchievements = dogData.achievements?.slice(0, 3) || [];

  // Mock Next Training Session
  const nextTraining = { title: "Impulse Control", time: "Today, 5:00 PM" };

  // Upcoming Reservation
  const nextReservation = dogData.reservations?.find(r => r.status === 'Upcoming');

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

      {/* Core Modules Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {/* Training Plan Widget */}
         <div 
            onClick={() => setActiveView('training_plan')}
            className="bg-white p-5 rounded-2xl border-2 border-pd-lightest hover:border-pd-teal hover:shadow-md transition-all cursor-pointer group"
         >
             <div className="flex justify-between items-start mb-3">
                 <div className="p-2 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Dumbbell size={24} />
                 </div>
                 <ChevronRight size={20} className="text-pd-lightest group-hover:text-pd-darkblue transition-colors" />
             </div>
             <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wide mb-1">Next Session</p>
             <p className="font-impact text-lg text-pd-darkblue leading-tight">{nextTraining.title}</p>
             <p className="text-xs text-pd-slate font-medium mt-1">{nextTraining.time}</p>
         </div>

         {/* Learning Widget */}
         <div 
            onClick={() => setActiveView('learning')}
            className="bg-white p-5 rounded-2xl border-2 border-pd-lightest hover:border-pd-yellow hover:shadow-md transition-all cursor-pointer group"
         >
             <div className="flex justify-between items-start mb-3">
                 <div className="p-2 bg-yellow-50 rounded-xl text-yellow-600 group-hover:bg-pd-yellow group-hover:text-pd-darkblue transition-colors">
                    <BookOpen size={24} />
                 </div>
                 <ChevronRight size={20} className="text-pd-lightest group-hover:text-pd-darkblue transition-colors" />
             </div>
             <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wide mb-1">Current Course</p>
             <p className="font-impact text-lg text-pd-darkblue leading-tight">Pet Parent Guide</p>
             <div className="w-full bg-pd-lightest h-1.5 rounded-full mt-2">
                <div className="bg-pd-yellow h-1.5 rounded-full w-[35%]"></div>
             </div>
         </div>

         {/* Booking Widget */}
         <div 
            onClick={() => setActiveView('community_reservations')}
            className="bg-white p-5 rounded-2xl border-2 border-pd-lightest hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
         >
             <div className="flex justify-between items-start mb-3">
                 <div className="p-2 bg-rose-50 rounded-xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <Ticket size={24} />
                 </div>
                 <ChevronRight size={20} className="text-pd-lightest group-hover:text-pd-darkblue transition-colors" />
             </div>
             <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wide mb-1">Reservations</p>
             {nextReservation ? (
                <>
                   <p className="font-impact text-lg text-pd-darkblue leading-tight">{nextReservation.serviceName}</p>
                   <p className="text-xs text-pd-slate font-medium mt-1">{new Date(nextReservation.startDate).toLocaleDateString()}</p>
                </>
             ) : (
                <p className="font-impact text-lg text-pd-slate/50 leading-tight">Book Now</p>
             )}
         </div>

         {/* Media Widget */}
         <div 
            onClick={() => setActiveView('learning')}
            className="bg-white p-5 rounded-2xl border-2 border-pd-lightest hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
         >
             <div className="flex justify-between items-start mb-3">
                 <div className="p-2 bg-purple-50 rounded-xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <Camera size={24} />
                 </div>
                 <ChevronRight size={20} className="text-pd-lightest group-hover:text-pd-darkblue transition-colors" />
             </div>
             <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wide mb-1">AI Analysis</p>
             <p className="font-impact text-lg text-pd-darkblue leading-tight">Upload Media</p>
             <p className="text-xs text-pd-slate font-medium mt-1">Check mechanics</p>
         </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
          
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
                <button className="p-2 text-pd-slate hover:text-pd-darkblue transition-colors ml-2 bg-pd-lightest/50 rounded-lg hover:bg-pd-lightest" title="Export Data">
                  <Download size={18} />
                </button>
              </div>
            </div>
            <div className="h-80 w-full">
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

          {/* Recent Activity / Notes */}
          <Card className="bg-white border-2 border-pd-lightest">
            <h2 className="font-impact text-2xl text-pd-darkblue tracking-wide mb-6 uppercase">TRAINER LOG</h2>
            <div className="space-y-4">
              {TRAINER_NOTES.map((note) => (
                <div key={note.id} className="flex gap-5 p-5 bg-pd-lightest/20 rounded-2xl border border-pd-lightest hover:border-pd-teal/50 hover:shadow-md transition-all">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    note.type === 'system' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-white text-pd-teal border border-pd-teal/20'
                  }`}>
                    {note.type === 'system' ? <Settings size={24} /> : <User size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-impact text-lg text-pd-darkblue tracking-wide">{note.author}</span>
                      <span className="text-[10px] text-pd-slate font-bold uppercase bg-white px-2 py-1 rounded-lg border border-pd-lightest tracking-wider">{note.date}</span>
                    </div>
                    <p className="text-pd-slate leading-relaxed font-medium text-sm">
                      {note.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Radar & Needs Work */}
        <div className="space-y-6">
          
          {/* Achievements Widget */}
          <Card className="bg-gradient-to-br from-pd-darkblue to-slate-900 text-white border-none shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-pd-teal rounded-full opacity-10 -mr-10 -mt-10 blur-3xl"></div>
             <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                   <Award size={24} className="text-pd-yellow" />
                </div>
                <h3 className="font-impact text-2xl tracking-wide uppercase">RECENT BADGES</h3>
             </div>
             <div className="space-y-3 relative z-10">
                {displayAchievements.length > 0 ? displayAchievements.map(ach => (
                   <div key={ach.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20">
                      <div className="text-2xl drop-shadow-md">{ach.icon}</div>
                      <div>
                         <p className="font-bold font-impact tracking-wide text-lg leading-none">{ach.title}</p>
                         <p className="text-xs text-pd-teal uppercase font-bold tracking-wide mt-1">{ach.description}</p>
                      </div>
                   </div>
                )) : (
                   <p className="text-white/60 italic text-sm">Start training to earn badges!</p>
                )}
             </div>
          </Card>

          <Card className="bg-white border-2 border-pd-lightest">
            <h2 className="font-impact text-2xl text-pd-darkblue tracking-wide mb-4 uppercase">SKILL BALANCE</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                  <PolarGrid stroke="#ebeded" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#022D41', fontSize: 12, fontFamily: 'Impact', letterSpacing: '1px' }} />
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
          </Card>

          <Card className="bg-white border-2 border-pd-lightest">
             <div className="flex items-center gap-3 mb-6">
                <div className="bg-pd-yellow/20 p-2 rounded-xl">
                   <Calendar className="text-pd-darkblue" size={24} />
                </div>
                <h2 className="font-impact text-2xl tracking-wide text-pd-darkblue uppercase">Upcoming Events</h2>
             </div>
             <div className="space-y-3">
                <div className="p-3 bg-pd-lightest/30 rounded-xl border border-pd-lightest">
                    <p className="font-bold text-pd-darkblue text-sm">Saturday Pack Walk</p>
                    <p className="text-xs text-pd-slate mt-1">Nov 12 • 9:00 AM</p>
                </div>
                <Button variant="secondary" className="w-full !py-2 !text-xs" onClick={() => setActiveView('community')}>
                    View Community Calendar
                </Button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

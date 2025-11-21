
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  Loader, 
  CheckCircle2, 
  Circle, 
  MoreVertical, 
  Filter, 
  Search, 
  Users, 
  Stethoscope, 
  Dumbbell, 
  Target,
  Clock,
  Trash2,
  X,
  Check,
  PlayCircle,
  TrendingUp,
  Hourglass
} from 'lucide-react';
import { Button, Card, Modal, ProgressBar } from './UI';
import { DogData, CalendarEvent, TrainingTask, MasteryProjection, EventType, Skill } from '../types';
import { generateContent } from '../services/gemini';
import { MOCK_EVENTS, getCurrentGrade, SKILL_TREE } from '../constants';

// --- Helper Functions ---
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const formatDate = (year: number, month: number, day: number) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// --- Mastery Algorithm Constants ---
const DAYS_PER_PHASE: Record<number, number> = {
  1: 5,  // Unknown -> Teaching
  2: 10, // Teaching -> Reinforcing
  3: 20, // Reinforcing -> Proofing
  4: 40  // Proofing -> Maintenance
};

const MINUTES_PER_DAY = 30;

// --- Mastery Projection Calculation ---
const calculateProjections = (dogData: DogData): { projections: MasteryProjection[], totalHoursRemaining: number, totalDaysRemaining: number } => {
  const today = new Date();
  const projections: MasteryProjection[] = [];
  let totalMinutesRemaining = 0;
  
  // Flatten all skills
  const allSkills = SKILL_TREE.flatMap(cat => cat.skills);

  // Filter for active skills (Not Level 5)
  const activeSkills = allSkills.filter(s => s.level < 5);

  activeSkills.forEach(skill => {
    let minutesForSkill = 0;
    
    // Calculate remaining time based on current level up to Level 5
    for (let lvl = skill.level; lvl < 5; lvl++) {
       const daysNeeded = DAYS_PER_PHASE[lvl] || 0;
       minutesForSkill += daysNeeded * MINUTES_PER_DAY;
    }

    totalMinutesRemaining += minutesForSkill;

    // Calculate projected date for this specific skill
    // Assumption: Training happens every day for this specific skill (optimistic forecast per skill)
    // In reality, users rotate skills, so this date represents "If you focused purely on this"
    // OR we can weight it by saying "If you train 30 mins/day total, this skill gets a slice"
    // For the "Forecast" UI, we usually show the date assuming consistent work.
    const daysToMastery = minutesForSkill / MINUTES_PER_DAY;
    const projectedDate = new Date(today);
    projectedDate.setDate(today.getDate() + daysToMastery);
    
    // Only push top priority or close-to-finish skills to the individual list to avoid clutter
    // or push all and let UI slice
    projections.push({
      skillName: skill.name,
      currentLevel: skill.level,
      weeksRemaining: Math.ceil(daysToMastery / 7),
      projectedDate: projectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  });
  
  // Global Calculation
  // If the user trains 30 mins/day TOTAL (across all skills), how long until the entire curriculum is done?
  const totalDaysToCompleteEverything = totalMinutesRemaining / MINUTES_PER_DAY;

  return {
    projections: projections.sort((a, b) => a.weeksRemaining - b.weeksRemaining), // Sort by nearest completion
    totalHoursRemaining: Math.round(totalMinutesRemaining / 60),
    totalDaysRemaining: Math.round(totalDaysToCompleteEverything)
  };
};

interface TrainingCalendarProps {
  dogData: DogData;
  onStartSession: () => void;
}

export const TrainingCalendar: React.FC<TrainingCalendarProps> = ({ dogData, onStartSession }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => {
     const d = new Date();
     return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'training' | 'community' | 'vet'>('all');
  
  // --- New Event Form State ---
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<EventType>('training');
  const [newEventTime, setNewEventTime] = useState('09:00');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]); 
  const [skillSearch, setSkillSearch] = useState('');

  // Flat list of skills for dropdown
  const allSkills = useMemo(() => SKILL_TREE.flatMap(cat => cat.skills), []);
  const allSkillNames = useMemo(() => allSkills.map(s => s.name).join(', '), [allSkills]);
  
  const filteredSkills = allSkills.filter(s => s.name.toLowerCase().includes(skillSearch.toLowerCase()));

  // Load/Init Events
  useEffect(() => {
    const savedEvents = localStorage.getItem(`pd360_calendar_${dogData.id}`);
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      const today = new Date();
      const mappedCommunityEvents: CalendarEvent[] = MOCK_EVENTS.map((evt, idx) => {
         const evtDate = new Date(today);
         evtDate.setDate(today.getDate() + (idx * 3) + 2); 
         return {
           id: `comm_${evt.id}`,
           date: formatDate(evtDate.getFullYear(), evtDate.getMonth(), evtDate.getDate()),
           title: evt.title,
           type: 'community',
           time: evt.time,
           location: evt.location,
           description: 'Community Event'
         };
      });
      setEvents(mappedCommunityEvents);
    }
  }, [dogData.id]);

  // Save Events
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem(`pd360_calendar_${dogData.id}`, JSON.stringify(events));
    }
  }, [events, dogData.id]);

  // Loading Simulation
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress(prev => (prev >= 90 ? prev : prev + 2));
      }, 100);
    } else {
      setLoadingProgress(100);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // --- Calendar Logic ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const getDisplayDate = (dateString: string) => {
    if (!dateString) return new Date();
    const [y, m, d] = dateString.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const displayDate = getDisplayDate(selectedDate);

  // --- Event Handling ---
  const handleAddEvent = () => {
    if (!newEventTitle) return;

    let tasks: TrainingTask[] = [];
    
    if (newEventType === 'training') {
        tasks = selectedSkills.map(skillId => {
            const skill = allSkills.find(s => s.id === skillId);
            return {
                id: `task_${Date.now()}_${skillId}`,
                name: skill ? skill.name : 'Custom Task',
                category: 'Custom Session',
                completed: false,
                duration: '10m'
            };
        });
    }

    const newEvent: CalendarEvent = {
        id: `evt_${Date.now()}`,
        date: selectedDate,
        title: newEventTitle,
        type: newEventType,
        time: newEventTime,
        location: newEventLocation,
        tasks: tasks.length > 0 ? tasks : undefined,
        description: newEventType === 'vet' ? 'Veterinary Appointment' : 'Custom Event'
    };

    setEvents([...events, newEvent]);
    setShowAddEventModal(false);
    // Reset form
    setNewEventTitle('');
    setNewEventType('training');
    setNewEventTime('09:00');
    setNewEventLocation('');
    setSelectedSkills([]);
    setSkillSearch('');
  };

  const toggleSkillSelection = (skillId: string) => {
      setSelectedSkills(prev => 
          prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
      );
  };

  // --- AI Generation ---
  const generateSchedule = async () => {
    setIsGenerating(true);
    const gradeInfo = getCurrentGrade(dogData.currentScore);
    const today = new Date();
    
    const prompt = `Generate a 7-day training schedule for ${dogData.name} (Grade: ${gradeInfo.current.name}).
    Start Date: today.
    
    CRITICAL: You MUST select exercise names ONLY from this list: ${allSkillNames}. Do not invent new tasks.
    
    Format: JSON Array of objects.
    Schema:
    {
      "title": "Focus Area (e.g. Obedience, Impulse Control)",
      "dayOffset": number (0-6),
      "morningTasks": ["Exact Skill Name 1", "Exact Skill Name 2"],
      "eveningTasks": ["Exact Skill Name 3", "Exact Skill Name 4"]
    }`;

    try {
      const responseText = await generateContent(prompt, "gemini-3-pro-preview", "You are a PD360 Training Planner. Use only known skills.");
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const planData = JSON.parse(cleanJson);

      const newEvents: CalendarEvent[] = planData.map((day: any) => {
        const dateObj = new Date(today);
        dateObj.setDate(today.getDate() + day.dayOffset);
        const dateStr = formatDate(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        
        const tasks: TrainingTask[] = [
          ...(day.morningTasks || []).map((t: string, i: number) => ({ id: `m_${i}`, name: t, category: 'Morning', completed: false, duration: '15m' })),
          ...(day.eveningTasks || []).map((t: string, i: number) => ({ id: `e_${i}`, name: t, category: 'Evening', completed: false, duration: '15m' }))
        ];

        return {
          id: `train_${Date.now()}_${day.dayOffset}`,
          date: dateStr,
          title: `${day.title}`,
          type: 'training',
          tasks: tasks,
          description: 'Daily structured training plan.'
        };
      });

      const filteredEvents = events.filter(e => {
         const isTraining = e.type === 'training';
         const isOverlap = newEvents.some(n => n.date === e.date);
         return !(isTraining && isOverlap);
      });

      setEvents([...filteredEvents, ...newEvents]);

    } catch (e) {
      console.error("Gen Plan Error", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTaskCompletion = (eventId: string, taskId: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id !== eventId || !evt.tasks) return evt;
      return {
        ...evt,
        tasks: evt.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
        completed: evt.tasks.every(t => t.id === taskId ? !t.completed : t.completed)
      };
    }));
  };

  const deleteEvent = (id: string) => {
     setEvents(prev => prev.filter(e => e.id !== id));
  };

  const filteredEvents = events.filter(e => {
    if (filterType !== 'all' && e.type !== filterType) return false;
    return true;
  });

  const getEventsForDay = (day: number) => {
    const dateStr = formatDate(year, month, day);
    return filteredEvents.filter(e => e.date === dateStr);
  };

  const selectedDayEvents = filteredEvents.filter(e => e.date === selectedDate);
  const { projections, totalHoursRemaining, totalDaysRemaining } = useMemo(() => calculateProjections(dogData), [dogData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Calendar (2/3) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Calendar Controls & Actions */}
          <Card className="bg-white border-2 border-pd-lightest !p-5">
            <div className="flex flex-col gap-4">
              {/* Actions Row */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-pd-lightest pb-4 mb-2 w-full">
                 <div className="flex items-center gap-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-pd-lightest rounded-full transition-colors text-pd-darkblue">
                      <ChevronLeft size={24} />
                    </button>
                    <h2 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide min-w-[180px] text-center">
                      {monthName} {year}
                    </h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-pd-lightest rounded-full transition-colors text-pd-darkblue">
                      <ChevronRight size={24} />
                    </button>
                  </div>

                 <div className="flex flex-wrap gap-3 justify-end">
                    <Button 
                      onClick={onStartSession} 
                      variant="primary" 
                      icon={PlayCircle}
                      className="shadow-lg border-b-4 border-pd-teal hover:border-pd-yellow"
                    >
                      Start Session
                    </Button>
                    <Button 
                      variant="gemini" 
                      onClick={generateSchedule} 
                      disabled={isGenerating}
                      icon={isGenerating ? Loader : Sparkles}
                      className={isGenerating ? "animate-pulse" : "shadow-lg"}
                    >
                      {isGenerating ? "Building..." : "Generate Week"}
                    </Button>
                    <Button variant="secondary" icon={Plus} onClick={() => setShowAddEventModal(true)}>
                      Add Session
                    </Button>
                 </div>
              </div>

              {/* Filter Row */}
              <div className="flex items-center gap-2 bg-pd-lightest/30 p-1.5 rounded-xl w-fit">
                 {['all', 'training', 'community', 'vet'].map((type) => (
                   <button
                     key={type}
                     onClick={() => setFilterType(type as any)}
                     className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                       filterType === type 
                         ? 'bg-pd-darkblue text-white shadow-sm' 
                         : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-white'
                     }`}
                   >
                     {type}
                   </button>
                 ))}
              </div>
            </div>
          </Card>

          {/* Calendar Grid */}
          <div className="bg-white rounded-3xl border-2 border-pd-lightest shadow-sm overflow-hidden">
             {/* Days Header */}
             <div className="grid grid-cols-7 border-b-2 border-pd-lightest bg-pd-lightest/30">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                 <div key={day} className="py-3 text-center text-xs font-bold text-pd-softgrey uppercase tracking-widest">
                   {day}
                 </div>
               ))}
             </div>
             
             {/* Dates */}
             <div className="grid grid-cols-7 auto-rows-fr">
               {Array.from({ length: firstDay }).map((_, i) => (
                 <div key={`empty-${i}`} className="min-h-[120px] border-b border-r border-pd-lightest/50 bg-pd-lightest/10"></div>
               ))}
               
               {Array.from({ length: daysInMonth }).map((_, i) => {
                 const day = i + 1;
                 const dateStr = formatDate(year, month, day);
                 const dayEvents = getEventsForDay(day);
                 const isSelected = selectedDate === dateStr;
                 const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                 return (
                   <div 
                      key={day} 
                      onClick={() => setSelectedDate(dateStr)}
                      className={`min-h-[120px] p-2 border-b border-r border-pd-lightest/50 cursor-pointer transition-all hover:bg-pd-lightest/20 relative group
                        ${isSelected ? 'bg-pd-teal/5 ring-2 ring-inset ring-pd-teal' : ''}
                      `}
                   >
                      <div className="flex justify-between items-start mb-2">
                         <span className={`
                            text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                            ${isToday ? 'bg-pd-darkblue text-white' : 'text-pd-slate'}
                         `}>
                           {day}
                         </span>
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((evt, idx) => (
                           <div 
                             key={evt.id} 
                             className={`text-[10px] font-bold truncate px-1.5 py-1 rounded-md border-l-2 
                               ${evt.type === 'training' ? 'bg-blue-50 text-blue-700 border-blue-400' : 
                                 evt.type === 'community' ? 'bg-purple-50 text-purple-700 border-purple-400' :
                                 'bg-emerald-50 text-emerald-700 border-emerald-400'}
                             `}
                           >
                             {evt.title}
                           </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] text-pd-softgrey font-bold pl-1">+ {dayEvents.length - 3} more</div>
                        )}
                      </div>
                   </div>
                 );
               })}
             </div>
          </div>
          
          {isGenerating && <ProgressBar progress={loadingProgress} label="Structuring Training Plan..." />}
        </div>

        {/* Right Column: Day Detail & Projections (1/3) */}
        <div className="space-y-6">
          
          {/* Selected Day Detail */}
          <Card className="bg-white border-l-8 border-l-pd-teal h-[600px] flex flex-col relative overflow-hidden">
             <div className="flex justify-between items-center mb-6 border-b-2 border-pd-lightest pb-4">
               <div>
                  <h3 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide">
                     {displayDate.toLocaleDateString('en-US', { weekday: 'long' })}
                  </h3>
                  <p className="text-pd-slate font-medium">
                     {displayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </p>
               </div>
               <div className="p-3 bg-pd-lightest rounded-2xl text-pd-teal">
                  <CalendarIcon size={28} />
               </div>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                {selectedDayEvents.length === 0 ? (
                   <div className="text-center py-12 text-pd-softgrey">
                      <p className="italic font-medium">No sessions scheduled.</p>
                      <Button variant="ghost" className="mt-4 mx-auto" onClick={() => setShowAddEventModal(true)}>Add Session</Button>
                   </div>
                ) : (
                   selectedDayEvents.map(evt => (
                      <div key={evt.id} className="group animate-in slide-in-from-right duration-300">
                         <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                               {evt.type === 'training' && <Dumbbell size={18} className="text-blue-500" />}
                               {evt.type === 'community' && <Users size={18} className="text-purple-500" />}
                               {evt.type === 'vet' && <Stethoscope size={18} className="text-emerald-500" />}
                               <span className="font-impact text-lg text-pd-darkblue tracking-wide uppercase">{evt.title}</span>
                            </div>
                            <button onClick={() => deleteEvent(evt.id)} className="text-pd-lightest hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">
                               <Trash2 size={16} />
                            </button>
                         </div>

                         <div className="bg-pd-lightest/30 rounded-xl p-4 border border-pd-lightest group-hover:border-pd-teal/30 transition-colors">
                            {evt.time && (
                               <div className="flex items-center gap-2 text-xs font-bold text-pd-softgrey uppercase tracking-wide mb-3">
                                  <Clock size={12} /> {evt.time}
                                  {evt.location && <span>• {evt.location}</span>}
                               </div>
                            )}
                            
                            {evt.tasks ? (
                               <div className="space-y-2">
                                  {evt.tasks.map(task => (
                                     <div 
                                       key={task.id} 
                                       onClick={() => toggleTaskCompletion(evt.id, task.id)}
                                       className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border border-transparent ${task.completed ? 'bg-emerald-50/50' : 'bg-white hover:border-pd-lightest hover:shadow-sm'}`}
                                     >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-pd-softgrey text-transparent bg-white'}`}>
                                           {task.completed && <Check size={12} strokeWidth={4} />}
                                        </div>
                                        <div className="flex-1">
                                           <p className={`text-sm font-bold leading-tight ${task.completed ? 'text-pd-softgrey line-through' : 'text-pd-darkblue'}`}>{task.name}</p>
                                           <p className="text-[10px] font-bold uppercase text-pd-softgrey mt-0.5">{task.category} • {task.duration}</p>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            ) : (
                               <p className="text-sm text-pd-slate font-medium">{evt.description}</p>
                            )}
                         </div>
                      </div>
                   ))
                )}
             </div>
          </Card>

          {/* Mastery Projections */}
          <Card className="bg-pd-darkblue text-white border-none relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-pd-yellow rounded-full opacity-5 -ml-10 -mb-10 blur-3xl"></div>
             <div className="flex items-center gap-3 mb-6 relative z-10">
                <Target size={24} className="text-pd-yellow" />
                <div>
                    <h3 className="font-impact text-2xl tracking-wide uppercase leading-none">Mastery Forecast</h3>
                    <p className="text-[10px] text-pd-teal uppercase font-bold tracking-wider">Based on 30m daily training</p>
                </div>
             </div>
             
             {/* Total Estimate */}
             <div className="flex gap-4 mb-6 relative z-10 bg-white/10 p-3 rounded-xl border border-white/10">
                 <div className="flex-1">
                     <p className="text-[10px] font-bold uppercase tracking-wider text-pd-lightest mb-1">Total Hours Left</p>
                     <div className="flex items-center gap-2">
                         <Hourglass size={16} className="text-pd-teal" />
                         <span className="font-impact text-2xl">{totalHoursRemaining}h</span>
                     </div>
                 </div>
                 <div className="w-px bg-white/10"></div>
                 <div className="flex-1">
                     <p className="text-[10px] font-bold uppercase tracking-wider text-pd-lightest mb-1">Days to Complete</p>
                     <div className="flex items-center gap-2">
                         <CalendarIcon size={16} className="text-pd-yellow" />
                         <span className="font-impact text-2xl">{totalDaysRemaining}d</span>
                     </div>
                 </div>
             </div>

             <div className="space-y-2 relative z-10 max-h-64 overflow-y-auto custom-scrollbar-dark pr-2">
                {projections.map((proj, idx) => (
                   <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group">
                      <div>
                         <p className="font-bold text-white text-sm leading-tight mb-1">{proj.skillName}</p>
                         <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-pd-teal uppercase tracking-wider bg-pd-teal/10 px-2 py-0.5 rounded">Lvl {proj.currentLevel}</span>
                             <span className="text-[10px] text-pd-lightest/60">→ Maintenance</span>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="font-impact text-lg text-pd-yellow tracking-wide group-hover:scale-105 transition-transform">{proj.projectedDate}</p>
                         <p className="text-[10px] font-bold text-pd-lightest/60 uppercase tracking-wider">{proj.weeksRemaining} Weeks</p>
                      </div>
                   </div>
                ))}
             </div>
          </Card>

        </div>
      </div>

      {/* Add Event Modal */}
      <Modal isOpen={showAddEventModal} onClose={() => setShowAddEventModal(false)} title="Add Session">
         <div className="space-y-6">
            <div>
               <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Title</label>
               <input 
                 type="text" 
                 value={newEventTitle} 
                 onChange={(e) => setNewEventTitle(e.target.value)} 
                 className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none font-medium text-pd-darkblue"
                 placeholder="Session Name" 
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Type</label>
                  <select 
                    value={newEventType} 
                    onChange={(e) => setNewEventType(e.target.value as EventType)} 
                    className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none font-medium text-pd-darkblue"
                  >
                     <option value="training">Training Session</option>
                     <option value="vet">Vet Appointment</option>
                     <option value="community">Community Event</option>
                     <option value="custom">Other</option>
                  </select>
               </div>
               <div>
                  <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Time</label>
                  <input 
                    type="time" 
                    value={newEventTime} 
                    onChange={(e) => setNewEventTime(e.target.value)} 
                    className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none font-medium text-pd-darkblue"
                  />
               </div>
            </div>

            {newEventType === 'training' && (
               <div className="animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block">Add Skills</label>
                     <span className="text-xs font-bold text-pd-teal">{selectedSkills.length} Selected</span>
                  </div>
                  
                  <div className="border-2 border-pd-lightest rounded-xl p-2 bg-white max-h-60 flex flex-col">
                      <div className="p-2 border-b border-pd-lightest mb-2 flex items-center gap-2">
                          <Search size={16} className="text-pd-softgrey" />
                          <input 
                              type="text" 
                              placeholder="Search skills..." 
                              className="w-full outline-none text-sm font-medium text-pd-darkblue placeholder-pd-softgrey"
                              value={skillSearch}
                              onChange={e => setSkillSearch(e.target.value)}
                          />
                          <Button variant="secondary" className="!py-1 !px-3 !text-xs !h-8 whitespace-nowrap">
                            Search
                          </Button>
                      </div>
                      <div className="overflow-y-auto custom-scrollbar pr-1 space-y-1">
                        {filteredSkills.map(skill => (
                            <div 
                            key={skill.id} 
                            onClick={() => toggleSkillSelection(skill.id)}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                                selectedSkills.includes(skill.id) 
                                ? 'bg-pd-teal/10 border border-pd-teal/20' 
                                : 'hover:bg-pd-lightest/50 border border-transparent'
                            }`}
                            >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedSkills.includes(skill.id) ? 'bg-pd-teal border-pd-teal' : 'border-pd-lightest bg-white'}`}>
                                {selectedSkills.includes(skill.id) && <CheckCircle2 size={14} className="text-white" />}
                            </div>
                            <span className={`text-sm font-bold ${selectedSkills.includes(skill.id) ? 'text-pd-darkblue' : 'text-pd-slate'}`}>{skill.name}</span>
                            </div>
                        ))}
                        {filteredSkills.length === 0 && <p className="text-center text-xs text-pd-softgrey py-4 italic">No skills found.</p>}
                      </div>
                  </div>
               </div>
            )}

            {newEventType !== 'training' && (
               <div>
                  <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Location</label>
                  <input 
                    type="text" 
                    value={newEventLocation} 
                    onChange={(e) => setNewEventLocation(e.target.value)} 
                    className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none font-medium text-pd-darkblue"
                    placeholder="Location (Optional)" 
                  />
               </div>
            )}

            <Button onClick={handleAddEvent} variant="primary" className="w-full">Add to Calendar</Button>
         </div>
      </Modal>
    </div>
  );
};

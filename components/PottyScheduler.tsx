
import React, { useState, useMemo, useEffect } from 'react';
import { DogData, PottyEvent, PottyScheduleConfig } from '../types';
import { Card, Button } from './UI';
import { Clock, Check, Edit2, Save, Droplets, Utensils, Moon, Sun, AlertCircle } from 'lucide-react';

// --- Helper Functions for Time Math ---

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const getAgeInMonths = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months -= birth.getMonth();
  months += today.getMonth();
  return months <= 0 ? 1 : months;
};

interface PottySchedulerProps {
  dogData: DogData;
}

export const PottyScheduler: React.FC<PottySchedulerProps> = ({ dogData }) => {
  // Configuration State
  const [config, setConfig] = useState<PottyScheduleConfig>({
    wakeTime: '07:00',
    bedTime: '22:00',
    mealTimes: dogData.feedingSchedule && dogData.feedingSchedule.length > 0 ? dogData.feedingSchedule : ['08:00', '18:00']
  });

  const [isEditing, setIsEditing] = useState(false);
  const [completedEvents, setCompletedEvents] = useState<string[]>([]);

  // Load completed events from local storage
  useEffect(() => {
    const saved = localStorage.getItem(`pd360_potty_completed_${dogData.id}_${new Date().toDateString()}`);
    if (saved) {
      setCompletedEvents(JSON.parse(saved));
    } else {
      setCompletedEvents([]); // Reset on new day
    }
  }, [dogData.id]);

  // Save completed events
  const toggleEvent = (id: string) => {
    setCompletedEvents(prev => {
      const next = prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id];
      localStorage.setItem(`pd360_potty_completed_${dogData.id}_${new Date().toDateString()}`, JSON.stringify(next));
      return next;
    });
  };

  // --- THE ALGORITHM ---
  const schedule = useMemo(() => {
    const events: PottyEvent[] = [];
    const ageMonths = getAgeInMonths(dogData.birthDate);
    
    // Rule: Max hold time is 1 hour per month of age, capped at 8 hours (adults)
    // For very young puppies, we might be stricter.
    const maxHoldHours = Math.min(ageMonths, 8);
    const maxHoldMinutes = maxHoldHours * 60;

    // 1. Anchor: Wake Up
    events.push({
      id: 'wake',
      time: config.wakeTime,
      type: 'POTTY_WAKE',
      label: 'Morning Elimination',
      isInput: false,
      completed: false
    });

    // 2. Meals & Reflex (Input -> Output)
    config.mealTimes.forEach((mealTime, idx) => {
      // Input Event
      events.push({
        id: `meal_${idx}`,
        time: mealTime,
        type: 'MEAL',
        label: idx === 0 ? 'Breakfast' : idx === config.mealTimes.length - 1 ? 'Dinner' : 'Lunch',
        isInput: true,
        completed: false
      });

      // Gastrocolic Reflex Output (Meal + 20m)
      const reflexTime = minutesToTime(timeToMinutes(mealTime) + 20);
      events.push({
        id: `potty_meal_${idx}`,
        time: reflexTime,
        type: 'POTTY_MEAL',
        label: 'Post-Meal Potty',
        isInput: false,
        completed: false
      });
    });

    // 3. Sort existing events
    events.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

    // 4. Gap Analysis (Insert Maintenance Potties)
    // We create a new list to avoid mutating the one we are iterating over in a way that messes up indices
    const finalEvents: PottyEvent[] = [];
    
    // Add Bedtime Anchor first to ensure we check the gap before bed
    const bedEvent: PottyEvent = {
       id: 'bed',
       time: config.bedTime,
       type: 'POTTY_BED',
       label: 'Last Call',
       isInput: false,
       completed: false
    };

    // Combine sorted events with bedtime for the loop
    const allPoints = [...events, bedEvent].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

    for (let i = 0; i < allPoints.length - 1; i++) {
      const current = allPoints[i];
      const next = allPoints[i + 1];
      
      finalEvents.push(current);

      // Calculate gap
      let startMins = timeToMinutes(current.time);
      const endMins = timeToMinutes(next.time);
      
      // If current is an Input (Meal), the timer technically starts, but we usually have a reflex potty scheduled shortly after.
      // We mostly care about the gap between the last POTTY and the next event.
      // However, for simplicity in the "Biological Algorithm", we ensure the bladder isn't full for too long.
      
      // Optimization: If current is a MEAL, we know a POTTY_MEAL is likely next.
      // We only check gaps if the gap > maxHoldMinutes
      
      if ((endMins - startMins) > maxHoldMinutes) {
         // We need to insert breaks
         let gap = endMins - startMins;
         let insertCount = Math.floor(gap / maxHoldMinutes);
         
         // Don't insert if the remainder is very small (e.g. 10 mins)
         if (gap % maxHoldMinutes < 30) insertCount--; 

         for (let k = 1; k <= insertCount; k++) {
            const insertTime = minutesToTime(startMins + (maxHoldMinutes * k));
            // Avoid duplicates if logic overlaps
            if (insertTime !== next.time) {
              finalEvents.push({
                id: `maint_${current.id}_${k}`,
                time: insertTime,
                type: 'POTTY_MAINTENANCE',
                label: 'Maintenance Break',
                isInput: false,
                completed: false
              });
            }
         }
      }
    }

    // Add the final point (Bedtime)
    finalEvents.push(allPoints[allPoints.length - 1]);

    return finalEvents;
  }, [config, dogData.birthDate]);

  // Apply completed state
  const eventsWithState = schedule.map(evt => ({
    ...evt,
    completed: completedEvents.includes(evt.id)
  }));

  const handleConfigChange = (field: keyof PottyScheduleConfig, val: any) => {
     setConfig(prev => ({ ...prev, [field]: val }));
  };

  const updateMealTime = (idx: number, val: string) => {
     const newMeals = [...config.mealTimes];
     newMeals[idx] = val;
     setConfig(prev => ({ ...prev, mealTimes: newMeals }));
  };

  return (
    <Card className="bg-white border-2 border-pd-lightest overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-pd-lightest/20 -m-6 md:-m-8 p-6 md:p-8 border-b-2 border-pd-lightest">
         <div>
            <h2 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide flex items-center gap-2">
               <Droplets className="text-pd-teal" /> Biological Scheduler
            </h2>
            <p className="text-pd-slate font-medium mt-1">
               Predictive potty plan based on {dogData.name}'s age ({getAgeInMonths(dogData.birthDate)}mo) and metabolism.
            </p>
         </div>
         <Button 
           variant={isEditing ? 'primary' : 'secondary'} 
           onClick={() => setIsEditing(!isEditing)}
           icon={isEditing ? Save : Edit2}
           className="!py-2 !px-4 !text-xs"
         >
            {isEditing ? 'Save Routine' : 'Edit Rhythm'}
         </Button>
      </div>
      
      {isEditing && (
         <div className="mb-8 p-4 bg-pd-lightest/30 rounded-xl border border-pd-lightest animate-in slide-in-from-top-2">
            <h4 className="font-impact text-lg text-pd-darkblue mb-4 uppercase">Daily Rhythm Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div>
                  <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Wake Up</label>
                  <input 
                    type="time" 
                    value={config.wakeTime} 
                    onChange={(e) => handleConfigChange('wakeTime', e.target.value)}
                    className="w-full p-2 rounded-lg border-2 border-pd-lightest font-bold text-pd-darkblue"
                  />
               </div>
               {config.mealTimes.map((mt, i) => (
                 <div key={i}>
                    <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Meal {i+1}</label>
                    <input 
                      type="time" 
                      value={mt} 
                      onChange={(e) => updateMealTime(i, e.target.value)}
                      className="w-full p-2 rounded-lg border-2 border-pd-lightest font-bold text-orange-600"
                    />
                 </div>
               ))}
               <div>
                  <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Bedtime</label>
                  <input 
                    type="time" 
                    value={config.bedTime} 
                    onChange={(e) => handleConfigChange('bedTime', e.target.value)}
                    className="w-full p-2 rounded-lg border-2 border-pd-lightest font-bold text-pd-darkblue"
                  />
               </div>
            </div>
         </div>
      )}

      <div className="relative pl-4 md:pl-8 py-4 mt-4">
         {/* Vertical Line */}
         <div className="absolute top-0 bottom-0 left-[27px] md:left-[43px] w-1 bg-pd-lightest rounded-full"></div>

         <div className="space-y-8">
            {eventsWithState.map((evt, idx) => (
               <div 
                 key={evt.id} 
                 className={`relative flex items-center gap-4 md:gap-6 transition-all duration-300 group ${evt.completed ? 'opacity-50 grayscale' : 'opacity-100'}`}
               >
                  {/* Icon Node */}
                  <div 
                     onClick={() => toggleEvent(evt.id)}
                     className={`
                       w-8 h-8 md:w-10 md:h-10 rounded-full border-4 z-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-sm bg-white
                       ${evt.isInput 
                          ? 'border-orange-500 text-orange-500' 
                          : 'border-pd-teal text-pd-teal'
                       }
                       ${evt.completed ? 'bg-pd-lightest border-pd-softgrey text-pd-softgrey' : ''}
                     `}
                  >
                     {evt.completed ? (
                        <Check size={16} strokeWidth={4} />
                     ) : (
                        <div className={`w-2.5 h-2.5 rounded-full ${evt.isInput ? 'bg-orange-500' : 'bg-pd-teal'}`}></div>
                     )}
                  </div>

                  {/* Content Card */}
                  <div 
                    onClick={() => toggleEvent(evt.id)}
                    className={`flex-1 p-3 md:p-4 rounded-xl border-l-4 shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md transition-all bg-white
                       ${evt.isInput ? 'border-l-orange-500' : 'border-l-pd-teal'}
                       ${evt.completed ? 'border-l-pd-softgrey bg-pd-lightest/20' : ''}
                    `}
                  >
                     <div className="flex items-center gap-3 md:gap-4">
                        <div className={`p-2 rounded-lg ${evt.isInput ? 'bg-orange-50 text-orange-600' : 'bg-pd-lightest/50 text-pd-teal'}`}>
                           {evt.type === 'POTTY_WAKE' && <Sun size={20} />}
                           {evt.type === 'POTTY_BED' && <Moon size={20} />}
                           {evt.type === 'MEAL' && <Utensils size={20} />}
                           {(evt.type === 'POTTY_MEAL' || evt.type === 'POTTY_MAINTENANCE') && <Droplets size={20} />}
                        </div>
                        <div>
                           <p className={`font-impact text-lg md:text-xl uppercase tracking-wide ${evt.completed ? 'line-through text-pd-softgrey' : 'text-pd-darkblue'}`}>
                              {evt.time}
                           </p>
                           <p className="text-xs md:text-sm font-bold text-pd-slate uppercase tracking-wide">
                              {evt.label}
                           </p>
                        </div>
                     </div>

                     {!evt.completed && (
                       <div className={`hidden sm:block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border ${evt.isInput ? 'text-orange-600 border-orange-200 bg-orange-50' : 'text-pd-teal border-pd-teal/30 bg-pd-teal/5'}`}>
                          {evt.isInput ? 'Input' : 'Output'}
                       </div>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </div>
      
      <div className="mt-8 p-4 bg-pd-lightest/30 rounded-xl border border-pd-lightest flex gap-3 items-start">
         <AlertCircle size={20} className="text-pd-teal shrink-0 mt-0.5" />
         <p className="text-sm text-pd-slate font-medium leading-relaxed">
            <span className="font-bold">Algorithm Logic:</span> Schedule calculated based on {dogData.name}'s age ({getAgeInMonths(dogData.birthDate)} months). 
            Puppies can typically hold their bladder for 1 hour per month of age. 
            Gaps exceeding this limit automatically trigger a "Maintenance Break".
         </p>
      </div>
    </Card>
  );
};

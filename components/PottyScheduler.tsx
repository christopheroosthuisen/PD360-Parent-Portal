
import React, { useState, useMemo, useEffect } from 'react';
import { DogData, HealthEvent, MetabolicProfile, Medication } from '../types';
import { Card, Button, Modal } from './UI';
import { 
  Clock, Droplets, Utensils, Activity, AlertTriangle, 
  CheckCircle2, Plus, Search, Camera, Stethoscope, 
  Thermometer, Pill, ShieldAlert, Zap, AlertOctagon,
  ChevronRight, Brain, Bone, Trash2
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_MEDS: Medication[] = [
  { id: 'm1', name: 'Fluoxetine', dosage: '20mg', frequency: 'Daily (AM)', type: 'Pill', nextDue: '08:00', instructions: 'Give with food', inventory: 12 },
  { id: 'm2', name: 'Carprofen', dosage: '50mg', frequency: 'As Needed', type: 'Pill', nextDue: '18:00', instructions: 'For pain/inflammation', inventory: 5 }
];

// --- HELPERS & ALGORITHMS ---

const calculateMetabolicProfile = (dog: DogData): MetabolicProfile => {
  const weightKg = dog.weight / 2.20462;
  const rer = 70 * Math.pow(weightKg, 0.75); // Gold standard RER
  
  // Simple logic for activity factor (Mocked based on breed/age for now)
  // In real app, this comes from collar data
  let activityFactor = 1.6; // Neutered Adult
  if (!dog.fixed) activityFactor = 1.8;
  if (dog.birthDate && new Date().getFullYear() - new Date(dog.birthDate).getFullYear() < 1) activityFactor = 3.0; // Puppy

  const der = rer * activityFactor;
  const hydrationGoal = weightKg * 60; // approx 60ml/kg

  return {
    rer: Math.round(rer),
    der: Math.round(der),
    activityFactor,
    hydrationGoalMl: Math.round(hydrationGoal)
  };
};

const getRotationDegrees = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMinutes = h * 60 + m;
  // 24 hours = 1440 mins = 360 degrees
  return (totalMinutes / 1440) * 360;
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

// --- SUB-COMPONENTS ---

const CircadianDial: React.FC<{ events: HealthEvent[], now: Date }> = ({ events, now }) => {
  const radius = 120;
  const center = 150;
  
  // Current time hand
  const nowDegrees = (now.getHours() * 60 + now.getMinutes()) / 1440 * 360;

  return (
    <div className="relative w-[300px] h-[300px] mx-auto">
      <svg viewBox="0 0 300 300" className="w-full h-full transform -rotate-90">
        {/* Background Dial */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#ebeded" strokeWidth="24" />
        
        {/* Day/Night Arc (Simulated) */}
        <path d="M 150, 150 L 150, 30 A 120,120 0 0,1 270,150 Z" fill="#FFDE59" fillOpacity="0.1" /> 
        <path d="M 150, 150 L 270, 150 A 120,120 0 0,1 30,150 Z" fill="#022D41" fillOpacity="0.05" />

        {/* Events */}
        {events.map((evt, i) => {
          const date = new Date(evt.timestamp);
          const deg = (date.getHours() * 60 + date.getMinutes()) / 1440 * 360;
          const rad = (deg * Math.PI) / 180;
          const x = center + radius * Math.cos(rad);
          const y = center + radius * Math.sin(rad);
          
          let color = "#3D4C53";
          if (evt.type === 'MEAL') color = "#FFDE59"; // Yellow
          if (evt.type === 'ELIMINATION_POOP' || evt.type === 'ELIMINATION_PEE') color = "#34C6B9"; // Teal
          if (evt.type === 'MEDICATION') color = "#6366f1"; // Indigo
          
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={6} fill={color} stroke="white" strokeWidth="2" />
            </g>
          );
        })}

        {/* Current Time Hand */}
        <line 
          x1={center} y1={center} 
          x2={center + (radius + 10) * Math.cos(nowDegrees * Math.PI / 180)} 
          y2={center + (radius + 10) * Math.sin(nowDegrees * Math.PI / 180)} 
          stroke="#022D41" strokeWidth="3" strokeLinecap="round"
        />
        <circle 
          cx={center + (radius + 10) * Math.cos(nowDegrees * Math.PI / 180)}
          cy={center + (radius + 10) * Math.sin(nowDegrees * Math.PI / 180)}
          r={4} fill="#022D41"
        />
      </svg>
      
      {/* Center Stats */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
         <span className="font-impact text-4xl text-pd-darkblue tracking-wide">
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
         </span>
         <span className="text-xs font-bold text-pd-softgrey uppercase tracking-wider">Circadian Rhythm</span>
      </div>
    </div>
  );
};

const FuelGauge: React.FC<{ current: number, max: number, treatCount: number }> = ({ current, max, treatCount }) => {
  const percentage = Math.min(100, (current / max) * 100);
  const treatPercentage = Math.min(10, (treatCount / max) * 100); // Max 10% buffer
  
  return (
    <div className="relative w-full h-4 bg-pd-lightest rounded-full overflow-hidden">
      {/* Main Meal Calories */}
      <div 
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-pd-darkblue to-pd-teal transition-all duration-500"
        style={{ width: `${percentage - treatPercentage}%` }}
      ></div>
      {/* Treat Buffer (Yellow) */}
      <div 
        className="absolute top-0 h-full bg-pd-yellow border-l-2 border-white transition-all duration-500"
        style={{ left: `${percentage - treatPercentage}%`, width: `${treatPercentage}%` }}
      ></div>
      
      {/* Tick Marks */}
      <div className="absolute top-0 left-[50%] w-0.5 h-full bg-white/30"></div>
      <div className="absolute top-0 left-[90%] w-0.5 h-full bg-red-500/50 z-10"></div> {/* Limit Line */}
    </div>
  );
};

// --- MAIN COMPONENT: APEX HEALTH SYSTEM ---

interface PottySchedulerProps {
  dogData: DogData;
}

export const PottyScheduler: React.FC<PottySchedulerProps> = ({ dogData }) => {
  const [now, setNow] = useState(new Date());
  const [logs, setLogs] = useState<HealthEvent[]>([]);
  const [metabolic, setMetabolic] = useState<MetabolicProfile>(calculateMetabolicProfile(dogData));
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [activeLogType, setActiveLogType] = useState<HealthEvent['type'] | null>(null);
  
  // Simulated Environmental Data
  const [environmentAlert, setEnvironmentAlert] = useState<{type: 'VIRUS' | 'HEAT' | 'NONE', msg: string}>({ type: 'NONE', msg: '' });

  useEffect(() => {
    // Simulating "Bio-Radar" check
    const checkEnvironment = () => {
        // Randomly trigger an alert for demo
        const rand = Math.random();
        if (rand > 0.7) {
            setEnvironmentAlert({ type: 'HEAT', msg: 'High Pavement Temp: 145°F. Burn Risk.' });
        } else if (rand > 0.9) {
            setEnvironmentAlert({ type: 'VIRUS', msg: 'Local Parvo Outbreak detected in 5mi radius.' });
        }
    };
    checkEnvironment();
    
    const interval = setInterval(() => setNow(new Date()), 60000); // Update minute
    return () => clearInterval(interval);
  }, []);

  const dailyCalories = logs
    .filter(l => new Date(l.timestamp).toDateString() === now.toDateString() && l.calories)
    .reduce((acc, curr) => acc + (curr.calories || 0), 0);
    
  const treatCalories = logs
    .filter(l => new Date(l.timestamp).toDateString() === now.toDateString() && l.type === 'MEAL' && l.calories && l.calories < 50) // Simple heuristic
    .reduce((acc, curr) => acc + (curr.calories || 0), 0);

  const handleQuickLog = (type: HealthEvent['type'], details: any = {}) => {
    const newLog: HealthEvent = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type,
        ...details
    };
    setLogs(prev => [...prev, newLog]);
    setIsLogModalOpen(false);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. ONE HEALTH BIO-RADAR ALERT */}
      {environmentAlert.type !== 'NONE' && (
          <div className={`rounded-2xl p-4 flex items-center gap-4 border-2 animate-in slide-in-from-top-4 ${
              environmentAlert.type === 'VIRUS' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-orange-50 border-orange-200 text-orange-800'
          }`}>
              <div className={`p-2 rounded-full ${environmentAlert.type === 'VIRUS' ? 'bg-rose-200' : 'bg-orange-200'}`}>
                  {environmentAlert.type === 'VIRUS' ? <ShieldAlert size={24} /> : <Thermometer size={24} />}
              </div>
              <div className="flex-1">
                  <h4 className="font-impact uppercase text-lg tracking-wide">Bio-Radar Alert</h4>
                  <p className="text-sm font-bold">{environmentAlert.msg}</p>
              </div>
              <Button variant="secondary" className="!py-2 !px-3 !text-xs">View Map</Button>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. CIRCADIAN DASHBOARD (Left Col) */}
          <div className="lg:col-span-1 space-y-6">
              <Card className="bg-white border-2 border-pd-lightest relative overflow-hidden">
                  <div className="absolute top-4 left-4 z-10">
                      <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide">Daily Rhythm</h3>
                      <p className="text-xs font-bold text-pd-softgrey uppercase">Bio-Digital Twin</p>
                  </div>
                  
                  <div className="mt-8 mb-4">
                      <CircadianDial events={logs} now={now} />
                  </div>

                  {/* Quick Legends */}
                  <div className="flex justify-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-pd-slate">
                          <div className="w-3 h-3 rounded-full bg-pd-yellow"></div> Meal
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-pd-slate">
                          <div className="w-3 h-3 rounded-full bg-pd-teal"></div> Potty
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-pd-slate">
                          <div className="w-3 h-3 rounded-full bg-indigo-500"></div> Meds
                      </div>
                  </div>
              </Card>

              {/* Metabolic Thermostat */}
              <Card className="bg-pd-darkblue text-white border-none">
                  <div className="flex justify-between items-end mb-2">
                      <div>
                          <h3 className="font-impact text-xl uppercase tracking-wide flex items-center gap-2">
                              <Utensils size={18} className="text-pd-yellow" /> Metabolic Fuel
                          </h3>
                          <p className="text-xs text-pd-lightest opacity-70">Target: {metabolic.der} kcal (Active)</p>
                      </div>
                      <span className="font-mono font-bold text-2xl">{dailyCalories} kcal</span>
                  </div>
                  <FuelGauge current={dailyCalories} max={metabolic.der} treatCount={treatCalories} />
                  <div className="flex justify-between mt-2 text-[10px] font-bold uppercase text-pd-lightest opacity-60">
                      <span>0%</span>
                      <span>Treat Limit (10%)</span>
                      <span>100%</span>
                  </div>
              </Card>
          </div>

          {/* 3. HEALTH LOGGING & INTELLIGENCE (Right Col - 2/3) */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Dirty Hands Action Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <button 
                    onClick={() => { setActiveLogType('ELIMINATION_POOP'); setIsLogModalOpen(true); }}
                    className="bg-white border-2 border-pd-lightest hover:border-pd-teal hover:shadow-md p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group"
                  >
                      <div className="w-12 h-12 rounded-full bg-pd-lightest flex items-center justify-center group-hover:bg-pd-teal group-hover:text-white transition-colors text-pd-darkblue">
                          <div className="text-2xl">💩</div>
                      </div>
                      <span className="font-impact text-lg text-pd-darkblue uppercase tracking-wide">Potty</span>
                  </button>

                  <button 
                    onClick={() => { setActiveLogType('MEAL'); setIsLogModalOpen(true); }}
                    className="bg-white border-2 border-pd-lightest hover:border-pd-yellow hover:shadow-md p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group"
                  >
                      <div className="w-12 h-12 rounded-full bg-pd-lightest flex items-center justify-center group-hover:bg-pd-yellow group-hover:text-pd-darkblue transition-colors text-pd-darkblue">
                          <Bone size={24} />
                      </div>
                      <span className="font-impact text-lg text-pd-darkblue uppercase tracking-wide">Meal</span>
                  </button>

                  <button 
                    onClick={() => { setActiveLogType('MEDICATION'); setIsLogModalOpen(true); }}
                    className="bg-white border-2 border-pd-lightest hover:border-indigo-500 hover:shadow-md p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group"
                  >
                      <div className="w-12 h-12 rounded-full bg-pd-lightest flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors text-pd-darkblue">
                          <Pill size={24} />
                      </div>
                      <span className="font-impact text-lg text-pd-darkblue uppercase tracking-wide">Meds</span>
                  </button>

                  <button 
                    onClick={() => handleQuickLog('ACTIVITY', { duration: 30 })}
                    className="bg-white border-2 border-pd-lightest hover:border-emerald-500 hover:shadow-md p-4 rounded-2xl flex flex-col items-center gap-2 transition-all group"
                  >
                      <div className="w-12 h-12 rounded-full bg-pd-lightest flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors text-pd-darkblue">
                          <Activity size={24} />
                      </div>
                      <span className="font-impact text-lg text-pd-darkblue uppercase tracking-wide">Activity</span>
                  </button>
              </div>

              {/* Pharmacokinetics Timeline */}
              <Card className="bg-white border-2 border-pd-lightest">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="font-impact text-xl text-pd-darkblue uppercase tracking-wide flex items-center gap-2">
                          <Stethoscope size={20} className="text-indigo-500" /> Medication Schedule
                      </h3>
                      <Button variant="secondary" className="!py-1 !px-3 !text-xs">Edit Regimen</Button>
                  </div>
                  
                  <div className="space-y-4">
                      {MOCK_MEDS.map(med => (
                          <div key={med.id} className="flex items-center justify-between p-3 rounded-xl bg-pd-lightest/20 border border-pd-lightest">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                      <Pill size={20} />
                                  </div>
                                  <div>
                                      <p className="font-bold text-pd-darkblue">{med.name} <span className="text-xs font-medium text-pd-slate">({med.dosage})</span></p>
                                      <p className="text-xs text-pd-softgrey font-bold uppercase">{med.instructions}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="text-xs font-bold text-pd-slate uppercase tracking-wide">Next Due</p>
                                  <p className="font-mono font-bold text-indigo-600">{med.nextDue}</p>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-2 items-start">
                      <AlertTriangle size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-indigo-800 font-medium">
                          <span className="font-bold">Drug-Symptom Watch:</span> Monitoring for GI upset following Carprofen administration.
                      </p>
                  </div>
              </Card>

              {/* Elimination & Gut Health Analysis */}
              <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-white border-2 border-pd-lightest">
                      <h3 className="font-impact text-lg text-pd-darkblue uppercase mb-4 flex items-center gap-2">
                          <Brain size={18} className="text-pd-teal" /> Gut Intelligence
                      </h3>
                      <div className="space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-pd-lightest">
                              <span className="text-sm font-bold text-pd-slate">Avg. Stool Score</span>
                              <span className="font-impact text-lg text-emerald-500">3.0 (Optimal)</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-pd-lightest">
                              <span className="text-sm font-bold text-pd-slate">Hydration Status</span>
                              <span className="font-impact text-lg text-pd-darkblue">Good</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-pd-slate">Last Vomit</span>
                              <span className="font-mono text-sm font-medium text-pd-softgrey">14 Days Ago</span>
                          </div>
                      </div>
                  </Card>

                  <Card className="bg-white border-2 border-pd-lightest">
                      <h3 className="font-impact text-lg text-pd-darkblue uppercase mb-4 flex items-center gap-2">
                          <Zap size={18} className="text-pd-yellow" /> Activity Vitals
                      </h3>
                      <div className="space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-pd-lightest">
                              <span className="text-sm font-bold text-pd-slate">Resting Pulse</span>
                              <span className="font-impact text-lg text-pd-darkblue">68 bpm</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-pd-lightest">
                              <span className="text-sm font-bold text-pd-slate">Sleep Quality</span>
                              <span className="font-impact text-lg text-pd-teal">92%</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-pd-slate">Active Minutes</span>
                              <span className="font-mono text-sm font-medium text-pd-darkblue">45 / 60 Goal</span>
                          </div>
                      </div>
                  </Card>
              </div>
          </div>
      </div>

      {/* LOG MODAL (Context Aware) */}
      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Log Health Event">
          {activeLogType === 'ELIMINATION_POOP' && (
              <div className="space-y-6">
                  <div className="text-center p-4 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest border-dashed cursor-pointer hover:border-pd-teal hover:bg-pd-teal/5 transition-colors">
                      <Camera size={32} className="mx-auto text-pd-softgrey mb-2" />
                      <p className="font-bold text-pd-darkblue">Smart Scat Scan</p>
                      <p className="text-xs text-pd-softgrey">Use AI to grade Bristol Scale</p>
                  </div>
                  <div>
                      <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Manual Grade (Bristol Scale)</label>
                      <div className="flex justify-between gap-1">
                          {[1,2,3,4,5,6,7].map(score => (
                              <button key={score} className="flex-1 aspect-square rounded-lg border-2 border-pd-lightest font-bold text-pd-darkblue hover:bg-pd-teal hover:text-white hover:border-pd-teal transition-colors">
                                  {score}
                              </button>
                          ))}
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-pd-softgrey mt-1 uppercase px-1">
                          <span>Hard</span>
                          <span>Ideal</span>
                          <span>Liquid</span>
                      </div>
                  </div>
                  <Button variant="primary" className="w-full !py-3" onClick={() => handleQuickLog('ELIMINATION_POOP')}>Log Entry</Button>
              </div>
          )}

          {activeLogType === 'MEAL' && (
              <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-pd-lightest/30 rounded-xl border border-pd-lightest">
                      <Camera size={24} className="text-pd-darkblue" />
                      <div className="flex-1">
                          <p className="font-bold text-pd-darkblue">KibbleScan™</p>
                          <p className="text-xs text-pd-softgrey">Scan barcode for recall check & macros</p>
                      </div>
                      <ChevronRight size={20} className="text-pd-softgrey" />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Calories / Portion</label>
                      <input type="number" placeholder="e.g. 400" className="w-full p-3 bg-white border-2 border-pd-lightest rounded-xl font-bold text-pd-darkblue outline-none focus:border-pd-teal" />
                  </div>
                  <Button variant="primary" className="w-full !py-3" onClick={() => handleQuickLog('MEAL', { calories: 400 })}>Log Meal</Button>
              </div>
          )}

          {activeLogType === 'MEDICATION' && (
              <div className="space-y-4">
                  {MOCK_MEDS.map(med => (
                      <div key={med.id} className="flex items-center justify-between p-4 bg-white border-2 border-pd-lightest rounded-xl hover:border-indigo-500 cursor-pointer group" onClick={() => handleQuickLog('MEDICATION', { medicationId: med.id })}>
                          <div>
                              <p className="font-bold text-pd-darkblue text-lg group-hover:text-indigo-600">{med.name}</p>
                              <p className="text-xs text-pd-slate">{med.dosage} • {med.instructions}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full border-2 border-pd-lightest flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-500 group-hover:text-white">
                              <CheckCircle2 size={16} />
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </Modal>
    </div>
  );
};

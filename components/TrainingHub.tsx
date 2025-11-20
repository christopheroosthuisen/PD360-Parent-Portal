
import React, { useState, useEffect } from 'react';
import { DogData } from '../types';
import { TrainingCalendar } from './TrainingCalendar';
import { SkillsHub } from './SkillsHub';
import { MediaAnalysis } from './MediaAnalysis';
import { ActiveTraining } from './ActiveTraining';
import { Calendar, ClipboardList, Video, PlayCircle, Brain } from 'lucide-react';
import { TrainingPlanGenerator } from './AIFeatures'; // Imported Plan Generator here

interface TrainingHubProps {
  dogData: DogData;
  initialTab?: 'schedule' | 'skills' | 'analysis' | 'session' | 'plan';
}

export const TrainingHub: React.FC<TrainingHubProps> = ({ dogData, initialTab = 'schedule' }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'skills' | 'analysis' | 'session' | 'plan'>(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Unified Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-impact text-5xl text-pd-darkblue tracking-wide uppercase mb-2">TRAINING HUB</h1>
          <p className="text-pd-slate text-lg font-medium">Plan sessions, track skills, and analyze performance.</p>
        </div>
        
        {/* Custom Tab Switcher */}
        <div className="bg-white p-1.5 rounded-2xl border-2 border-pd-lightest flex shadow-sm overflow-x-auto max-w-full no-scrollbar">
            <button 
               onClick={() => setActiveTab('schedule')}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase transition-all whitespace-nowrap ${
                  activeTab === 'schedule' 
                  ? 'bg-pd-darkblue text-white shadow-md' 
                  : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-pd-lightest'
               }`}
            >
               <Calendar size={20} className={activeTab === 'schedule' ? 'text-pd-yellow' : ''} />
               Schedule
            </button>
            <button 
               onClick={() => setActiveTab('plan')}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase transition-all whitespace-nowrap ${
                  activeTab === 'plan' 
                  ? 'bg-pd-darkblue text-white shadow-md' 
                  : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-pd-lightest'
               }`}
            >
               <Brain size={20} className={activeTab === 'plan' ? 'text-pd-yellow' : ''} />
               AI Plan
            </button>
            <button 
               onClick={() => setActiveTab('skills')}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase transition-all whitespace-nowrap ${
                  activeTab === 'skills' 
                  ? 'bg-pd-darkblue text-white shadow-md' 
                  : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-pd-lightest'
               }`}
            >
               <ClipboardList size={20} className={activeTab === 'skills' ? 'text-pd-yellow' : ''} />
               Skills
            </button>
            <button 
               onClick={() => setActiveTab('analysis')}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase transition-all whitespace-nowrap ${
                  activeTab === 'analysis' 
                  ? 'bg-pd-darkblue text-white shadow-md' 
                  : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-pd-lightest'
               }`}
            >
               <Video size={20} className={activeTab === 'analysis' ? 'text-pd-yellow' : ''} />
               Analysis
            </button>
            <button 
               onClick={() => setActiveTab('session')}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-impact text-lg tracking-wide uppercase transition-all whitespace-nowrap ${
                  activeTab === 'session' 
                  ? 'bg-pd-teal text-pd-darkblue shadow-md' 
                  : 'text-pd-teal hover:text-pd-darkblue hover:bg-pd-lightest'
               }`}
            >
               <PlayCircle size={20} className={activeTab === 'session' ? 'text-white' : ''} />
               Start Session
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-8">
         {activeTab === 'schedule' && <TrainingCalendar dogData={dogData} />}
         {activeTab === 'plan' && <TrainingPlanGenerator dogData={dogData} />}
         {activeTab === 'skills' && <SkillsHub dogData={dogData} />}
         {activeTab === 'analysis' && <MediaAnalysis dogData={dogData} />}
         {activeTab === 'session' && <ActiveTraining dogId={dogData.id} onComplete={() => setActiveTab('schedule')} />}
      </div>
    </div>
  );
};




import React, { useState, useEffect } from 'react';
import { DogData } from '../types';
import { TrainingCalendar } from './TrainingCalendar';
import { SkillsHub } from './SkillsHub';
import { MediaAnalysis } from './MediaAnalysis';
import { ActiveTraining } from './ActiveTraining';
import { Calendar, ClipboardList, Video, PlayCircle } from 'lucide-react';

interface TrainingHubProps {
  dogData: DogData;
  initialTab?: 'schedule' | 'skills' | 'analysis' | 'session';
}

export const TrainingHub: React.FC<TrainingHubProps> = ({ dogData, initialTab = 'schedule' }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'skills' | 'analysis' | 'session'>(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Navigation - No redundant Main Title as the Tab is the title context */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-2 border-pd-lightest pb-6">
         <div>
            {activeTab === 'schedule' && (
               <>
                 <h1 className="font-impact text-4xl text-pd-darkblue tracking-wide uppercase mb-1">Training Schedule</h1>
                 <p className="text-pd-slate font-medium">Manage sessions, AI plans, and track consistency.</p>
               </>
            )}
            {activeTab === 'skills' && (
               <>
                 <h1 className="font-impact text-4xl text-pd-darkblue tracking-wide uppercase mb-1">Skills & Progress</h1>
                 <p className="text-pd-slate font-medium">Detailed breakdown of curriculum and mastery levels.</p>
               </>
            )}
            {activeTab === 'analysis' && (
               <>
                 <h1 className="font-impact text-4xl text-pd-darkblue tracking-wide uppercase mb-1">Media Analysis</h1>
                 <p className="text-pd-slate font-medium">AI-powered feedback on mechanics and body language.</p>
               </>
            )}
            {activeTab === 'session' && (
               <>
                 <h1 className="font-impact text-4xl text-pd-darkblue tracking-wide uppercase mb-1">Active Session</h1>
                 <p className="text-pd-slate font-medium">Live tracking mode.</p>
               </>
            )}
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
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-4">
         {activeTab === 'schedule' && (
            <TrainingCalendar 
               dogData={dogData} 
               onStartSession={() => setActiveTab('session')} 
            />
         )}
         {activeTab === 'skills' && <SkillsHub dogData={dogData} />}
         {activeTab === 'analysis' && <MediaAnalysis dogData={dogData} />}
         {activeTab === 'session' && <ActiveTraining dogId={dogData.id} onComplete={() => setActiveTab('schedule')} />}
      </div>
    </div>
  );
};
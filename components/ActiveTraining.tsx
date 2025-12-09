
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, ProgressBar } from './UI';
import { SKILL_TREE } from '../constants';
import { Play, Square, CheckCircle2, XCircle, Mic, Volume2, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { TrainingTask, SessionLog, ActiveSession, TrainingSessionRecord } from '../types';
import { DataService } from '../services/dataService';

interface ActiveTrainingProps {
  dogId: string;
  initialSkills?: TrainingTask[];
  onComplete: (session: ActiveSession) => void;
}

export const ActiveTraining: React.FC<ActiveTrainingProps> = ({ dogId, initialSkills = [], onComplete }) => {
  const [mode, setMode] = useState<'setup' | 'active' | 'summary'>('setup');
  const [selectedSkills, setSelectedSkills] = useState<TrainingTask[]>(initialSkills);
  const [sessionTime, setSessionTime] = useState(0);
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [activeStats, setActiveStats] = useState<Record<string, { success: number, fail: number }>>({});
  const [isListening, setIsListening] = useState(false);
  
  // Mock Audio visualizer state
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Timer
  useEffect(() => {
    let interval: any;
    if (mode === 'active') {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
        // Simulate volume fluctuation if listening
        if (isListening) {
            setVolumeLevel(Math.random() * 100);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, isListening]);

  const toggleSkill = (skillName: string) => {
     const exists = selectedSkills.find(s => s.name === skillName);
     if (exists) {
        setSelectedSkills(prev => prev.filter(s => s.name !== skillName));
     } else {
        // Find details from constant
        const skillDetails = SKILL_TREE.flatMap(cat => cat.skills).find(s => s.name === skillName);
        if (skillDetails) {
            setSelectedSkills(prev => [...prev, { id: skillDetails.id, name: skillDetails.name, category: 'General', completed: false, duration: '5m' }]);
        }
     }
  };

  const startSession = () => {
    // Initialize stats
    const initialStats: any = {};
    selectedSkills.forEach(s => initialStats[s.name] = { success: 0, fail: 0 });
    setActiveStats(initialStats);
    setMode('active');
    addLog('system', 'Session Started');
  };

  const endSession = async () => {
    setMode('summary');
    addLog('system', 'Session Ended');
    
    // Log to DB
    const sessionRecord: TrainingSessionRecord = {
        id: `sess_${Date.now()}`,
        dogId: dogId,
        date: new Date().toISOString(),
        durationSeconds: sessionTime,
        skillsWorked: Object.entries(activeStats).map(([name, stats]) => {
            const typedStats = stats as { success: number; fail: number };
            return {
                skillName: name,
                successCount: typedStats.success,
                failCount: typedStats.fail
            };
        }),
        notes: "Automated Log"
    };
    await DataService.logTrainingSession(sessionRecord);
  };

  const addLog = (type: SessionLog['type'], detail: string) => {
      setLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), type, detail }, ...prev]);
  };

  const recordResult = (skillName: string, success: boolean) => {
      setActiveStats(prev => ({
          ...prev,
          [skillName]: {
              success: prev[skillName].success + (success ? 1 : 0),
              fail: prev[skillName].fail + (success ? 0 : 1)
          }
      }));
      addLog('command', `${skillName}: ${success ? 'Success' : 'Retry'}`);
  };

  const toggleMic = () => {
      setIsListening(!isListening);
      addLog('system', isListening ? 'Voice Assistant Paused' : 'Voice Assistant Active');
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="font-impact text-4xl text-pd-darkblue uppercase tracking-wide">
                    {mode === 'setup' ? 'Session Setup' : mode === 'active' ? 'Live Training' : 'Session Summary'}
                </h1>
                <p className="text-pd-slate font-medium">
                    {mode === 'setup' ? 'Select behaviors to work on today.' : mode === 'active' ? 'Focus on mechanics and timing.' : 'Review your performance.'}
                </p>
            </div>
            {mode === 'active' && (
                <div className="bg-pd-darkblue text-white px-6 py-2 rounded-xl font-impact text-3xl tracking-widest tabular-nums shadow-lg">
                    {formatTime(sessionTime)}
                </div>
            )}
        </div>

        {/* SETUP MODE */}
        {mode === 'setup' && (
            <Card className="bg-white border-2 border-pd-lightest">
                <h3 className="font-impact text-xl text-pd-darkblue uppercase mb-4">Planned for Today</h3>
                <div className="grid gap-3 mb-8">
                    {selectedSkills.length > 0 ? selectedSkills.map(skill => (
                        <div key={skill.id} className="flex items-center justify-between p-4 bg-pd-lightest/30 rounded-xl border border-pd-lightest">
                            <span className="font-bold text-pd-darkblue text-lg">{skill.name}</span>
                            <button onClick={() => toggleSkill(skill.name)} className="text-pd-softgrey hover:text-rose-500">
                                <XCircle size={20} />
                            </button>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-pd-softgrey italic">No skills selected from plan. Add custom skills below.</div>
                    )}
                </div>

                <h3 className="font-impact text-xl text-pd-darkblue uppercase mb-4">Add Skills</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                    {SKILL_TREE.flatMap(c => c.skills).slice(0, 10).map(s => (
                        <button 
                            key={s.id} 
                            onClick={() => toggleSkill(s.name)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${selectedSkills.find(sk => sk.name === s.name) ? 'bg-pd-darkblue text-white border-pd-darkblue' : 'bg-white text-pd-slate border-pd-lightest hover:border-pd-teal'}`}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>

                <Button variant="primary" onClick={startSession} className="w-full !py-4 !text-xl shadow-xl" icon={Play}>
                    Start Session
                </Button>
            </Card>
        )}

        {/* ACTIVE MODE */}
        {mode === 'active' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Controls */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid gap-4">
                        {selectedSkills.map(skill => (
                            <Card key={skill.id} className="bg-white border-l-8 border-l-pd-teal shadow-md hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide">{skill.name}</h3>
                                    <div className="flex gap-4 text-sm font-bold">
                                        <span className="text-emerald-600">{activeStats[skill.name]?.success || 0} Success</span>
                                        <span className="text-rose-500">{activeStats[skill.name]?.fail || 0} Fail</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => recordResult(skill.name, true)}
                                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-2 border-emerald-200 py-4 rounded-xl font-impact text-lg uppercase tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        <CheckCircle2 /> Success
                                    </button>
                                    <button 
                                        onClick={() => recordResult(skill.name, false)}
                                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 py-4 rounded-xl font-impact text-lg uppercase tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        <XCircle /> Retry
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                    <Button variant="secondary" onClick={endSession} className="w-full" icon={Square}>End Session</Button>
                </div>

                {/* Right: Live Feed & Voice */}
                <div className="space-y-6">
                    <Card className="bg-pd-darkblue text-white border-none shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-pd-teal rounded-full opacity-10 -mr-10 -mt-10"></div>
                         <div className="relative z-10 text-center py-6">
                             <button 
                                onClick={toggleMic}
                                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 border-4 ${isListening ? 'bg-white text-pd-darkblue border-pd-teal shadow-[0_0_30px_rgba(52,198,185,0.6)]' : 'bg-white/10 text-pd-lightest border-white/10 hover:bg-white/20'}`}
                             >
                                 {isListening ? <Mic size={32} className="animate-pulse" /> : <Mic size={32} />}
                             </button>
                             <h3 className="font-impact text-xl uppercase tracking-wide mb-1">Voice Assistant</h3>
                             <p className="text-xs text-pd-teal uppercase font-bold tracking-wider mb-4">
                                 {isListening ? 'Listening for markers...' : 'Tap to activate'}
                             </p>
                             
                             {/* Fake Visualizer */}
                             <div className="flex justify-center gap-1 h-8 items-end">
                                {[1,2,3,4,5,6,7,8].map(i => (
                                    <div 
                                        key={i} 
                                        className="w-1.5 bg-pd-yellow rounded-full transition-all duration-100"
                                        style={{ height: isListening ? `${Math.random() * 100}%` : '4px' }}
                                    ></div>
                                ))}
                             </div>
                         </div>
                    </Card>

                    <Card className="bg-white border-2 border-pd-lightest h-[400px] flex flex-col">
                        <h4 className="font-impact text-lg text-pd-darkblue uppercase mb-4 border-b-2 border-pd-lightest pb-2">Session Log</h4>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                            {logs.map((log, idx) => (
                                <div key={idx} className="text-sm">
                                    <span className="text-pd-softgrey font-mono text-xs mr-2">{log.timestamp}</span>
                                    <span className={`font-bold ${
                                        log.type === 'system' ? 'text-pd-slate italic' : 
                                        log.type === 'command' ? 'text-pd-darkblue' : 
                                        'text-pd-teal'
                                    }`}>
                                        {log.detail}
                                    </span>
                                </div>
                            ))}
                            {logs.length === 0 && <p className="text-pd-softgrey italic text-center mt-10">Waiting for activity...</p>}
                        </div>
                    </Card>
                </div>
            </div>
        )}

        {/* SUMMARY MODE */}
        {mode === 'summary' && (
            <div className="space-y-8">
                <Card className="bg-white border-2 border-pd-lightest text-center py-12">
                    <div className="w-24 h-24 bg-pd-teal text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Sparkles size={48} />
                    </div>
                    <h2 className="font-impact text-4xl text-pd-darkblue uppercase mb-2">Great Job!</h2>
                    <p className="text-pd-slate text-lg font-medium mb-8">Session Duration: <span className="font-bold text-pd-darkblue">{formatTime(sessionTime)}</span></p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {Object.entries(activeStats).map(([name, s]) => {
                            const stats = s as { success: number; fail: number };
                            const total = stats.success + stats.fail;
                            const rate = total > 0 ? Math.round((stats.success / total) * 100) : 0;
                            return (
                                <div key={name} className="bg-pd-lightest/30 p-6 rounded-2xl border border-pd-lightest">
                                    <h4 className="font-impact text-xl text-pd-darkblue uppercase mb-2">{name}</h4>
                                    <div className="text-4xl font-bold text-pd-teal mb-2">{rate}%</div>
                                    <div className="text-xs font-bold text-pd-softgrey uppercase tracking-wider">{total} Reps</div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
                
                <div className="flex justify-center">
                    <Button variant="primary" onClick={() => window.location.reload()} className="!px-8 !py-4">Return to Dashboard</Button>
                </div>
            </div>
        )}
    </div>
  );
};

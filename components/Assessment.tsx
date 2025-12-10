
import React, { useState, useEffect } from 'react';
import { usePD360Schema } from '../services/schemaService';
import { DogData } from '../types';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Save, Brain, Dumbbell, Users, ShieldAlert, Sparkles, AlertOctagon } from 'lucide-react';
import { Button, Card } from './UI';
import { DataService } from '../services/dataService';

interface AssessmentProps {
  dog: DogData;
  onUpdate: (updatedDog: DogData) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  IB: AlertOctagon,
  OB: Dumbbell,
  SB: Users,
  ST: ShieldAlert,
  TR: Sparkles,
  SCORES: Brain
};

const CATEGORY_COLORS: Record<string, string> = {
  IB: 'text-rose-600 bg-rose-50 border-rose-200',
  OB: 'text-pd-darkblue bg-pd-lightest/50 border-pd-lightest',
  SB: 'text-pd-teal bg-pd-teal/10 border-pd-teal/20',
  ST: 'text-orange-600 bg-orange-50 border-orange-200',
  TR: 'text-purple-600 bg-purple-50 border-purple-200',
  SCORES: 'text-pd-slate bg-pd-lightest border-pd-lightest'
};

export const Assessment: React.FC<AssessmentProps> = ({ dog, onUpdate }) => {
  const schema = usePD360Schema();
  const [formValues, setFormValues] = useState<Record<string, any>>(dog.assessmentScores || {});
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({ IB: true, SCORES: true });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with defaults if empty
  useEffect(() => {
      setFormValues(dog.assessmentScores || {});
  }, [dog.id]);

  const handleScoreChange = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (catKey: string) => {
    setExpandedCats(prev => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const updatedDog = { ...dog, assessmentScores: formValues };
        await DataService.updateDog(dog.id, updatedDog);
        onUpdate(updatedDog);
    } catch (e) {
        console.error("Failed to save assessment", e);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h2 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide">PD360 Assessment</h2>
                <p className="text-pd-slate font-medium">Digital twin of the official intake evaluation.</p>
            </div>
            <Button variant="primary" icon={Save} onClick={handleSave} disabled={isSaving} className="shadow-lg">
                {isSaving ? 'Saving...' : 'Save Assessment'}
            </Button>
        </div>

        <div className="space-y-6">
            {Object.entries(schema.categories).map(([catKey, category]) => {
                if (category.fields.length === 0) return null;
                const Icon = CATEGORY_ICONS[catKey] || Brain;
                const colorClass = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.OB;
                const isExpanded = expandedCats[catKey];

                return (
                    <Card key={catKey} className={`!p-0 border-2 overflow-hidden transition-all duration-300 ${isExpanded ? 'border-pd-lightest' : 'border-transparent bg-white/50'}`}>
                        <button 
                            onClick={() => toggleCategory(catKey)}
                            className={`w-full flex items-center justify-between p-5 transition-colors ${isExpanded ? 'bg-white' : 'bg-pd-lightest/20 hover:bg-pd-lightest/40'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl ${colorClass.split(' ')[1]} ${colorClass.split(' ')[0]}`}>
                                    <Icon size={24} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-impact text-xl text-pd-darkblue uppercase tracking-wide">{category.label}</h3>
                                    <p className="text-xs text-pd-softgrey font-bold uppercase tracking-wider">{category.description}</p>
                                </div>
                            </div>
                            {isExpanded ? <ChevronUp size={20} className="text-pd-softgrey" /> : <ChevronDown size={20} className="text-pd-softgrey" />}
                        </button>

                        {isExpanded && (
                            <div className="p-6 pt-0 bg-white border-t-2 border-pd-lightest">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                                    {category.fields.map(field => (
                                        <div key={field.key} className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className={`text-xs font-bold uppercase tracking-wider truncate ${field.is_liability ? 'text-rose-600' : 'text-pd-slate'}`}>
                                                    {field.label}
                                                </label>
                                                {field.is_liability && (
                                                    <div title="Liability Risk" className="text-rose-500 animate-pulse">
                                                        <AlertTriangle size={12} />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {catKey === 'SCORES' ? (
                                                <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        value={formValues[field.key] || ''} 
                                                        onChange={(e) => handleScoreChange(field.key, e.target.value)}
                                                        className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none font-mono font-bold text-pd-darkblue"
                                                        placeholder="0"
                                                    />
                                                    {field.max_points && (
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-pd-softgrey">
                                                            / {field.max_points}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <select 
                                                    value={formValues[field.key] || ''}
                                                    onChange={(e) => handleScoreChange(field.key, e.target.value)}
                                                    className="w-full p-3 bg-white border-2 border-pd-lightest rounded-xl text-sm font-medium text-pd-darkblue focus:border-pd-teal outline-none appearance-none"
                                                >
                                                    <option value="">Select Level...</option>
                                                    <option value="1">1 - {catKey === 'IB' ? 'Frequent' : 'Unknown'}</option>
                                                    <option value="2">2 - {catKey === 'IB' ? 'Often' : 'Teaching'}</option>
                                                    <option value="3">3 - {catKey === 'IB' ? 'Occasional' : 'Reinforcing'}</option>
                                                    <option value="4">4 - {catKey === 'IB' ? 'Rarely' : 'Proofing'}</option>
                                                    <option value="5">5 - {catKey === 'IB' ? 'Never' : 'Maintenance'}</option>
                                                </select>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    </div>
  );
};

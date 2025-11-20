
import React, { useMemo } from 'react';
import { SKILL_TREE } from '../constants';
import { Card } from './UI';
import { Trophy, Calculator } from 'lucide-react';

export const ScoreBreakdown: React.FC = () => {
  const { processedCategories, totalScore } = useMemo(() => {
    const processed = SKILL_TREE.map(cat => {
      const sortedSkills = [...cat.skills].sort((a, b) => a.name.localeCompare(b.name));
      const categoryScore = sortedSkills.reduce((acc, skill) => acc + skill.level, 0);
      return {
        ...cat,
        skills: sortedSkills,
        categoryScore
      };
    });

    const sortedCategories = processed.sort((a, b) => a.category.localeCompare(b.category));
    const total = sortedCategories.reduce((acc, cat) => acc + cat.categoryScore, 0);

    return { processedCategories: sortedCategories, totalScore: total };
  }, []);

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="font-impact text-4xl text-pd-darkblue tracking-wide uppercase">Score Breakdown</h1>
          <p className="text-pd-slate mt-1 font-medium">Comprehensive list of all tracked behaviors and scores.</p>
        </div>
        <div className="bg-pd-darkblue text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-4 border-l-4 border-pd-teal">
          <Calculator size={28} className="text-pd-teal" />
          <div>
            <p className="text-xs font-bold text-pd-teal uppercase tracking-wider">PD360 Total Score</p>
            <p className="font-impact text-3xl leading-none">{totalScore}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {processedCategories.map((cat, idx) => (
          <Card key={idx} className="overflow-hidden !p-0 bg-white border-none shadow-md">
            {/* Category Header */}
            <div className="bg-pd-lightest/30 p-6 border-b-2 border-pd-lightest flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white border-2 border-pd-lightest rounded-xl text-pd-slate">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="font-impact text-xl text-pd-darkblue uppercase tracking-wide">{cat.category}</h3>
                  <p className="text-xs text-pd-slate font-bold uppercase tracking-wider">
                    {cat.skills.length} Behaviors
                  </p>
                </div>
              </div>
              <div className="text-right">
                 <span className="block text-xs text-pd-softgrey uppercase font-bold tracking-wider">Category Score</span>
                 <span className="block font-impact text-2xl text-pd-teal">{cat.categoryScore}</span>
              </div>
            </div>

            {/* Behaviors List */}
            <div className="divide-y divide-pd-lightest">
              {cat.skills.map((skill) => (
                <div key={skill.id} className="p-5 flex items-center justify-between hover:bg-pd-lightest/20 transition-colors group">
                  <div className="flex-1">
                    <p className="font-bold text-pd-darkblue text-lg">{skill.name}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-48 hidden sm:block">
                      <div className="h-2.5 w-full bg-pd-lightest rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${cat.type === 'INAPPROPRIATE' ? 'bg-emerald-500' : 'bg-pd-teal'}`} 
                          style={{ width: `${(skill.level / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-pd-lightest flex items-center justify-center font-impact text-xl text-pd-slate group-hover:bg-pd-darkblue group-hover:text-white transition-colors">
                      {skill.level}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

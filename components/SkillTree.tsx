import React from 'react';
import { SKILL_TREE } from '../constants';
import { PD360PhaseBar } from './UI';

export const SkillTree: React.FC = () => {
  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">PD360 Skill Tree</h1>
          <p className="text-slate-500 mt-1">Detailed phase breakdown and curriculum status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SKILL_TREE.map((category, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm flex items-center gap-2">
                 {category.category}
               </h3>
               {category.type === "INAPPROPRIATE" && (
                 <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">Goal: Never</span>
               )}
            </div>
            
            <div className="space-y-3">
              {category.skills.map((skill) => (
                <div key={skill.id} className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-indigo-200 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-slate-800 text-sm">{skill.name}</span>
                    <div className="text-xs font-medium text-slate-400">
                      Lvl {skill.level}
                    </div>
                  </div>
                  
                  <PD360PhaseBar level={skill.level} type={category.type} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { BookOpen, PlayCircle, Lock, CheckCircle, ExternalLink, Search, GraduationCap } from 'lucide-react';
import { Card, Button } from './UI';
import { MOCK_COURSES, SKILL_TREE } from '../constants';

export const KnowledgeBase: React.FC = () => {
  const flattenedSkills = SKILL_TREE.flatMap(cat => cat.skills).filter(s => s.link);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-24">
      
      {/* Hero Section */}
      <div className="bg-pd-darkblue rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-pd-teal rounded-full opacity-10 -mr-20 -mt-20 blur-3xl"></div>
         <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
               <div className="bg-pd-yellow text-pd-darkblue p-2 rounded-xl font-bold uppercase tracking-wide text-xs flex items-center gap-2">
                  <GraduationCap size={16} /> Partners University
               </div>
            </div>
            <h1 className="font-impact text-5xl md:text-6xl tracking-wide uppercase mb-6 leading-none">
               MASTER THE <br/><span className="text-pd-teal">PARTNERS METHOD</span>
            </h1>
            <p className="text-pd-lightest text-lg font-medium mb-8 max-w-xl leading-relaxed">
               Access our comprehensive curriculum, from puppy foundations to advanced behavior modification. Your journey to a better relationship starts here.
            </p>
            <div className="flex gap-4">
               <a href="https://university.partnersdogs.org" target="_blank" rel="noreferrer">
                  <Button variant="accent" className="!px-8 !py-4 !text-lg">
                     Go to University
                  </Button>
               </a>
               <a href="https://knowledge.partnersdogs.com" target="_blank" rel="noreferrer">
                  <Button variant="secondary" className="!px-8 !py-4 !text-lg !bg-white/10 !text-white !border-white hover:!bg-white hover:!text-pd-darkblue">
                     Browse Knowledge Base
                  </Button>
               </a>
            </div>
         </div>
      </div>

      {/* Learning Paths (Courses) */}
      <div>
         <h2 className="font-impact text-3xl text-pd-darkblue tracking-wide uppercase mb-6">YOUR LEARNING PATH</h2>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {MOCK_COURSES.map(course => (
               <Card key={course.id} className="bg-white !p-0 overflow-hidden border-2 border-pd-lightest hover:shadow-xl transition-shadow group">
                  <div className="h-48 bg-pd-slate relative overflow-hidden">
                     <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-pd-darkblue/90 to-transparent"></div>
                     <div className="absolute bottom-4 left-6 right-6">
                        <h3 className="font-impact text-2xl text-white tracking-wide uppercase mb-2">{course.title}</h3>
                        <div className="flex items-center gap-4 text-xs font-bold text-pd-lightest uppercase tracking-wider">
                           <span>{course.completedModules}/{course.totalModules} Modules</span>
                           <span>{course.progress}% Complete</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-white/20 rounded-full mt-3 overflow-hidden">
                           <div className="h-full bg-pd-yellow" style={{ width: `${course.progress}%` }}></div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="p-6">
                     <p className="text-pd-slate mb-6 text-sm font-medium">{course.description}</p>
                     
                     <div className="space-y-1 mb-6">
                        {course.modules.slice(0, 3).map((mod, idx) => (
                           <div key={mod.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-pd-lightest/40 transition-colors">
                              <div className="flex items-center gap-3">
                                 {mod.isCompleted ? (
                                    <CheckCircle size={18} className="text-pd-teal" />
                                 ) : mod.isLocked ? (
                                    <Lock size={18} className="text-pd-softgrey" />
                                 ) : (
                                    <PlayCircle size={18} className="text-pd-darkblue" />
                                 )}
                                 <span className={`text-sm font-bold ${mod.isCompleted ? 'text-pd-slate line-through opacity-70' : 'text-pd-darkblue'}`}>
                                    {idx + 1}. {mod.title}
                                 </span>
                              </div>
                              <span className="text-xs text-pd-softgrey font-bold">{mod.duration}</span>
                           </div>
                        ))}
                        {course.modules.length > 3 && (
                           <div className="text-center pt-2 text-xs font-bold text-pd-softgrey uppercase tracking-wide">
                              + {course.modules.length - 3} more lessons
                           </div>
                        )}
                     </div>

                     <a href={course.link} target="_blank" rel="noreferrer" className="block">
                        <Button variant="primary" className="w-full">Continue Learning</Button>
                     </a>
                  </div>
               </Card>
            ))}
         </div>
      </div>

      {/* Quick Reference Library */}
      <div>
         <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
               <h2 className="font-impact text-3xl text-pd-darkblue tracking-wide uppercase">BEHAVIOR LIBRARY</h2>
               <p className="text-pd-slate mt-1">Quick guides for specific training behaviors.</p>
            </div>
            <div className="relative">
               <input 
                  type="text" 
                  placeholder="Search library..." 
                  className="pl-10 pr-4 py-2 bg-white border-2 border-pd-lightest rounded-xl text-pd-darkblue placeholder-pd-softgrey font-medium focus:border-pd-teal focus:outline-none w-full md:w-64"
               />
               <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-pd-softgrey" />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flattenedSkills.map(skill => (
               <a 
                  key={skill.id} 
                  href={skill.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 bg-white border-2 border-pd-lightest rounded-xl hover:border-pd-teal hover:shadow-md transition-all group"
               >
                  <span className="font-bold text-pd-darkblue group-hover:text-pd-teal transition-colors">{skill.name}</span>
                  <ExternalLink size={16} className="text-pd-softgrey group-hover:text-pd-teal" />
               </a>
            ))}
         </div>
      </div>
    </div>
  );
};


import { Grade } from './types';

// 1. Grade Thresholds (Constant)
export const GRADE_THRESHOLDS: Grade[] = [
  { name: "Pre-School", minScore: 77, color: "text-blue-600", bg: "bg-blue-100", bar: "bg-blue-500" },
  { name: "Kindergarten", minScore: 147, color: "text-emerald-600", bg: "bg-emerald-100", bar: "bg-emerald-500" },
  { name: "Elementary", minScore: 243, color: "text-yellow-600", bg: "bg-yellow-100", bar: "bg-yellow-500" },
  { name: "Middle School", minScore: 339, color: "text-orange-600", bg: "bg-orange-100", bar: "bg-orange-500" },
  { name: "High School", minScore: 404, color: "text-red-600", bg: "bg-red-100", bar: "bg-red-500" },
  { name: "College", minScore: 463, color: "text-purple-600", bg: "bg-purple-100", bar: "bg-purple-500" },
  { name: "Masters", minScore: 518, color: "text-indigo-600", bg: "bg-indigo-100", bar: "bg-indigo-500" },
  { name: "Dogtorate", minScore: 602, color: "text-slate-800", bg: "bg-slate-200", bar: "bg-slate-800" }
];

export interface BehaviorDef {
  id: string;
  cleanName: string;
  category: string;
  introGrade: string; // e.g., "Pre-School"
  expectations: Record<string, number | null>; // Grade Name -> Phase (2-5) or null if not applicable
}

// Helper to map suffix to grade name
const getIntroGradeFromSuffix = (suffix: string): string => {
  const map: Record<string, string> = {
    'PS': 'Pre-School',
    'K': 'Kindergarten',
    'E': 'Elementary',
    'MS': 'Middle School',
    'HS': 'High School',
    'C': 'College',
    'M': 'Masters',
    'D': 'Dogtorate'
  };
  return map[suffix] || 'Pre-School'; // Default to Pre-School if general
};

// Helper to generate expectations based on intro grade
// Logic: Starts at Phase 2 in intro grade, increments by 1 each grade until Phase 5
const generateExpectations = (introGradeName: string): Record<string, number | null> => {
  const expectations: Record<string, number | null> = {};
  let started = false;
  let phase = 2;

  for (const grade of GRADE_THRESHOLDS) {
    if (grade.name === introGradeName) {
      started = true;
    }
    
    if (started) {
      expectations[grade.name] = Math.min(phase, 5);
      phase++;
    } else {
      expectations[grade.name] = null;
    }
  }
  return expectations;
};

const createBehavior = (rawId: string, cleanName: string, category: string = 'General'): BehaviorDef => {
  const parts = rawId.split('_');
  const suffix = parts.length > 2 ? parts[parts.length - 1] : ''; // e.g., 'PS' from quant_Sit_PS
  const introGrade = getIntroGradeFromSuffix(suffix);
  
  return {
    id: rawId,
    cleanName,
    category,
    introGrade,
    expectations: generateExpectations(introGrade)
  };
};

// 2. Behavior Library (Sample implementation of the CSV logic)
export const BEHAVIOR_LIBRARY: Record<string, BehaviorDef> = {
  // Pre-School (PS)
  'quant_Sit_PS': createBehavior('quant_Sit_PS', 'Sit', 'Obedience'),
  'quant_Down_PS': createBehavior('quant_Down_PS', 'Down', 'Obedience'),
  'quant_Watch_PS': createBehavior('quant_Watch_PS', 'Watch', 'Focus'),
  'quant_Name_Recognition_PS': createBehavior('quant_Name_Recognition_PS', 'Name Recognition', 'Focus'),
  
  // Kindergarten (K)
  'quant_Heel_K': createBehavior('quant_Heel_K', 'Heel', 'Obedience'),
  'quant_Place_K': createBehavior('quant_Place_K', 'Place', 'Obedience'),
  'quant_Recall_K': createBehavior('quant_Recall_K', 'Recall', 'Obedience'),
  'quant_Stay_K': createBehavior('quant_Stay_K', 'Stay', 'Obedience'),

  // Elementary (E)
  'quant_Recall_To_Heel_E': createBehavior('quant_Recall_To_Heel_E', 'Recall to Heel', 'Obedience'),
  'quant_Leave_It_E': createBehavior('quant_Leave_It_E', 'Leave It', 'Obedience'),
  'quant_Loose_Leash_E': createBehavior('quant_Loose_Leash_E', 'Loose Leash Walking', 'Obedience'),

  // Middle School (MS)
  'quant_Off_Leash_MS': createBehavior('quant_Off_Leash_MS', 'Off Leash Control', 'Obedience'),
  'quant_Distance_Commands_MS': createBehavior('quant_Distance_Commands_MS', 'Distance Commands', 'Obedience'),

  // General / Inappropriate (No specific suffix usually means Pre-School or General)
  'quant_Barrier_Fence': createBehavior('quant_Barrier_Fence', 'Barrier/Fence Reactivity', 'Behavior'),
  'quant_Jumping': createBehavior('quant_Jumping', 'Jumping', 'Behavior'),
  'quant_Barking': createBehavior('quant_Barking', 'Barking', 'Behavior'),
};

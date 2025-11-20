
import { GRADE_THRESHOLDS, BEHAVIOR_LIBRARY } from './progressionData';
import { Grade } from './types';

// Calculate Grade based on current score
export const calculateGrade = (currentScore: number): Grade => {
  // Default to Pre-School if below first threshold, though logic typically handles 0
  let grade = GRADE_THRESHOLDS[0];
  
  for (let i = 0; i < GRADE_THRESHOLDS.length; i++) {
    if (currentScore >= GRADE_THRESHOLDS[i].minScore) {
      grade = GRADE_THRESHOLDS[i];
    } else {
      break; // Stop once we find the highest grade achieved
    }
  }
  return grade;
};

// Get expected phase for a behavior in a specific grade
export const getBehaviorPhaseForGrade = (behaviorId: string, currentGradeName: string): number | null => {
  const behavior = BEHAVIOR_LIBRARY[behaviorId];
  if (!behavior) return null;
  
  return behavior.expectations[currentGradeName] || null;
};

// Normalize behavior name for UI
export const normalizeBehaviorName = (rawId: string): string => {
  // Check if we have it in library
  if (BEHAVIOR_LIBRARY[rawId]) {
    return BEHAVIOR_LIBRARY[rawId].cleanName;
  }

  // Fallback logic if not in library
  let clean = rawId.replace('quant_', '');
  // Remove common suffixes
  const suffixes = ['_PS', '_K', '_E', '_MS', '_HS', '_C', '_M', '_D'];
  suffixes.forEach(s => {
    if (clean.endsWith(s)) {
      clean = clean.substring(0, clean.length - s.length);
    }
  });
  // Replace underscores with spaces
  return clean.split('_').join(' ');
};

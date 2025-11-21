
import { 
  Grade, SkillCategory, Note, RadarPoint, 
  PhaseConfig, Phases, Achievement, DogData, 
  Coach, Facility, ServiceOption, AddOn, 
  CommunityPost, CommunityEvent, LeaderboardEntry, 
  Course, MediaItem 
} from './types';
import { Brain, Trophy, Users, Star, Award, Flame } from 'lucide-react';
import React from 'react';

// --- Grades ---
export const GRADE_THRESHOLDS: Grade[] = [
  { name: "Pre-School", minScore: 0, color: "text-blue-600", bg: "bg-blue-100", bar: "bg-blue-500" },
  { name: "Kindergarten", minScore: 150, color: "text-emerald-600", bg: "bg-emerald-100", bar: "bg-emerald-500" },
  { name: "Elementary", minScore: 300, color: "text-yellow-600", bg: "bg-yellow-100", bar: "bg-yellow-500" },
  { name: "Middle School", minScore: 450, color: "text-orange-600", bg: "bg-orange-100", bar: "bg-orange-500" },
  { name: "High School", minScore: 600, color: "text-red-600", bg: "bg-red-100", bar: "bg-red-500" },
  { name: "College", minScore: 750, color: "text-purple-600", bg: "bg-purple-100", bar: "bg-purple-500" },
  { name: "Masters", minScore: 900, color: "text-indigo-600", bg: "bg-indigo-100", bar: "bg-indigo-500" },
];

export const getCurrentGrade = (score: number) => {
  const current = GRADE_THRESHOLDS.slice().reverse().find(g => score >= g.minScore) || GRADE_THRESHOLDS[0];
  const nextIndex = GRADE_THRESHOLDS.indexOf(current) + 1;
  const next = GRADE_THRESHOLDS[nextIndex] || { name: "Max Level", minScore: 1000, color: "", bg: "", bar: "" };
  return { current, next };
};

// --- Phases ---
export const PHASES: Phases = {
  STANDARD: {
    1: { label: 'Unknown', desc: 'Dog does not understand the behavior.' },
    2: { label: 'Teaching', desc: 'Luring and shaping the mechanics.' },
    3: { label: 'Reinforcing', desc: 'Building value and history.' },
    4: { label: 'Proofing', desc: 'Adding distance, duration, and distraction.' },
    5: { label: 'Maintenance', desc: 'Reliable in all environments.' },
  },
  INAPPROPRIATE: {
    1: { label: 'Frequent', desc: 'Occurs daily or multiple times a day.' },
    2: { label: 'Often', desc: 'Occurs a few times a week.' },
    3: { label: 'Occasional', desc: 'Occurs once a week or less.' },
    4: { label: 'Rarely', desc: 'Occurs once a month or less.' },
    5: { label: 'Never', desc: 'Behavior has been extinguished.' },
  }
};

// --- Skill Tree ---
export const SKILL_TREE: SkillCategory[] = [
  {
    category: "Obedience",
    type: "STANDARD",
    skills: [
      { id: "sit", name: "Sit", level: 5, link: "https://knowledge.partnersdogs.com/sit" },
      { id: "down", name: "Down", level: 4, link: "https://knowledge.partnersdogs.com/down" },
      { id: "place", name: "Place", level: 4, link: "https://knowledge.partnersdogs.com/place" },
      { id: "recall", name: "Recall", level: 3, link: "https://knowledge.partnersdogs.com/recall" },
      { id: "heel", name: "Heel", level: 2, link: "https://knowledge.partnersdogs.com/heel" }
    ]
  },
  {
    category: "Socialization",
    type: "STANDARD",
    skills: [
      { id: "dogs", name: "Dog Neutrality", level: 3 },
      { id: "people", name: "People Greetings", level: 4 },
      { id: "surfaces", name: "Surface Confidence", level: 5 }
    ]
  },
  {
    category: "Management",
    type: "INAPPROPRIATE",
    skills: [
      { id: "jump", name: "Jumping", level: 2 },
      { id: "bark", name: "Demand Barking", level: 3 },
      { id: "chew", name: "Destructive Chewing", level: 5 }
    ]
  }
];

// --- Mock Data ---
export const TRAINER_NOTES: Note[] = [
  { id: 1, date: 'Oct 24', author: 'Marcus (Trainer)', content: "Barnaby is in the 'Proofing' phase for Down. We added duration today.", type: 'session' },
  { id: 2, date: 'Oct 24', author: 'System', content: "PD360 Automated Update: 'Sit' promoted to Maintenance (5).", type: 'system' },
];

export const FULL_HISTORY_DATA = [
  { date: 'Oct 1', score: 220 }, { date: 'Oct 5', score: 225 },
  { date: 'Oct 10', score: 228 }, { date: 'Oct 15', score: 230 },
  { date: 'Oct 20', score: 234 }, { date: 'Oct 25', score: 234 },
];

export const RADAR_DATA: RadarPoint[] = [
  { subject: 'Obedience', A: 4, fullMark: 5 },
  { subject: 'Social', A: 3, fullMark: 5 },
  { subject: 'Household', A: 5, fullMark: 5 },
  { subject: 'Confidence', A: 4, fullMark: 5 },
  { subject: 'Engagement', A: 3, fullMark: 5 },
  { subject: 'Neutrality', A: 2, fullMark: 5 },
];

export const ACHIEVEMENTS_MOCK: Achievement[] = [
  { id: 'a1', title: 'Week Warrior', description: '7 Day Streak', icon: '🔥', dateEarned: '2023-10-10', isLocked: false },
  { id: 'a2', title: 'Sit Master', description: 'Level 5 Sit', icon: '🪑', dateEarned: '2023-09-15', isLocked: false },
  { id: 'a3', title: 'Social Butterfly', description: '10 Dog Meets', icon: '🦋', dateEarned: '2023-10-01', isLocked: false },
  { id: 'a4', title: 'Recall Pro', description: 'Off-leash Recall', icon: '⚡', isLocked: true },
];

// --- Booking ---
export const MOCK_FACILITIES: Facility[] = [
  { id: 'f1', name: 'Partners Dog Training - Cave Creek', address: 'Cave Creek, AZ', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80', hasPDUAlumni: true, distance: '2.4 miles' },
  { id: 'f2', name: 'Partners Dog Training - Scottsdale', address: 'Scottsdale, AZ', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80', hasPDUAlumni: true, distance: '8.1 miles' },
];

export const BOOKING_SERVICES: ServiceOption[] = [
  { id: 'boarding', name: 'Luxury Boarding', description: 'Overnight stay with play groups and cozy bedding.', price: 65, priceUnit: 'night' },
  { id: 'day_school', name: 'Day School', description: 'Daytime training reinforcement and socialization.', price: 45, priceUnit: 'day' },
];

export const BOOKING_ADDONS: AddOn[] = [
  { id: 'train_sesh', name: 'Training Session', description: '20m 1-on-1 with trainer', price: 30, category: 'Training' },
  { id: 'bath', name: 'Exit Bath', description: 'Wash and dry before pickup', price: 40, category: 'Grooming' },
  { id: 'kong', name: 'Stuffed Kong', description: 'Peanut butter frozen treat', price: 5, category: 'Enrichment' },
];

export const MOCK_COACHES: Coach[] = [
  { 
    id: 'c1', name: 'Mike T.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 
    specialties: ['Behavior Mod', 'Puppy'], location: 'Scottsdale', rating: 4.9, reviews: 124, 
    bio: 'Specializing in high-drive breeds and behavior modification.', isPDUAlum: true, hourlyRate: 120, availableSlots: ['Mon 9am', 'Tue 2pm'] 
  },
  { 
    id: 'c2', name: 'Sarah J.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', 
    specialties: ['Obedience', 'Tricks'], location: 'Phoenix', rating: 5.0, reviews: 89, 
    bio: 'Passionate about building engagement and fun through tricks.', isPDUAlum: true, hourlyRate: 100, availableSlots: ['Wed 10am', 'Fri 4pm'] 
  },
];

// --- Community ---
export const MOCK_POSTS: CommunityPost[] = [
  { id: 'p1', authorName: 'Sarah J.', authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', timeAgo: '2h ago', content: "Barnaby finally hit Level 5 on his \"Place\" command! He held it for 10 minutes while I cooked dinner. So proud of this guy! 🎓", image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80', likes: 24, comments: 5, tags: ['Win', 'Place'], likedByMe: true },
  { id: 'p2', authorName: 'Mike T.', authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', timeAgo: '5h ago', content: "Quick tip: If your dog is struggling with 'Heel', try increasing your pace. Movement creates focus!", likes: 45, comments: 12, tags: ['TrainerTip'], likedByMe: false },
];

export const MOCK_EVENTS: CommunityEvent[] = [
  { id: 'e1', title: 'Pack Walk: Desert Ridge', date: 'Nov 24', time: '08:00 AM', location: 'Desert Ridge Trails', attendees: 12, type: 'Social' },
  { id: 'e2', title: 'Group Class: Distractions', date: 'Nov 26', time: '06:00 PM', location: 'Scottsdale Campus', attendees: 8, type: 'Class', price: 25 },
];

export const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, dogName: 'Maximus', score: 850, avatar: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=100&q=80', trend: 'stable' },
  { rank: 2, dogName: 'Bella', score: 820, avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=100&q=80', trend: 'up' },
  { rank: 3, dogName: 'Barnaby', score: 234, avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=100&q=80', trend: 'up' },
  { rank: 4, dogName: 'Cooper', score: 210, avatar: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=100&q=80', trend: 'down' },
  { rank: 5, dogName: 'Luna', score: 150, avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=100&q=80', trend: 'stable' },
];

// --- Learning ---
export const MOCK_COURSES: Course[] = [
  { id: 'c1', title: 'Puppy Foundations', description: 'The essential guide to surviving the first 6 months.', thumbnail: 'https://images.unsplash.com/photo-1591160690555-5debfba600f2?auto=format&fit=crop&w=800&q=80', progress: 35, totalModules: 10, completedModules: 3, modules: [{id: 'm1', title: 'Potty Training', duration: '10m', isCompleted: true, isLocked: false}, {id: 'm2', title: 'Crate Games', duration: '15m', isCompleted: true, isLocked: false}, {id: 'm3', title: 'Biting & Chewing', duration: '12m', isCompleted: true, isLocked: false}, {id: 'm4', title: 'Leash Intro', duration: '20m', isCompleted: false, isLocked: false}], link: '#' },
  { id: 'c2', title: 'Leash Mastery', description: 'Stop pulling and start walking together.', thumbnail: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80', progress: 0, totalModules: 8, completedModules: 0, modules: [], link: '#' },
];

export const BEHAVIOR_TIPS: Record<string, Record<number, string>> = {
  "Sit": {
    1: "Use a high value treat and lure the nose up and back.",
    2: "Fade the lure. Use hand signal only.",
    3: "Start asking for Sit before opening doors or crossing streets.",
    4: "Practice long duration Sits while you walk around the dog.",
    5: "Randomly reward Sits on walks to maintain motivation."
  }
};

// --- Media ---
export const BEHAVIOR_TAGS = ['Sit', 'Down', 'Place', 'Heel', 'Recall', 'Play', 'Aggression', 'Anxiety'];
export const MOCK_MEDIA_LIBRARY: MediaItem[] = [
  { id: 'm1', type: 'video', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80', thumbnail: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80', date: 'Oct 20', title: 'Place Command Session', tags: ['Place', 'Duration'], notes: 'Held for 2 mins.' },
  { id: 'm2', type: 'photo', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80', thumbnail: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80', date: 'Oct 18', title: 'Park Exposure', tags: ['Social', 'Environment'], notes: 'Relaxed body language.' }
];

// --- Dogs ---
export const MOCK_DOGS: DogData[] = [
  {
    id: "d1",
    crmId: "crm_12345",
    accountId: "acc_98765",
    name: "Barnaby",
    breeds: ["Golden Retriever"],
    birthDate: "2020-05-15",
    sex: "Male",
    fixed: true,
    weight: 72,
    color: "Golden",
    avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=200&q=80",
    owner: { id: "o1", firstName: "Alex", lastName: "Morgan", email: "alex@example.com", phone: "(555) 123-4567" },
    emergencyContact: { firstName: "Jamie", lastName: "Morgan", phone: "(555) 987-6543", email: "jamie@example.com", relation: "Spouse" },
    notificationSettings: { email: true, push: true, sms: false, marketing: false },
    assignedTrainer: { id: "t1", name: "Mike T.", role: "Senior Trainer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
    homeFacilityId: "f2",
    currentScore: 234,
    streak: 12,
    lastSync: "Today, 9:00 AM",
    achievements: ACHIEVEMENTS_MOCK,
    medications: [],
    allergies: ["Chicken"],
    veterinarian: { name: "Dr. Smith", clinicName: "Valley Vet", phone: "(555) 555-5555" },
    vaccinations: [
        { name: "Rabies", expiryDate: "2024-05-15", status: "valid" },
        { name: "Bordetella", expiryDate: "2023-11-01", status: "expiring" }
    ],
    foodBrand: "Purina Pro Plan",
    feedingAmount: "2 cups",
    feedingSchedule: ["07:00", "17:00"],
    homeType: "House",
    hasYard: true,
    siblings: [{ name: "Luna", type: "Dog" }]
  },
  {
    id: "d2",
    crmId: "crm_67890",
    accountId: "acc_98765",
    name: "Luna",
    breeds: ["Border Collie"],
    birthDate: "2021-08-20",
    sex: "Female",
    fixed: true,
    weight: 45,
    color: "Black & White",
    avatar: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=200&q=80",
    owner: { id: "o1", firstName: "Alex", lastName: "Morgan", email: "alex@example.com", phone: "(555) 123-4567" },
    emergencyContact: { firstName: "Jamie", lastName: "Morgan", phone: "(555) 987-6543", email: "jamie@example.com", relation: "Spouse" },
    notificationSettings: { email: true, push: true, sms: true, marketing: false },
    assignedTrainer: { id: "t2", name: "Sarah J.", role: "Trainer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
    currentScore: 150,
    streak: 3,
    achievements: [ACHIEVEMENTS_MOCK[0]],
    medications: [{
      id: "m_luna_1",
      name: "Fluoxetine",
      dosage: "20mg",
      frequency: "Daily AM",
      type: "Pill",
      nextDue: "2023-11-21T08:00:00"
    }],
    allergies: [],
    vaccinations: [
        { name: "Rabies", expiryDate: "2024-01-10", status: "valid" },
        { name: "DHPP", expiryDate: "2024-01-10", status: "valid" },
    ],
    foodBrand: "Royal Canin",
    feedingAmount: "1.5 cups",
    feedingSchedule: ["08:00", "18:00"],
    homeType: "House",
    hasYard: true,
    siblings: [{ name: "Barnaby", type: "Dog" }]
  }
];

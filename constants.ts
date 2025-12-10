
import { 
  Grade, SkillCategory, Note, RadarPoint, 
  PhaseConfig, Phases, Achievement, DogData, 
  Coach, Facility, ServiceOption, AddOn, 
  CommunityPost, CommunityEvent, LeaderboardEntry, 
  Course, MediaItem, Product, SiteConfig
} from './types';
import { Brain, Trophy, Users, Star, Award, Flame } from 'lucide-react';
import React from 'react';

// --- SITE CONFIG MOCK ---
export const MOCK_SITE_CONFIG: SiteConfig = {
  id: 'site_conf_1',
  assets: {
    logoUrl: 'logo_1.png',
    logoDarkUrl: 'logo_1.png',
    faviconUrl: '/favicon.ico'
  },
  contact: {
    phone: '(480) 555-0199',
    email: 'support@partnersdogs.com',
    supportUrl: '/support'
  },
  links: {
    universityUrl: 'https://university.partnersdogs.org',
    knowledgeBaseUrl: 'https://knowledge.partnersdogs.com',
    bookingPortalUrl: '/booking',
    guideUrl: 'https://partnersdogs.com/guide'
  },
  features: {
    enableShop: true,
    enableAi: true
  }
};

// --- INFRASTRUCTURE AS CODE: RAW SCHEMA SOURCE ---
// This string is parsed by SchemaService to generate the "Assessment" UI dynamically.
export const RAW_PD360_HEADERS = `
"Ticket ID","Ticket name","Ticket status","Create date","Ticket owner","[130/650] PD360 Total Score","[50/250] PD360 Obedience","[17/85] PD360 Social Behavior","[20/100] PD360 Inappropriate","[18/90] PD360 Stressors & Triggers","[25/125] PD360 Tricks","Location","IB_Aggressive Behavior_TC","IB_Barking_E","IB_Barrier/Fence Reactivity_PS","IB_Correction Marker (No!)_PS","IB_CounterSurfing_FC","IB_Destructiveness_K","IB_E-Collar_E","IB_Escaping/Bolting_K","IB_Growling_BC","IB_Insecurity_E","IB_Jumping_E","IB_Lunging_BC","IB_Mounting_E","IB_Mouthing (Gentle)_PS","IB_Muzzle_E","IB_Nipping_FC","IB_OCD_FC","IB_Opportunistic Issues_E","IB_Possessive (Protective/Territorial)_BC","IB_Potty In The House_PS","IB_Pulling_K","IB_Resource Guarding_BC","IB_Separation Anxiety_PS","OB_Advanced Turns_HS","OB_Back Up_E","OB_Bow_C","OB_Bye_HS","OB_Calm Greetings_E","OB_Catch (Ball, Tug or Treat)_M","OB_Close Door_C","OB_Crate/Kennel_PS","OB_Distance Commands_C","OB_Done_E","OB_Down_PS","OB_Figure 8_M","OB_Flip to Heel_MS","OB_Free_K","OB_Freestyle Bridging_M","OB_Handoff Protocol_K","OB_Heel_K","OB_Impulse Control Response_K","OB_Leash_PS","OB_Leave It_E","OB_Left about 180_K","OB_Look (Left, Right, Up, Down, Backwards)_M","OB_Middle Position (Between Legs)_C","OB_Name Recognition_PS","OB_Off Leash Commands_MS","OB_Off_E","OB_On The Move Commands_C","OB_Open Door_C","OB_Orbit_M","OB_Out_MS","OB_Pacing_HS","OB_Place_K","OB_Put Away Toys/Clothes_M","OB_Recall (Come/Front)_K","OB_Recall To Heel_E","OB_Reset_E","OB_Retrieve objects (Leash, Glasses Case, Bottle, Etc.)_C","OB_Reward Marker (Yes!)_PS","OB_Right Side Position_M","OB_Right About 180_K","OB_Ring Bell To Go Outside Response_C","OB_Send Out (Directional W/ Touch Pads)_C","OB_Sit_PS","OB_Stand_MS","OB_Standing Pivots_HS","OB_Stay_K","OB_Threshold Protocol_K","OB_Turn Off Lights_M","OB_Watch_PS","OB_Wipe The Floor_M","SB_Appropriate Play_K","SB_Baby/Children_HS","SB_Car Socialization (In/Out of Car)_MS","SB_Cats_HS","SB_Confidence Building_PS","SB_Environment_PS","SB_Females_PS","SB_Grooming Desensitization_MS","SB_Large Dogs_PS","SB_Males_PS","SB_Medical Socialization (Taking Vitals)_HS","SB_Other Animals (Birds, Bunnies, Etc.)_HS","SB_Personal Space_PS","SB_Small Dogs_PS","SB_Social Cues_PS","SB_Textures_K","ST_Body Stiffening","ST_Confinement_PS","ST_Corrections_PS","ST_Ears Flattening","ST_Furniture_PS","ST_Handling_K","ST_High Energy_PS","ST_Lip Licking","ST_Loud/Unusual Sounds_PS","ST_Movement_PS","ST_Owner/Family_BC","ST_Pet Sibling_PS","ST_Prey/Chase_PS","ST_Shy/Shaking/Cowers","ST_Spatial Boundaries_E","ST_Strangers_PS","ST_Teeth Chattering","ST_Whale Eye","TR_Catch a Frisbee/Disc_D","TR_Counting_D","TR_Crawl_MS","TR_Cross Paws_D","TR_Dance_M","TR_High Five_HS","TR_Hug_HS","TR_Jump Through Arms_D","TR_Jump Through Hoop_D","TR_Kiss_M","TR_Leg Jump_D","TR_Leg Weaves_D","TR_Limp_D","TR_Play Dead (Bang!)_C","TR_Pup in a Blanket_D","TR_Rollover_MS","TR_Shake/Paw_K","TR_Shuffle_D","TR_Sit Pretty_C","TR_Skateboard_D","TR_Speak_HS","TR_Spin_PS","TR_Tell A Secret_M","TR_Touch_E","TR_Wave Response_M"
`;

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
  { 
    id: 'f1', 
    name: 'Partners Dog Training - Cave Creek', 
    address: 'Cave Creek, AZ', 
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80', 
    hasPDUAlumni: true, 
    distance: '2.4 miles',
    phone: '(480) 555-0101',
    email: 'cavecreek@partnersdogs.com'
  },
  { 
    id: 'f2', 
    name: 'Partners Dog Training - Scottsdale', 
    address: 'Scottsdale, AZ', 
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80', 
    hasPDUAlumni: true, 
    distance: '8.1 miles',
    phone: '(480) 555-0102',
    email: 'scottsdale@partnersdogs.com'
  },
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
    bio: 'Specializing in high-drive breeds and behavior modification.', isPDUAlum: true, hourlyRate: 120, 
    availableSlots: [
      { id: 's_c1_1', coachId: 'c1', startTime: new Date().toISOString(), endTime: new Date().toISOString(), isBooked: false },
      { id: 's_c1_2', coachId: 'c1', startTime: new Date().toISOString(), endTime: new Date().toISOString(), isBooked: false }
    ]
  },
  { 
    id: 'c2', name: 'Sarah J.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', 
    specialties: ['Obedience', 'Tricks'], location: 'Phoenix', rating: 5.0, reviews: 89, 
    bio: 'Passionate about building engagement and fun through tricks.', isPDUAlum: true, hourlyRate: 100, 
    availableSlots: [
      { id: 's_c2_1', coachId: 'c2', startTime: new Date().toISOString(), endTime: new Date().toISOString(), isBooked: false },
      { id: 's_c2_2', coachId: 'c2', startTime: new Date().toISOString(), endTime: new Date().toISOString(), isBooked: false }
    ]
  },
];

// --- Community ---
export const MOCK_POSTS: CommunityPost[] = [
  { 
    id: 'p1', 
    authorId: 'u1',
    authorName: 'Sarah J.', 
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', 
    timeAgo: '2h ago', 
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    content: "Barnaby finally hit Level 5 on his \"Place\" command! He held it for 10 minutes while I cooked dinner. So proud of this guy! 🎓", 
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80', 
    likes: 24, 
    comments: 5, 
    tags: ['Win', 'Place'], 
    likedByMe: true,
    reactions: [
      { type: 'high-five', count: 24, userReacted: true },
      { type: 'sniff', count: 5, userReacted: false },
      { type: 'howl', count: 2, userReacted: false }
    ],
    commentCount: 5
  },
  { 
    id: 'p2', 
    authorId: 'u2',
    authorName: 'Mike T.', 
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', 
    timeAgo: '5h ago', 
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    content: "Quick tip: If your dog is struggling with 'Heel', try increasing your pace. Movement creates focus!", 
    likes: 45, 
    comments: 12, 
    tags: ['TrainerTip'], 
    likedByMe: false,
    reactions: [
      { type: 'high-five', count: 45, userReacted: false },
      { type: 'sniff', count: 12, userReacted: false },
      { type: 'howl', count: 8, userReacted: false }
    ],
    commentCount: 12
  },
];

export const MOCK_EVENTS: CommunityEvent[] = [
  { id: 'e1', title: 'Pack Walk: Desert Ridge', date: 'Nov 24', time: '08:00 AM', location: 'Desert Ridge Trails', attendees: 12, type: 'Social' },
  { id: 'e2', title: 'Group Class: Distractions', date: 'Nov 26', time: '06:00 PM', location: 'Scottsdale Campus', attendees: 8, type: 'Class', price: 25 },
];

export const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, dogId: 'd_max', dogName: 'Maximus', score: 850, avatar: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=100&q=80', trend: 'stable' },
  { rank: 2, dogId: 'd_bella', dogName: 'Bella', score: 820, avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=100&q=80', trend: 'up' },
  { rank: 3, dogId: 'd1', dogName: 'Barnaby', score: 234, avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=100&q=80', trend: 'up' },
  { rank: 4, dogId: 'd_cooper', dogName: 'Cooper', score: 210, avatar: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=100&q=80', trend: 'down' },
  { rank: 5, dogId: 'd2', dogName: 'Luna', score: 150, avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=100&q=80', trend: 'stable' },
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
  { id: 'm1', dogId: 'd1', type: 'video', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80', thumbnail: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80', date: 'Oct 20', title: 'Place Command Session', tags: ['Place', 'Duration'], notes: 'Held for 2 mins.' },
  { id: 'm2', dogId: 'd1', type: 'photo', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80', thumbnail: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80', date: 'Oct 18', title: 'Park Exposure', tags: ['Social', 'Environment'], notes: 'Relaxed body language.' }
];

// --- Shop ---
export const SHOP_INVENTORY: Product[] = [
  {
    id: 'p1',
    title: 'Herm Sprenger Prong Collar',
    categoryId: 'collars',
    basePrice: 29.99,
    description: 'The gold standard for communication. Chrome plated steel with center plate.',
    brand: 'Herm Sprenger',
    hasVariants: true,
    variants: [
        { id: 'v1', name: '2.25mm', price: 29.99, inStock: true },
        { id: 'v2', name: '3.0mm', price: 34.99, inStock: true }
    ],
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=400&q=80',
    inStock: true
  },
  {
    id: 'p2',
    title: 'Biothane Long Line (15ft)',
    categoryId: 'training',
    basePrice: 24.99,
    description: 'Essential tool for recall training and decompression walks. Waterproof and durable.',
    brand: 'Partners Dogs',
    hasVariants: false,
    image: 'https://images.unsplash.com/photo-1551856392-f07d5203001e?auto=format&fit=crop&w=400&q=80',
    inStock: true
  },
  {
    id: 'p3',
    title: 'High Value Training Treats',
    categoryId: 'training',
    basePrice: 12.99,
    description: 'Soft, smelly, and irresistible. Perfect for marking new behaviors.',
    brand: 'Partners Dogs',
    hasVariants: false,
    image: 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&w=400&q=80',
    inStock: true
  },
  {
    id: 'p4',
    title: 'Kuranda Place Bed',
    categoryId: 'training',
    basePrice: 89.99,
    description: 'The ultimate tool for teaching "Place". Chew proof and comfortable.',
    brand: 'Kuranda',
    hasVariants: true,
    variants: [
        { id: 'v_sm', name: 'Small (30x20)', price: 89.99, inStock: true },
        { id: 'v_lg', name: 'Large (40x25)', price: 109.99, inStock: true }
    ],
    image: 'https://images.unsplash.com/photo-1581888227599-779811985203?auto=format&fit=crop&w=400&q=80',
    inStock: true
  },
  {
    id: 'p5',
    title: 'DuraChew Bone',
    categoryId: 'toys',
    basePrice: 14.99,
    description: 'Long-lasting nylon chew for aggressive chewers.',
    brand: 'Nylabone',
    hasVariants: false,
    image: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=400&q=80',
    inStock: true
  }
];

// --- Dogs ---
export const MOCK_DOGS: DogData[] = [
  {
    id: "d1",
    ownerId: "o1",
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
    assessmentScores: {}, // Empty for mock
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
    ownerId: "o1",
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
    assessmentScores: {}, // Empty for mock
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

// --- SUPPORT AI DEFLECTION DATABASE ---
export const SMART_FAQS: { keywords: string[], question: string, answer: string, linkText?: string, linkUrl?: string }[] = [
  {
    keywords: ['cancel', 'refund', 'subscription', 'upgrade', 'downgrade', 'billing', 'charge'],
    question: "How do I manage my subscription or billing?",
    answer: "You can manage your subscription tier and billing details directly through the 'Coach' tab in the Izzy chat window (bottom right) or by visiting the facility front desk.",
    linkText: "View Subscription Options",
    linkUrl: "/support"
  },
  {
    keywords: ['upload', 'video', 'fail', 'error', 'size', 'format'],
    question: "Trouble uploading training videos?",
    answer: "Ensure your video is in MP4 or MOV format and under 50MB. If you're on a slow connection, try compressing the video first or uploading via Wi-Fi.",
  },
  {
    keywords: ['password', 'reset', 'login', 'account', 'email'],
    question: "Resetting your password?",
    answer: "You can reset your password from the login screen by clicking 'Forgot Password'. If you're logged in, go to your Profile > Account Settings.",
  },
  {
    keywords: ['boarding', 'reservation', 'book', 'stay', 'kennel'],
    question: "Questions about boarding reservations?",
    answer: "You can book, modify, or view boarding details in the 'Marketplace' > 'Spots' tab. For urgent cancellations <24hrs, please call the facility directly.",
    linkText: "Go to Booking",
    linkUrl: "/marketplace"
  },
  {
    keywords: ['homework', 'plan', 'schedule', 'training'],
    question: "Where is my training plan?",
    answer: "Your personalized weekly training plan is located in the 'Training Hub' under the 'Schedule' tab. You can regenerate it anytime.",
    linkText: "Go to Training Hub",
    linkUrl: "/training_hub"
  }
];

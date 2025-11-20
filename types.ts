
export interface Grade {
  name: string;
  minScore: number;
  color: string;
  bg: string;
  bar: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  link?: string;
}

export interface SkillCategory {
  category: string;
  type: 'STANDARD' | 'INAPPROPRIATE';
  description?: string;
  skills: Skill[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface Vaccination {
  name: string;
  expiryDate: string;
  status?: 'valid' | 'expiring' | 'expired';
}

export interface Veterinarian {
  name: string;
  clinicName: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Sibling {
  name: string;
  type: 'Dog' | 'Cat' | 'Human' | 'Other';
  age?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or lucide icon name
  dateEarned?: string;
  isLocked: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  progress: number; // 0-100
  totalModules: number;
  completedModules: number;
  modules: CourseModule[];
  link: string;
}

export interface Coach {
  id: string;
  name: string;
  avatar: string;
  specialties: string[];
  location: string;
  rating: number;
  reviews: number;
  bio: string;
  isPDUAlum: boolean;
  hourlyRate: number;
  availableSlots: string[];
}

// --- Booking Types ---
export interface Facility {
  id: string;
  name: string;
  address: string;
  image: string;
  hasPDUAlumni: boolean;
  distance: string;
}

export interface ServiceOption {
  id: string;
  name: string;
  description: string;
  price: number;
  priceUnit: 'night' | 'day' | 'flat';
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Training' | 'Grooming' | 'Enrichment' | 'Health';
}

export interface Reservation {
  id: string;
  serviceName: string;
  startDate: string;
  endDate: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  totalPrice: number;
  facilityName?: string;
}

export interface OwnerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string; // In a real app, never store plain text
}

export interface EmergencyContact {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  relation: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

export interface DogData {
  id: string;
  name: string;
  breeds: string[];
  birthDate: string; // YYYY-MM-DD
  sex: 'Male' | 'Female';
  fixed: boolean;
  weight: number; // lbs
  color: string;
  avatar: string;
  
  // Owner Info
  owner: OwnerProfile;
  emergencyContact: EmergencyContact;
  notificationSettings: NotificationSettings;

  // Progress
  currentScore: number;
  streak: number;
  lastSync?: string;
  achievements: Achievement[];
  
  // Medical
  medications: Medication[];
  allergies: string[];
  veterinarian?: Veterinarian;
  vaccinations: Vaccination[];
  
  // Nutrition
  foodBrand?: string;
  feedingAmount?: string; // e.g. "1.5 cups"
  feedingSchedule?: string[]; // e.g. ["08:00", "18:00"]
  
  // Home
  homeType: 'House' | 'Apartment' | 'Condo' | 'Acreage';
  hasYard: boolean;
  siblings: Sibling[];
  
  // Training Context
  trainingHistory?: string;
  notes?: string;
  
  // Reservations
  reservations?: Reservation[];
}

export interface Note {
  id: number;
  date: string;
  author: string;
  content: string;
  type: 'session' | 'system' | 'message';
}

export interface RadarPoint {
  subject: string;
  A: number;
  fullMark: number;
}

export interface PhaseConfig {
  label: string;
  desc: string;
}

export interface Phases {
  STANDARD: Record<number, PhaseConfig>;
  INAPPROPRIATE: Record<number, PhaseConfig>;
}

// --- Calendar & Training Plan Types ---

export type EventType = 'training' | 'community' | 'vet' | 'custom';

export interface TrainingTask {
  id: string;
  name: string;
  category: string;
  completed: boolean;
  duration?: string; // e.g., "5 min"
}

export interface CalendarEvent {
  id: string;
  date: string; // ISO YYYY-MM-DD
  title: string;
  type: EventType;
  time?: string;
  description?: string;
  tasks?: TrainingTask[]; // Only for training type
  location?: string;
  completed?: boolean;
}

export interface MasteryProjection {
  skillName: string;
  currentLevel: number;
  projectedDate: string;
  weeksRemaining: number;
}

export interface AnalysisResult {
  timeline?: { time: string; event: string; detail: string; type: string }[];
  mechanics?: string;
  engagement_score?: number;
  posture_feedback?: string;
  recommendations?: string[];
}

export interface TrainingSession {
  title: string;
  duration?: string;
  exercises: string[];
}

export interface DailyPlan {
  day: string;
  focus: string;
  morning: TrainingSession;
  evening: TrainingSession;
  bonus: {
    title: string;
    exercises: string[];
  };
}

// Community Types
export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  timeAgo: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  tags?: string[];
  likedByMe?: boolean;
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  type: 'Class' | 'Social' | 'Workshop';
  price?: number;
  isRegistered?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  dogName: string;
  score: number;
  avatar: string;
  trend: 'up' | 'down' | 'stable';
}

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail: string;
  date: string;
  title: string;
  tags: string[];
  analysis?: AnalysisResult;
  notes?: string;
}

export interface SessionLog {
  timestamp: string;
  type: 'system' | 'command';
  detail: string;
}

export interface ActiveSession {
  id: string;
  date: string;
  duration: number;
  stats: Record<string, { success: number; fail: number }>;
  notes?: string;
}

// --- Messaging Types ---
export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export interface CoachConversation {
  id: string;
  coachId: string;
  coachName: string;
  coachAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  messageCount: number | 'Unlimited';
  features: string[];
  recommended?: boolean;
}

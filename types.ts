
import React from 'react';

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
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  type: 'Pill' | 'Liquid' | 'Injection' | 'Topical';
  nextDue: string; // ISO string
  instructions?: string; // e.g. "With food"
  inventory?: number;
  isTapering?: boolean;
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
  id: string; // CRM Contact ID
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

export interface AssignedTrainer {
  id: string;
  name: string;
  role: string; // e.g. "Senior Trainer"
  avatar: string;
}

export interface DogData {
  id: string; // Internal App ID
  crmId: string; // HubSpot/CRM Object ID
  accountId: string; // Family/Household Account ID
  
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

  // Relationship & Location
  assignedTrainer?: AssignedTrainer;
  homeFacilityId?: string;

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

// --- Social & Community Types (Updated) ---

export interface Badge {
  id: string;
  name: string;
  icon: React.ElementType | string; 
  color: string; 
  description?: string;
}

export interface Pack {
  id: string;
  name: string;
  category: 'Breed' | 'Interest' | 'Location' | 'Training';
  image: string;
  membersCount: number;
  location?: string;
  isPrivate: boolean;
  isMember: boolean;
  description: string;
  nextEvent?: string;
}

export interface Reaction {
  type: 'high-five' | 'sniff' | 'howl';
  count: number;
  userReacted: boolean;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorBadges?: Badge[];
  timeAgo: string;
  content: string;
  image?: string;
  likes?: number; // Deprecated in favor of reactions
  reactions?: Reaction[];
  comments: number;
  tags?: string[];
  likedByMe?: boolean; // Deprecated in favor of reactions
  packId?: string;
  packName?: string;
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
  packId?: string;
}

export interface LeaderboardEntry {
  rank: number;
  dogName: string;
  score: number;
  avatar: string;
  trend: 'up' | 'down' | 'stable';
  badges?: Badge[];
  breed?: string;
  location?: string;
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

// --- Apex Health Types ---

// Bristol Stool Scale (1-7)
export type BristolScore = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface StoolLog {
  score: BristolScore;
  color: 'Brown' | 'Black' | 'Red' | 'Yellow' | 'Green' | 'White';
  foreignObjects?: string[]; // e.g. "Plastic", "Bone"
  notes?: string;
}

export interface VomitLog {
  color: 'Yellow/Bile' | 'Coffee Grounds' | 'White Foam' | 'Green' | 'Undigested Food';
  contents?: string;
  isEmergency?: boolean;
}

export interface HealthEvent {
  id: string;
  timestamp: string; // ISO string
  type: 'MEAL' | 'ELIMINATION_PEE' | 'ELIMINATION_POOP' | 'VOMIT' | 'MEDICATION' | 'WATER' | 'ACTIVITY' | 'SEIZURE';
  
  // Contextual Data
  calories?: number;
  volumeMl?: number;
  medicationId?: string;
  stoolData?: StoolLog;
  vomitData?: VomitLog;
  seizureDurationSec?: number;
}

export interface MetabolicProfile {
  rer: number; // Resting Energy Requirement
  der: number; // Daily Energy Requirement
  activityFactor: number;
  hydrationGoalMl: number;
}

// --- Shop Types ---
export interface ProductVariant {
  id: string;
  name: string; // e.g., "Chrome - 2.25mm"
  price: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  title: string;
  categoryId: 'training' | 'collars' | 'toys' | 'health';
  basePrice: number;
  description: string;
  brand: string; // e.g., "Herm Sprenger", "Partners Dogs"
  hasVariants: boolean;
  variants?: ProductVariant[];
  image: string; // Placeholder URL
}

export interface CartItem extends Product {
  variantId?: string;
  variantName?: string;
  finalPrice: number;
  quantity: number;
}

// --- Learning Types ---
export interface StudyResource {
  title: string;
  type: 'Article' | 'Video';
  description: string;
  estimatedTime: string;
}

export interface StudyModule {
  title: string;
  focus: string;
  resources: StudyResource[];
}


import React from 'react';

// --- Global Site Configuration ---
export interface SiteConfig {
  id: string;
  assets: {
    logoUrl: string;
    logoDarkUrl: string;
    faviconUrl: string;
  };
  contact: {
    phone: string;
    email: string;
    supportUrl: string;
  };
  links: {
    universityUrl: string;
    knowledgeBaseUrl: string;
    bookingPortalUrl: string;
    guideUrl: string;
  };
  features: {
    enableShop: boolean;
    enableAi: boolean;
  };
}

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

// --- Coaching (Pros) Types ---
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
  availableSlots: TimeSlot[]; // Denormalized for UI, derived from DB
}

export interface TimeSlot {
  id: string;
  coachId: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  isBooked: boolean;
}

export interface CoachingSession {
  id: string;
  userId: string;
  dogId: string;
  coachId: string;
  slotId: string;
  type: 'virtual' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingLink?: string; // For virtual
  location?: string; // For in-person
  notes?: string;
  pricePaid: number;
  bookedAt: string;
}

// --- Booking (Spots) Types ---
export interface Facility {
  id: string;
  name: string;
  address: string;
  image: string;
  hasPDUAlumni: boolean;
  distance: string;
  phone: string;
  email: string;
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
  userId: string;
  dogId: string;
  facilityId: string;
  serviceId: string;
  serviceName: string; // Snapshot
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dropOffTime: string;
  pickUpTime: string;
  addOns: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  notes?: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'deposit-paid' | 'unpaid';
  confirmationCode?: string;
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

// DB Table: training_sessions
export interface TrainingSessionRecord {
  id: string;
  dogId: string;
  date: string;
  durationSeconds: number;
  skillsWorked: {
    skillName: string;
    successCount: number;
    failCount: number;
  }[];
  notes?: string;
}

// DB Table: training_plans
export interface DailyPlan {
  day: string;
  focus: string;
  morning: {
    title: string;
    duration?: string;
    exercises: string[];
  };
  evening: {
    title: string;
    duration?: string;
    exercises: string[];
  };
  bonus: {
    title: string;
    exercises: string[];
  };
}

export interface TrainingPlan {
  id: string;
  dogId: string;
  createdAt: string;
  weekSchedule: DailyPlan[];
}

// --- Social & Community DB Types ---

// Table: badges
export interface Badge {
  id: string;
  name: string;
  icon: React.ElementType | string; 
  color: string; 
  description?: string;
}

// Table: packs
export interface Pack {
  id: string;
  name: string;
  category: 'Breed' | 'Interest' | 'Location' | 'Training';
  image: string;
  membersCount: number;
  location?: string;
  isPrivate: boolean;
  isMember: boolean; // Derived from pack_members
  description: string;
  nextEventId?: string; // Relation to events table
  nextEvent?: string; // Derived string for display
}

// Table: pack_members
export interface PackMember {
  packId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface Reaction {
  type: 'high-five' | 'sniff' | 'howl';
  count: number;
  userReacted: boolean;
}

// Table: posts
export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string; // Denormalized for display
  authorAvatar: string; // Denormalized for display
  authorBadges?: Badge[]; // Derived
  packId?: string;
  packName?: string; // Denormalized
  
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  
  createdAt: string; // ISO timestamp
  timeAgo: string; // Derived
  
  // Engagement (Derived from post_reactions and post_comments)
  reactions: Reaction[];
  commentCount: number;
  
  // Legacy UI fields (to be deprecated or mapped)
  likes?: number; 
  image?: string; 
  comments?: number; // legacy number
  tags?: string[];
  likedByMe?: boolean;
}

// Table: post_comments
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// Table: events
export interface CommunityEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  attendees: number;
  type: 'Class' | 'Social' | 'Workshop';
  price?: number;
  isRegistered?: boolean; // Derived from event_registrations
  packId?: string;
  organizerId?: string;
}

// Table: event_registrations
export interface EventRegistration {
  eventId: string;
  userId: string;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  ticketCode?: string;
  paidAmount?: number;
}

// Table: leaderboard (or View)
export interface LeaderboardEntry {
  rank: number;
  dogId: string; // Relation to dogs table
  dogName: string;
  score: number;
  avatar: string;
  trend: 'up' | 'down' | 'stable';
  
  // Metadata for filters
  breed?: string;
  location?: string;
  grade?: string;
  pack?: string;
  age?: number;
  
  badges?: Badge[];
}

// DB Table: media_library
export interface MediaItem {
  id: string;
  dogId?: string;
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

// DB Table: health_logs
export interface HealthEvent {
  id: string;
  dogId?: string;
  timestamp: string; // ISO string
  type: 'MEAL' | 'ELIMINATION_PEE' | 'ELIMINATION_POOP' | 'VOMIT' | 'MEDICATION' | 'WATER' | 'ACTIVITY' | 'SEIZURE';
  
  // Contextual Data
  calories?: number;
  volumeMl?: number;
  medicationId?: string;
  stoolData?: StoolLog;
  vomitData?: VomitLog;
  seizureDurationSec?: number;
  duration?: number; // for Activity
}

export interface MetabolicProfile {
  rer: number; // Resting Energy Requirement
  der: number; // Daily Energy Requirement
  activityFactor: number;
  hydrationGoalMl: number;
}

// DB Table: notification_queue
export interface NotificationRecord {
  id: string;
  userId: string;
  type: 'EMAIL' | 'SMS' | 'PUSH';
  title: string;
  message: string;
  status: 'SENT' | 'PENDING' | 'FAILED';
  sentAt?: string;
  relatedEntityId?: string; // ID of health log, booking, etc.
}

// --- Shop Types (E-commerce) ---
export interface ProductVariant {
  id: string;
  name: string; // e.g., "Chrome - 2.25mm"
  price: number;
  inStock: boolean;
  sku?: string;
}

export interface Product {
  id: string;
  externalId?: string; // Shopify/WooCommerce ID
  title: string;
  categoryId: 'training' | 'collars' | 'toys' | 'health';
  basePrice: number;
  description: string;
  brand: string; // e.g., "Herm Sprenger", "Partners Dogs"
  hasVariants: boolean;
  variants?: ProductVariant[];
  image: string; // Placeholder URL
  inStock: boolean;
}

export interface CartItem extends Product {
  variantId?: string;
  variantName?: string;
  finalPrice: number;
  quantity: number;
}

export interface ShopOrder {
  id: string;
  userId: string;
  items: {
    productId: string;
    variantId?: string;
    productName: string;
    quantity: number;
    priceAtPurchase: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  createdAt: string;
  externalOrderId?: string;
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

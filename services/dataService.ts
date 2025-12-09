
import { 
  MOCK_DOGS, 
  SHOP_INVENTORY, 
  MOCK_COACHES, 
  MOCK_EVENTS,
  MOCK_POSTS,
  MOCK_FACILITIES,
  BOOKING_SERVICES,
  BOOKING_ADDONS,
  SKILL_TREE,
  MOCK_COURSES,
  MOCK_SITE_CONFIG,
  MOCK_MEDIA_LIBRARY,
  LEADERBOARD_DATA
} from '../constants';
import { 
  DogData, Product, Coach, CommunityEvent, CommunityPost, 
  Facility, ServiceOption, AddOn, SkillCategory, Course, 
  SiteConfig, TrainingPlan, TrainingSessionRecord, MediaItem, HealthEvent, NotificationRecord,
  Pack, LeaderboardEntry, Reaction, Badge,
  Reservation, CoachingSession, ShopOrder, CartItem, TimeSlot, CalendarEvent, ChatMessage
} from '../types';

// Simulating API Latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- STORAGE HELPER ---
const Storage = {
  get: <T>(key: string, defaultVal: T): T => {
    const stored = localStorage.getItem(`pd360_db_${key}`);
    return stored ? JSON.parse(stored) : defaultVal;
  },
  set: (key: string, value: any) => {
    localStorage.setItem(`pd360_db_${key}`, JSON.stringify(value));
  }
};

// --- INITIAL DATA HYDRATION ---
// We load from LocalStorage or fall back to Constants
let DB_PLANS = Storage.get<Record<string, TrainingPlan>>('plans', {});
let DB_SESSIONS = Storage.get<TrainingSessionRecord[]>('sessions', []);
let DB_MEDIA = Storage.get<MediaItem[]>('media', [...MOCK_MEDIA_LIBRARY]);
let DB_HEALTH = Storage.get<HealthEvent[]>('health', []);
let DB_RESERVATIONS = Storage.get<Reservation[]>('reservations', []);
let DB_COACHING = Storage.get<CoachingSession[]>('coaching', []);
let DB_ORDERS = Storage.get<ShopOrder[]>('orders', []);
let DB_POSTS = Storage.get<CommunityPost[]>('posts', MOCK_POSTS);
let DB_CALENDAR = Storage.get<CalendarEvent[]>('calendar', []);
let DB_CHAT_HISTORY = Storage.get<Record<string, { role: 'user' | 'ai', text: string }[]>>('chat_history', {});

// Hydrate Coaches with Slots
let DB_COACHES = MOCK_COACHES.map(c => ({
    ...c,
    availableSlots: c.availableSlots.map((sStr, i) => ({
        id: `slot_${c.id}_${i}`,
        coachId: c.id,
        startTime: new Date(new Date().setDate(new Date().getDate() + (i+1))).toISOString(),
        endTime: new Date(new Date().setDate(new Date().getDate() + (i+1))).toISOString(),
        isBooked: false
    })) as TimeSlot[]
}));

export const DataService = {
  // --- Core User Data ---
  fetchDogs: async (): Promise<DogData[]> => {
    await delay(500); 
    // Create a deep-ish clone to avoid mutating the constant directly during session
    const dogs = MOCK_DOGS.map(d => ({ ...d }));
    
    // Inject mock reservation if exists
    if (DB_RESERVATIONS.length > 0) {
        dogs[0].reservations = DB_RESERVATIONS;
    }
    return dogs;
  },

  fetchSiteConfig: async (): Promise<SiteConfig> => {
    return MOCK_SITE_CONFIG;
  },

  // --- Marketplace: Shop ---
  fetchShopItems: async (): Promise<Product[]> => {
    await delay(300);
    return SHOP_INVENTORY;
  },

  createShopOrder: async (userId: string, items: CartItem[], total: number): Promise<void> => {
      await delay(800);
      const newOrder: ShopOrder = {
          id: `ord_${Date.now()}`,
          userId,
          items: items.map(i => ({
              productId: i.id,
              variantId: i.variantId,
              productName: i.title + (i.variantName ? ` (${i.variantName})` : ''),
              quantity: i.quantity,
              priceAtPurchase: i.finalPrice
          })),
          totalAmount: total,
          status: 'paid',
          createdAt: new Date().toISOString(),
          externalOrderId: `ext_${Math.floor(Math.random()*10000)}`
      };
      DB_ORDERS.push(newOrder);
      Storage.set('orders', DB_ORDERS);
  },

  // --- Marketplace: Pros (Coaching) ---
  fetchCoaches: async (): Promise<Coach[]> => {
    await delay(300);
    return DB_COACHES;
  },

  bookCoachingSession: async (userId: string, coachId: string, slotId: string, type: 'virtual' | 'in-person'): Promise<void> => {
      await delay(800);
      const session: CoachingSession = {
          id: `sess_${Date.now()}`,
          userId,
          dogId: 'd1',
          coachId,
          slotId,
          type,
          status: 'scheduled',
          pricePaid: 100,
          bookedAt: new Date().toISOString(),
          meetingLink: type === 'virtual' ? 'https://meet.google.com/abc-defg-hij' : undefined
      };
      DB_COACHING.push(session);
      Storage.set('coaching', DB_COACHING);
  },

  // --- Marketplace: Spots ---
  fetchFacilities: async (): Promise<Facility[]> => {
    return MOCK_FACILITIES;
  },

  fetchServices: async (): Promise<{ services: ServiceOption[], addons: AddOn[] }> => {
    return { services: BOOKING_SERVICES, addons: BOOKING_ADDONS };
  },

  createReservation: async (reservation: Reservation): Promise<void> => {
      await delay(1000);
      const confirmedRes: Reservation = {
          ...reservation,
          status: 'confirmed',
          paymentStatus: 'paid',
          confirmationCode: `RES-${Math.floor(Math.random() * 100000)}`
      };
      DB_RESERVATIONS.push(confirmedRes);
      Storage.set('reservations', DB_RESERVATIONS);
  },

  // --- Training System ---
  fetchTrainingPlan: async (dogId: string): Promise<TrainingPlan | null> => {
    await delay(300);
    return DB_PLANS[dogId] || null;
  },

  saveTrainingPlan: async (plan: TrainingPlan): Promise<void> => {
    await delay(300);
    DB_PLANS[plan.dogId] = plan;
    Storage.set('plans', DB_PLANS);
  },

  fetchTrainingSessions: async (dogId: string): Promise<TrainingSessionRecord[]> => {
    return DB_SESSIONS.filter(s => s.dogId === dogId);
  },

  logTrainingSession: async (session: TrainingSessionRecord): Promise<void> => {
    await delay(300);
    DB_SESSIONS.unshift(session); 
    Storage.set('sessions', DB_SESSIONS);
  },

  // --- Calendar System ---
  fetchCalendarEvents: async (dogId: string): Promise<CalendarEvent[]> => {
    await delay(200);
    // If empty, init with mock
    if (DB_CALENDAR.length === 0) {
       const today = new Date();
       const mapped = MOCK_EVENTS.map((evt, idx) => ({
           id: `comm_${evt.id}`,
           date: new Date(today.setDate(today.getDate() + (idx * 3) + 2)).toISOString().split('T')[0],
           title: evt.title,
           type: 'community' as const,
           time: evt.time,
           location: evt.location,
           description: 'Community Event'
       }));
       DB_CALENDAR = mapped;
       Storage.set('calendar', DB_CALENDAR);
    }
    return DB_CALENDAR;
  },

  saveCalendarEvents: async (events: CalendarEvent[]): Promise<void> => {
    DB_CALENDAR = events;
    Storage.set('calendar', DB_CALENDAR);
  },

  // --- Chat Persistence ---
  fetchChatHistory: async (dogId: string): Promise<{ role: 'user' | 'ai', text: string }[]> => {
    return DB_CHAT_HISTORY[dogId] || [];
  },

  saveChatHistory: async (dogId: string, messages: { role: 'user' | 'ai', text: string }[]): Promise<void> => {
    DB_CHAT_HISTORY[dogId] = messages;
    Storage.set('chat_history', DB_CHAT_HISTORY);
  },

  // --- Media System ---
  fetchMediaAssets: async (dogId: string): Promise<MediaItem[]> => {
    await delay(300);
    return DB_MEDIA; 
  },

  uploadMediaAsset: async (asset: MediaItem): Promise<void> => {
    await delay(800); 
    DB_MEDIA.unshift(asset);
    Storage.set('media', DB_MEDIA);
  },

  // --- Health & Vitals ---
  fetchHealthLogs: async (dogId: string): Promise<HealthEvent[]> => {
    return DB_HEALTH.filter(h => h.dogId === dogId);
  },

  logHealthEvent: async (event: HealthEvent): Promise<void> => {
    await delay(200);
    DB_HEALTH.push(event);
    Storage.set('health', DB_HEALTH);
  },

  // --- Community ---
  fetchCommunityFeed: async (): Promise<CommunityPost[]> => {
    return DB_POSTS;
  },

  createPost: async (post: CommunityPost): Promise<CommunityPost> => {
    await delay(300);
    DB_POSTS.unshift(post);
    Storage.set('posts', DB_POSTS);
    return post;
  },

  addReaction: async (postId: string, reactionType: Reaction['type']): Promise<void> => {
    const postIndex = DB_POSTS.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const post = DB_POSTS[postIndex];
    let newReactions = post.reactions || [];
    const existing = newReactions.find(r => r.type === reactionType);

    if (existing) {
        if (existing.userReacted) {
            newReactions = newReactions.map(r => r.type === reactionType ? { ...r, count: Math.max(0, r.count - 1), userReacted: false } : r);
        } else {
            newReactions = newReactions.map(r => r.type === reactionType ? { ...r, count: r.count + 1, userReacted: true } : r);
        }
    } else {
        newReactions.push({ type: reactionType, count: 1, userReacted: true });
    }
    
    DB_POSTS[postIndex] = { ...post, reactions: newReactions };
    Storage.set('posts', DB_POSTS);
  },

  fetchPacks: async (): Promise<Pack[]> => {
    // ... Mock implementation, usually static or simpler
    return [
      { id: 'p1', name: 'Scottsdale Retrievers', category: 'Breed', image: 'https://images.unsplash.com/photo-1558929996-da64ba858315?auto=format&fit=crop&w=400&q=80', membersCount: 142, isPrivate: false, isMember: true, description: 'Goldens & Labs.' },
      { id: 'p2', name: 'Agility All-Stars', category: 'Training', image: 'https://images.unsplash.com/photo-1535008652995-e95986556e32?auto=format&fit=crop&w=400&q=80', membersCount: 56, isPrivate: true, isMember: false, description: 'Competitive team.' }
    ];
  },

  joinPack: async (packId: string): Promise<void> => { await delay(200); },
  leavePack: async (packId: string): Promise<void> => { await delay(200); },
  createPack: async (pack: Pack): Promise<void> => { await delay(200); },

  fetchEvents: async (): Promise<CommunityEvent[]> => {
    return MOCK_EVENTS; // Simpler for now
  },

  registerForEvent: async (eventId: string): Promise<void> => { await delay(300); },

  fetchLeaderboard: async (): Promise<LeaderboardEntry[]> => {
      return LEADERBOARD_DATA;
  },

  fetchCourses: async (): Promise<Course[]> => {
    return MOCK_COURSES;
  },

  fetchCurriculum: async (): Promise<SkillCategory[]> => {
    return SKILL_TREE;
  },

  sendNotification: async (notification: NotificationRecord): Promise<void> => {
     console.log(`[Notification] ${notification.message}`);
  }
};

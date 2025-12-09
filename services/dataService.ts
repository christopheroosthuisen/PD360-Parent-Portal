
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
  Reservation, CoachingSession, ShopOrder, CartItem, TimeSlot, CalendarEvent
} from '../types';
import { db, isFirebaseConfigured } from '../firebaseConfig';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  doc, 
  updateDoc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import { HubSpotService } from './hubspotService';

// Simulating API Latency for UX feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const DataService = {
  // --- Core User Data (Firestore Integrated) ---
  
  /**
   * Fetches all dogs belonging to the authenticated user.
   */
  fetchDogs: async (userId?: string): Promise<DogData[]> => {
    if (!isFirebaseConfigured) {
        await delay(500);
        return MOCK_DOGS;
    }

    if (!userId) return [];
    
    try {
      const q = query(collection(db, "dogs"), where("owner.id", "==", userId));
      const querySnapshot = await getDocs(q);
      const dogs: DogData[] = [];
      
      querySnapshot.forEach((doc) => {
        dogs.push({ id: doc.id, ...doc.data() } as DogData);
      });

      if (dogs.length === 0) {
         return [];
      }

      return dogs;
    } catch (e) {
      console.error("Error fetching dogs:", e);
      return []; 
    }
  },

  /**
   * Creates a new dog profile in Firestore AND HubSpot
   */
  createDog: async (dogData: Omit<DogData, 'id'>): Promise<string> => {
    if (!isFirebaseConfigured) {
        await delay(500);
        console.log("Mock Dog Created");
        return "mock_new_dog_id";
    }

    try {
      // 1. Create in Firestore
      const docRef = await addDoc(collection(db, "dogs"), dogData);
      const newId = docRef.id;
      
      // 2. Sync to HubSpot (Async, don't block UI strictly, but good to await for data consistency)
      const fullDogData = { ...dogData, id: newId } as DogData;
      HubSpotService.syncData(fullDogData).catch(err => console.error("Background HubSpot Sync Failed", err));

      return newId;
    } catch (e) {
      console.error("Error creating dog:", e);
      throw e;
    }
  },

  updateDog: async (dogId: string, data: Partial<DogData>): Promise<void> => {
    if (!isFirebaseConfigured) {
        console.log("Mock Dog Update:", data);
        return;
    }

    try {
        const dogRef = doc(db, "dogs", dogId);
        await updateDoc(dogRef, data);
        
        // Fetch full updated doc to sync to HubSpot
        const snap = await getDoc(dogRef);
        if (snap.exists()) {
            const fullData = { id: snap.id, ...snap.data() } as DogData;
            HubSpotService.syncData(fullData).catch(err => console.error("Background HubSpot Sync Failed", err));
        }
    } catch (e) {
        console.error("Error updating dog:", e);
    }
  },

  /**
   * Explicitly Sync to CRM (Triggered by UI Button)
   */
  syncToCrm: async (dogData: DogData): Promise<void> => {
      if (!isFirebaseConfigured) {
          console.log("Mock CRM Sync triggered");
          await delay(1000);
          return;
      }
      await HubSpotService.syncData(dogData);
  },

  fetchSiteConfig: async (): Promise<SiteConfig> => {
    return MOCK_SITE_CONFIG;
  },

  // --- Marketplace: Shop (Mock for now) ---
  fetchShopItems: async (): Promise<Product[]> => {
    await delay(300);
    return SHOP_INVENTORY;
  },

  createShopOrder: async (userId: string, items: CartItem[], total: number): Promise<void> => {
      await delay(800);
      console.log(`Order created for ${userId}: $${total}`);
  },

  // --- Marketplace: Pros (Coaching) ---
  fetchCoaches: async (): Promise<Coach[]> => {
    await delay(300);
    return MOCK_COACHES;
  },

  bookCoachingSession: async (userId: string, coachId: string, slotId: string, type: 'virtual' | 'in-person'): Promise<void> => {
      await delay(800);
      if (isFirebaseConfigured) {
        await addDoc(collection(db, "coaching_sessions"), {
            userId, coachId, slotId, type, status: 'scheduled', bookedAt: new Date().toISOString()
        });
      }
  },

  // --- Marketplace: Spots ---
  fetchFacilities: async (): Promise<Facility[]> => {
    return MOCK_FACILITIES;
  },

  fetchServices: async (): Promise<{ services: ServiceOption[], addons: AddOn[] }> => {
    return { services: BOOKING_SERVICES, addons: BOOKING_ADDONS };
  },

  createReservation: async (reservation: Reservation): Promise<void> => {
      if (isFirebaseConfigured) {
        await addDoc(collection(db, "reservations"), {
            ...reservation,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
      } else {
          await delay(500);
          console.log("Mock Reservation created");
      }
  },

  // --- Training System (Firestore Hybrid) ---
  fetchTrainingPlan: async (dogId: string): Promise<TrainingPlan | null> => {
    if (!isFirebaseConfigured) return null;
    try {
        const q = query(collection(db, "training_plans"), where("dogId", "==", dogId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as TrainingPlan;
        }
        return null;
    } catch (e) {
        return null;
    }
  },

  saveTrainingPlan: async (plan: TrainingPlan): Promise<void> => {
    if (isFirebaseConfigured) {
        await addDoc(collection(db, "training_plans"), plan);
    }
  },

  logTrainingSession: async (session: TrainingSessionRecord): Promise<void> => {
    if (isFirebaseConfigured) {
        await addDoc(collection(db, "training_sessions"), session);
    }
  },

  // --- Calendar System ---
  fetchCalendarEvents: async (dogId: string): Promise<CalendarEvent[]> => {
    // If connected, we could merge mock + real. For demo stability, we keep mock events as base.
    return MOCK_EVENTS.map((evt, idx) => ({
       id: `comm_${evt.id}`,
       date: new Date(new Date().setDate(new Date().getDate() + (idx * 3) + 2)).toISOString().split('T')[0],
       title: evt.title,
       type: 'community' as const,
       time: evt.time,
       location: evt.location,
       description: 'Community Event'
    }));
  },

  saveCalendarEvents: async (events: CalendarEvent[]): Promise<void> => {
    console.log("Saving events to DB", events.length);
  },

  // --- Chat Persistence ---
  fetchChatHistory: async (dogId: string): Promise<{ role: 'user' | 'ai', text: string }[]> => {
    return [];
  },

  saveChatHistory: async (dogId: string, messages: { role: 'user' | 'ai', text: string }[]): Promise<void> => {
    // Update firestore doc
  },

  // --- Media System ---
  fetchMediaAssets: async (dogId: string): Promise<MediaItem[]> => {
    return MOCK_MEDIA_LIBRARY; 
  },

  uploadMediaAsset: async (asset: MediaItem): Promise<void> => {
    await delay(800); 
  },

  // --- Health & Vitals ---
  fetchHealthLogs: async (dogId: string): Promise<HealthEvent[]> => {
    if (!isFirebaseConfigured) return [];
    try {
        const q = query(collection(db, "health_logs"), where("dogId", "==", dogId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({id: d.id, ...d.data()} as HealthEvent));
    } catch (e) {
        return [];
    }
  },

  logHealthEvent: async (event: HealthEvent): Promise<void> => {
    if (isFirebaseConfigured) {
        await addDoc(collection(db, "health_logs"), event);
    }
  },

  // --- Community ---
  fetchCommunityFeed: async (): Promise<CommunityPost[]> => {
    return MOCK_POSTS;
  },

  createPost: async (post: CommunityPost): Promise<CommunityPost> => {
    await delay(300);
    return post;
  },

  addReaction: async (postId: string, reactionType: Reaction['type']): Promise<void> => {
    // DB update logic
  },

  fetchPacks: async (): Promise<Pack[]> => {
    return [
      { id: 'p1', name: 'Scottsdale Retrievers', category: 'Breed', image: 'https://images.unsplash.com/photo-1558929996-da64ba858315?auto=format&fit=crop&w=400&q=80', membersCount: 142, isPrivate: false, isMember: true, description: 'Goldens & Labs.' },
      { id: 'p2', name: 'Agility All-Stars', category: 'Training', image: 'https://images.unsplash.com/photo-1535008652995-e95986556e32?auto=format&fit=crop&w=400&q=80', membersCount: 56, isPrivate: true, isMember: false, description: 'Competitive team.' }
    ];
  },

  joinPack: async (packId: string): Promise<void> => { await delay(200); },
  leavePack: async (packId: string): Promise<void> => { await delay(200); },
  createPack: async (pack: Pack): Promise<void> => { await delay(200); },

  fetchEvents: async (): Promise<CommunityEvent[]> => {
    return MOCK_EVENTS;
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

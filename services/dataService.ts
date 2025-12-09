
import { 
  MOCK_DOGS, SHOP_INVENTORY, MOCK_COACHES, MOCK_EVENTS, MOCK_POSTS, 
  MOCK_FACILITIES, BOOKING_SERVICES, BOOKING_ADDONS, SKILL_TREE, 
  MOCK_COURSES, MOCK_SITE_CONFIG, MOCK_MEDIA_LIBRARY, LEADERBOARD_DATA
} from '../constants';
import { 
  DogData, Product, Coach, CommunityEvent, CommunityPost, 
  Facility, ServiceOption, AddOn, SkillCategory, Course, 
  SiteConfig, TrainingPlan, TrainingSessionRecord, MediaItem, HealthEvent, 
  NotificationRecord, Pack, LeaderboardEntry, Reaction, Reservation, CartItem, CalendarEvent
} from '../types';
import { db, isFirebaseConfigured } from '../firebaseConfig';
import { HubSpotService } from './hubspotService';

/**
 * DataService acts as the unified data layer.
 * It handles the logic of switching between Firebase (Real) and Constants (Mock)
 * based on the configuration state.
 */

// Helper to simulate network latency for better UX testing with mock data
const simulateLatency = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to log mock data usage
const logMockUsage = (method: string) => {
  // console.debug(`[DataService] ${method}: Using Mock Data (Firebase not configured)`);
};

export const DataService = {
  
  // ==========================================
  // CORE USER DATA (Dogs & Profiles)
  // ==========================================

  fetchDogs: async (userId?: string): Promise<DogData[]> => {
    if (!userId) return [];

    if (isFirebaseConfigured) {
      try {
        const snapshot = await db.collection("dogs").where("owner.id", "==", userId).get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DogData));
      } catch (e) {
        console.error("Error fetching dogs:", e);
        return []; 
      }
    } else {
      logMockUsage('fetchDogs');
      await simulateLatency();
      return MOCK_DOGS;
    }
  },

  createDog: async (dogData: Omit<DogData, 'id'>): Promise<string> => {
    if (isFirebaseConfigured) {
      try {
        // 1. Create in Firestore
        const docRef = await db.collection("dogs").add(dogData);
        
        // 2. Sync to HubSpot (Background)
        HubSpotService.syncData({ ...dogData, id: docRef.id } as DogData)
          .catch(err => console.error("HubSpot Sync Failed", err));

        return docRef.id;
      } catch (e) {
        console.error("Error creating dog:", e);
        throw e;
      }
    } else {
      logMockUsage('createDog');
      await simulateLatency();
      return `mock_dog_${Date.now()}`;
    }
  },

  updateDog: async (dogId: string, data: Partial<DogData>): Promise<void> => {
    if (isFirebaseConfigured) {
      try {
        const dogRef = db.collection("dogs").doc(dogId);
        await dogRef.update(data);
        
        // Sync update to HubSpot
        const snap = await dogRef.get();
        if (snap.exists) {
            HubSpotService.syncData({ id: snap.id, ...snap.data() } as DogData)
              .catch(err => console.error("HubSpot Sync Failed", err));
        }
      } catch (e) {
        console.error("Error updating dog:", e);
      }
    } else {
      logMockUsage('updateDog');
      // No-op for mock
    }
  },

  syncToCrm: async (dogData: DogData): Promise<void> => {
    if (isFirebaseConfigured) {
      await HubSpotService.syncData(dogData);
    } else {
      logMockUsage('syncToCrm');
      await simulateLatency(1000);
    }
  },

  // ==========================================
  // CONFIGURATION
  // ==========================================

  fetchSiteConfig: async (): Promise<SiteConfig> => {
    // Usually static or cached
    return MOCK_SITE_CONFIG;
  },

  // ==========================================
  // MARKETPLACE (Shop, Coaching, Booking)
  // ==========================================

  fetchShopItems: async (): Promise<Product[]> => {
    // In production, this would query a 'products' collection or Shopify API
    await simulateLatency(300);
    return SHOP_INVENTORY;
  },

  createShopOrder: async (userId: string, items: CartItem[], total: number): Promise<void> => {
    if (isFirebaseConfigured) {
      await db.collection("orders").add({
        userId, items, total, status: 'pending', createdAt: new Date().toISOString()
      });
    } else {
      logMockUsage('createShopOrder');
      await simulateLatency(800);
    }
  },

  fetchCoaches: async (): Promise<Coach[]> => {
    // In production, query 'coaches' collection
    await simulateLatency(300);
    return MOCK_COACHES;
  },

  bookCoachingSession: async (userId: string, coachId: string, slotId: string, type: 'virtual' | 'in-person'): Promise<void> => {
    if (isFirebaseConfigured) {
      await db.collection("coaching_sessions").add({
          userId, coachId, slotId, type, status: 'scheduled', bookedAt: new Date().toISOString()
      });
    } else {
      logMockUsage('bookCoachingSession');
      await simulateLatency(800);
    }
  },

  fetchFacilities: async (): Promise<Facility[]> => {
    return MOCK_FACILITIES;
  },

  fetchServices: async (): Promise<{ services: ServiceOption[], addons: AddOn[] }> => {
    return { services: BOOKING_SERVICES, addons: BOOKING_ADDONS };
  },

  createReservation: async (reservation: Reservation): Promise<void> => {
    if (isFirebaseConfigured) {
      await db.collection("reservations").add({
          ...reservation,
          status: 'pending',
          createdAt: new Date().toISOString()
      });
    } else {
      logMockUsage('createReservation');
      await simulateLatency(500);
    }
  },

  // ==========================================
  // TRAINING & PROGRESS
  // ==========================================

  fetchTrainingPlan: async (dogId: string): Promise<TrainingPlan | null> => {
    if (isFirebaseConfigured) {
      try {
        const snapshot = await db.collection("training_plans")
          .where("dogId", "==", dogId)
          .orderBy("createdAt", "desc")
          .limit(1)
          .get();
          
        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as TrainingPlan;
        }
      } catch (e) { return null; }
    }
    return null;
  },

  saveTrainingPlan: async (plan: TrainingPlan): Promise<void> => {
    if (isFirebaseConfigured) {
        await db.collection("training_plans").add(plan);
    }
  },

  logTrainingSession: async (session: TrainingSessionRecord): Promise<void> => {
    if (isFirebaseConfigured) {
        await db.collection("training_sessions").add(session);
    }
  },

  fetchCurriculum: async (): Promise<SkillCategory[]> => {
    // Curriculum is currently static constant data
    return SKILL_TREE;
  },

  // ==========================================
  // CALENDAR & EVENTS
  // ==========================================

  fetchCalendarEvents: async (dogId: string): Promise<CalendarEvent[]> => {
    // Mix of Real (User logged) and Mock (Community/Static) events
    const communityEvents = MOCK_EVENTS.map((evt, idx) => ({
       id: `comm_${evt.id}`,
       date: new Date(new Date().setDate(new Date().getDate() + (idx * 3) + 2)).toISOString().split('T')[0],
       title: evt.title,
       type: 'community' as const,
       time: evt.time,
       location: evt.location,
       description: 'Community Event'
    }));

    if (isFirebaseConfigured) {
        // Fetch user specific events from DB here and merge
        // const userEvents = ...
        return communityEvents; 
    }
    
    return communityEvents;
  },

  saveCalendarEvents: async (events: CalendarEvent[]): Promise<void> => {
    // In a real app, this would batch write to Firestore
    if (!isFirebaseConfigured) logMockUsage('saveCalendarEvents');
  },

  // ==========================================
  // SOCIAL & COMMUNITY
  // ==========================================

  fetchCommunityFeed: async (): Promise<CommunityPost[]> => {
    if (isFirebaseConfigured) {
        // fetch from 'posts' collection
        return MOCK_POSTS;
    }
    return MOCK_POSTS;
  },

  createPost: async (post: CommunityPost): Promise<CommunityPost> => {
    if (isFirebaseConfigured) {
        await db.collection("posts").add(post);
    } else {
        await simulateLatency(300);
    }
    return post;
  },

  addReaction: async (postId: string, reactionType: Reaction['type']): Promise<void> => {
    if (isFirebaseConfigured) {
        // transaction to increment counter
    }
  },

  fetchPacks: async (): Promise<Pack[]> => {
    // In real app, query 'packs' collection
    return [
      { id: 'p1', name: 'Scottsdale Retrievers', category: 'Breed', image: 'https://images.unsplash.com/photo-1558929996-da64ba858315?auto=format&fit=crop&w=400&q=80', membersCount: 142, isPrivate: false, isMember: true, description: 'Goldens & Labs.' },
      { id: 'p2', name: 'Agility All-Stars', category: 'Training', image: 'https://images.unsplash.com/photo-1535008652995-e95986556e32?auto=format&fit=crop&w=400&q=80', membersCount: 56, isPrivate: true, isMember: false, description: 'Competitive team.' }
    ];
  },

  joinPack: async (packId: string): Promise<void> => { await simulateLatency(200); },
  leavePack: async (packId: string): Promise<void> => { await simulateLatency(200); },
  createPack: async (pack: Pack): Promise<void> => { await simulateLatency(200); },

  fetchEvents: async (): Promise<CommunityEvent[]> => {
    return MOCK_EVENTS;
  },

  registerForEvent: async (eventId: string): Promise<void> => { await simulateLatency(300); },

  fetchLeaderboard: async (): Promise<LeaderboardEntry[]> => {
      // In real app, complex aggregation query
      return LEADERBOARD_DATA;
  },

  // ==========================================
  // MEDIA & ASSETS
  // ==========================================

  fetchMediaAssets: async (dogId: string): Promise<MediaItem[]> => {
    if (isFirebaseConfigured) {
        // Query 'media' collection
        return MOCK_MEDIA_LIBRARY;
    }
    return MOCK_MEDIA_LIBRARY;
  },

  uploadMediaAsset: async (asset: MediaItem): Promise<void> => {
    if (isFirebaseConfigured) {
        await db.collection("media").add(asset);
    } else {
        await simulateLatency(800);
    }
  },

  // ==========================================
  // HEALTH & VITALS
  // ==========================================

  fetchHealthLogs: async (dogId: string): Promise<HealthEvent[]> => {
    if (isFirebaseConfigured) {
      try {
        const snapshot = await db.collection("health_logs")
            .where("dogId", "==", dogId)
            .orderBy("timestamp", "desc")
            .limit(50)
            .get();
        return snapshot.docs.map(d => ({id: d.id, ...d.data()} as HealthEvent));
      } catch (e) {
        return [];
      }
    }
    return [];
  },

  logHealthEvent: async (event: HealthEvent): Promise<void> => {
    if (isFirebaseConfigured) {
        await db.collection("health_logs").add(event);
    }
  },

  // ==========================================
  // LEARNING
  // ==========================================

  fetchCourses: async (): Promise<Course[]> => {
    return MOCK_COURSES;
  },

  // ==========================================
  // CHAT & NOTIFICATIONS
  // ==========================================

  fetchChatHistory: async (dogId: string): Promise<{ role: 'user' | 'ai', text: string }[]> => {
    // Implementation would fetch from 'chat_history' collection
    return [];
  },

  saveChatHistory: async (dogId: string, messages: { role: 'user' | 'ai', text: string }[]): Promise<void> => {
    // Implementation would update 'chat_history' document
  },

  sendNotification: async (notification: NotificationRecord): Promise<void> => {
     console.log(`[Notification] ${notification.message}`);
  }
};

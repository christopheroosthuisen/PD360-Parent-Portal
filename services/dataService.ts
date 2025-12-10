
import { 
  MOCK_DOGS, SHOP_INVENTORY, MOCK_COACHES, MOCK_EVENTS, MOCK_POSTS, 
  MOCK_FACILITIES, BOOKING_SERVICES, BOOKING_ADDONS, SKILL_TREE, 
  MOCK_COURSES, MOCK_SITE_CONFIG, MOCK_MEDIA_LIBRARY, LEADERBOARD_DATA
} from '../constants';
import { 
  DogData, Product, Coach, CommunityEvent, CommunityPost, 
  Facility, ServiceOption, AddOn, SkillCategory, Course, 
  SiteConfig, TrainingPlan, TrainingSessionRecord, MediaItem, HealthEvent, 
  NotificationRecord, Pack, LeaderboardEntry, Reaction, Reservation, CartItem, CalendarEvent, SupportTicket
} from '../types';
import { db, storage, isFirebaseConfigured } from '../firebaseConfig';
import { HubSpotService } from './hubspotService';
import firebase from 'firebase/compat/app';

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

// Helper to convert Firestore timestamps to ISO strings
const convertFirestoreData = (data: any): any => {
  if (!data) return data;
  
  if (data instanceof firebase.firestore.Timestamp) {
    return data.toDate().toISOString();
  }
  
  if (Array.isArray(data)) {
    return data.map(item => convertFirestoreData(item));
  }
  
  if (typeof data === 'object') {
    const newData: any = {};
    for (const key in data) {
      newData[key] = convertFirestoreData(data[key]);
    }
    return newData;
  }
  
  return data;
};

export const DataService = {
  
  // ==========================================
  // CORE USER DATA (Dogs & Profiles)
  // ==========================================

  fetchDogs: async (userId?: string): Promise<DogData[]> => {
    if (!userId) return [];

    if (isFirebaseConfigured) {
      try {
        // Query by ownerId at the root level for indexing performance
        const snapshot = await db.collection("dogs").where("ownerId", "==", userId).get();
        if (snapshot.empty) return [];
        
        return snapshot.docs.map(doc => {
          const rawData = doc.data();
          const convertedData = convertFirestoreData(rawData);
          return { id: doc.id, ...convertedData } as DogData;
        });
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
        // Ensure critical root-level fields exist
        const enrichedData = {
          ...dogData,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 1. Create in Firestore
        const docRef = await db.collection("dogs").add(enrichedData);
        
        // 2. Sync to HubSpot (Background)
        // Note: We use the local dogData which has the ISO string for creation to avoid Timestamp issues in the Hubspot payload initially
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
        
        const updatePayload = {
          ...data,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await dogRef.update(updatePayload);
        
        // Sync update to HubSpot
        const snap = await dogRef.get();
        if (snap.exists) {
            const rawData = snap.data();
            const convertedData = convertFirestoreData(rawData);
            HubSpotService.syncData({ id: snap.id, ...convertedData } as DogData)
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

  uploadAvatar: async (dogId: string, file: File): Promise<string> => {
    if (isFirebaseConfigured) {
        try {
            const storageRef = storage.ref(`avatars/${dogId}/${Date.now()}_${file.name}`);
            const snapshot = await storageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            return downloadURL;
        } catch (e) {
            console.error("Avatar upload failed", e);
            throw e;
        }
    } else {
        await simulateLatency(800);
        return URL.createObjectURL(file); // Temporary blob for mock
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
        userId, 
        items, 
        total, 
        status: 'pending', 
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
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
          userId, 
          coachId, 
          slotId, 
          type, 
          status: 'scheduled', 
          bookedAt: firebase.firestore.FieldValue.serverTimestamp()
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
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
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
            const rawData = snapshot.docs[0].data();
            const convertedData = convertFirestoreData(rawData);
            return { id: snapshot.docs[0].id, ...convertedData } as TrainingPlan;
        }
      } catch (e) { return null; }
    }
    return null;
  },

  saveTrainingPlan: async (plan: TrainingPlan): Promise<void> => {
    if (isFirebaseConfigured) {
        // Ensure plan has timestamp
        const planWithTimestamp = {
            ...plan,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection("training_plans").add(planWithTimestamp);
    }
  },

  logTrainingSession: async (session: TrainingSessionRecord): Promise<void> => {
    if (isFirebaseConfigured) {
        const sessionWithTimestamp = {
            ...session,
            date: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection("training_sessions").add(sessionWithTimestamp);
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
       dogId: dogId, // Assign current context dogId to mock events
       date: new Date(new Date().setDate(new Date().getDate() + (idx * 3) + 2)).toISOString().split('T')[0],
       title: evt.title,
       type: 'community' as const,
       time: evt.time,
       location: evt.location,
       description: 'Community Event'
    }));

    if (isFirebaseConfigured) {
        try {
          const snapshot = await db.collection("calendar_events")
            .where("dogId", "==", dogId) 
            .get();
          
          const userEvents = snapshot.docs.map(doc => {
              const data = convertFirestoreData(doc.data());
              return { id: doc.id, ...data } as CalendarEvent;
          });
          return [...communityEvents, ...userEvents];
        } catch (e) {
          console.error("Error fetching calendar events", e);
          return communityEvents;
        }
    }
    
    return communityEvents;
  },

  saveCalendarEvents: async (events: CalendarEvent[]): Promise<void> => {
    if (isFirebaseConfigured) {
      const batch = db.batch();
      events.forEach(evt => {
        // Only save new events or updated ones
        if (!evt.id.startsWith('comm_')) {
           // Check if it's a new event generated by the UI
           const docRef = db.collection("calendar_events").doc(evt.id); 
           batch.set(docRef, evt, { merge: true });
        }
      });
      try {
        await batch.commit();
      } catch(e) {
        console.error("Batch save failed", e);
      }
    } else {
      logMockUsage('saveCalendarEvents');
    }
  },

  // ==========================================
  // SOCIAL & COMMUNITY
  // ==========================================

  fetchCommunityFeed: async (): Promise<CommunityPost[]> => {
    if (isFirebaseConfigured) {
      try {
        const snapshot = await db.collection("posts").orderBy("createdAt", "desc").limit(20).get();
        const realPosts = snapshot.docs.map(doc => {
            const data = convertFirestoreData(doc.data());
            return { id: doc.id, ...data } as CommunityPost;
        });
        return [...realPosts, ...MOCK_POSTS]; // Mix for demo purposes
      } catch (e) {
        console.error("Error fetching feed", e);
        return MOCK_POSTS;
      }
    }
    return MOCK_POSTS;
  },

  createPost: async (post: CommunityPost): Promise<CommunityPost> => {
    if (isFirebaseConfigured) {
        const postWithTimestamp = {
            ...post,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection("posts").add(postWithTimestamp);
    } else {
        await simulateLatency(300);
    }
    return post;
  },

  addReaction: async (postId: string, reactionType: Reaction['type']): Promise<void> => {
    if (isFirebaseConfigured) {
        // In a real app: Firestore transaction to increment counter in subcollection or array
        // For simple apps, update array is OK but race conditions exist.
    }
  },

  fetchPacks: async (): Promise<Pack[]> => {
    if (isFirebaseConfigured) {
      try {
        const snapshot = await db.collection("packs").get();
        if (!snapshot.empty) {
           return snapshot.docs.map(doc => {
               const data = convertFirestoreData(doc.data());
               return { id: doc.id, ...data } as Pack;
           });
        }
      } catch (e) { console.error(e); }
    }
    
    return [
      { id: 'p1', name: 'Scottsdale Retrievers', category: 'Breed', image: 'https://images.unsplash.com/photo-1558929996-da64ba858315?auto=format&fit=crop&w=400&q=80', membersCount: 142, isPrivate: false, isMember: true, description: 'Goldens & Labs.' },
      { id: 'p2', name: 'Agility All-Stars', category: 'Training', image: 'https://images.unsplash.com/photo-1535008652995-e95986556e32?auto=format&fit=crop&w=400&q=80', membersCount: 56, isPrivate: true, isMember: false, description: 'Competitive team.' }
    ];
  },

  joinPack: async (packId: string): Promise<void> => { await simulateLatency(200); },
  leavePack: async (packId: string): Promise<void> => { await simulateLatency(200); },
  createPack: async (pack: Pack): Promise<void> => { 
    if (isFirebaseConfigured) {
      await db.collection("packs").add(pack);
    } else {
      await simulateLatency(200); 
    }
  },

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
        try {
          const snapshot = await db.collection("media")
            .where("dogId", "==", dogId)
            .orderBy("date", "desc")
            .get();
          return snapshot.docs.map(doc => {
              const data = convertFirestoreData(doc.data());
              return { id: doc.id, ...data } as MediaItem;
          });
        } catch (e) {
          console.error("Error fetching media", e);
          return MOCK_MEDIA_LIBRARY;
        }
    }
    return MOCK_MEDIA_LIBRARY;
  },

  uploadMediaAsset: async (asset: MediaItem, file?: File): Promise<MediaItem> => {
    let finalAsset = { ...asset };

    if (isFirebaseConfigured && file) {
        try {
          // 1. Upload File to Storage
          const storageRef = storage.ref(`media/${asset.dogId}/${Date.now()}_${file.name}`);
          const snapshot = await storageRef.put(file);
          const downloadURL = await snapshot.ref.getDownloadURL();

          // 2. Save Metadata to Firestore with Real URL
          finalAsset = { 
              ...asset, 
              url: downloadURL, 
              thumbnail: downloadURL 
          };
          
          const docRef = await db.collection("media").add(finalAsset);
          finalAsset.id = docRef.id;

        } catch (e) {
          console.error("Upload failed", e);
          throw e;
        }
    } else if (isFirebaseConfigured && !file) {
        // Metadata only save
        const docRef = await db.collection("media").add(asset);
        finalAsset.id = docRef.id;
    } else {
        await simulateLatency(800);
    }
    
    return finalAsset;
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
        return snapshot.docs.map(d => {
            const data = convertFirestoreData(d.data());
            return { id: d.id, ...data } as HealthEvent;
        });
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
    if (isFirebaseConfigured) {
      try {
        const doc = await db.collection("chats").doc(dogId).get();
        if (doc.exists) {
          return doc.data()?.messages || [];
        }
      } catch (e) { console.error(e); }
    }
    return [];
  },

  saveChatHistory: async (dogId: string, messages: { role: 'user' | 'ai', text: string }[]): Promise<void> => {
    if (isFirebaseConfigured) {
      await db.collection("chats").doc(dogId).set({ messages }, { merge: true });
    }
  },

  sendNotification: async (notification: NotificationRecord): Promise<void> => {
     console.log(`[Notification] ${notification.message}`);
  },

  // ==========================================
  // SUPPORT & TICKETS (HubSpot Integration)
  // ==========================================

  fetchUserTickets: async (userId: string): Promise<SupportTicket[]> => {
    // In production, call your Cloud Function endpoint
    
    if (isFirebaseConfigured) {
       try {
         const snapshot = await db.collection("tickets").where("userId", "==", userId).get();
         if (!snapshot.empty) {
            return snapshot.docs.map(d => {
                const data = convertFirestoreData(d.data());
                return { id: d.id, ...data } as SupportTicket;
            });
         }
       } catch (e) { console.error("Error fetching tickets", e); }
    }
    
    // Default Mock Data if empty or error
    await simulateLatency(600);
    return [
      {
        id: 'hs_123',
        subject: 'My login isn\'t working',
        category: 'Technical/Billing',
        description: 'I cannot access my profile.',
        status: 'closed',
        createdAt: '2023-10-20T10:00:00Z',
        lastUpdated: '2023-10-21T14:30:00Z',
        pipeline: 'Support'
      },
      {
        id: 'hs_456',
        subject: 'Recall training help needed',
        category: 'Training Advice',
        description: 'Barnaby ignores me at the park.',
        status: 'waiting',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        lastUpdated: new Date().toISOString(),
        pipeline: 'Client Success'
      }
    ];
  },

  uploadSupportEvidence: async (file: File): Promise<string> => {
    if (isFirebaseConfigured) {
      try {
        const storageRef = storage.ref(`support_evidence/${Date.now()}_${file.name}`);
        const snapshot = await storageRef.put(file);
        return await snapshot.ref.getDownloadURL();
      } catch (e) {
        console.error("Evidence upload failed", e);
        throw new Error("Upload failed");
      }
    }
    
    // Mock Fallback
    await simulateLatency(1500); 
    return `https://firebasestorage.googleapis.com/v0/b/partners-life-mock/o/${file.name}?alt=media&token=mock-token`;
  },

  createSupportTicket: async (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'lastUpdated'>): Promise<SupportTicket> => {
    const newTicket: SupportTicket = {
      id: `hs_${Date.now()}`,
      ...ticket,
      status: 'new',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
        const ticketWithTimestamp = {
            ...newTicket,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection("tickets").add(ticketWithTimestamp);
    } else {
        await simulateLatency(1000);
    }

    console.group("🚀 HubSpot Ticket Created");
    console.log("Pipeline:", ticket.pipeline);
    console.log("Payload:", newTicket);
    console.groupEnd();

    return newTicket;
  }
};

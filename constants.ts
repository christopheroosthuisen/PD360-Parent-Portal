
import { DogData, Grade, Note, Phases, RadarPoint, SkillCategory, CommunityPost, CommunityEvent, LeaderboardEntry, Achievement, Course, Coach, ServiceOption, AddOn, Facility, MediaItem } from './types';

export const PHASES: Phases = {
  STANDARD: {
    1: { label: "Unknown", desc: "New behavior, no knowledge." },
    2: { label: "Teaching", desc: "Learning the mechanics." },
    3: { label: "Reinforcing", desc: "Building history of success." },
    4: { label: "Proofing", desc: "Adding distractions & duration." },
    5: { label: "Maintenance", desc: "Mastered life skill." }
  },
  INAPPROPRIATE: {
    1: { label: "Frequent", desc: "Happens constantly." },
    2: { label: "Often", desc: "Happens regularly." },
    3: { label: "Occasional", desc: "Happens sometimes." },
    4: { label: "Rarely", desc: "Happens infrequently." },
    5: { label: "Never", desc: "Behavior extinguished." }
  }
};

export const MOCK_FACILITIES: Facility[] = [
  {
    id: 'cc',
    name: 'Partners Dog Training - Cave Creek',
    address: 'Cave Creek, AZ',
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=300&q=80',
    hasPDUAlumni: true,
    distance: '2.4 miles'
  },
  {
    id: 'sc',
    name: 'Partners Dog Training - Scottsdale',
    address: 'Scottsdale, AZ',
    image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=300&q=80',
    hasPDUAlumni: true,
    distance: '8.1 miles'
  },
  {
    id: 'phx',
    name: 'Partners Dog Training - Phoenix',
    address: 'Phoenix, AZ',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=300&q=80',
    hasPDUAlumni: false,
    distance: '12.5 miles'
  }
];

export const BOOKING_SERVICES: ServiceOption[] = [
  {
    id: 'boarding',
    name: 'Luxury Boarding',
    description: 'Overnight stay in our premium suites. Includes 3 potty walks and bedding.',
    price: 65,
    priceUnit: 'night'
  },
  {
    id: 'dayschool',
    name: 'Day School',
    description: 'Daycare with a structured schedule including socialization and rest.',
    price: 50,
    priceUnit: 'day'
  }
];

export const BOOKING_ADDONS: AddOn[] = [
  { id: 'train_1', name: '(1) Additional Training Session', description: '30-minute 1-on-1 session with a pro trainer.', price: 50, category: 'Training' },
  { id: 'train_2', name: '(2) Additional Training Sessions', description: 'Two 30-minute sessions.', price: 100, category: 'Training' },
  { id: 'bath', name: 'Exit Bath', description: 'Shampoo, condition, and blow dry before pickup.', price: 40, category: 'Grooming' },
  { id: 'nails', name: 'Nail Trim', description: 'Dremel or clip.', price: 20, category: 'Grooming' },
  { id: 'treadmill', name: 'Treadmill Session', description: '20-minute cardio session.', price: 25, category: 'Health' },
  { id: 'kong', name: 'Stuffed Kong', description: 'Peanut butter or yogurt frozen treat.', price: 10, category: 'Enrichment' },
];

export const BEHAVIOR_TIPS: Record<string, Record<number, string>> = {
  "Sit": {
    2: "Lure the dog into a sit. Mark and reward immediately. Pair with 'Sit' cue. High rate of reinforcement.",
    3: "Fade lure to hand signal/verbal cue. Add duration (sit-stay). Practice in new spots.",
    4: "Proof with distractions and distance. Ensure the dog holds the sit until released, regardless of environment."
  },
};

export const BEHAVIOR_TAGS = [
  "Sit", "Down", "Place", "Heel", "Recall", "Loose Leash", "Stay", "Look/Watch", "Touch", "Body Language", "Engagement", "Timing"
];

export const MOCK_MEDIA_LIBRARY: MediaItem[] = [
  {
    id: 'm1',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Placeholder
    thumbnail: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=80',
    date: 'Oct 24, 2023',
    title: 'Heel Work Session',
    tags: ['Heel', 'Focus', 'Engagement'],
    notes: 'Working on duration and eye contact while walking past distractions.',
    analysis: {
       engagement_score: 8,
       mechanics: "Excellent timing on the 'Yes' marker. You are marking the exact moment of eye contact. Leash handling is smooth, keeping a nice J-loop.",
       posture_feedback: "Your shoulders are relaxed, which translates to a calm energy for the dog. Great job not facing the dog directly, encouraging forward movement.",
       recommendations: ["Try increasing your pace slightly to build more drive.", "Add a few left turns to re-engage if focus drops."],
       timeline: [
          { time: "0:05", event: "Command", detail: "Heel", type: "command" },
          { time: "0:07", event: "Behavior", detail: "Dog engages and aligns", type: "behavior_success" },
          { time: "0:15", event: "Marker", detail: "Verbal 'Yes' for eye contact", type: "marker" },
          { time: "0:30", event: "Distraction", detail: "Another dog passes", type: "event" }
       ]
    }
  },
  {
    id: 'm2',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
    date: 'Oct 20, 2023',
    title: 'Body Language Check',
    tags: ['Body Language', 'Relaxed'],
    notes: 'Checking comfort level in new park.',
    analysis: {
        mechanics: "The dog appears relaxed with loose ears and an open mouth (play face). Tail posture suggests neutral/happy state."
    }
  },
  {
    id: 'm3',
    type: 'video',
    url: '', 
    thumbnail: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=400&q=80',
    date: 'Oct 15, 2023',
    title: 'Place Duration',
    tags: ['Place', 'Duration'],
    notes: 'Attempting 2 minutes on place.',
    analysis: {
        engagement_score: 7,
        mechanics: "Good initial placement. You might be repeating the cue 'Place' too often. Say it once and wait.",
        timeline: [
            { time: "0:02", event: "Command", detail: "Place", type: "command" },
            { time: "0:10", event: "Correction", detail: "Verbal 'Ah-ah' when dog breaks", type: "correction" }
        ]
    }
  }
];

export const GRADES: Grade[] = [
  { name: "Pre-School", minScore: 77, color: "text-blue-600", bg: "bg-blue-100", bar: "bg-blue-500" },
  { name: "Kindergarten", minScore: 147, color: "text-emerald-600", bg: "bg-emerald-100", bar: "bg-emerald-500" },
  { name: "Elementary", minScore: 243, color: "text-yellow-600", bg: "bg-yellow-100", bar: "bg-yellow-500" },
  { name: "Middle School", minScore: 339, color: "text-orange-600", bg: "bg-orange-100", bar: "bg-orange-500" },
  { name: "High School", minScore: 404, color: "text-red-600", bg: "bg-red-100", bar: "bg-red-500" },
  { name: "College", minScore: 463, color: "text-purple-600", bg: "bg-purple-100", bar: "bg-purple-500" },
  { name: "Masters", minScore: 518, color: "text-indigo-600", bg: "bg-indigo-100", bar: "bg-indigo-500" },
  { name: "Dogtorate", minScore: 602, color: "text-slate-800", bg: "bg-slate-200", bar: "bg-slate-800" }
];

export const ACHIEVEMENTS_MOCK: Achievement[] = [
  { id: '1', title: 'Week Warrior', description: '7 Day Training Streak', icon: '🔥', dateEarned: '2023-10-15', isLocked: false },
  { id: '2', title: 'Sit Master', description: 'Achieved Level 5 in Sit', icon: '🪑', dateEarned: '2023-09-20', isLocked: false },
  { id: '3', title: 'Social Butterfly', description: 'Completed 5 Community Events', icon: '🦋', dateEarned: '2023-10-01', isLocked: false },
  { id: '4', title: 'Scholar', description: 'Complete the Pet Parent Guide', icon: '🎓', isLocked: true },
  { id: '5', title: 'Proofing Pro', description: 'Level 4 in 10 Behaviors', icon: '🛡️', isLocked: true },
];

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'The Partners Method: Pet Parent Guide',
    description: 'The essential foundation for every Partners Dog parent. Learn the core philosophy and techniques.',
    thumbnail: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
    progress: 35,
    totalModules: 12,
    completedModules: 4,
    link: 'https://university.partnersdogs.org/login',
    modules: [
      { id: 'm1', title: 'Understanding Drive', duration: '15 min', isCompleted: true, isLocked: false },
      { id: 'm2', title: 'The 3 D\'s of Dog Training', duration: '20 min', isCompleted: true, isLocked: false },
      { id: 'm3', title: 'Marker Training 101', duration: '12 min', isCompleted: true, isLocked: false },
      { id: 'm4', title: 'Leash Handling Mechanics', duration: '18 min', isCompleted: true, isLocked: false },
      { id: 'm5', title: 'Thresholds & Boundaries', duration: '25 min', isCompleted: false, isLocked: false },
      { id: 'm6', title: 'Correction vs. Punishment', duration: '15 min', isCompleted: false, isLocked: true },
    ]
  },
  {
    id: 'c2',
    title: 'Puppy Raising Blueprint',
    description: 'Everything you need to know for the first 6 months.',
    thumbnail: 'https://images.unsplash.com/photo-1591160690555-5debfba600f2?auto=format&fit=crop&w=800&q=80',
    progress: 0,
    totalModules: 8,
    completedModules: 0,
    link: 'https://university.partnersdogs.org/login',
    modules: []
  }
];

export const MOCK_COACHES: Coach[] = [
  {
    id: 'c1',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    specialties: ['Behavior Modification', 'Aggression', 'Leash Reactivity'],
    location: 'Phoenix, AZ',
    rating: 4.9,
    reviews: 124,
    bio: 'PDU Class of 2018. I specialize in helping dogs overcome fear and reactivity using the Partners Method.',
    isPDUAlum: true,
    hourlyRate: 120,
    availableSlots: ['Today 2:00 PM', 'Tomorrow 10:00 AM', 'Wed 4:00 PM']
  },
  {
    id: 'c2',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    specialties: ['Puppy Foundations', 'Obedience', 'Tricks'],
    location: 'Scottsdale, AZ',
    rating: 5.0,
    reviews: 89,
    bio: 'Passionate about setting puppies up for success! PDU Alum and certified trick dog instructor.',
    isPDUAlum: true,
    hourlyRate: 95,
    availableSlots: ['Tomorrow 1:00 PM', 'Thu 11:00 AM', 'Fri 9:00 AM']
  },
  {
    id: 'c3',
    name: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    specialties: ['Advanced Obedience', 'Off-Leash Control', 'E-Collar'],
    location: 'Virtual / Remote',
    rating: 4.8,
    reviews: 210,
    bio: 'Specializing in distance work and off-leash reliability. I can help you fine-tune your mechanics via video.',
    isPDUAlum: true,
    hourlyRate: 110,
    availableSlots: ['Today 5:00 PM', 'Wed 2:00 PM', 'Fri 3:00 PM']
  },
  {
    id: 'c4',
    name: 'Emily Dao',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    specialties: ['Anxiety', 'Separation Anxiety', 'Confidence Building'],
    location: 'Tempe, AZ',
    rating: 4.9,
    reviews: 65,
    bio: 'Helping anxious dogs find their confidence. Patient, supportive approach for sensitive pups.',
    isPDUAlum: true,
    hourlyRate: 100,
    availableSlots: ['Tomorrow 3:00 PM', 'Thu 10:00 AM']
  }
];

export const MOCK_DOGS: DogData[] = [
  {
    id: "d1",
    name: "Barnaby",
    breeds: ["Golden Retriever"],
    birthDate: "2022-05-15",
    sex: "Male",
    fixed: true,
    weight: 65,
    color: "Golden",
    avatar: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&q=80&w=200&h=200",
    currentScore: 285,
    streak: 12,
    achievements: ACHIEVEMENTS_MOCK,
    medications: [],
    allergies: ["Chicken"],
    veterinarian: {
      name: "Dr. Smith",
      clinicName: "Scottsdale Veterinary Clinic",
      phone: "(480) 555-0123",
      address: "1234 Main St, Scottsdale, AZ"
    },
    vaccinations: [
      { name: "Rabies", expiryDate: "2024-05-15", status: "valid" },
      { name: "DHPP", expiryDate: "2024-05-15", status: "valid" },
      { name: "Bordetella", expiryDate: "2023-11-20", status: "expiring" }
    ],
    foodBrand: "Purina Pro Plan",
    feedingAmount: "2 cups",
    feedingSchedule: ["07:00", "17:00"],
    homeType: "House",
    hasYard: true,
    siblings: [{ name: "Mittens", type: "Cat" }],
    trainingHistory: "Puppy class graduate. Working on impulse control.",
    reservations: [
      {
        id: "res_1",
        serviceName: "Luxury Boarding",
        startDate: "2024-11-20",
        endDate: "2024-11-27",
        status: "Upcoming",
        totalPrice: 600,
        facilityName: "Partners Dog Training - Cave Creek"
      }
    ]
  },
  {
    id: "d2",
    name: "Luna",
    breeds: ["Border Collie", "Australian Shepherd"],
    birthDate: "2023-01-10",
    sex: "Female",
    fixed: true,
    weight: 40,
    color: "Black & White",
    avatar: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&q=80&w=200&h=200",
    currentScore: 150,
    streak: 3,
    achievements: [ACHIEVEMENTS_MOCK[0]],
    medications: [{name: "Fluoxetine", dosage: "20mg", frequency: "Daily AM"}],
    allergies: [],
    vaccinations: [
        { name: "Rabies", expiryDate: "2024-01-10", status: "valid" },
        { name: "DHPP", expiryDate: "2024-01-10", status: "valid" },
    ],
    foodBrand: "Orijen Regional Red",
    feedingAmount: "1 cup",
    feedingSchedule: ["08:00", "18:00"],
    homeType: "Apartment",
    hasYard: false,
    siblings: [],
    trainingHistory: "Rescue. High energy. Needs work on reactivity.",
    reservations: []
  }
];

export const INITIAL_DOG_DATA: DogData = MOCK_DOGS[0];

// ... (Include full SKILL_TREE here, ensuring imports are correct)
export const SKILL_TREE: SkillCategory[] = [
  // ... SKILL_TREE data (restored from previous context)
  {
    category: "Stress & Triggers",
    type: "INAPPROPRIATE",
    description: "Goal: Reduce frequency (Level 5 = Never)",
    skills: [
      { id: "quant_Body_Stiffening", name: "Body Stiffening", level: 2, link: "https://knowledge.partnersdogs.com/stress-triggers" },
      { id: "quant_Confinement_PS", name: "Confinement", level: 3, link: "https://knowledge.partnersdogs.com/confinement" },
      { id: "quant_Corrections", name: "Corrections", level: 1, link: "https://knowledge.partnersdogs.com/correction" },
      { id: "quant_Ears_Flattening", name: "Ears Flattening", level: 3 },
      { id: "quant_Furniture", name: "Furniture Boundaries", level: 4, link: "https://knowledge.partnersdogs.com/furniture-boundaries" },
      { id: "quant_Handling_K", name: "Handling", level: 3, link: "https://knowledge.partnersdogs.com/handling" },
      { id: "quant_High_Energy", name: "High Energy", level: 2, link: "https://knowledge.partnersdogs.com/hyperactivity" },
      { id: "quant_Knocking_Doorbell_K", name: "Knocking/Doorbell", level: 3, link: "https://knowledge.partnersdogs.com/knocking/doorbell" },
      { id: "quant_Lip_Licking", name: "Lip Licking", level: 3 },
      { id: "quant_Loud_Sounds", name: "Loud/Unusual Sounds", level: 2, link: "https://knowledge.partnersdogs.com/sound-desensitization" },
      { id: "quant_Movement", name: "Movement", level: 3, link: "https://knowledge.partnersdogs.com/movement" },
      { id: "quant_Owner_Family", name: "Owner/Family", level: 4 },
      { id: "quant_Pet_Sibling", name: "Pet Sibling", level: 3 },
      { id: "quant_Prey_Chase", name: "Prey/Chase", level: 2, link: "https://knowledge.partnersdogs.com/prey/chase-drive" },
      { id: "quant_Shy", name: "Shy/Shaking/Cowers", level: 2, link: "https://knowledge.partnersdogs.com/shy" },
      { id: "quant_Spatial_Boundaries", name: "Spatial Boundaries", level: 3, link: "https://knowledge.partnersdogs.com/spacial-boundaries" },
      { id: "quant_Strangers", name: "Strangers", level: 3, link: "https://knowledge.partnersdogs.com/strangers" },
      { id: "quant_Teeth_Chattering", name: "Teeth Chattering", level: 5 },
      { id: "quant_Whale_Eye", name: "Whale Eye", level: 4 },
    ]
  },
  // ... other categories
  {
    category: "Socialization",
    type: "STANDARD",
    skills: [
       { id: "quant_Baby_Children", name: "Baby/Children", level: 2, link: "https://knowledge.partnersdogs.com/children-socialization" },
       { id: "quant_Car_Socialization", name: "Car Socialization", level: 3, link: "https://knowledge.partnersdogs.com/car-socialization" },
       { id: "quant_Cats", name: "Cats", level: 3 },
       { id: "quant_Confidence", name: "Confidence", level: 2, link: "https://knowledge.partnersdogs.com/confidence-building" },
       { id: "quant_Cuddles", name: "Cuddles", level: 5 },
       { id: "quant_Grooming_Desens", name: "Grooming Desensitization", level: 3 },
       { id: "quant_Environment", name: "Environment", level: 4, link: "https://knowledge.partnersdogs.com/environmental-socialization" },
       { id: "quant_Females", name: "Females", level: 4, link: "https://knowledge.partnersdogs.com/female-socialization" },
       { id: "quant_Hyperactivity", name: "Hyperactivity", level: 2, link: "https://knowledge.partnersdogs.com/hyperactivity" },
       { id: "quant_Large_Dogs", name: "Large Dogs", level: 3 },
       { id: "quant_Leash_Response", name: "Leash Response", level: 3 },
       { id: "quant_Males", name: "Males", level: 3, link: "https://knowledge.partnersdogs.com/male-socialization" },
       { id: "quant_Medical_Socialization", name: "Medical Socialization", level: 2, link: "https://knowledge.partnersdogs.com/medical-socialization" },
       { id: "quant_Nose_Mental", name: "Nose/Mental Stimulation", level: 4, link: "https://knowledge.partnersdogs.com/nose/mental-stimulation" },
       { id: "quant_Object_Desens", name: "Object Desensitization", level: 3, link: "https://knowledge.partnersdogs.com/object-desensitization-bike-wheelchair-skateboard" },
       { id: "quant_Other_Animals", name: "Other Animals", level: 2, link: "https://knowledge.partnersdogs.com/animal-socialization" },
       { id: "quant_Personal_Space", name: "Personal Space Response", level: 3 },
       { id: "quant_Appropriate_Play", name: "Appropriate Play", level: 3, link: "https://knowledge.partnersdogs.com/appropriate-play" },
       { id: "quant_Quiet", name: "Quiet", level: 2, link: "https://knowledge.partnersdogs.com/quiet" },
       { id: "quant_Relationship_Building", name: "Relationship Building", level: 4, link: "https://knowledge.partnersdogs.com/relationship-building" },
       { id: "quant_Separation_Response", name: "Separation Response", level: 2, link: "https://knowledge.partnersdogs.com/separation-anxiety" },
       { id: "quant_Small_Dogs", name: "Small Dogs", level: 3 },
       { id: "quant_Social_Cue", name: "Social Cue", level: 3, link: "https://knowledge.partnersdogs.com/social-cues-recognition" },
       { id: "quant_Texture_Response", name: "Texture Response", level: 4, link: "https://knowledge.partnersdogs.com/touch/texture-desensitization" },
       { id: "quant_Toy_Drive", name: "Toy Drive", level: 4, link: "https://knowledge.partnersdogs.com/toy-drive" },
    ]
  },
  {
    category: "Tricks",
    type: "STANDARD",
    skills: [
       { id: "quant_A_Frame", name: "A-Frame", level: 1, link: "https://knowledge.partnersdogs.com/a-frame" },
       { id: "quant_Agility_Weaves", name: "Agility Weaves", level: 1, link: "https://knowledge.partnersdogs.com/weave-poles" },
       { id: "quant_Arm_Flips", name: "Arm Flips", level: 1, link: "https://knowledge.partnersdogs.com/arm-flips" },
       { id: "quant_Back_Vault", name: "Back Vault", level: 1, link: "https://knowledge.partnersdogs.com/back-vault" },
       { id: "quant_Backstall", name: "Backstall", level: 1, link: "https://knowledge.partnersdogs.com/backstall" },
       { id: "quant_Bar_Jump", name: "Bar Jump", level: 2, link: "https://knowledge.partnersdogs.com/bar-jump" },
       { id: "quant_Body_Over", name: "Body Over", level: 2, link: "https://knowledge.partnersdogs.com/body-over" },
       { id: "quant_Boing", name: "Boing", level: 1, link: "https://knowledge.partnersdogs.com/boing" },
       { id: "quant_Catch_Frisbee", name: "Catch Frisbee", level: 2, link: "https://knowledge.partnersdogs.com/frisbee" },
       { id: "quant_Chin_Rest", name: "Chin Rest", level: 3, link: "https://knowledge.partnersdogs.com/chin-rest" },
       { id: "quant_Counting", name: "Counting", level: 1, link: "https://knowledge.partnersdogs.com/counting" },
       { id: "quant_Crawl", name: "Crawl", level: 2, link: "https://knowledge.partnersdogs.com/crawl" },
       { id: "quant_Cross_Paws", name: "Cross Paws", level: 3, link: "https://knowledge.partnersdogs.com/cross-paws" },
       { id: "quant_Dance", name: "Dance", level: 2, link: "https://knowledge.partnersdogs.com/dance" },
       { id: "quant_Dog_Catch", name: "Dog Catch", level: 1, link: "https://knowledge.partnersdogs.com/dog-catch" },
       { id: "quant_Fake_Pee", name: "Fake Pee", level: 1, link: "https://knowledge.partnersdogs.com/fake-pee" },
       { id: "quant_Fetch_Leash", name: "Fetch Leash", level: 3, link: "https://knowledge.partnersdogs.com/fetch-leash" },
       { id: "quant_Flip", name: "Flip", level: 2, link: "https://knowledge.partnersdogs.com/flip" },
       { id: "quant_Foot_Rebound", name: "Foot Rebound", level: 1, link: "https://knowledge.partnersdogs.com/foot-rebound" },
       { id: "quant_Footsies", name: "Footsies", level: 2, link: "https://knowledge.partnersdogs.com/footsies" },
       { id: "quant_Footstall", name: "Footstall", level: 1, link: "https://knowledge.partnersdogs.com/footstall" },
       { id: "quant_Handstand", name: "Handstand", level: 1, link: "https://knowledge.partnersdogs.com/handstand" },
       { id: "quant_Hide_Suitcase", name: "Hide In Suitcase", level: 1, link: "https://knowledge.partnersdogs.com/hide-in-suitcase" },
       { id: "quant_High_Five", name: "High Five", level: 4, link: "https://knowledge.partnersdogs.com/high-five" },
       { id: "quant_Hug", name: "Hug", level: 3, link: "https://knowledge.partnersdogs.com/hug" },
       { id: "quant_Hug_Leg", name: "Hug Leg", level: 2, link: "https://knowledge.partnersdogs.com/hug-leg" },
       { id: "quant_Hug_Object", name: "Hug Object", level: 2, link: "https://knowledge.partnersdogs.com/hug-object" },
       { id: "quant_Jump_Rope", name: "Jump Rope", level: 1, link: "https://knowledge.partnersdogs.com/jump-rope" },
       { id: "quant_Jump_Through_Arms", name: "Jump Through Arms", level: 2, link: "https://knowledge.partnersdogs.com/hooped-arms" },
       { id: "quant_Jump_Through_Hoop", name: "Jump Through Hoop", level: 2, link: "https://knowledge.partnersdogs.com/tire-jump" },
       { id: "quant_Kiss", name: "Kiss", level: 4, link: "https://knowledge.partnersdogs.com/kiss" },
       { id: "quant_Leg_Jump", name: "Leg Jump", level: 2, link: "https://knowledge.partnersdogs.com/leg-vault" },
       { id: "quant_Leg_Weaves", name: "Leg Weaves", level: 2, link: "https://knowledge.partnersdogs.com/leg-weaves" },
       { id: "quant_Limp", name: "Limp", level: 1, link: "https://knowledge.partnersdogs.com/limp" },
       { id: "quant_Play_Dead", name: "Play Dead", level: 3, link: "https://knowledge.partnersdogs.com/play-dead" },
       { id: "quant_Pup_Blanket", name: "Pup in a Blanket", level: 2, link: "https://knowledge.partnersdogs.com/pup-in-a-blanket" },
       { id: "quant_Rebound", name: "Rebound", level: 1, link: "https://knowledge.partnersdogs.com/rebound" },
       { id: "quant_Rollover", name: "Rollover", level: 4, link: "https://knowledge.partnersdogs.com/rollover" },
       { id: "quant_Say_Prayers", name: "Say Your Prayers", level: 2, link: "https://knowledge.partnersdogs.com/say-your-prayers" },
       { id: "quant_Scoot", name: "Scoot", level: 1, link: "https://knowledge.partnersdogs.com/scoot" },
       { id: "quant_Selfie", name: "Selfie", level: 2, link: "https://knowledge.partnersdogs.com/selfie" },
       { id: "quant_Shake", name: "Shake/Paw", level: 5, link: "https://knowledge.partnersdogs.com/shake" },
       { id: "quant_Shuffle", name: "Shuffle", level: 1, link: "https://knowledge.partnersdogs.com/shuffle" },
       { id: "quant_Sit_Pretty", name: "Sit Pretty", level: 3, link: "https://knowledge.partnersdogs.com/sit-pretty" },
       { id: "quant_Skateboard", name: "Skateboard", level: 1, link: "https://knowledge.partnersdogs.com/skateboard" },
       { id: "quant_Speak", name: "Speak", level: 3, link: "https://knowledge.partnersdogs.com/speak" },
       { id: "quant_Spin", name: "Spin", level: 4, link: "https://knowledge.partnersdogs.com/spin" },
       { id: "quant_Tell_Secret", name: "Tell A Secret", level: 2, link: "https://knowledge.partnersdogs.com/tell-me-a-secret" },
       { id: "quant_Touch", name: "Touch", level: 4, link: "https://knowledge.partnersdogs.com/touch" },
       { id: "quant_Tunnel", name: "Tunnel", level: 2, link: "https://knowledge.partnersdogs.com/tunnel" },
       { id: "quant_Wave", name: "Wave", level: 3, link: "https://knowledge.partnersdogs.com/wave" },
       { id: "quant_Wipe_Floor", name: "Wipe The Floor", level: 1, link: "https://knowledge.partnersdogs.com/wipe-the-floor" },
    ]
  },
  {
    category: "Service",
    type: "STANDARD",
    skills: [
       { id: "quant_CPR", name: "CPR", level: 1, link: "https://knowledge.partnersdogs.com/cpr" },
       { id: "quant_Hand_Signals", name: "Hand Signals", level: 3, link: "https://knowledge.partnersdogs.com/hand-signals" },
       { id: "quant_Hold_Objects", name: "Hold Objects", level: 2, link: "https://knowledge.partnersdogs.com/hold-objects" },
    ]
  },
  {
    category: "Obedience",
    type: "STANDARD",
    skills: [
       { id: "quant_Adv_Turns", name: "Advanced Turns", level: 2, link: "https://knowledge.partnersdogs.com/left-turn" },
       { id: "quant_Adventure_Walk", name: "Adventure Walk", level: 3 },
       { id: "quant_Back_Up", name: "Back Up", level: 2, link: "https://knowledge.partnersdogs.com/backup" },
       { id: "quant_Bow", name: "Bow", level: 3, link: "https://knowledge.partnersdogs.com/bow" },
       { id: "quant_Bye", name: "Bye", level: 2, link: "https://knowledge.partnersdogs.com/circle/around/bye" },
       { id: "quant_Calm_Greetings", name: "Calm Greetings", level: 3, link: "https://knowledge.partnersdogs.com/calm-greetings" },
       { id: "quant_Catch", name: "Catch", level: 4, link: "https://knowledge.partnersdogs.com/catch" },
       { id: "quant_Close_Door", name: "Close Door", level: 1, link: "https://knowledge.partnersdogs.com/close-door" },
       { id: "quant_Correction_Marker", name: "Correction Marker", level: 4, link: "https://knowledge.partnersdogs.com/correction-marker-no" },
       { id: "quant_Crate", name: "Crate/Kennel", level: 4, link: "https://knowledge.partnersdogs.com/crate" },
       { id: "quant_Distance_Cmds", name: "Distance Commands", level: 2, link: "https://knowledge.partnersdogs.com/distance-command" },
       { id: "quant_Done", name: "Done Response", level: 4, link: "https://knowledge.partnersdogs.com/done" },
       { id: "quant_Down_PS", name: "Down", level: 3, link: "https://knowledge.partnersdogs.com/down" },
       { id: "quant_Figure_8", name: "Figure 8", level: 2, link: "https://knowledge.partnersdogs.com/figure-8" },
       { id: "quant_Flip_Heel", name: "Flip To Heel", level: 2 },
       { id: "quant_Free", name: "Free", level: 4, link: "https://knowledge.partnersdogs.com/free" },
       { id: "quant_Freestyle", name: "Freestyle Bridging", level: 1, link: "https://knowledge.partnersdogs.com/bridging-commands" },
       { id: "quant_Handoff", name: "Handoff Protocol", level: 3, link: "https://knowledge.partnersdogs.com/hand-off-protocol" },
       { id: "quant_Heel_K", name: "Heel", level: 2, link: "https://knowledge.partnersdogs.com/heel" },
       { id: "quant_Impulse_Control", name: "Impulse Control", level: 3, link: "https://knowledge.partnersdogs.com/impulse-control" },
       { id: "quant_Leave_It", name: "Leave It", level: 3, link: "https://knowledge.partnersdogs.com/leave-it" },
       { id: "quant_Left_360", name: "Left Circle 360", level: 2, link: "https://knowledge.partnersdogs.com/left-turn" },
       { id: "quant_Left_90", name: "Left Turn 90", level: 2, link: "https://knowledge.partnersdogs.com/left-turn" },
       { id: "quant_Left_180", name: "Left About 180", level: 2, link: "https://knowledge.partnersdogs.com/left-turn" },
       { id: "quant_Look", name: "Look (Directional)", level: 2, link: "https://knowledge.partnersdogs.com/look-backwards" },
       { id: "quant_Middle", name: "Middle Position", level: 3, link: "https://knowledge.partnersdogs.com/middle-position" },
       { id: "quant_Name_Rec", name: "Name Recognition", level: 5, link: "https://knowledge.partnersdogs.com/name-recognition" },
       { id: "quant_Off_Leash", name: "Off Leash Commands", level: 1, link: "https://knowledge.partnersdogs.com/outdoor-commands" },
       { id: "quant_Ecollar", name: "Off Leash E-Collar", level: 1, link: "https://knowledge.partnersdogs.com/off-leash-e-collar-recall" },
       { id: "quant_Precision_Heel", name: "Off Leash Precision Heel", level: 1, link: "https://knowledge.partnersdogs.com/off-leash-precision-heel" },
       { id: "quant_Off", name: "Off", level: 3, link: "https://knowledge.partnersdogs.com/jumping/off" },
       { id: "quant_On_Move", name: "On The Move Commands", level: 2 },
       { id: "quant_Open_Door", name: "Open Door", level: 1, link: "https://knowledge.partnersdogs.com/open-door" },
       { id: "quant_Orbit", name: "Orbit", level: 2, link: "https://knowledge.partnersdogs.com/orbit" },
       { id: "quant_Out", name: "Out", level: 3, link: "https://knowledge.partnersdogs.com/out" },
       { id: "quant_Pacing", name: "Pacing", level: 2, link: "https://knowledge.partnersdogs.com/pacing" },
       { id: "quant_Place_K", name: "Place", level: 3, link: "https://knowledge.partnersdogs.com/place" },
       { id: "quant_Put_Away", name: "Put Away Toys", level: 1, link: "https://knowledge.partnersdogs.com/put-toys-away" },
       { id: "quant_Recall_K", name: "Recall (Come/Front)", level: 3, link: "https://knowledge.partnersdogs.com/come" },
       { id: "quant_Recall_Heel", name: "Recall To Heel", level: 2 },
       { id: "quant_Reset", name: "Reset", level: 3, link: "https://knowledge.partnersdogs.com/reset" },
       { id: "quant_Retrieve", name: "Retrieve Objects", level: 2, link: "https://knowledge.partnersdogs.com/object-retrieve-and-manipulation" },
       { id: "quant_Reward_Marker", name: "Reward Marker", level: 5, link: "https://knowledge.partnersdogs.com/reward-marker-yes" },
       { id: "quant_Right_360", name: "Right Circle 360", level: 2, link: "https://knowledge.partnersdogs.com/right-turn" },
       { id: "quant_Right_Side", name: "Right Side Position", level: 2, link: "https://knowledge.partnersdogs.com/right-side-position" },
       { id: "quant_Right_90", name: "Right Turn 90", level: 2, link: "https://knowledge.partnersdogs.com/right-turn" },
       { id: "quant_Ring_Bell", name: "Ring Bell To Go Outside", level: 2, link: "https://knowledge.partnersdogs.com/ring-bell-to-go-outside" },
       { id: "quant_Send_Out", name: "Send Out", level: 1, link: "https://knowledge.partnersdogs.com/send-out" },
       { id: "quant_Send_Crate", name: "Send To Crate", level: 3 },
       { id: "quant_Sit_PS", name: "Sit", level: 5, link: "https://knowledge.partnersdogs.com/sit" },
       { id: "quant_Stand", name: "Stand", level: 2, link: "https://knowledge.partnersdogs.com/stand" },
       { id: "quant_Standing_Pivots", name: "Standing Pivots", level: 1, link: "https://knowledge.partnersdogs.com/standing-pivots" },
       { id: "quant_Stay_K", name: "Stay", level: 3, link: "https://knowledge.partnersdogs.com/stay" },
       { id: "quant_Threshold", name: "Threshold Protocol", level: 3, link: "https://knowledge.partnersdogs.com/threshold" },
       { id: "quant_Turn_Lights", name: "Turn Off Lights", level: 1, link: "https://knowledge.partnersdogs.com/turn-off-the-lights" },
       { id: "quant_Right_180", name: "Right About 180", level: 2, link: "https://knowledge.partnersdogs.com/right-turn" },
       { id: "quant_Watch", name: "Watch", level: 4 },
       { id: "quant_Wipe", name: "Wipe The Floor", level: 1, link: "https://knowledge.partnersdogs.com/wipe-the-floor" },
    ]
  },
  {
    category: "Inappropriate Behaviors",
    type: "INAPPROPRIATE",
    description: "Goal: Reduce frequency (Level 5 = Never)",
    skills: [
       { id: "quant_Barking", name: "Barking", level: 3, link: "https://knowledge.partnersdogs.com/barking" },
       { id: "quant_Barrier", name: "Barrier/Fence", level: 2, link: "https://knowledge.partnersdogs.com/barrier-reactivity" },
       { id: "quant_Chewing", name: "Chewing", level: 4, link: "https://knowledge.partnersdogs.com/chewing" },
       { id: "quant_Counter_Surfing", name: "Counter Surfing", level: 3, link: "https://knowledge.partnersdogs.com/counter-surfing" },
       { id: "quant_Destructiveness", name: "Destructiveness", level: 3, link: "https://knowledge.partnersdogs.com/destructive" },
       { id: "quant_Digging", name: "Digging", level: 3, link: "https://knowledge.partnersdogs.com/digging" },
       { id: "quant_Dog_Aggression", name: "Dog Aggression", level: 1, link: "https://knowledge.partnersdogs.com/dog-aggression" },
       { id: "quant_Eating_Potty", name: "Eating Potty", level: 2 },
       { id: "quant_Escaping", name: "Escaping/Bolting", level: 2 },
       { id: "quant_Potty_House", name: "Potty In The House", level: 4, link: "https://knowledge.partnersdogs.com/potty-training" },
       { id: "quant_Growling", name: "Growling", level: 2, link: "https://knowledge.partnersdogs.com/growling" },
       { id: "quant_Human_Aggression", name: "Human Aggression", level: 1, link: "https://knowledge.partnersdogs.com/human-aggression" },
       { id: "quant_Insecurity", name: "Insecurity", level: 2, link: "https://knowledge.partnersdogs.com/anxiousness/insecurity" },
       { id: "quant_Jumping", name: "Jumping", level: 2, link: "https://knowledge.partnersdogs.com/jumping/off" },
       { id: "quant_Lunging", name: "Lunging", level: 2, link: "https://knowledge.partnersdogs.com/lunging" },
       { id: "quant_Marking", name: "Marking", level: 2, link: "https://knowledge.partnersdogs.com/marking" },
       { id: "quant_Mounting", name: "Mounting", level: 2, link: "https://knowledge.partnersdogs.com/mounting" },
       { id: "quant_Mouthing", name: "Mouthing (Gentle)", level: 3, link: "https://knowledge.partnersdogs.com/mouthing" },
       { id: "quant_Muzzle_Res", name: "Muzzle Response", level: 3, link: "https://knowledge.partnersdogs.com/muzzle-training" },
       { id: "quant_Neophobia", name: "Neophobia", level: 2, link: "https://knowledge.partnersdogs.com/neophobia" },
       { id: "quant_Nipping", name: "Nipping", level: 3 },
       { id: "quant_OCD", name: "OCD", level: 2, link: "https://knowledge.partnersdogs.com/ocd-behavior" },
       { id: "quant_Opportunistic", name: "Opportunistic Issues", level: 2, link: "https://knowledge.partnersdogs.com/opportunistic-issues" },
       { id: "quant_Possessive", name: "Possessive (protective)", level: 2, link: "https://knowledge.partnersdogs.com/possessive" },
       { id: "quant_Pulling", name: "Pulling", level: 2, link: "https://knowledge.partnersdogs.com/pulling" },
       { id: "quant_Resource_Guarding", name: "Resource Guarding", level: 2, link: "https://knowledge.partnersdogs.com/resource-guarding" },
    ]
  }
];

export const generateHistory = () => {
  const data = [];
  const today = new Date();
  // Start with a base score
  let currentTotal = 180;
  let obedience = 50;
  let social = 40;
  let management = 40;
  let tricks = 50;

  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Add some random fluctuation but generally trending up
    if (i % 7 === 0) {
       currentTotal += Math.floor(Math.random() * 5) + 2;
       obedience += Math.random() > 0.3 ? 1 : 0;
       social += Math.random() > 0.4 ? 1 : 0;
       management += Math.random() > 0.5 ? 1 : 0;
       tricks += Math.random() > 0.6 ? 1 : 0;
    }

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString(),
      score: currentTotal,
      obedience: obedience,
      social: social,
      management: management,
      tricks: tricks
    });
  }
  return data;
};

export const FULL_HISTORY_DATA = generateHistory();

export const RADAR_DATA: RadarPoint[] = [
  { subject: 'Obedience', A: 3.2, fullMark: 5 },
  { subject: 'Social', A: 3.8, fullMark: 5 },
  { subject: 'Tricks', A: 2.5, fullMark: 5 },
  { subject: 'Mgmt', A: 3.5, fullMark: 5 },
  { subject: 'Stress', A: 3.8, fullMark: 5 },
];

export const TRAINER_NOTES: Note[] = [
  {
    id: 1,
    date: "Oct 24, 2023",
    author: "Mike (Senior Trainer)",
    content: "Barnaby is in the 'Proofing' phase for Down. We added duration today. 'Jumping' is still at Level 2 (Often), so we need to strictly ignore him when he jumps.",
    type: "session"
  },
  {
    id: 2,
    date: "Oct 20, 2023",
    author: "System (HubSpot)",
    content: "PD360 Automated Update: 'Sit' promoted to Maintenance (5).",
    type: "system"
  }
];

export const getCurrentGrade = (score: number) => {
  let grade = GRADES[0];
  let nextGrade = GRADES[1];
  
  for (let i = 0; i < GRADES.length; i++) {
    if (score >= GRADES[i].minScore) {
      grade = GRADES[i];
      nextGrade = GRADES[i + 1] || { name: "Graduated", minScore: score, color: "", bg: "", bar: "" };
    }
  }
  return { current: grade, next: nextGrade };
};

// --- COMMUNITY MOCK DATA ---

export const MOCK_POSTS: CommunityPost[] = [
  {
    id: '1',
    authorName: 'Sarah J.',
    authorAvatar: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&q=80&w=100&h=100',
    timeAgo: '2h ago',
    content: 'Barnaby finally hit Level 5 on his "Place" command! He held it for 10 minutes while I cooked dinner. So proud of this guy! 🎓',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    likes: 24,
    comments: 5,
    tags: ['Win', 'Place Command'],
    likedByMe: true
  },
  {
    id: '2',
    authorName: 'Mike T.',
    authorAvatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=100&h=100',
    timeAgo: '5h ago',
    content: 'Question for the group: How do you guys handle "doorbell barking" when you have guests actually coming inside? We are good with the sound, but the entry is still tough.',
    likes: 12,
    comments: 8,
    tags: ['Help Needed', 'Behavior'],
    likedByMe: false
  },
  {
    id: '3',
    authorName: 'Jessica L.',
    authorAvatar: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=100&h=100',
    timeAgo: '1d ago',
    content: 'Pack walk success! Cooper ignored 3 other dogs today. The "Look" cue is a lifesaver.',
    likes: 45,
    comments: 2,
    tags: ['Socialization', 'Heel'],
    likedByMe: false
  }
];

export const MOCK_EVENTS: CommunityEvent[] = [
  {
    id: '1',
    title: 'Saturday Pack Walk',
    date: 'Nov 12',
    time: '9:00 AM',
    location: 'City Park Entrance',
    attendees: 15,
    type: 'Social'
  },
  {
    id: '2',
    title: 'Puppy Social Hour',
    date: 'Nov 14',
    time: '6:00 PM',
    location: 'Partners Facility (Indoor)',
    attendees: 8,
    type: 'Class'
  },
  {
    id: '3',
    title: 'Leash Skills Workshop',
    date: 'Nov 18',
    time: '10:00 AM',
    location: 'Training Field B',
    attendees: 12,
    type: 'Workshop'
  }
];

export const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, dogName: 'Maximus', score: 850, avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=100&h=100', trend: 'stable' },
  { rank: 2, dogName: 'Bella', score: 820, avatar: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=100&h=100', trend: 'up' },
  { rank: 3, dogName: 'Barnaby', score: 285, avatar: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&q=80&w=100&h=100', trend: 'up' },
  { rank: 4, dogName: 'Cooper', score: 210, avatar: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&q=80&w=100&h=100', trend: 'down' },
  { rank: 5, dogName: 'Luna', score: 150, avatar: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&q=80&w=100&h=100', trend: 'stable' },
];
export const LOADING_MESSAGES = [
  "Chasing squirrels...",
  "Fetching your data...",
  "Sniffing out the details...",
  "Calibrating tail wags...",
  "Loading treats...",
  "Herding data packets...",
  "Sitting for the algorithm...",
  "Checking for good boys...",
  "Practicing patience...",
  "Zoomies in progress..."
];

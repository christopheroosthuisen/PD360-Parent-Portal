
import { DogData, OwnerProfile } from './types';
import { getCurrentGrade } from './constants';

// --- HUBSPOT CONFIGURATION ---
// In HubSpot, Custom Objects have a specific ID (e.g., '2-123456' or a name like 'dogs')
export const HUBSPOT_OBJECT_TYPE = 'dogs'; 

// --- TYPES ---
export interface HubSpotProperty {
  property: string;
  value: string | number;
}

export interface HubSpotPayload {
  properties: Record<string, string | number | boolean | null>;
}

// --- HELPER: Formats the Owner Profile for HubSpot Contacts API ---
export const formatHubSpotContact = (owner: OwnerProfile): HubSpotPayload => {
  return {
    properties: {
      email: owner.email,
      firstname: owner.firstName,
      lastname: owner.lastName,
      phone: owner.phone,
      lifecyclestage: 'customer', // Default to customer
    }
  };
};

// --- HELPER: Formats the Dog Data for HubSpot Custom Object API ---
export const formatHubSpotDog = (dog: DogData): HubSpotPayload => {
  const gradeInfo = getCurrentGrade(dog.currentScore);
  
  // Note: HubSpot internal names are usually lowercase snake_case.
  // Ensure these match your actual HubSpot Property Internal Names.
  return {
    properties: {
      dog_name: dog.name,
      breed: dog.breeds.join(';'), // HubSpot uses semicolons for multi-select
      birth_date: new Date(dog.birthDate).valueOf(), // Unix timestamp (ms) often required for Date properties
      gender: dog.sex,
      weight_lbs: dog.weight,
      is_fixed: dog.fixed ? 'true' : 'false',
      
      // Training Metrics
      current_grade: gradeInfo.current.name,
      training_score: dog.currentScore,
      streak_days: dog.streak,
      assigned_trainer: dog.assignedTrainer ? dog.assignedTrainer.name : null,
      
      // Health
      food_brand: dog.foodBrand || null,
      next_vaccination_date: dog.vaccinations.length > 0 ? new Date(dog.vaccinations[0].expiryDate).valueOf() : null,
      
      // System
      last_app_sync: new Date().toISOString()
    }
  };
};

// --- LOGGING ---
export const logSyncData = (dog: DogData) => {
  const contactPayload = formatHubSpotContact(dog.owner);
  const dogPayload = formatHubSpotDog(dog);
  
  console.group("🚀 CRM Sync Payload Prepared");
  console.log("HubSpot Contact Payload:", contactPayload);
  console.log("HubSpot Dog Payload:", dogPayload);
  console.groupEnd();
  
  return { contactPayload, dogPayload };
};

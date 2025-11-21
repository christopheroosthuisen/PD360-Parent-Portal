
import { DogData } from './types';
import { getCurrentGrade } from './constants';

// --- PERSONALIZATION TOKEN DATABASE ---
// This defines the available tokens that can be used in emails, UI, and CRM sync.
export const PERSONALIZATION_TOKENS = {
  // Account & Owner
  ACCOUNT_ID: 'account.id',
  OWNER_FIRST_NAME: 'contact.firstname',
  OWNER_LAST_NAME: 'contact.lastname',
  OWNER_EMAIL: 'contact.email',
  OWNER_PHONE: 'contact.phone',
  
  // Dog Core
  DOG_ID: 'dog.internal_id',
  DOG_CRM_ID: 'dog.crm_id',
  DOG_NAME: 'dog.name',
  DOG_BREED: 'dog.breed', // Comma separated string
  DOG_BIRTHDATE: 'dog.birthdate',
  DOG_AGE: 'dog.age_years',
  DOG_WEIGHT: 'dog.weight_lbs',
  DOG_SEX: 'dog.sex',
  DOG_FIXED: 'dog.fixed_status',
  
  // Training Progress
  TRAINING_GRADE: 'dog.training_grade', // e.g. "Elementary"
  TRAINING_SCORE: 'dog.total_score',
  TRAINING_STREAK: 'dog.streak_days',
  TRAINING_ASSIGNED_TRAINER: 'dog.assigned_trainer_name',
  
  // Health & Care
  HOME_FACILITY: 'dog.home_facility',
  VET_NAME: 'dog.vet_name',
  VET_CLINIC: 'dog.vet_clinic',
  FOOD_BRAND: 'dog.food_brand',
  NEXT_VAX_DUE: 'dog.next_vaccination_date',
  
  // System
  LAST_SYNC: 'system.last_sync_timestamp'
};

// --- HELPER: Age Calculation ---
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
  return years;
};

// --- HELPER: Next Vax ---
const getNextVaxDate = (dog: DogData): string => {
  if (!dog.vaccinations.length) return '';
  const sorted = [...dog.vaccinations].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  return sorted[0].expiryDate;
};

// --- CRM MAPPING FUNCTION ---
// Converts the complex DogData object into a flat key-value map matching the Tokens
export const mapDogToCRM = (dog: DogData): Record<string, string | number | boolean> => {
  const gradeInfo = getCurrentGrade(dog.currentScore);
  
  return {
    // Account
    [PERSONALIZATION_TOKENS.ACCOUNT_ID]: dog.accountId,
    [PERSONALIZATION_TOKENS.OWNER_FIRST_NAME]: dog.owner.firstName,
    [PERSONALIZATION_TOKENS.OWNER_LAST_NAME]: dog.owner.lastName,
    [PERSONALIZATION_TOKENS.OWNER_EMAIL]: dog.owner.email,
    [PERSONALIZATION_TOKENS.OWNER_PHONE]: dog.owner.phone,

    // Dog
    [PERSONALIZATION_TOKENS.DOG_ID]: dog.id,
    [PERSONALIZATION_TOKENS.DOG_CRM_ID]: dog.crmId,
    [PERSONALIZATION_TOKENS.DOG_NAME]: dog.name,
    [PERSONALIZATION_TOKENS.DOG_BREED]: dog.breeds.join(', '),
    [PERSONALIZATION_TOKENS.DOG_BIRTHDATE]: dog.birthDate,
    [PERSONALIZATION_TOKENS.DOG_AGE]: calculateAge(dog.birthDate),
    [PERSONALIZATION_TOKENS.DOG_WEIGHT]: dog.weight,
    [PERSONALIZATION_TOKENS.DOG_SEX]: dog.sex,
    [PERSONALIZATION_TOKENS.DOG_FIXED]: dog.fixed,

    // Training
    [PERSONALIZATION_TOKENS.TRAINING_GRADE]: gradeInfo.current.name,
    [PERSONALIZATION_TOKENS.TRAINING_SCORE]: dog.currentScore,
    [PERSONALIZATION_TOKENS.TRAINING_STREAK]: dog.streak,
    [PERSONALIZATION_TOKENS.TRAINING_ASSIGNED_TRAINER]: dog.assignedTrainer ? dog.assignedTrainer.name : 'Unassigned',

    // Health / Ops
    [PERSONALIZATION_TOKENS.HOME_FACILITY]: dog.homeFacilityId || 'Unassigned', // In real app, map ID to Name
    [PERSONALIZATION_TOKENS.VET_NAME]: dog.veterinarian?.name || '',
    [PERSONALIZATION_TOKENS.VET_CLINIC]: dog.veterinarian?.clinicName || '',
    [PERSONALIZATION_TOKENS.FOOD_BRAND]: dog.foodBrand || '',
    [PERSONALIZATION_TOKENS.NEXT_VAX_DUE]: getNextVaxDate(dog),
    
    // System
    [PERSONALIZATION_TOKENS.LAST_SYNC]: new Date().toISOString()
  };
};

export const logSyncData = (dog: DogData) => {
  const crmPayload = mapDogToCRM(dog);
  console.group("🚀 CRM Sync Payload");
  console.log("Syncing to Account ID:", dog.accountId);
  console.log("HubSpot Object ID:", dog.crmId);
  console.table(crmPayload);
  console.groupEnd();
  return crmPayload;
};

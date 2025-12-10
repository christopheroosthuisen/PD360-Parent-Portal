
import { DogData } from '../types';
import { formatHubSpotContact, formatHubSpotDog, HUBSPOT_OBJECT_TYPE } from '../crmSystem';

/**
 * SECURITY NOTE:
 * In a production environment, you should NEVER expose your HubSpot Private App Access Token
 * in the frontend code (REACT_APP_...).
 * 
 * Instead, this service should call your own backend endpoints (e.g., Firebase Cloud Functions),
 * which then securely communicate with HubSpot.
 * 
 * For this implementation, we will simulate the direct call structure or use the environment variable
 * if you are accepting the risk for an internal/prototype tool.
 */

const HUBSPOT_API_BASE = 'https://api.hubapi.com/crm/v3/objects';
const ACCESS_TOKEN = typeof process !== 'undefined' ? process.env.REACT_APP_HUBSPOT_ACCESS_TOKEN : undefined;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ACCESS_TOKEN}`
};

export const HubSpotService = {
  
  /**
   * Syncs the Dog and Owner to HubSpot.
   * 1. Search/Create Contact (Owner).
   * 2. Search/Create Dog (Custom Object).
   * 3. Associate them.
   */
  syncData: async (dogData: DogData): Promise<void> => {
    if (!ACCESS_TOKEN) {
      console.warn("HubSpot Sync Skipped: Missing REACT_APP_HUBSPOT_ACCESS_TOKEN");
      return;
    }

    try {
      // 1. Sync Owner (Contact)
      const contactId = await HubSpotService.upsertContact(dogData);
      
      // 2. Sync Dog (Custom Object)
      const dogObjectId = await HubSpotService.upsertDogObject(dogData);

      // 3. Associate Dog to Contact
      if (contactId && dogObjectId) {
        await HubSpotService.associateObjects(contactId, dogObjectId);
      }
      
      console.log("✅ HubSpot Sync Complete");
    } catch (error) {
      console.error("HubSpot Sync Failed:", error);
      throw error;
    }
  },

  upsertContact: async (dogData: DogData): Promise<string | null> => {
    const payload = formatHubSpotContact(dogData.owner);
    
    // A. Search for existing contact by email
    const searchResponse = await fetch(`${HUBSPOT_API_BASE}/contacts/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: dogData.owner.email }] }]
      })
    });
    
    const searchResult = await searchResponse.json();
    
    if (searchResult.total > 0) {
      // Update existing
      const contactId = searchResult.results[0].id;
      await fetch(`${HUBSPOT_API_BASE}/contacts/${contactId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      });
      return contactId;
    } else {
      // Create new
      const createResponse = await fetch(`${HUBSPOT_API_BASE}/contacts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const created = await createResponse.json();
      return created.id;
    }
  },

  upsertDogObject: async (dogData: DogData): Promise<string | null> => {
    const payload = formatHubSpotDog(dogData);
    
    // Typically we store the HubSpot Object ID in our database (dogData.crmId).
    // If we have it, update. If not, create.
    
    if (dogData.crmId && dogData.crmId.startsWith('HS_')) {
       // Extract raw ID if stored with prefix
       const rawId = dogData.crmId.replace('HS_', '');
       await fetch(`${HUBSPOT_API_BASE}/${HUBSPOT_OBJECT_TYPE}/${rawId}`, {
         method: 'PATCH',
         headers,
         body: JSON.stringify(payload)
       });
       return rawId;
    } else {
       // Create new Dog Object
       // Note: This endpoint assumes 'dogs' is the valid schema name/ID
       const createResponse = await fetch(`${HUBSPOT_API_BASE}/${HUBSPOT_OBJECT_TYPE}`, {
         method: 'POST',
         headers,
         body: JSON.stringify(payload)
       });
       
       if (!createResponse.ok) {
           const err = await createResponse.json();
           console.error("Failed to create HubSpot Dog Object:", err);
           return null;
       }

       const created = await createResponse.json();
       return created.id;
    }
  },

  associateObjects: async (contactId: string, dogObjectId: string): Promise<void> => {
    // Association Type ID depends on how the association was defined in HubSpot.
    // Standard Contact->Custom Object association is often specific.
    // For this generic code, we assume a standard definition or we list generic IDs.
    // You must find the Association Type ID via HubSpot API: /crm/v4/associations/definitions
    const associationTypeId = 1; // Replace with actual ID (e.g., 'dog_to_contact')

    await fetch(`${HUBSPOT_API_BASE}/${HUBSPOT_OBJECT_TYPE}/${dogObjectId}/associations/contacts/${contactId}/${associationTypeId}`, {
      method: 'PUT',
      headers
    });
  }
};

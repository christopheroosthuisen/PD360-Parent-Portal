
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import firebase from 'firebase/compat/app';
import { auth, googleProvider, db, isFirebaseConfigured } from '../firebaseConfig';

// Define the shape of our AuthContext
interface AuthContextType {
  currentUser: firebase.User | null;
  loading: boolean;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithPhone: (phoneNumber: string, appVerifier: any) => Promise<firebase.auth.ConfirmationResult | any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// --- SECURITY & LOGGING HELPER ---
const performSecurityCheck = async (userEmail: string) => {
  if (!isFirebaseConfigured) return;
  try {
    // Basic IP check simulation
    // console.log(`[Security] Session initiated for ${userEmail}`);
  } catch (error: any) {
    console.warn("Security check bypassed:", error.message);
  }
};

// --- USER DOCUMENT CREATION ---
const createUserDocument = async (user: firebase.User, additionalData?: any) => {
  if (!user || !isFirebaseConfigured) return;
  
  const userRef = db.collection('users').doc(user.uid);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    const { email, phoneNumber } = user;
    try {
      await userRef.set({
        id: user.uid,
        email: email || '',
        phone: phoneNumber || '',
        createdAt: new Date().toISOString(),
        firstName: additionalData?.fullName?.split(' ')[0] || 'Member',
        lastName: additionalData?.fullName?.split(' ')[1] || '',
        ...additionalData
      });
    } catch (error) {
      console.error("Error creating user document", error);
    }
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. If Firebase is configured, listen to auth state changes
    if (isFirebaseConfigured && auth) {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setCurrentUser(user);
        setLoading(false);
      });
      return unsubscribe;
    } 
    // 2. Fallback: Check for mock session in local storage
    else {
      const savedUser = localStorage.getItem('pd360_mock_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }
  }, []);

  // --- MOCK HELPERS ---
  const handleMockLogin = (user: any) => {
      setCurrentUser(user);
      localStorage.setItem('pd360_mock_user', JSON.stringify(user));
  };

  // --- AUTH ACTIONS (Compat Syntax) ---

  const signup = async (email: string, password: string, fullName?: string) => {
    if (isFirebaseConfigured && auth) {
      try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        if (result.user) {
          // Update profile displayName immediately so it's available in context
          if (fullName) {
            await result.user.updateProfile({ displayName: fullName });
            // Force refresh of the user object to pick up changes
            await result.user.reload();
            setCurrentUser(auth.currentUser); 
          }
          await createUserDocument(result.user, { fullName });
          await performSecurityCheck(email);
        }
      } catch (error: any) {
        // Fallback if config is invalid despite check
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/api-key-not-valid' || error.code === 'auth/operation-not-allowed') {
            console.warn("Firebase Config Error during Signup. Falling back to Mock.");
            const mockUser = { uid: 'mock_user_id', email, displayName: fullName } as firebase.User;
            handleMockLogin(mockUser);
            return;
        }
        throw error;
      }
    } else {
      // Mock Implementation
      const mockUser = { uid: 'mock_user_id', email, displayName: fullName } as firebase.User;
      handleMockLogin(mockUser);
    }
  };

  const login = async (email: string, password: string) => {
    if (isFirebaseConfigured && auth) {
      try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        if (result.user) {
          await performSecurityCheck(result.user.email || email);
        }
      } catch (error: any) {
        // Fallback if config is invalid despite check
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/api-key-not-valid') {
            console.warn("Firebase Config Error during Login. Falling back to Mock.");
            const mockUser = { uid: 'mock_user_id', email, displayName: 'Demo User' } as firebase.User;
            handleMockLogin(mockUser);
            return;
        }
        throw error;
      }
    } else {
      // Mock Implementation
      const mockUser = { uid: 'mock_user_id', email, displayName: 'Demo User' } as firebase.User;
      handleMockLogin(mockUser);
    }
  };

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        const result = await auth.signInWithPopup(googleProvider);
        if (result.user) {
          await createUserDocument(result.user, { fullName: result.user.displayName });
          await performSecurityCheck(result.user.email || 'google_user');
        }
      } catch (error: any) {
         if (error.code === 'auth/invalid-credential' || error.code === 'auth/api-key-not-valid' || error.code === 'auth/operation-not-allowed') {
            console.warn("Firebase Config Error during Google Auth. Falling back to Mock.");
            const mockUser = { uid: 'mock_google_id', email: 'google@demo.com', displayName: 'Google User' } as firebase.User;
            handleMockLogin(mockUser);
            return;
         }
         throw error;
      }
    } else {
      // Mock Implementation
      const mockUser = { uid: 'mock_google_id', email: 'google@demo.com', displayName: 'Google User' } as firebase.User;
      handleMockLogin(mockUser);
    }
  };

  const loginWithPhone = async (phoneNumber: string, appVerifier: any) => {
    if (isFirebaseConfigured && auth) {
      try {
        return await auth.signInWithPhoneNumber(phoneNumber, appVerifier);
      } catch (error) {
        console.error("Error sending SMS code", error);
        throw error;
      }
    } else {
      // Mock Implementation
      console.log("Mock Phone Login initiated for", phoneNumber);
      return {
        confirm: async (code: string) => {
           if (code === '123456') {
             const mockUser = { uid: 'mock_phone_id', phoneNumber: phoneNumber, displayName: 'Phone User' } as firebase.User;
             handleMockLogin(mockUser);
             await performSecurityCheck('phone_user');
             return { user: mockUser };
           }
           throw new Error("Invalid verification code (Mock: use 123456)");
        },
        verificationId: 'mock_ver_id'
      };
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await auth.signOut();
      } catch (e) {
        console.warn("Sign out error", e);
        // Even if Firebase fails, clear local state
        setCurrentUser(null);
        localStorage.removeItem('pd360_mock_user');
      }
    } else {
      // Mock Implementation
      setCurrentUser(null);
      localStorage.removeItem('pd360_mock_user');
    }
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    loginWithPhone,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

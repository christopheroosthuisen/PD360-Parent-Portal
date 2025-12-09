
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  User 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, isFirebaseConfigured } from '../firebaseConfig';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithPhone: (phoneNumber: string, appVerifier: any) => Promise<ConfirmationResult | any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// --- IP SECURITY CHECK (Mock Implementation) ---
const performSecurityCheck = async (userEmail: string) => {
  // Logic preserved from previous version
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    if (data.error) return; 

    const currentSession = {
      ip: data.ip,
      country: data.country_name,
      city: data.city,
      timestamp: new Date().toISOString(),
      email: userEmail
    };

    const storageKey = `pd360_security_${userEmail}`;
    const lastSessionStr = localStorage.getItem(storageKey);

    if (lastSessionStr) {
      const lastSession = JSON.parse(lastSessionStr);
      const msDiff = new Date(currentSession.timestamp).getTime() - new Date(lastSession.timestamp).getTime();
      const hoursDiff = msDiff / (1000 * 60 * 60);

      if (lastSession.country !== currentSession.country && hoursDiff < 24) {
        console.warn(`SECURITY ALERT: Suspicious travel detected.`);
      }
    }
    localStorage.setItem(storageKey, JSON.stringify(currentSession));
  } catch (error: any) {
    console.warn("Security check bypassed:", error.message);
  }
};

const createUserDocument = async (user: User, additionalData?: any) => {
  if (!user || !isFirebaseConfigured) return;
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { email, phoneNumber } = user;
    const createdAt = new Date().toISOString();
    try {
      await setDoc(userRef, {
        id: user.uid,
        email: email || '',
        phone: phoneNumber || '',
        createdAt,
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Mock Auth Initialization
      // Check local storage to persist mock session
      const savedUser = localStorage.getItem('pd360_mock_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }
  }, []);

  const signup = async (email: string, password: string, fullName?: string) => {
    if (isFirebaseConfigured) {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createUserDocument(result.user, { fullName });
      await performSecurityCheck(email);
    } else {
      // Mock Signup
      const mockUser = { uid: 'mock_user_id', email, displayName: fullName } as User;
      setCurrentUser(mockUser);
      localStorage.setItem('pd360_mock_user', JSON.stringify(mockUser));
    }
  };

  const login = async (email: string, password: string) => {
    if (isFirebaseConfigured) {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await performSecurityCheck(result.user.email || email);
    } else {
      // Mock Login
      const mockUser = { uid: 'mock_user_id', email, displayName: 'Demo User' } as User;
      setCurrentUser(mockUser);
      localStorage.setItem('pd360_mock_user', JSON.stringify(mockUser));
    }
  };

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured) {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserDocument(result.user, { fullName: result.user.displayName });
      await performSecurityCheck(result.user.email || 'google_user');
    } else {
      // Mock Google Login
      const mockUser = { uid: 'mock_google_id', email: 'google@demo.com', displayName: 'Google User' } as User;
      setCurrentUser(mockUser);
      localStorage.setItem('pd360_mock_user', JSON.stringify(mockUser));
    }
  };

  const loginWithPhone = async (phoneNumber: string, appVerifier: any) => {
    if (isFirebaseConfigured) {
      try {
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        return confirmationResult;
      } catch (error) {
        console.error("Error sending SMS code", error);
        throw error;
      }
    } else {
      // Mock Phone Login Flow
      console.log("Mock Phone Login initiated for", phoneNumber);
      return {
        confirm: async (code: string) => {
           if (code === '123456') {
             const mockUser = { uid: 'mock_phone_id', phoneNumber: phoneNumber, displayName: 'Phone User' } as User;
             setCurrentUser(mockUser);
             localStorage.setItem('pd360_mock_user', JSON.stringify(mockUser));
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
    if (isFirebaseConfigured) {
      return signOut(auth);
    } else {
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

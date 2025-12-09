
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// --- IP SECURITY CHECK ---
const performSecurityCheck = async (userEmail: string) => {
  try {
    // 1. Fetch current IP and Location
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.error) {
      console.warn("Could not fetch IP data for security check.");
      return; // Fail open if API is down, or implement strict mode based on requirements
    }

    const currentSession = {
      ip: data.ip,
      country: data.country_name,
      city: data.city,
      timestamp: new Date().toISOString(),
      email: userEmail
    };

    // 2. Retrieve last known session
    const storageKey = `pd360_security_${userEmail}`;
    const lastSessionStr = localStorage.getItem(storageKey);

    if (lastSessionStr) {
      const lastSession = JSON.parse(lastSessionStr);
      
      // 3. Security Logic: Country Jump within 24 hours
      const msDiff = new Date(currentSession.timestamp).getTime() - new Date(lastSession.timestamp).getTime();
      const hoursDiff = msDiff / (1000 * 60 * 60);

      if (lastSession.country !== currentSession.country && hoursDiff < 24) {
        // FLAGGED
        console.error(`SECURITY ALERT: Impossible travel detected from ${lastSession.country} to ${currentSession.country} in ${hoursDiff.toFixed(1)} hours.`);
        // In a real app, we would:
        // 1. Log this to Firestore 'security_logs' collection
        // 2. Potentially block access or require 2FA
        // For this implementation, we will throw an error to block the UI login flow
        throw new Error(`Security Alert: Login blocked due to suspicious location change (${lastSession.country} to ${currentSession.country}). Please contact support.`);
      }
    }

    // 4. Update local record (Mocking DB persistence)
    localStorage.setItem(storageKey, JSON.stringify(currentSession));
    
  } catch (error: any) {
    // Pass the specific security error up, ignore fetch errors
    if (error.message.includes('Security Alert')) throw error;
    console.error("Security check failed:", error);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
    await performSecurityCheck(email);
  };

  const login = async (email: string, password: string) => {
    // 1. Verify Credentials
    const result = await signInWithEmailAndPassword(auth, email, password);
    // 2. Perform Security Check
    await performSecurityCheck(result.user.email || email);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await performSecurityCheck(result.user.email || 'google_user');
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

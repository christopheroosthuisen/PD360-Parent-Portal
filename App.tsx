
import React, { useState, useEffect } from 'react';
import { Sidebar, AppLoadingScreen } from './components/UI';
import { Dashboard } from './components/Dashboard';
import { TrainingHub } from './components/TrainingHub';
import { IzzyChat } from './components/IzzyChat';
import { DogProfile } from './components/DogProfile';
import { CommunityHub } from './components/CommunityHub';
import { LearningCenter } from './components/LearningCenter';
import { Marketplace } from './components/Marketplace';
import { Auth } from './components/Auth'; // Legacy
import { Support } from './components/Support';
import { Footer } from './components/Footer';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { TermsOfService } from './pages/legal/TermsOfService';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { NotFound } from './pages/NotFound';
import { ServerError } from './pages/ServerError';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getCurrentGrade, MOCK_DOGS } from './constants';
import { Menu } from 'lucide-react';
import { DogData } from './types';
import { CartProvider } from './CartContext';
import { logSyncData } from './crmSystem';
import { Logo } from './components/Logo';
import { DataService } from './services/dataService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CartDrawer } from './components/CartDrawer';

// Wrapper component to handle routing logic inside AuthContext
const AppContent = () => {
  const [activeView, setActiveView] = useState('login'); // Default start at login
  const [activeHubTab, setActiveHubTab] = useState<string | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Auth state
  const { currentUser, loading: authLoading, logout } = useAuth();

  // Multi-Dog State
  const [dogs, setDogs] = useState<DogData[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string>('');

  const selectedDog = dogs.find(d => d.id === selectedDogId) || dogs[0];
  const gradeInfo = selectedDog ? getCurrentGrade(selectedDog.currentScore) : getCurrentGrade(0);

  // Effect: Handle initial redirect based on auth status
  useEffect(() => {
    if (!authLoading) {
      if (currentUser && (activeView === 'login' || activeView === 'signup')) {
        setActiveView('dashboard');
      } else if (!currentUser && !['signup', 'forgot-password', 'privacy', 'terms', '404', '500'].includes(activeView)) {
        setActiveView('login');
      }
    }
  }, [currentUser, authLoading]);

  // Initial Load: Fetch Data from Service
  useEffect(() => {
    const initApp = async () => {
      // Only fetch data if logged in
      if (!currentUser) {
        setIsLoaded(true); // Stop loading screen if just waiting for login
        return; 
      }

      try {
        const fetchedDogs = await DataService.fetchDogs(currentUser.uid);
        
        // --- DEV DEMO FALLBACK ---
        // If user has no dogs in DB, load the mock for demonstration purposes
        if (fetchedDogs.length === 0) {
           setDogs(MOCK_DOGS);
           setSelectedDogId(MOCK_DOGS[0].id);
        } else {
           setDogs(fetchedDogs);
           setSelectedDogId(fetchedDogs[0].id);
        }
      } catch (error) {
        console.error("Failed to load application data", error);
        // Optional: setActiveView('500'); if critical data fails
      } finally {
        setIsLoaded(true);
      }
    };

    if (!authLoading) {
      initApp();
    }
  }, [currentUser, authLoading]);

  const handleSync = async () => {
    setIsSyncing(true);
    if (selectedDog) {
      try {
        // Log locally
        logSyncData(selectedDog);
        // Execute actual HubSpot Sync
        await DataService.syncToCrm(selectedDog);
      } catch (e) {
        console.error("Sync error", e);
      }
    }
    
    // Simulate UI refresh feeling
    setTimeout(() => {
      setIsSyncing(false);
      const updatedDogs = dogs.map(d => {
         if (d.id === selectedDogId) {
            return { ...d, lastSync: "Just now" };
         }
         return d;
      });
      setDogs(updatedDogs);
    }, 1000);
  };

  const handleDogUpdate = async (updatedDog: DogData) => {
     const newDogs = dogs.map(d => d.id === updatedDog.id ? updatedDog : d);
     setDogs(newDogs);
     await DataService.updateDog(updatedDog.id, updatedDog);
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setActiveHubTab(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDashboardNav = (view: string, tab?: string) => {
    setActiveView(view);
    if (tab) setActiveHubTab(tab);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await logout();
      setActiveView('login');
    }
  };

  // 1. Global Loading State (Auth or Data)
  if (authLoading || (!isLoaded && currentUser)) {
    return <AppLoadingScreen />;
  }

  // 2. Public / Error Pages (No protection needed)
  if (activeView === '404') {
    return <NotFound onNavigate={handleViewChange} />;
  }
  if (activeView === '500') {
    return <ServerError onNavigate={handleViewChange} />;
  }
  if (activeView === 'login') {
    return <Login onNavigate={handleViewChange} onLoginSuccess={() => setActiveView('dashboard')} />;
  }
  if (activeView === 'signup') {
    return <Signup onNavigate={handleViewChange} onLoginSuccess={() => setActiveView('dashboard')} />;
  }
  if (activeView === 'forgot-password') {
     return <Auth view="forgot-password" onNavigate={handleViewChange} onLogin={() => setActiveView('dashboard')} />;
  }

  // 3. Protected App View
  // If no dog loaded yet but authenticated (and loaded), show onboarding or fallback
  if (currentUser && dogs.length === 0 && isLoaded) {
     return <div className="flex items-center justify-center h-screen">No Dogs Found. Create One (Feature Coming Soon)</div>;
  }

  // Fallback for types safety
  if (!selectedDog) return <AppLoadingScreen />;

  return (
    <ProtectedRoute onRedirect={setActiveView}>
      <CartProvider>
        <div className="flex h-screen bg-white font-sans text-pd-slate overflow-hidden">
          <CartDrawer />
          <Sidebar 
            activeView={activeView} 
            setActiveView={handleViewChange} 
            dogs={dogs}
            selectedDogId={selectedDogId}
            onSelectDog={setSelectedDogId}
            gradeName={gradeInfo.current.name}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            onLogout={handleLogout}
          />

          <main className="flex-1 overflow-y-auto relative h-full bg-slate-50">
            {/* Mobile Header */}
            <div className="lg:hidden h-20 bg-white border-b-2 border-pd-lightest flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-pd-darkblue p-2 hover:bg-pd-lightest rounded-lg transition">
                  <Menu size={28} />
                </button>
                <Logo variant="mobile" />
              </div>
              <div className="w-10 h-10 bg-pd-teal rounded-xl flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-md">
                {selectedDog.name[0]}
              </div>
            </div>

            <div className="p-6 lg:p-8 max-w-7xl mx-auto min-h-full flex flex-col">
              <div className="flex-1">
                {activeView === 'dashboard' && (
                  <Dashboard 
                    dogData={selectedDog} 
                    gradeInfo={gradeInfo} 
                    isSyncing={isSyncing} 
                    onSync={handleSync}
                    navigate={handleDashboardNav}
                  />
                )}
                
                {activeView === 'training_hub' && (
                  <TrainingHub 
                    dogData={selectedDog} 
                    initialTab={activeHubTab as any} 
                  />
                )}
                
                {activeView === 'learning' && <LearningCenter dogData={selectedDog} />}
                
                {activeView === 'marketplace' && (
                  <Marketplace 
                    dogData={selectedDog} 
                    initialTab={activeHubTab as any} 
                  />
                )}

                {activeView === 'profile' && (
                  <DogProfile dog={selectedDog} onUpdate={handleDogUpdate} />
                )}

                {activeView === 'community' && (
                  <CommunityHub 
                    dogData={selectedDog} 
                    defaultTab={activeHubTab as any || 'feed'} 
                  />
                )}

                {activeView === 'support' && <Support onNavigate={handleViewChange} />}
                
                {/* Legal Pages (Protected View Version) */}
                {activeView === 'privacy' && <PrivacyPolicy />}
                {activeView === 'terms' && <TermsOfService />}
              </div>

              {/* Footer */}
              <div className="mt-auto">
                 <Footer onNavigate={handleViewChange} />
              </div>
            </div>
          </main>
          
          {/* Persistent Chatbot with context of selected dog */}
          <IzzyChat dogData={selectedDog} />
        </div>
      </CartProvider>
    </ProtectedRoute>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

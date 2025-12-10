
import React, { useState, useEffect } from 'react';
import { Sidebar, AppLoadingScreen, Button, Card } from './components/UI';
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
import { Menu, Plus, Dog } from 'lucide-react';
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
  const [isCreatingDog, setIsCreatingDog] = useState(false);
  
  // Onboarding State
  const [onboardingName, setOnboardingName] = useState('');
  const [onboardingBreed, setOnboardingBreed] = useState('');
  
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
        // If user has no dogs in DB, we leave it empty to trigger onboarding flow
        if (fetchedDogs.length === 0) {
           setDogs([]);
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

  const handleCreateDog = async () => {
    if (!currentUser) return;
    
    // Basic validation
    if (!onboardingName.trim()) {
        alert("Please enter your dog's name.");
        return;
    }

    setIsCreatingDog(true);
    try {
      const displayName = currentUser.displayName || 'Owner';
      const [firstName, ...rest] = displayName.split(' ');
      const lastName = rest.join(' ');

      // Create profile with user inputs
      const newDogTemplate: Omit<DogData, 'id'> = {
        ownerId: currentUser.uid, // Root level ID for security/indexing
        crmId: '',
        accountId: 'acc_' + Date.now(),
        name: onboardingName,
        breeds: onboardingBreed ? [onboardingBreed] : ['Mixed Breed'],
        birthDate: new Date().toISOString(),
        sex: 'Male', // Default, editable later
        fixed: false,
        weight: 0,
        color: 'Unknown',
        avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
        owner: { 
            id: currentUser.uid, 
            firstName: firstName || 'Owner', 
            lastName: lastName || '', 
            email: currentUser.email || '', 
            phone: currentUser.phoneNumber || '' 
        },
        emergencyContact: { firstName: '', lastName: '', phone: '', email: '', relation: '' },
        notificationSettings: { email: true, push: true, sms: false, marketing: false },
        currentScore: 0,
        streak: 0,
        achievements: [],
        medications: [],
        allergies: [],
        vaccinations: [],
        homeType: 'House',
        hasYard: false,
        siblings: []
      };

      const newId = await DataService.createDog(newDogTemplate);
      const createdDog = { ...newDogTemplate, id: newId } as DogData;
      setDogs([...dogs, createdDog]);
      setSelectedDogId(newId);
      setActiveView('dashboard'); // Go straight to dashboard after creation
    } catch (e) {
      console.error("Failed to create dog", e);
      alert("Could not create profile. Please try again.");
    } finally {
      setIsCreatingDog(false);
    }
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
    try {
      await logout();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
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

  // 3. Protected App View - Onboarding State
  if (currentUser && dogs.length === 0 && isLoaded) {
     return (
        <div className="flex flex-col items-center justify-center h-screen bg-pd-lightest p-4 relative overflow-hidden">
           {/* Decorative bg */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-pd-teal rounded-full opacity-10 -mr-20 -mt-20 blur-3xl"></div>
           <div className="absolute bottom-0 left-0 w-80 h-80 bg-pd-yellow rounded-full opacity-5 -ml-20 -mb-20 blur-3xl"></div>

           <Card className="max-w-md w-full text-center py-12 px-8 relative z-10 border-4 border-pd-lightest/50">
              <div className="w-24 h-24 bg-pd-teal rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-white ring-4 ring-pd-lightest">
                 <Dog size={48} />
              </div>
              <h2 className="font-impact text-3xl text-pd-darkblue uppercase mb-2">Welcome to the Pack!</h2>
              <p className="text-pd-slate font-medium mb-8">Let's get started by creating a profile for your dog.</p>
              
              <div className="space-y-4 mb-8 text-left">
                  <div>
                      <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-1 block">Dog's Name</label>
                      <input 
                          type="text" 
                          placeholder="e.g. Barnaby" 
                          value={onboardingName}
                          onChange={(e) => setOnboardingName(e.target.value)}
                          className="w-full p-4 bg-pd-lightest/30 border-2 border-pd-lightest rounded-xl focus:border-pd-teal outline-none font-medium text-pd-darkblue transition-colors text-lg"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-1 block">Breed (Optional)</label>
                      <input 
                          type="text" 
                          placeholder="e.g. Golden Retriever" 
                          value={onboardingBreed}
                          onChange={(e) => setOnboardingBreed(e.target.value)}
                          className="w-full p-4 bg-pd-lightest/30 border-2 border-pd-lightest rounded-xl focus:border-pd-teal outline-none font-medium text-pd-darkblue transition-colors text-lg"
                      />
                  </div>
              </div>

              <Button 
                variant="primary" 
                className="w-full !py-4 !text-lg shadow-xl" 
                onClick={handleCreateDog}
                disabled={isCreatingDog || !onboardingName.trim()}
                icon={Plus}
              >
                 {isCreatingDog ? "Creating Profile..." : "Create Profile"}
              </Button>
              
              <button onClick={handleLogout} className="mt-6 text-sm text-pd-softgrey hover:text-pd-darkblue font-bold uppercase tracking-wide">
                 Log Out
              </button>
           </Card>
        </div>
     );
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

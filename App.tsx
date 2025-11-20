
import React, { useState, useEffect } from 'react';
import { Sidebar, AppLoadingScreen } from './components/UI';
import { Dashboard } from './components/Dashboard';
import { TrainingHub } from './components/TrainingHub';
import { IzzyChat } from './components/IzzyChat';
import { DogProfile } from './components/DogProfile';
import { CommunityHub } from './components/CommunityHub';
import { LearningCenter } from './components/LearningCenter';
import { Shop } from './components/Shop';
import { MOCK_DOGS, getCurrentGrade } from './constants';
import { Menu } from 'lucide-react';
import { DogData } from './types';
import { CartProvider } from './CartContext';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  // State to handle deep linking to specific tabs within hubs
  const [activeHubTab, setActiveHubTab] = useState<string | undefined>(undefined);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Multi-Dog State
  const [dogs, setDogs] = useState<DogData[]>(MOCK_DOGS);
  const [selectedDogId, setSelectedDogId] = useState<string>(MOCK_DOGS[0].id);

  const selectedDog = dogs.find(d => d.id === selectedDogId) || dogs[0];
  const gradeInfo = getCurrentGrade(selectedDog.currentScore);

  // Initial Load Simulation
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 2000);
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // Update selected dog score
      const updatedDogs = dogs.map(d => {
         if (d.id === selectedDogId) {
            return { ...d, currentScore: Math.min(d.currentScore + 10, 900), lastSync: "Just now" };
         }
         return d;
      });
      setDogs(updatedDogs);
    }, 2000);
  };

  const handleDogUpdate = (updatedDog: DogData) => {
     const newDogs = dogs.map(d => d.id === updatedDog.id ? updatedDog : d);
     setDogs(newDogs);
  };

  // Navigation helper to reset tab state when switching main views via Sidebar
  const handleViewChange = (view: string) => {
    setActiveView(view);
    setActiveHubTab(undefined);
  };

  // Navigation helper for Dashboard widgets to set specific tabs
  const handleDashboardNav = (view: string, tab?: string) => {
    setActiveView(view);
    if (tab) setActiveHubTab(tab);
  };

  if (!isLoaded) {
    return <AppLoadingScreen />;
  }

  return (
    <CartProvider>
      <div className="flex h-screen bg-white font-sans text-pd-slate overflow-hidden">
        <Sidebar 
          activeView={activeView} 
          setActiveView={handleViewChange} 
          dogs={dogs}
          selectedDogId={selectedDogId}
          onSelectDog={setSelectedDogId}
          gradeName={gradeInfo.current.name}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="flex-1 overflow-y-auto relative h-full bg-slate-50">
          {/* Mobile Header */}
          <div className="lg:hidden h-20 bg-white border-b-2 border-pd-lightest flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="text-pd-darkblue p-2 hover:bg-pd-lightest rounded-lg transition">
                <Menu size={28} />
              </button>
              <span className="font-impact text-2xl text-pd-darkblue tracking-wide">PD360</span>
            </div>
            <div className="w-10 h-10 bg-pd-teal rounded-xl flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-md">
              {selectedDog.name[0]}
            </div>
          </div>

          <div className="p-6 lg:p-8 max-w-7xl mx-auto pb-32">
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
            
            {activeView === 'shop' && <Shop />}

            {activeView === 'profile' && (
              <DogProfile dog={selectedDog} onUpdate={handleDogUpdate} />
            )}

            {(activeView === 'community') && (
              <CommunityHub 
                dogData={selectedDog} 
                defaultTab={activeHubTab as any || 'feed'} 
              />
            )}
          </div>
        </main>
        
        {/* Persistent Chatbot with context of selected dog */}
        <IzzyChat dogData={selectedDog} />
      </div>
    </CartProvider>
  );
}


import React, { useState } from 'react';
import { Coach } from '../types';
import { MOCK_COACHES } from '../constants';
import { Card, Button } from './UI';
import { Star, MapPin, Calendar, Video, Users, GraduationCap, CheckCircle, X } from 'lucide-react';
import { DataService } from '../services/dataService';

export const Coaching: React.FC = () => {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [bookingStep, setBookingStep] = useState<'profile' | 'schedule' | 'confirm'>('profile');
  const [sessionType, setSessionType] = useState<'virtual' | 'in-person'>('virtual');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const filteredCoaches = MOCK_COACHES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookClick = (coach: Coach) => {
    setSelectedCoach(coach);
    setBookingStep('schedule');
    setSessionType('virtual'); // Default
    setSelectedSlotId(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedCoach || !selectedSlotId) return;
    setIsBooking(true);
    await DataService.bookCoachingSession('user_1', selectedCoach.id, selectedSlotId, sessionType);
    setIsBooking(false);
    setBookingStep('confirm');
  };

  const resetBooking = () => {
    setSelectedCoach(null);
    setBookingStep('profile');
  };

  const formatSlotTime = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ` (${d.toLocaleDateString()})`;
  };

  // --- Booking Modal ---
  if (selectedCoach) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pd-darkblue/80 backdrop-blur-sm animate-in fade-in duration-300">
        <Card className="w-full max-w-3xl bg-white relative overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
           <button 
             onClick={resetBooking}
             className="absolute top-4 right-4 p-2 bg-pd-lightest rounded-full hover:bg-pd-darkblue hover:text-white transition-colors z-10"
           >
             <X size={20} />
           </button>

           {bookingStep === 'schedule' && (
             <div className="flex flex-col h-full">
                {/* Header */}
                <div className="bg-pd-darkblue p-8 text-white flex items-center gap-6 shrink-0">
                   <img src={selectedCoach.avatar} alt={selectedCoach.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-pd-teal" />
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-impact text-3xl tracking-wide">{selectedCoach.name}</h2>
                        {selectedCoach.isPDUAlum && (
                           <span className="bg-pd-yellow text-pd-darkblue px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                             <GraduationCap size={12} /> PDU Alum
                           </span>
                        )}
                      </div>
                      <p className="text-pd-lightest/80 font-medium mb-2">{selectedCoach.location}</p>
                      <div className="flex items-center gap-1 text-pd-teal font-bold text-sm">
                         <Star size={16} fill="currentColor" />
                         {selectedCoach.rating} ({selectedCoach.reviews} reviews)
                      </div>
                   </div>
                </div>

                <div className="p-8 overflow-y-auto flex-1">
                   <div className="grid md:grid-cols-2 gap-8">
                      <div>
                         <h3 className="font-impact text-xl text-pd-darkblue mb-4 uppercase">Session Details</h3>
                         <div className="space-y-4">
                            <div>
                               <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Type</label>
                               <div className="flex gap-3">
                                  <button 
                                    onClick={() => setSessionType('virtual')}
                                    className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${sessionType === 'virtual' ? 'border-pd-teal bg-pd-teal/10 text-pd-darkblue' : 'border-pd-lightest text-pd-slate hover:border-pd-softgrey'}`}
                                  >
                                     <Video size={20} /> Virtual
                                  </button>
                                  <button 
                                    onClick={() => setSessionType('in-person')}
                                    className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${sessionType === 'in-person' ? 'border-pd-teal bg-pd-teal/10 text-pd-darkblue' : 'border-pd-lightest text-pd-slate hover:border-pd-softgrey'}`}
                                  >
                                     <Users size={20} /> In-Person
                                  </button>
                               </div>
                            </div>
                            
                            <div>
                               <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Select Time</label>
                               <div className="grid grid-cols-2 gap-2">
                                  {/* In a real app, slots would come from DataService based on availability */}
                                  {/* Using a mock array here consistent with previous design but mapping to IDs */}
                                  {['10:00 AM', '2:00 PM'].map((time, idx) => (
                                    <button
                                       key={idx}
                                       onClick={() => setSelectedSlotId(`slot_${selectedCoach.id}_${idx}`)}
                                       className={`p-3 rounded-xl text-sm font-bold border-2 transition-all ${selectedSlotId === `slot_${selectedCoach.id}_${idx}` ? 'bg-pd-darkblue text-white border-pd-darkblue' : 'bg-white border-pd-lightest text-pd-darkblue hover:border-pd-teal'}`}
                                    >
                                       {time}
                                    </button>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>

                      <div>
                         <h3 className="font-impact text-xl text-pd-darkblue mb-4 uppercase">Summary</h3>
                         <div className="bg-pd-lightest/30 rounded-2xl p-6 border border-pd-lightest space-y-4">
                            <div className="flex justify-between items-center">
                               <span className="text-pd-slate font-medium">Hourly Rate</span>
                               <span className="font-bold text-pd-darkblue">${selectedCoach.hourlyRate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-pd-slate font-medium">Platform Fee</span>
                               <span className="font-bold text-pd-darkblue">$5</span>
                            </div>
                            <div className="h-px bg-pd-lightest my-2"></div>
                            <div className="flex justify-between items-center text-lg">
                               <span className="font-impact text-pd-darkblue uppercase">Total</span>
                               <span className="font-impact text-pd-teal">${selectedCoach.hourlyRate + 5}</span>
                            </div>
                         </div>
                         
                         <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800 font-medium">
                            <p>PDU Alumni are certified in the Partners Method, ensuring consistent training for your dog.</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-6 border-t border-pd-lightest bg-pd-lightest/20 flex justify-end gap-3">
                   <Button variant="ghost" onClick={resetBooking}>Cancel</Button>
                   <Button variant="primary" disabled={!selectedSlotId || isBooking} onClick={handleConfirmBooking}>
                       {isBooking ? 'Confirming...' : 'Confirm Booking'}
                   </Button>
                </div>
             </div>
           )}

           {bookingStep === 'confirm' && (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                 <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                    <CheckCircle size={48} />
                 </div>
                 <h2 className="font-impact text-4xl text-pd-darkblue uppercase mb-2">Booking Confirmed!</h2>
                 <p className="text-pd-slate text-lg mb-8 max-w-md">
                    You are scheduled with {selectedCoach.name} for a {sessionType} session.
                 </p>
                 <Button variant="primary" onClick={resetBooking}>Return to Directory</Button>
              </div>
           )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-impact text-5xl text-pd-darkblue tracking-wide uppercase mb-2">FIND A PRO</h1>
          <p className="text-pd-slate text-lg">Book 1-on-1 sessions with certified PDU Alumni for personalized guidance.</p>
        </div>
        
        <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search by name, specialty, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-white border-2 border-pd-lightest rounded-xl focus:outline-none focus:border-pd-teal text-pd-darkblue font-medium placeholder-pd-softgrey shadow-sm"
            />
        </div>
      </div>

      {/* Coach Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoaches.map(coach => (
          <Card key={coach.id} className="bg-white border-2 border-pd-lightest hover:border-pd-teal transition-all hover:shadow-lg group overflow-hidden flex flex-col h-full">
             <div className="flex items-start gap-4 mb-4">
                <img src={coach.avatar} alt={coach.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-pd-lightest group-hover:border-pd-teal transition-colors" />
                <div>
                   <h3 className="font-impact text-xl text-pd-darkblue tracking-wide">{coach.name}</h3>
                   <div className="flex items-center gap-1 text-xs text-pd-slate font-bold uppercase tracking-wide mb-2">
                      <MapPin size={12} className="text-pd-softgrey" /> {coach.location}
                   </div>
                   {coach.isPDUAlum && (
                      <span className="inline-flex items-center gap-1 bg-pd-yellow/20 text-pd-darkblue text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-pd-yellow/50">
                         <GraduationCap size={12} /> PDU Alum
                      </span>
                   )}
                </div>
             </div>
             
             <p className="text-pd-slate text-sm leading-relaxed mb-4 line-clamp-2 flex-1">{coach.bio}</p>

             <div className="flex flex-wrap gap-2 mb-6">
                {coach.specialties.slice(0, 3).map(spec => (
                   <span key={spec} className="bg-pd-lightest text-pd-darkblue text-xs font-bold px-2 py-1 rounded-md">{spec}</span>
                ))}
             </div>

             <div className="mt-auto pt-4 border-t border-pd-lightest flex items-center justify-between">
                <div className="flex items-center gap-1 text-pd-darkblue font-bold">
                   <Star size={16} className="text-pd-yellow fill-pd-yellow" />
                   {coach.rating} <span className="text-pd-softgrey text-xs font-medium">({coach.reviews})</span>
                </div>
                <Button variant="secondary" className="!py-2 !px-4 !text-xs" onClick={() => handleBookClick(coach)}>
                   Book Now
                </Button>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

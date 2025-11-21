import React, { useState, useMemo } from 'react';
import { DogData, ServiceOption, AddOn } from '../types';
import { BOOKING_SERVICES, BOOKING_ADDONS, MOCK_FACILITIES } from '../constants';
import { Card, Button } from './UI';
import { Calendar as CalendarIcon, Clock, CheckCircle, Plus, Minus, Dog, DollarSign, ChevronRight, ChevronLeft, MapPin, GraduationCap, Star } from 'lucide-react';

interface BookingProps {
  dogData: DogData;
}

const STEPS = [
  { id: 1, label: 'Location' },
  { id: 2, label: 'Dates' },
  { id: 3, label: 'Services' },
  { id: 4, label: 'Notes' },
  { id: 5, label: 'Review' },
];

export const Booking: React.FC<BookingProps> = ({ dogData }) => {
  const [step, setStep] = useState(1);
  
  // Booking State
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dropOffTime, setDropOffTime] = useState('09:00');
  const [pickUpTime, setPickUpTime] = useState('17:00');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(BOOKING_SERVICES[0].id);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedFacility = MOCK_FACILITIES.find(f => f.id === selectedFacilityId);
  const selectedService = BOOKING_SERVICES.find(s => s.id === selectedServiceId);

  // Helper to calculate cost
  const costBreakdown = useMemo(() => {
    if (!startDate || !endDate || !selectedService) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Default to 1 day if same day

    const serviceTotal = selectedService.price * diffDays;
    
    let addonsTotal = 0;
    const addonItems: { name: string; qty: number; price: number; total: number }[] = [];

    Object.entries(selectedAddons).forEach(([id, qtyValue]) => {
      const qty = qtyValue as number;
      if (qty > 0) {
        const addon = BOOKING_ADDONS.find(a => a.id === id);
        if (addon) {
            const total = addon.price * qty;
            addonsTotal += total;
            addonItems.push({ name: addon.name, qty, price: addon.price, total });
        }
      }
    });

    return {
      days: diffDays,
      serviceTotal,
      addonsTotal,
      grandTotal: serviceTotal + addonsTotal,
      addonItems
    };
  }, [startDate, endDate, selectedServiceId, selectedAddons]);

  const handleAddonToggle = (id: string, increment: boolean) => {
    setSelectedAddons(prev => {
      const current = prev[id] || 0;
      const next = increment ? current + 1 : Math.max(0, current - 1);
      return { ...prev, [id]: next };
    });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const reset = () => {
    setStep(1);
    setSelectedFacilityId(null);
    setStartDate('');
    setEndDate('');
    setSelectedAddons({});
    setNotes('');
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce shadow-xl border-4 border-white">
          <CheckCircle size={64} />
        </div>
        <div>
          <h2 className="font-impact text-5xl text-pd-darkblue uppercase tracking-wide mb-2">Request Sent!</h2>
          <p className="text-pd-slate text-xl max-w-lg font-medium mx-auto">
            We've received your booking for <span className="text-pd-darkblue font-bold">{dogData.name}</span> at {selectedFacility?.name}. 
          </p>
          <p className="text-pd-softgrey mt-2 font-medium">Check your email for confirmation.</p>
        </div>
        <Button variant="primary" onClick={reset} className="!px-8 !py-4">Book Another Stay</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
         <div>
           <h1 className="font-impact text-5xl text-pd-darkblue tracking-wide uppercase mb-2">BOOK A SPOT</h1>
           <p className="text-pd-slate text-lg">Secure boarding or day school at a Partners facility.</p>
         </div>
       </div>
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8">
             
             {/* Steps Indicator */}
             <div className="bg-white p-4 rounded-2xl border-2 border-pd-lightest shadow-sm overflow-x-auto no-scrollbar">
                <div className="flex justify-between items-center min-w-[300px]">
                  {STEPS.map((s, idx) => (
                    <React.Fragment key={s.id}>
                        <div className={`flex flex-col items-center gap-1 shrink-0 ${step >= s.id ? 'text-pd-darkblue' : 'text-pd-softgrey'}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all duration-300 ${
                              step >= s.id 
                              ? 'bg-pd-darkblue text-white border-pd-teal shadow-md scale-110' 
                              : 'bg-white border-pd-lightest'
                          }`}>
                              {step > s.id ? <CheckCircle size={18} className="text-pd-teal" /> : s.id}
                          </div>
                          <span className="font-impact uppercase tracking-wide text-[10px] md:text-xs">{s.label}</span>
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${step > s.id ? 'bg-pd-teal' : 'bg-pd-lightest'}`}></div>
                        )}
                    </React.Fragment>
                  ))}
                </div>
             </div>

             <div className="min-h-[400px]">
                
                {/* STEP 1: LOCATION */}
                {step === 1 && (
                   <div className="space-y-6 animate-in slide-in-from-right duration-300">
                      <div>
                        <h3 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide mb-1">Select Facility</h3>
                        <p className="text-pd-slate font-medium">Choose a location for your stay.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {MOCK_FACILITIES.map(facility => (
                            <div 
                               key={facility.id}
                               onClick={() => setSelectedFacilityId(facility.id)}
                               className={`group relative flex flex-col rounded-3xl border-2 cursor-pointer transition-all duration-300 overflow-hidden h-full ${
                                  selectedFacilityId === facility.id 
                                  ? 'border-pd-teal shadow-xl ring-4 ring-pd-teal/10 translate-y-[-4px]' 
                                  : 'bg-white border-pd-lightest hover:border-pd-softgrey hover:shadow-lg hover:translate-y-[-2px]'
                               }`}
                            >
                               <div className="h-40 overflow-hidden relative">
                                  <img src={facility.image} alt={facility.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-pd-darkblue/80 to-transparent"></div>
                                  {facility.hasPDUAlumni && (
                                    <div className="absolute top-3 right-3 bg-pd-yellow text-pd-darkblue text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1 border border-pd-darkblue/10">
                                       <GraduationCap size={14} /> PDU Alumni
                                    </div>
                                  )}
                                  <div className="absolute bottom-3 left-4 text-white">
                                     <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider opacity-90 mb-1">
                                        <MapPin size={12} /> {facility.distance}
                                     </div>
                                  </div>
                               </div>
                               
                               <div className="p-5 flex-1 bg-white">
                                  <h4 className="font-impact text-xl text-pd-darkblue tracking-wide mb-2 group-hover:text-pd-teal transition-colors">{facility.name}</h4>
                                  <p className="text-pd-slate text-sm font-medium">{facility.address}</p>
                               </div>

                               {selectedFacilityId === facility.id && (
                                  <div className="absolute top-3 left-3 w-8 h-8 bg-pd-teal rounded-full flex items-center justify-center text-white shadow-md animate-in zoom-in duration-200">
                                     <CheckCircle size={20} />
                                  </div>
                               )}
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {/* STEP 2: DATES */}
                {step === 2 && (
                   <div className="space-y-6 animate-in slide-in-from-right duration-300">
                      <div>
                        <h3 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide mb-1">Select Dates</h3>
                        <p className="text-pd-slate font-medium">When are you dropping off and picking up?</p>
                      </div>
                      
                      <Card className="bg-white border-2 border-pd-lightest !p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                              <label className="flex items-center gap-2 text-xs font-bold text-pd-darkblue uppercase tracking-wider">
                                <CalendarIcon size={16} className="text-pd-teal" /> Drop Off
                              </label>
                              <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full p-4 bg-pd-lightest/20 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none font-bold text-pd-darkblue text-lg transition-colors cursor-pointer hover:bg-pd-lightest/40"
                              />
                              <select 
                                value={dropOffTime}
                                onChange={(e) => setDropOffTime(e.target.value)}
                                className="w-full p-4 bg-pd-lightest/20 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none font-medium text-pd-darkblue"
                              >
                                <option value="07:00">7:00 AM</option>
                                <option value="08:00">8:00 AM</option>
                                <option value="09:00">9:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                              </select>
                          </div>

                          <div className="space-y-4">
                              <label className="flex items-center gap-2 text-xs font-bold text-pd-darkblue uppercase tracking-wider">
                                <CalendarIcon size={16} className="text-pd-teal" /> Pick Up
                              </label>
                              <input 
                                type="date" 
                                value={endDate}
                                min={startDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full p-4 bg-pd-lightest/20 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none font-bold text-pd-darkblue text-lg transition-colors cursor-pointer hover:bg-pd-lightest/40"
                              />
                              <select 
                                value={pickUpTime}
                                onChange={(e) => setPickUpTime(e.target.value)}
                                className="w-full p-4 bg-pd-lightest/20 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none font-medium text-pd-darkblue"
                              >
                                <option value="12:00">12:00 PM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="16:00">4:00 PM</option>
                                <option value="17:00">5:00 PM</option>
                                <option value="18:00">6:00 PM</option>
                              </select>
                          </div>
                        </div>
                      </Card>
                   </div>
                )}

                {/* STEP 3: SERVICES */}
                {step === 3 && (
                   <div className="space-y-8 animate-in slide-in-from-right duration-300">
                      <div>
                         <h3 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide mb-4 flex items-center gap-2">
                            Primary Service
                         </h3>
                         <div className="grid md:grid-cols-2 gap-4">
                            {BOOKING_SERVICES.map(service => (
                               <div 
                                 key={service.id}
                                 onClick={() => setSelectedServiceId(service.id)}
                                 className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[140px] ${
                                    selectedServiceId === service.id 
                                    ? 'bg-pd-teal text-white border-pd-teal shadow-lg scale-[1.02]' 
                                    : 'bg-white border-pd-lightest hover:border-pd-softgrey text-pd-darkblue hover:shadow-md'
                                 }`}
                               >
                                  <div>
                                     <p className="font-impact text-2xl tracking-wide mb-2">{service.name}</p>
                                     <p className={`text-sm font-medium leading-relaxed ${selectedServiceId === service.id ? 'text-white/90' : 'text-pd-slate'}`}>{service.description}</p>
                                  </div>
                                  <div className="mt-4 flex justify-between items-end">
                                     <div>
                                        <p className="font-impact text-3xl">${service.price}</p>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedServiceId === service.id ? 'text-white/80' : 'text-pd-softgrey'}`}>Per {service.priceUnit}</p>
                                     </div>
                                     {selectedServiceId === service.id && <div className="bg-white/20 p-1 rounded-full"><CheckCircle size={24} /></div>}
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div>
                         <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide mb-4 flex items-center gap-2">
                            Customize Stay
                         </h3>
                         <div className="grid gap-3">
                            {BOOKING_ADDONS.map(addon => (
                               <div key={addon.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${selectedAddons[addon.id] ? 'bg-white border-pd-teal shadow-sm' : 'bg-white border-pd-lightest hover:border-pd-softgrey'}`}>
                                  <div className="flex-1">
                                     <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black bg-pd-lightest text-pd-darkblue px-2 py-0.5 rounded uppercase tracking-wider">{addon.category}</span>
                                        <span className="font-bold text-pd-darkblue">{addon.name}</span>
                                     </div>
                                     <p className="text-xs text-pd-slate font-medium">{addon.description}</p>
                                  </div>
                                  <div className="flex items-center gap-6">
                                     <span className="font-impact text-lg text-pd-darkblue">${addon.price}</span>
                                     <div className="flex items-center bg-pd-lightest rounded-lg p-1 gap-3">
                                        <button 
                                          onClick={() => handleAddonToggle(addon.id, false)}
                                          className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-pd-darkblue shadow-sm hover:text-rose-500 transition-colors disabled:opacity-50"
                                          disabled={!selectedAddons[addon.id]}
                                        >
                                           <Minus size={16} strokeWidth={3} />
                                        </button>
                                        <span className="w-4 text-center font-impact text-lg text-pd-darkblue">{selectedAddons[addon.id] || 0}</span>
                                        <button 
                                          onClick={() => handleAddonToggle(addon.id, true)}
                                          className="w-8 h-8 flex items-center justify-center bg-pd-darkblue rounded-md text-white shadow-sm hover:bg-pd-teal transition-colors"
                                        >
                                           <Plus size={16} strokeWidth={3} />
                                        </button>
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                )}

                {/* STEP 4: NOTES */}
                {step === 4 && (
                   <div className="space-y-6 animate-in slide-in-from-right duration-300">
                      <div>
                         <h3 className="font-impact text-3xl text-pd-darkblue uppercase tracking-wide mb-1">Special Instructions</h3>
                         <p className="text-pd-slate font-medium">Feeding, medical, or behavioral notes.</p>
                      </div>
                      <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full h-64 bg-white border-2 border-pd-lightest rounded-2xl p-6 text-pd-darkblue focus:outline-none focus:border-pd-teal focus:shadow-lg resize-none font-medium placeholder-pd-softgrey transition-all text-lg leading-relaxed"
                        placeholder="e.g. Barnaby needs his medication with breakfast. He can be shy with new men..."
                      />
                   </div>
                )}

                {/* STEP 5: REVIEW */}
                {step === 5 && costBreakdown && (
                   <div className="space-y-8 animate-in slide-in-from-right duration-300">
                      <div className="bg-white rounded-3xl p-8 border-2 border-pd-lightest shadow-sm relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pd-darkblue to-pd-teal"></div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                               <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-1">Facility</p>
                               <div className="flex items-center gap-3 mb-6">
                                  <div className="w-12 h-12 bg-pd-lightest rounded-xl flex items-center justify-center text-pd-darkblue">
                                     <MapPin size={24} />
                                  </div>
                                  <div>
                                     <p className="font-impact text-xl text-pd-darkblue tracking-wide">{selectedFacility?.name}</p>
                                     <p className="text-pd-slate text-sm font-medium">{selectedFacility?.address}</p>
                                  </div>
                               </div>

                               <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-1">Dates</p>
                               <div className="flex items-center gap-3 mb-6">
                                  <div className="w-12 h-12 bg-pd-lightest rounded-xl flex items-center justify-center text-pd-darkblue">
                                     <CalendarIcon size={24} />
                                  </div>
                                  <div>
                                     <p className="font-bold text-pd-darkblue text-lg">
                                        {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                                     </p>
                                     <p className="text-pd-slate text-sm font-medium">{dropOffTime} Drop • {pickUpTime} Pick</p>
                                  </div>
                                </div>
                            </div>
                            
                            <div>
                               <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-1">Service Plan</p>
                               <div className="flex items-center gap-3 mb-6">
                                  <div className="w-12 h-12 bg-pd-lightest rounded-xl flex items-center justify-center text-pd-darkblue">
                                     <Dog size={24} />
                                  </div>
                                  <div>
                                     <p className="font-impact text-xl text-pd-darkblue tracking-wide">{selectedService?.name}</p>
                                     <p className="text-pd-slate text-sm font-medium">{costBreakdown.days} Night(s)</p>
                                  </div>
                               </div>

                               {costBreakdown.addonItems.length > 0 && (
                                  <>
                                    <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-2">Add-Ons</p>
                                    <div className="flex flex-wrap gap-2">
                                       {costBreakdown.addonItems.map((item, idx) => (
                                          <span key={idx} className="bg-pd-teal/10 text-pd-darkblue px-3 py-1 rounded-lg text-xs font-bold border border-pd-teal/20">
                                             {item.name} x{item.qty}
                                          </span>
                                       ))}
                                    </div>
                                  </>
                               )}
                            </div>
                         </div>

                         {notes && (
                            <div className="mt-6 pt-6 border-t-2 border-pd-lightest">
                               <p className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-2">Notes</p>
                               <p className="text-pd-slate italic font-medium bg-pd-lightest/30 p-4 rounded-xl border border-pd-lightest">"{notes}"</p>
                            </div>
                         )}
                      </div>
                   </div>
                )}
             </div>

             {/* Navigation Buttons */}
             <div className="flex justify-between pt-8 border-t-2 border-pd-lightest">
                <Button 
                  variant="secondary" 
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                  icon={ChevronLeft}
                  className="!px-6"
                >
                   Back
                </Button>
                
                {step < 5 ? (
                   <Button 
                     variant="primary" 
                     onClick={() => setStep(Math.min(5, step + 1))}
                     disabled={(step === 1 && !selectedFacilityId) || (step === 2 && (!startDate || !endDate))}
                     className="flex-row-reverse !px-8"
                   >
                      Next <ChevronRight size={20} />
                   </Button>
                ) : (
                   <Button 
                     variant="primary" 
                     onClick={handleSubmit}
                     disabled={isSubmitting}
                     className={`!px-10 !py-4 !text-lg shadow-lg ${isSubmitting ? 'animate-pulse' : ''}`}
                  >
                      {isSubmitting ? 'Processing...' : 'Submit Request'}
                   </Button>
                )}
             </div>
          </div>

          {/* Right Column: Estimate (Sticky) */}
          <div className="lg:col-span-1">
             <Card className="bg-pd-darkblue text-white border-none sticky top-6 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pd-teal rounded-full opacity-10 -mr-10 -mt-10 blur-2xl"></div>
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                      <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                         <DollarSign className="text-pd-yellow" size={20} />
                      </div>
                      <h3 className="font-impact text-2xl tracking-wide uppercase">Estimated Total</h3>
                   </div>
                   
                   {selectedFacility && (
                        <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-3">
                           <MapPin size={16} className="text-pd-teal shrink-0" />
                           <div>
                              <p className="text-[10px] text-pd-lightest font-bold uppercase tracking-wide opacity-70">Location</p>
                              <p className="font-bold text-white text-sm truncate leading-tight">{selectedFacility.name}</p>
                           </div>
                        </div>
                   )}

                   {costBreakdown ? (
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-pd-lightest opacity-80">{selectedService?.name} <span className="text-xs opacity-60">(x{costBreakdown.days})</span></span>
                            <span className="font-bold text-white">${costBreakdown.serviceTotal}</span>
                         </div>

                         {costBreakdown.addonItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm font-medium">
                               <span className="text-pd-lightest opacity-80">{item.name} <span className="text-xs opacity-60">(x{item.qty})</span></span>
                               <span className="font-bold text-white">${item.total}</span>
                            </div>
                         ))}

                         <div className="h-px bg-white/20 my-6"></div>

                         <div className="flex justify-between items-end">
                            <span className="font-impact tracking-wide uppercase text-pd-teal text-xl">Total</span>
                            <span className="font-impact tracking-wide text-white text-3xl">${costBreakdown.grandTotal}</span>
                         </div>
                         
                         <div className="mt-6 bg-pd-yellow/10 p-3 rounded-lg border border-pd-yellow/20 flex gap-2 items-start">
                            <Star size={14} className="text-pd-yellow shrink-0 mt-0.5" />
                            <p className="text-[10px] text-pd-lightest font-medium leading-relaxed">
                               Pricing is estimated. Holidays may affect rates. Payment due upon completion of service.
                            </p>
                         </div>
                      </div>
                   ) : (
                      <div className="text-center py-12 text-pd-lightest/30 italic font-medium border-2 border-dashed border-white/10 rounded-xl">
                         Select dates to view estimate.
                      </div>
                   )}
                </div>
             </Card>
          </div>
       </div>
    </div>
  );
};
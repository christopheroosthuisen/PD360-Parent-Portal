
import React, { useState, useRef } from 'react';
import { DogData, OwnerProfile, EmergencyContact, NotificationSettings } from '../types';
import { Button, Card } from './UI';
import { Camera, Save, Plus, X, Pill, Utensils, Home, Heart, Dog, Stethoscope, Syringe, Trash2, Phone, MapPin, User, Lock, Bell, Mail, MessageSquare, ShieldAlert, AlertTriangle, Loader, ClipboardCheck } from 'lucide-react';
import { DataService } from '../services/dataService';
import { Assessment } from './Assessment';

interface DogProfileProps {
  dog: DogData;
  onUpdate: (updatedDog: DogData) => void;
}

export const DogProfile: React.FC<DogProfileProps> = ({ dog, onUpdate }) => {
  const [formData, setFormData] = useState<DogData>({ ...dog });
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'assessment' | 'account' | 'notifications'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof DogData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOwnerChange = (field: keyof OwnerProfile, value: string) => {
    setFormData(prev => ({
        ...prev,
        owner: { ...prev.owner, [field]: value }
    }));
  };

  const handleEmergencyChange = (field: keyof EmergencyContact, value: string) => {
    setFormData(prev => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [field]: value }
    }));
  };

  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setFormData(prev => ({
        ...prev,
        notificationSettings: { ...prev.notificationSettings, [field]: value }
    }));
  };

  const handleVetChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      veterinarian: { ...prev.veterinarian, [field]: value } as any
    }));
  };

  const addMedication = () => {
    const newMeds = [...formData.medications, { name: '', dosage: '', frequency: '' }];
    handleChange('medications', newMeds);
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const newMeds = [...formData.medications];
    newMeds[index] = { ...newMeds[index], [field]: value };
    handleChange('medications', newMeds);
  };
  
  const removeMedication = (index: number) => {
    const newMeds = formData.medications.filter((_, i) => i !== index);
    handleChange('medications', newMeds);
  };

  const addVaccination = () => {
    const newVax = [...formData.vaccinations, { name: '', expiryDate: '' }];
    handleChange('vaccinations', newVax);
  };

  const updateVaccination = (index: number, field: string, value: string) => {
    const newVax = [...formData.vaccinations];
    newVax[index] = { ...newVax[index], [field]: value };
    if (field === 'expiryDate') {
      const today = new Date();
      const exp = new Date(value);
      const diffTime = exp.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) newVax[index].status = 'expired';
      else if (diffDays < 30) newVax[index].status = 'expiring';
      else newVax[index].status = 'valid';
    }
    handleChange('vaccinations', newVax);
  };

  const removeVaccination = (index: number) => {
    const newVax = formData.vaccinations.filter((_, i) => i !== index);
    handleChange('vaccinations', newVax);
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
      if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
          // In a real app, call API deletion
          alert("Account deletion request submitted. You will be logged out.");
          window.location.reload();
      }
  };

  const getAge = (birthDate: string) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const triggerFileUpload = () => {
      if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setIsUploading(true);
          try {
              const url = await DataService.uploadAvatar(dog.id, e.target.files[0]);
              setFormData(prev => ({ ...prev, avatar: url }));
              // Auto-save the avatar change
              onUpdate({ ...formData, avatar: url });
          } catch (error) {
              console.error("Avatar upload failed", error);
              alert("Failed to upload avatar.");
          } finally {
              setIsUploading(false);
          }
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-3xl border-2 border-pd-lightest shadow-sm">
         <div className="flex items-center gap-8">
            <div className="relative group shrink-0">
               <img 
                 src={formData.avatar} 
                 alt={formData.name} 
                 className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-pd-lightest shadow-xl transition-opacity ${isUploading ? 'opacity-50' : ''}`}
               />
               {isUploading && (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <Loader className="animate-spin text-pd-teal" size={32} />
                   </div>
               )}
               {isEditing && !isUploading && (
                 <div 
                    onClick={triggerFileUpload}
                    className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer backdrop-blur-sm"
                 >
                    <Camera className="text-white" size={32} />
                 </div>
               )}
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
               />
            </div>
            <div className="flex-1">
               {isEditing ? (
                 <input 
                   value={formData.name} 
                   onChange={e => handleChange('name', e.target.value)}
                   className="font-impact text-5xl text-pd-darkblue bg-transparent border-b-4 border-pd-teal focus:outline-none w-full mb-2"
                   placeholder="Dog Name"
                 />
               ) : (
                 <h1 className="font-impact text-5xl md:text-6xl text-pd-darkblue tracking-wide uppercase leading-none">{formData.name}</h1>
               )}
               <div className="flex flex-wrap gap-3 mt-3">
                  <span className="bg-pd-lightest/50 text-pd-darkblue px-3 py-1 rounded-lg font-bold uppercase text-sm tracking-wide border border-pd-lightest">
                    {formData.breeds.join(' & ')}
                  </span>
                  <span className="bg-pd-lightest/50 text-pd-darkblue px-3 py-1 rounded-lg font-bold uppercase text-sm tracking-wide border border-pd-lightest">
                     {getAge(formData.birthDate)} Yrs Old
                  </span>
               </div>
            </div>
         </div>
         
         <div className="flex flex-col items-end gap-4 w-full md:w-auto">
             <div className="flex flex-wrap gap-2 bg-pd-lightest/30 p-1.5 rounded-xl border border-pd-lightest">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 rounded-lg font-impact uppercase tracking-wide text-sm transition-all ${activeTab === 'profile' ? 'bg-pd-darkblue text-white shadow-md' : 'text-pd-slate hover:bg-white'}`}
                >
                    Profile
                </button>
                <button 
                    onClick={() => setActiveTab('assessment')}
                    className={`px-4 py-2 rounded-lg font-impact uppercase tracking-wide text-sm transition-all ${activeTab === 'assessment' ? 'bg-pd-darkblue text-white shadow-md' : 'text-pd-slate hover:bg-white'}`}
                >
                    Assessment
                </button>
                <button 
                    onClick={() => setActiveTab('account')}
                    className={`px-4 py-2 rounded-lg font-impact uppercase tracking-wide text-sm transition-all ${activeTab === 'account' ? 'bg-pd-darkblue text-white shadow-md' : 'text-pd-slate hover:bg-white'}`}
                >
                    Account
                </button>
                <button 
                    onClick={() => setActiveTab('notifications')}
                    className={`px-4 py-2 rounded-lg font-impact uppercase tracking-wide text-sm transition-all ${activeTab === 'notifications' ? 'bg-pd-darkblue text-white shadow-md' : 'text-pd-slate hover:bg-white'}`}
                >
                    Alerts
                </button>
             </div>
             
             {activeTab === 'profile' && (
                <Button 
                    variant={isEditing ? "accent" : "primary"} 
                    icon={isEditing ? Save : undefined}
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="w-full md:w-auto"
                >
                    {isEditing ? "Save All Changes" : "Edit Settings"}
                </Button>
             )}
         </div>
      </div>

      {/* --- DOG PROFILE TAB --- */}
      {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Core Details */}
            <Card className="bg-white hover:shadow-md transition-shadow duration-300 border-2 border-pd-lightest">
                <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide mb-6 flex items-center gap-2 border-b-2 border-pd-lightest pb-4">
                    <Dog className="text-pd-teal" /> Core Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-2">
                    <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider">Breed(s)</label>
                    {isEditing ? (
                        <input 
                            value={formData.breeds.join(', ')} 
                            onChange={e => handleChange('breeds', e.target.value.split(', '))}
                            className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal focus:bg-white transition-colors outline-none font-medium text-pd-darkblue"
                        />
                    ) : (
                        <p className="font-bold text-pd-darkblue text-lg">{formData.breeds.join(', ')}</p>
                    )}
                    </div>
                    
                    <div className="space-y-2">
                    <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider">Date of Birth</label>
                    {isEditing ? (
                        <input 
                            type="date"
                            value={formData.birthDate} 
                            onChange={e => handleChange('birthDate', e.target.value)}
                            className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal focus:bg-white transition-colors outline-none font-medium text-pd-darkblue"
                        />
                    ) : (
                        <p className="font-bold text-pd-darkblue text-lg">{new Date(formData.birthDate).toLocaleDateString()}</p>
                    )}
                    </div>
                     <div className="space-y-2">
                    <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider">Weight</label>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                        <input 
                            type="number"
                            value={formData.weight} 
                            onChange={e => handleChange('weight', parseInt(e.target.value))}
                            className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal focus:bg-white transition-colors outline-none font-medium text-pd-darkblue"
                        />
                        <span className="text-sm font-bold text-pd-slate">lbs</span>
                        </div>
                    ) : (
                        <p className="font-bold text-pd-darkblue text-lg">{formData.weight} lbs</p>
                    )}
                    </div>
                     <div className="space-y-2">
                    <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider">Status</label>
                    {isEditing ? (
                        <div className="flex gap-3">
                            <select 
                            value={formData.sex} 
                            onChange={e => handleChange('sex', e.target.value)}
                            className="p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest font-medium text-pd-darkblue"
                            >
                            <option>Male</option>
                            <option>Female</option>
                            </select>
                            <label className="flex items-center gap-2 text-sm font-bold text-pd-darkblue cursor-pointer bg-pd-lightest/30 px-3 rounded-xl border-2 border-pd-lightest hover:bg-pd-lightest/50">
                            <input 
                                type="checkbox" 
                                checked={formData.fixed} 
                                onChange={e => handleChange('fixed', e.target.checked)} 
                                className="w-4 h-4 text-pd-teal rounded focus:ring-pd-teal"
                            /> Fixed
                            </label>
                        </div>
                    ) : (
                        <p className="font-bold text-pd-darkblue text-lg">{formData.sex} • {formData.fixed ? 'Fixed' : 'Intact'}</p>
                    )}
                    </div>
                </div>
            </Card>

            {/* Veterinary Care */}
            <Card className="bg-white hover:shadow-md transition-shadow duration-300 border-2 border-pd-lightest">
                <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide mb-6 flex items-center gap-2 border-b-2 border-pd-lightest pb-4">
                    <Stethoscope className="text-rose-500" /> Veterinary Care
                </h3>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                    <h4 className="font-impact text-xl text-pd-darkblue uppercase tracking-wide mb-4">Primary Veterinarian</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Vet Name</label>
                            {isEditing ? (
                                <input 
                                value={formData.veterinarian?.name || ''} 
                                onChange={e => handleVetChange('name', e.target.value)} 
                                className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none"
                                placeholder="Dr. Name"
                                />
                            ) : (
                                <p className="font-bold text-pd-darkblue text-lg">{formData.veterinarian?.name || "Not listed"}</p>
                            )}
                        </div>
                         <div>
                            <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Clinic</label>
                            {isEditing ? (
                                <input 
                                value={formData.veterinarian?.clinicName || ''} 
                                onChange={e => handleVetChange('clinicName', e.target.value)} 
                                className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none"
                                placeholder="Clinic Name"
                                />
                            ) : (
                                <p className="font-bold text-pd-darkblue">{formData.veterinarian?.clinicName}</p>
                            )}
                        </div>
                    </div>
                    </div>

                    <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-impact text-xl text-pd-darkblue uppercase tracking-wide">Vaccinations</h4>
                        {isEditing && (
                            <button onClick={addVaccination} className="text-xs font-bold text-pd-teal uppercase flex items-center gap-1 hover:bg-pd-lightest/50 px-2 py-1 rounded transition-colors">
                                <Plus size={14} /> Add
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        {formData.vaccinations.map((vax, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                {isEditing ? (
                                <>
                                    <input 
                                        value={vax.name} 
                                        onChange={e => updateVaccination(idx, 'name', e.target.value)} 
                                        placeholder="Vaccine Name" 
                                        className="flex-1 p-2 bg-pd-lightest/30 rounded-lg border border-pd-lightest text-sm" 
                                    />
                                    <input 
                                        type="date" 
                                        value={vax.expiryDate} 
                                        onChange={e => updateVaccination(idx, 'expiryDate', e.target.value)} 
                                        className="w-32 p-2 bg-pd-lightest/30 rounded-lg border border-pd-lightest text-sm" 
                                    />
                                    <button onClick={() => removeVaccination(idx)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded"><Trash2 size={16} /></button>
                                </>
                                ) : (
                                <div className="flex justify-between items-center w-full p-3 bg-pd-lightest/20 rounded-xl border border-pd-lightest/50">
                                    <div className="flex items-center gap-3">
                                        <Syringe size={16} className="text-pd-teal" />
                                        <span className="font-bold text-pd-darkblue">{vax.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-pd-slate font-medium">Exp: {new Date(vax.expiryDate).toLocaleDateString()}</span>
                                        {vax.status === 'expired' && <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded uppercase">Expired</span>}
                                        {vax.status === 'expiring' && <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded uppercase">Expiring Soon</span>}
                                        {(vax.status === 'valid' || !vax.status) && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded uppercase">Valid</span>}
                                    </div>
                                </div>
                                )}
                            </div>
                        ))}
                        {formData.vaccinations.length === 0 && !isEditing && <p className="text-pd-softgrey italic text-sm">No vaccinations listed.</p>}
                    </div>
                    </div>
                </div>
            </Card>

            {/* Health & Nutrition */}
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-white hover:shadow-md transition-shadow duration-300 border-2 border-pd-lightest">
                    <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide mb-6 flex items-center gap-2 border-b-2 border-pd-lightest pb-4">
                    <Pill className="text-indigo-500" /> Medications
                    </h3>
                     <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider">Active Prescriptions</label>
                            {isEditing && (
                                <button onClick={addMedication} className="text-xs font-bold text-pd-teal uppercase flex items-center gap-1 hover:bg-pd-lightest/50 px-2 py-1 rounded transition-colors">
                                <Plus size={14} /> Add
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {formData.medications.map((med, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                {isEditing ? (
                                    <>
                                        <input value={med.name} onChange={e => updateMedication(idx, 'name', e.target.value)} placeholder="Name" className="flex-1 p-2 bg-pd-lightest/30 rounded-lg border border-pd-lightest text-sm" />
                                        <input value={med.dosage} onChange={e => updateMedication(idx, 'dosage', e.target.value)} placeholder="Dose" className="w-20 p-2 bg-pd-lightest/30 rounded-lg border border-pd-lightest text-sm" />
                                        <input value={med.frequency} onChange={e => updateMedication(idx, 'frequency', e.target.value)} placeholder="Freq" className="w-20 p-2 bg-pd-lightest/30 rounded-lg border border-pd-lightest text-sm" />
                                        <button onClick={() => removeMedication(idx)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded"><Trash2 size={16} /></button>
                                    </>
                                ) : (
                                    <div className="flex justify-between w-full p-3 bg-pd-lightest/20 rounded-xl border border-pd-lightest/50">
                                        <span className="font-bold text-pd-darkblue">{med.name}</span>
                                        <span className="text-sm text-pd-slate font-medium">{med.dosage} • {med.frequency}</span>
                                    </div>
                                )}
                                </div>
                            ))}
                            {!isEditing && formData.medications.length === 0 && <p className="text-pd-softgrey italic text-sm">No active medications.</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-2 block">Allergies</label>
                        {isEditing ? (
                            <input 
                                value={formData.allergies.join(', ')} 
                                onChange={e => handleChange('allergies', e.target.value.split(', '))}
                                className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none"
                                placeholder="Chicken, Beef, etc."
                            />
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {formData.allergies.length > 0 ? formData.allergies.map(a => (
                                <span key={a} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold border border-rose-100">{a}</span>
                                )) : <span className="text-pd-softgrey italic text-sm">None listed</span>}
                            </div>
                        )}
                    </div>
                    </div>
                </Card>

                <Card className="bg-white hover:shadow-md transition-shadow duration-300 border-2 border-pd-lightest">
                    <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide mb-6 flex items-center gap-2 border-b-2 border-pd-lightest pb-4">
                    <Utensils className="text-orange-500" /> Nutrition
                    </h3>
                    <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Brand</label>
                            {isEditing ? (
                                <input value={formData.foodBrand} onChange={e => handleChange('foodBrand', e.target.value)} className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none" />
                            ) : (
                                <p className="font-bold text-pd-darkblue text-lg">{formData.foodBrand || "Not set"}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Amount</label>
                            {isEditing ? (
                                <input value={formData.feedingAmount} onChange={e => handleChange('feedingAmount', e.target.value)} className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none" />
                            ) : (
                                <p className="font-bold text-pd-darkblue text-lg">{formData.feedingAmount || "Not set"}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Schedule</label>
                        {isEditing ? (
                            <input value={formData.feedingSchedule?.join(', ')} onChange={e => handleChange('feedingSchedule', e.target.value.split(', '))} className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none" placeholder="08:00, 18:00" />
                        ) : (
                            <div className="flex gap-3">
                                {formData.feedingSchedule?.map(t => (
                                <span key={t} className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold border border-orange-100">{t}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    </div>
                </Card>
            </div>
            
             <Card className="bg-white hover:shadow-md transition-shadow duration-300 border-2 border-pd-lightest">
                <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide mb-6 flex items-center gap-2 border-b-2 border-pd-lightest pb-4">
                    <Home className="text-pd-teal" /> Household
                </h3>
                <div className="grid md:grid-cols-3 gap-8">
                    <div>
                        <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Home Type</label>
                        {isEditing ? (
                        <select value={formData.homeType} onChange={e => handleChange('homeType', e.target.value)} className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none font-medium text-pd-darkblue">
                            <option>House</option>
                            <option>Apartment</option>
                            <option>Condo</option>
                            <option>Acreage</option>
                        </select>
                        ) : (
                        <p className="font-bold text-pd-darkblue text-lg">{formData.homeType}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Yard</label>
                        {isEditing ? (
                        <label className="flex items-center gap-2 text-pd-darkblue font-bold bg-pd-lightest/30 p-3 rounded-xl border-2 border-pd-lightest cursor-pointer">
                            <input type="checkbox" checked={formData.hasYard} onChange={e => handleChange('hasYard', e.target.checked)} className="w-4 h-4 text-pd-teal focus:ring-pd-teal rounded" /> Has Yard
                        </label>
                        ) : (
                        <p className="font-bold text-pd-darkblue text-lg flex items-center gap-2">
                            {formData.hasYard ? <span className="text-emerald-600">Yes</span> : "No"}
                        </p>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Siblings</label>
                        <div className="space-y-2">
                        {formData.siblings.map((s, i) => (
                            <div key={i} className="text-sm font-bold text-pd-darkblue bg-pd-lightest/30 px-3 py-2 rounded-lg border border-pd-lightest/50">• {s.name} ({s.type})</div>
                        ))}
                        {formData.siblings.length === 0 && <span className="text-sm text-pd-softgrey italic">None</span>}
                        </div>
                    </div>
                </div>
            </Card>
          </div>
      )}

      {/* --- ASSESSMENT TAB (New) --- */}
      {activeTab === 'assessment' && (
          <Assessment dog={dog} onUpdate={onUpdate} />
      )}

      {/* --- ACCOUNT TAB --- */}
      {activeTab === 'account' && (
         <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Primary Parent */}
                <Card className="bg-white hover:shadow-md transition-shadow duration-300 border-2 border-pd-lightest">
                    <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide mb-6 flex items-center gap-2 border-b-2 border-pd-lightest pb-4">
                        <User className="text-pd-teal" /> Parent Info
                    </h3>
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">First Name</label>
                                {isEditing ? (
                                    <input value={formData.owner?.firstName || ''} onChange={e => handleOwnerChange('firstName', e.target.value)} className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none" />
                                ) : (
                                    <p className="font-bold text-pd-darkblue text-lg">{formData.owner?.firstName || "First Name"}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Last Name</label>
                                {isEditing ? (
                                    <input value={formData.owner?.lastName || ''} onChange={e => handleOwnerChange('lastName', e.target.value)} className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none" />
                                ) : (
                                    <p className="font-bold text-pd-darkblue text-lg">{formData.owner?.lastName || "Last Name"}</p>
                                )}
                            </div>
                        </div>
                         <div>
                            <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Email Address</label>
                            {isEditing ? (
                                <input value={formData.owner?.email || ''} onChange={e => handleOwnerChange('email', e.target.value)} className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none" />
                            ) : (
                                <p className="font-bold text-pd-darkblue text-lg">{formData.owner?.email || "email@example.com"}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Phone Number</label>
                            {isEditing ? (
                                <input value={formData.owner?.phone || ''} onChange={e => handleOwnerChange('phone', e.target.value)} className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none" />
                            ) : (
                                <p className="font-bold text-pd-darkblue text-lg">{formData.owner?.phone || "(555) 555-5555"}</p>
                            )}
                        </div>
                        
                        {isEditing && (
                            <div className="pt-4 border-t border-pd-lightest mt-4">
                                <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Change Password</label>
                                <div className="flex items-center gap-2">
                                    <Lock size={16} className="text-pd-softgrey" />
                                    <input 
                                        type="password" 
                                        placeholder="New Password" 
                                        className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none" 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Emergency Contact */}
                <Card className="bg-white hover:shadow-md transition-shadow duration-300 border-2 border-pd-lightest">
                    <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide mb-6 flex items-center gap-2 border-b-2 border-pd-lightest pb-4">
                        <ShieldAlert className="text-rose-500" /> Emergency Contact
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">First Name</label>
                                {isEditing ? (
                                    <input value={formData.emergencyContact?.firstName || ''} onChange={e => handleEmergencyChange('firstName', e.target.value)} className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none" />
                                ) : (
                                    <p className="font-bold text-pd-darkblue text-lg">{formData.emergencyContact?.firstName || "First Name"}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Last Name</label>
                                {isEditing ? (
                                    <input value={formData.emergencyContact?.lastName || ''} onChange={e => handleEmergencyChange('lastName', e.target.value)} className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none" />
                                ) : (
                                    <p className="font-bold text-pd-darkblue text-lg">{formData.emergencyContact?.lastName || "Last Name"}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Relation</label>
                            {isEditing ? (
                                <input value={formData.emergencyContact?.relation || ''} onChange={e => handleEmergencyChange('relation', e.target.value)} className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none" />
                            ) : (
                                <p className="font-bold text-pd-darkblue text-lg">{formData.emergencyContact?.relation || "Relation"}</p>
                            )}
                        </div>
                         <div>
                            <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Phone Number</label>
                            {isEditing ? (
                                <input value={formData.emergencyContact?.phone || ''} onChange={e => handleEmergencyChange('phone', e.target.value)} className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none" />
                            ) : (
                                <p className="font-bold text-pd-darkblue text-lg">{formData.emergencyContact?.phone || "(555) 555-5555"}</p>
                            )}
                        </div>
                         <div>
                            <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Email</label>
                            {isEditing ? (
                                <input value={formData.emergencyContact?.email || ''} onChange={e => handleEmergencyChange('email', e.target.value)} className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none" />
                            ) : (
                                <p className="font-bold text-pd-darkblue text-lg">{formData.emergencyContact?.email || "email@example.com"}</p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Danger Zone */}
            <div className="mt-12 pt-8 border-t-2 border-pd-lightest">
                <h3 className="font-impact text-2xl text-rose-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <AlertTriangle /> Danger Zone
                </h3>
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <p className="text-pd-darkblue font-bold text-lg mb-1">Delete Account</p>
                        <p className="text-pd-slate text-sm">Permanently delete your account and all associated data. This action cannot be undone.</p>
                    </div>
                    <Button 
                        variant="ghost" 
                        className="!text-rose-600 !border-rose-200 hover:!bg-rose-100 hover:!border-rose-300" 
                        onClick={handleDeleteAccount}
                    >
                        Delete Account
                    </Button>
                </div>
            </div>
         </div>
      )}

      {/* --- NOTIFICATIONS TAB --- */}
      {activeTab === 'notifications' && (
         <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="bg-white border-2 border-pd-lightest">
                <h3 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide mb-6 flex items-center gap-2 border-b-2 border-pd-lightest pb-4">
                    <Bell className="text-pd-yellow" /> Notification Preferences
                </h3>
                
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 bg-pd-lightest/20 rounded-2xl border border-pd-lightest">
                       <div className="flex items-center gap-4">
                           <div className="p-3 bg-white rounded-xl border border-pd-lightest shadow-sm text-pd-darkblue">
                               <Mail size={24} />
                           </div>
                           <div>
                               <h4 className="font-impact text-lg text-pd-darkblue uppercase">Email Notifications</h4>
                               <p className="text-sm text-pd-slate font-medium">Receive weekly summaries and booking receipts.</p>
                           </div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                             type="checkbox" 
                             className="sr-only peer" 
                             checked={formData.notificationSettings?.email} 
                             onChange={(e) => handleNotificationChange('email', e.target.checked)}
                             disabled={!isEditing}
                          />
                          <div className="w-11 h-6 bg-pd-lightest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pd-teal"></div>
                       </label>
                   </div>

                   <div className="flex items-center justify-between p-4 bg-pd-lightest/20 rounded-2xl border border-pd-lightest">
                       <div className="flex items-center gap-4">
                           <div className="p-3 bg-white rounded-xl border border-pd-lightest shadow-sm text-pd-darkblue">
                               <Bell size={24} />
                           </div>
                           <div>
                               <h4 className="font-impact text-lg text-pd-darkblue uppercase">Push Notifications</h4>
                               <p className="text-sm text-pd-slate font-medium">Real-time updates for chat and reminders.</p>
                           </div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                             type="checkbox" 
                             className="sr-only peer" 
                             checked={formData.notificationSettings?.push} 
                             onChange={(e) => handleNotificationChange('push', e.target.checked)}
                             disabled={!isEditing}
                          />
                          <div className="w-11 h-6 bg-pd-lightest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pd-teal"></div>
                       </label>
                   </div>

                   <div className="flex items-center justify-between p-4 bg-pd-lightest/20 rounded-2xl border border-pd-lightest">
                       <div className="flex items-center gap-4">
                           <div className="p-3 bg-white rounded-xl border border-pd-lightest shadow-sm text-pd-darkblue">
                               <MessageSquare size={24} />
                           </div>
                           <div>
                               <h4 className="font-impact text-lg text-pd-darkblue uppercase">SMS Alerts</h4>
                               <p className="text-sm text-pd-slate font-medium">Urgent updates about bookings or emergencies.</p>
                           </div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                             type="checkbox" 
                             className="sr-only peer" 
                             checked={formData.notificationSettings?.sms} 
                             onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                             disabled={!isEditing}
                          />
                          <div className="w-11 h-6 bg-pd-lightest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pd-teal"></div>
                       </label>
                   </div>
                </div>
            </Card>
         </div>
      )}

    </div>
  );
};

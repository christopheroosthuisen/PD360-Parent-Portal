
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button } from './UI';
import { Toast } from './Toast';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Send, 
  Search, 
  LifeBuoy, 
  HelpCircle, 
  Video, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  ExternalLink, 
  ChevronRight, 
  X, 
  Loader
} from 'lucide-react';
import { SMART_FAQS } from '../constants';
import { DataService } from '../services/dataService';
import { SupportCategory, SupportTicket, TicketStatus } from '../types';

interface SupportProps {
  onNavigate: (view: string) => void;
}

const STATUS_CONFIG: Record<TicketStatus, { label: string, color: string, bg: string, icon: React.ElementType }> = {
  'new': { label: 'Received', color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle2 },
  'waiting': { label: 'Action Required', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  'in_progress': { label: 'In Progress', color: 'text-purple-600', bg: 'bg-purple-50', icon: Loader },
  'closed': { label: 'Resolved', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
};

export const Support: React.FC<SupportProps> = ({ onNavigate }) => {
  // --- UI State ---
  const [activeTab, setActiveTab] = useState<'triage' | 'history'>('triage'); // Mobile tabs (on desktop it's split view)
  
  // --- Triage State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [deflectionResult, setDeflectionResult] = useState<typeof SMART_FAQS[0] | null>(null);
  const [showFullForm, setShowFullForm] = useState(false);
  const [category, setCategory] = useState<SupportCategory>('General');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- History State ---
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // --- 1. Load History ---
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await DataService.fetchUserTickets('current_user');
        setTickets(data);
      } catch (e) {
        console.error("Failed to load tickets", e);
      } finally {
        setIsLoadingTickets(false);
      }
    };
    loadTickets();
  }, []);

  // --- 2. AI Deflection Logic ---
  useEffect(() => {
    if (searchQuery.length < 3) {
      setDeflectionResult(null);
      return;
    }

    // Simple keyword matching (In production, use embedding search)
    const lowerQuery = searchQuery.toLowerCase();
    const match = SMART_FAQS.find(faq => 
      faq.keywords.some(k => lowerQuery.includes(k))
    );

    if (match) {
      setDeflectionResult(match);
    } else {
      setDeflectionResult(null);
    }
  }, [searchQuery]);

  // --- 3. Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    try {
      // A. Upload Evidence
      let videoUrl = undefined;
      if (videoFile) {
        videoUrl = await DataService.uploadSupportEvidence(videoFile);
      }

      // B. Metadata Injection
      const metadata = `
        \n--- DEBUG INFO ---
        App: Partners Life Web
        Browser: ${navigator.userAgent}
        Platform: ${navigator.platform}
        Date: ${new Date().toISOString()}
      `;

      // C. Routing Logic
      const pipeline = category === 'Training Advice' ? 'Client Success' : 'Support';

      // D. Create Ticket
      const newTicket = await DataService.createSupportTicket({
        subject: searchQuery || `Support Request: ${category}`,
        category,
        description: description + metadata,
        videoUrl,
        pipeline
      });

      // E. Optimistic Update
      setTickets(prev => [newTicket, ...prev]);
      setToast({ msg: `Ticket #${newTicket.id.split('_')[1]} Created. We're on it!`, type: 'success' });
      
      // Reset
      setSearchQuery('');
      setDescription('');
      setVideoFile(null);
      setShowFullForm(false);
      
    } catch (err) {
      console.error(err);
      setToast({ msg: "Failed to create ticket. Please try again.", type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <div className="bg-pd-darkblue text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pd-teal rounded-full opacity-10 -mr-10 -mt-10 blur-3xl"></div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                    <LifeBuoy size={28} className="text-pd-yellow" />
                </div>
                <h1 className="font-impact text-4xl tracking-wide uppercase">Support Command</h1>
            </div>
            <p className="text-pd-lightest text-lg font-medium opacity-90 max-w-lg">
                Direct line to our training & technical team.
            </p>
        </div>
        
        {/* Quick Contact Info */}
        <div className="relative z-10 flex gap-4 text-sm font-bold bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2">
                <Mail size={16} className="text-pd-teal" />
                <span>support@partnersdogs.com</span>
            </div>
            <div className="w-px bg-white/20"></div>
            <div className="flex items-center gap-2">
                <Phone size={16} className="text-pd-teal" />
                <span>(480) 555-0199</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* LEFT COLUMN: TRIAGE (3/5) */}
        <div className="xl:col-span-3 space-y-6">
           <Card className="bg-white border-2 border-pd-lightest shadow-sm min-h-[500px]">
              <h2 className="font-impact text-2xl text-pd-darkblue uppercase tracking-wide mb-6 flex items-center gap-2">
                 <MessageCircle className="text-pd-teal" /> How can we help?
              </h2>

              {/* SEARCH / TRIAGE INPUT */}
              <div className="relative mb-6">
                 <textarea 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Describe your issue here..."
                    className="w-full h-32 p-5 bg-pd-lightest/30 rounded-2xl border-2 border-pd-lightest focus:border-pd-teal focus:bg-white outline-none text-lg text-pd-darkblue font-medium transition-all resize-none placeholder:text-pd-softgrey"
                 />
                 {searchQuery.length > 0 && (
                    <button 
                       onClick={() => setSearchQuery('')}
                       className="absolute top-4 right-4 p-1 bg-pd-lightest rounded-full text-pd-slate hover:bg-pd-slate hover:text-white transition-colors"
                    >
                       <X size={16} />
                    </button>
                 )}
              </div>

              {/* AI DEFLECTION CARD */}
              {deflectionResult ? (
                 <div className="animate-in slide-in-from-top-4 fade-in duration-300 mb-6">
                    <div className="bg-pd-yellow/10 border-2 border-pd-yellow/50 rounded-2xl p-6 flex gap-4">
                       <div className="p-3 bg-white rounded-full h-fit shadow-sm text-pd-yellow shrink-0">
                          <HelpCircle size={24} />
                       </div>
                       <div className="flex-1">
                          <h4 className="font-impact text-xl text-pd-darkblue uppercase mb-1">Wait! Did you mean...</h4>
                          <p className="font-bold text-pd-slate text-sm mb-2">"{deflectionResult.question}"</p>
                          <p className="text-pd-slate leading-relaxed mb-4">{deflectionResult.answer}</p>
                          
                          <div className="flex gap-3">
                             {deflectionResult.linkUrl && (
                                <Button variant="secondary" onClick={() => onNavigate(deflectionResult.linkUrl!.replace('/', ''))} className="!py-2 !px-4 !text-xs !bg-white">
                                   {deflectionResult.linkText} <ExternalLink size={12} className="ml-2" />
                                </Button>
                             )}
                             <Button variant="ghost" onClick={() => { setDeflectionResult(null); setShowFullForm(true); setDescription(searchQuery); }} className="!text-xs">
                                No, I still need help
                             </Button>
                          </div>
                       </div>
                    </div>
                 </div>
              ) : (
                 // Only show form trigger if search has length and no deflection
                 searchQuery.length > 5 && !showFullForm && (
                    <div className="animate-in fade-in duration-300">
                       <Button 
                          variant="primary" 
                          onClick={() => { setShowFullForm(true); setDescription(searchQuery); }}
                          className="w-full !py-4 shadow-lg flex justify-between group"
                       >
                          <span>Continue to Support Ticket</span>
                          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                       </Button>
                    </div>
                 )
              )}

              {/* FULL EVIDENCE FORM */}
              {showFullForm && (
                 <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-500 border-t-2 border-pd-lightest pt-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Category</label>
                           <select 
                              value={category}
                              onChange={(e) => setCategory(e.target.value as SupportCategory)}
                              className="w-full p-3 bg-white border-2 border-pd-lightest rounded-xl font-bold text-pd-darkblue focus:border-pd-teal outline-none"
                           >
                              <option value="General">General Inquiry</option>
                              <option value="Training Advice">Training Advice</option>
                              <option value="Technical/Billing">Technical / Billing</option>
                           </select>
                        </div>
                        
                        {/* Video Upload Logic */}
                        <div>
                           <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Video Evidence (Optional)</label>
                           <div className="relative">
                              <input 
                                 type="file" 
                                 accept="video/*"
                                 onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
                                 className="hidden" 
                                 id="video-upload"
                              />
                              <label 
                                 htmlFor="video-upload"
                                 className={`w-full p-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${videoFile ? 'border-pd-teal bg-pd-teal/5 text-pd-teal' : 'border-pd-lightest text-pd-softgrey hover:border-pd-darkblue hover:text-pd-darkblue'}`}
                              >
                                 {videoFile ? (
                                    <><CheckCircle2 size={18} /> {videoFile.name}</>
                                 ) : (
                                    <><Upload size={18} /> Upload Video (Max 50MB)</>
                                 )}
                              </label>
                           </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-2">Additional Details</label>
                        <textarea 
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                           className="w-full h-32 p-4 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none text-pd-darkblue font-medium resize-none"
                        />
                    </div>

                    <div className="flex gap-3">
                       <Button type="button" variant="ghost" onClick={() => setShowFullForm(false)} className="flex-1">Cancel</Button>
                       <Button 
                          type="submit" 
                          variant="primary" 
                          className="flex-[2] !py-3 shadow-lg"
                          disabled={isSubmitting}
                       >
                          {isSubmitting ? 'Submitting Ticket...' : 'Submit Request'}
                       </Button>
                    </div>
                 </form>
              )}
           </Card>
        </div>

        {/* RIGHT COLUMN: HISTORY (2/5) */}
        <div className="xl:col-span-2 space-y-6">
           <Card className="bg-pd-lightest/30 border-2 border-pd-lightest h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-impact text-xl text-pd-darkblue uppercase tracking-wide">Ticket History</h3>
                 {isLoadingTickets && <Loader className="animate-spin text-pd-teal" size={18} />}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                 {tickets.length === 0 && !isLoadingTickets ? (
                    <div className="text-center py-12 text-pd-softgrey italic">No active tickets found.</div>
                 ) : (
                    tickets.map(ticket => {
                       const statusStyle = STATUS_CONFIG[ticket.status] || STATUS_CONFIG['new'];
                       const StatusIcon = statusStyle.icon;
                       
                       return (
                          <div key={ticket.id} className="bg-white p-4 rounded-xl border border-pd-lightest shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                             <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded flex items-center gap-1 ${statusStyle.color} ${statusStyle.bg}`}>
                                   <StatusIcon size={12} /> {statusStyle.label}
                                </span>
                                <span className="text-[10px] font-bold text-pd-softgrey">#{ticket.id.split('_')[1] || ticket.id}</span>
                             </div>
                             
                             <h4 className="font-bold text-pd-darkblue text-sm mb-1 line-clamp-1">{ticket.subject}</h4>
                             <p className="text-xs text-pd-slate mb-3 line-clamp-2">{ticket.description}</p>
                             
                             <div className="flex justify-between items-center text-[10px] text-pd-softgrey font-bold uppercase tracking-wider border-t border-pd-lightest pt-2">
                                <span>{new Date(ticket.lastUpdated).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1 group-hover:text-pd-teal transition-colors">View Details <ChevronRight size={12} /></span>
                             </div>
                          </div>
                       );
                    })
                 )}
              </div>
           </Card>
        </div>

      </div>
    </div>
  );
};

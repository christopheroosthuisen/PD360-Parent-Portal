
import React, { useState } from 'react';
import { Card, Button } from './UI';
import { MessageCircle, Mail, Phone, ChevronDown, ChevronUp, Send, Search, LifeBuoy, FileText, HelpCircle } from 'lucide-react';

const FAQS = [
    {
        question: "How do I upgrade my subscription?",
        answer: "You can view subscription tiers by clicking the floating Izzy button (bottom right) and selecting the 'Coach' tab."
    },
    {
        question: "My training video won't upload.",
        answer: "Ensure your video is in MP4 or MOV format and under 100MB. If issues persist, try compressing the video or checking your internet connection."
    },
    {
        question: "Can I add a second dog to my profile?",
        answer: "Yes! Open the sidebar menu by clicking your dog's name/avatar dropdown, then select 'Add New Dog' at the bottom of the list."
    },
    {
        question: "How do I cancel a boarding reservation?",
        answer: "Please contact the facility directly via the 'Spots' tab in the Marketplace or call the location number listed in your booking confirmation email."
    },
    {
        question: "Where can I find my training homework?",
        answer: "Your personalized plan is under 'Training Hub' > 'Schedule'. You can regenerate it weekly."
    }
];

interface SupportProps {
  onNavigate: (view: string) => void;
}

export const Support: React.FC<SupportProps> = ({ onNavigate }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setTimeout(() => {
          alert("Message sent! We'll get back to you shortly.");
          setContactForm({ subject: '', message: '' });
          setIsSubmitting(false);
      }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        {/* Header */}
        <div className="bg-pd-darkblue text-white p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pd-teal rounded-full opacity-10 -mr-10 -mt-10 blur-3xl"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                        <LifeBuoy size={24} className="text-pd-yellow" />
                    </div>
                    <h1 className="font-impact text-4xl tracking-wide uppercase">Support Center</h1>
                </div>
                <p className="text-pd-lightest text-lg font-medium max-w-2xl">
                    Need help with the app or your training journey? Search our knowledge base or get in touch with the team.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Contact */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="bg-white border-2 border-pd-lightest h-full">
                    <h3 className="font-impact text-2xl text-pd-darkblue uppercase mb-6 flex items-center gap-2">
                        <MessageCircle className="text-pd-teal" /> Contact Us
                    </h3>
                    
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Subject</label>
                            <select 
                                className="w-full p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none font-medium text-pd-darkblue"
                                value={contactForm.subject}
                                onChange={e => setContactForm({...contactForm, subject: e.target.value})}
                                required
                            >
                                <option value="">Select a topic...</option>
                                <option value="technical">Technical Issue</option>
                                <option value="billing">Billing & Subscription</option>
                                <option value="training">Training Question</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider block mb-1">Message</label>
                            <textarea 
                                className="w-full h-32 p-3 bg-pd-lightest/30 rounded-xl border-2 border-pd-lightest focus:border-pd-teal outline-none font-medium text-pd-darkblue resize-none"
                                placeholder="Describe your issue..."
                                value={contactForm.message}
                                onChange={e => setContactForm({...contactForm, message: e.target.value})}
                                required
                            />
                        </div>
                        <Button variant="primary" className="w-full !py-3" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send Message'} <Send size={18} className="ml-2" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t-2 border-pd-lightest space-y-4">
                        <h4 className="font-bold text-pd-darkblue uppercase text-sm tracking-wide">Direct Contact</h4>
                        <div className="flex items-center gap-3 text-pd-slate font-medium">
                            <div className="w-8 h-8 bg-pd-lightest rounded-full flex items-center justify-center text-pd-darkblue">
                                <Mail size={16} />
                            </div>
                            support@partnersdogs.com
                        </div>
                        <div className="flex items-center gap-3 text-pd-slate font-medium">
                             <div className="w-8 h-8 bg-pd-lightest rounded-full flex items-center justify-center text-pd-darkblue">
                                <Phone size={16} />
                            </div>
                            (480) 555-0199
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right Col: FAQ */}
            <div className="lg:col-span-2 space-y-6">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pd-softgrey" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search for help..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-pd-lightest rounded-2xl shadow-sm focus:border-pd-teal outline-none font-medium text-lg text-pd-darkblue placeholder-pd-softgrey transition-all"
                    />
                </div>

                <Card className="bg-white border-2 border-pd-lightest min-h-[400px]">
                    <h3 className="font-impact text-2xl text-pd-darkblue uppercase mb-6 flex items-center gap-2">
                        <HelpCircle className="text-pd-yellow" /> Frequently Asked Questions
                    </h3>
                    
                    <div className="space-y-3">
                        {filteredFaqs.map((faq, idx) => (
                            <div key={idx} className="border-2 border-pd-lightest rounded-xl overflow-hidden bg-pd-lightest/10">
                                <button 
                                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white transition-colors"
                                >
                                    <span className="font-bold text-pd-darkblue">{faq.question}</span>
                                    {openFaqIndex === idx ? <ChevronUp size={20} className="text-pd-teal" /> : <ChevronDown size={20} className="text-pd-softgrey" />}
                                </button>
                                {openFaqIndex === idx && (
                                    <div className="p-4 pt-0 bg-white border-t-2 border-pd-lightest">
                                        <p className="text-pd-slate font-medium mt-4 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                        {filteredFaqs.length === 0 && (
                            <div className="text-center py-12 text-pd-softgrey italic">No results found for "{searchQuery}"</div>
                        )}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t-2 border-pd-lightest flex gap-4">
                        <Button variant="secondary" className="flex-1" icon={FileText} onClick={() => onNavigate('terms')}>Terms of Service</Button>
                        <Button variant="secondary" className="flex-1" icon={FileText} onClick={() => onNavigate('privacy')}>Privacy Policy</Button>
                    </div>
                </Card>
            </div>
        </div>
    </div>
  );
};

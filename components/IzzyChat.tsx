
import React, { useState, useRef, useEffect } from 'react';
import { generateContent } from '../services/gemini';
import { DogData, ChatMessage, CoachConversation } from '../types';
import { getCurrentGrade } from '../constants';
import { DataService } from '../services/dataService';
import { 
  Bot, ShoppingBag, User, Maximize2, ChevronUp, Send, Loader, Sparkles, Plus
} from 'lucide-react';
import { Button } from './UI';
import { useCart } from '../CartContext';

// Define Custom Event Type for global window object
declare global {
  interface WindowEventMap {
    'ask-izzy': CustomEvent<{ message: string; autoSend: boolean }>;
  }
}

interface QuickProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  categoryId?: string;
  brand?: string;
  basePrice?: number;
  title?: string;
}

const RECOMMENDED_PRODUCTS: QuickProduct[] = [
  { id: 'p1', name: 'High Value Training Treats', price: 12.99, image: 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&w=200&q=80', description: 'Perfect for marking behaviors.', categoryId: 'training', brand: 'Partners', basePrice: 12.99, title: 'High Value Training Treats' },
  { id: 'p2', name: 'Biothane Long Line (15ft)', price: 24.99, image: 'https://images.unsplash.com/photo-1551856392-f07d5203001e?auto=format&fit=crop&w=200&q=80', description: 'Essential for recall training.', categoryId: 'training', brand: 'Partners', basePrice: 24.99, title: 'Biothane Long Line (15ft)' },
  { id: 'p3', name: 'Kuranda Place Bed', price: 89.99, image: 'https://images.unsplash.com/photo-1581888227599-779811985203?auto=format&fit=crop&w=200&q=80', description: 'The gold standard for "Place".', categoryId: 'training', brand: 'Kuranda', basePrice: 89.99, title: 'Kuranda Place Bed' },
  { id: 'p4', name: 'Herm Sprenger Prong', price: 29.99, image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=200&q=80', description: 'Made in Germany. Chrome.', categoryId: 'collars', brand: 'Herm Sprenger', basePrice: 29.99, title: 'Herm Sprenger Prong' }
];

interface IzzyChatProps {
  dogData: DogData;
}

export const IzzyChat: React.FC<IzzyChatProps> = ({ dogData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'shop' | 'coach'>('ai');
  const IZZY_AVATAR = "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=100&h=100";

  // --- 1. AI STATE (Izzy) ---
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);

  // --- 2. SHOP STATE ---
  const { addToCart, items: cartItems, cartTotal, toggleCart } = useCart();

  // --- 3. COACH STATE ---
  const [conversations, setConversations] = useState<CoachConversation[]>([
      {
          id: 'c1',
          coachId: 'coach_mike',
          coachName: 'Mike (Senior Trainer)',
          coachAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
          lastMessage: "You're doing great with the Place command!",
          lastMessageTime: '2h ago',
          unreadCount: 1,
          messages: [
              { id: 'm1', sender: 'coach', text: "Hey! How is Barnaby doing with the new homework?", timestamp: '10:00 AM' },
              { id: 'm2', sender: 'user', text: "Really good! He held place for 5 mins.", timestamp: '10:15 AM' },
              { id: 'm3', sender: 'coach', text: "That's awesome! Keep pushing the duration.", timestamp: '10:20 AM' }
          ]
      }
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string>('c1');
  const [coachInput, setCoachInput] = useState('');
  const coachMessagesEndRef = useRef<HTMLDivElement>(null);

  // LOAD HISTORY
  useEffect(() => {
    const loadHistory = async () => {
        const history = await DataService.fetchChatHistory(dogData.id);
        if (history.length > 0) {
            setAiMessages(history);
        } else {
            setAiMessages([{ role: 'ai', text: `Hi! I'm Izzy, your Partners Dogs 360 guide. 🐾\n\nI can help you analyze training videos, interpret behavior scores, or suggest homework exercises. What's on your mind?` }]);
        }
    };
    loadHistory();
  }, [dogData.id]);

  // SAVE HISTORY
  useEffect(() => {
    if (aiMessages.length > 0) {
        DataService.saveChatHistory(dogData.id, aiMessages);
    }
  }, [aiMessages, dogData.id]);

  // --- SCROLL HELPERS ---
  const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isOpen) return;
    if (activeTab === 'ai') scrollToBottom(aiMessagesEndRef);
    if (activeTab === 'coach') scrollToBottom(coachMessagesEndRef);
  }, [isOpen, activeTab, aiMessages, conversations]);

  // --- EVENT LISTENERS ---
  useEffect(() => {
    const handleAskIzzy = (event: CustomEvent<{ message: string; autoSend: boolean }>) => {
      const { message, autoSend } = event.detail;
      setIsOpen(true);
      setActiveTab('ai');
      if (autoSend) {
        handleAiSend(message);
      } else {
        setAiInput(message);
      }
    };
    
    // Explicitly cast the listener to avoid TS errors
    window.addEventListener('ask-izzy', handleAskIzzy as EventListener);
    return () => window.removeEventListener('ask-izzy', handleAskIzzy as EventListener);
  }, [dogData]);

  // --- AI LOGIC ---
  const handleAiSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || aiInput;
    if (!textToSend.trim()) return;

    const newMessages = [...aiMessages, { role: 'user', text: textToSend } as const];
    setAiMessages(newMessages);
    setAiInput('');
    setIsAiTyping(true);

    try {
        const gradeInfo = getCurrentGrade(dogData.currentScore);
        const context = `
          Dog: ${dogData.name}
          Current Score: ${dogData.currentScore}
          Current Grade: ${gradeInfo.current.name}
          You are Izzy, the AI assistant for Partners Dogs 360.
        `;
        const response = await generateContent(textToSend, "gemini-3-pro-preview", context);
        setAiMessages([...newMessages, { role: 'ai', text: response }]);
    } catch (e) {
        setAiMessages([...newMessages, { role: 'ai', text: "I'm having a little trouble connecting right now." }]);
    } finally {
        setIsAiTyping(false);
    }
  };

  // --- SHOP LOGIC ---
  const handleQuickAdd = (prod: QuickProduct) => {
      addToCart({
          id: prod.id,
          title: prod.title || prod.name,
          basePrice: prod.basePrice || prod.price,
          categoryId: prod.categoryId as any || 'training',
          brand: prod.brand || 'Partners',
          description: prod.description,
          hasVariants: false,
          image: prod.image,
          inStock: true
      });
  };

  const openGlobalCart = () => {
      setIsOpen(false);
      toggleCart(true); 
  };

  // --- COACH LOGIC ---
  const handleCoachSend = () => {
    if (!coachInput.trim()) return;
    const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: coachInput,
        timestamp: 'Just now'
    };
    setConversations(prev => prev.map(c => 
        c.id === activeConversationId ? { ...c, messages: [...c.messages, newMessage], lastMessage: newMessage.text, lastMessageTime: 'Just now' } : c
    ));
    setCoachInput('');
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-pd-darkblue text-pd-teal rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center z-50 border-4 border-pd-teal group overflow-hidden"
      >
        <img src={IZZY_AVATAR} alt="Izzy" className="w-full h-full object-cover" />
      </button>
    );
  }

  return (
    <div className={`fixed z-50 bg-white shadow-2xl flex flex-col transition-all duration-300 overflow-hidden border-2 border-pd-darkblue
      ${isExpanded ? 'inset-6 md:inset-20 rounded-3xl' : 'bottom-8 right-8 w-[90vw] md:w-[420px] h-[650px] rounded-3xl'}
    `}>
      {/* HEADER */}
      <div className="bg-pd-darkblue p-4 shrink-0 border-b-4 border-pd-teal text-white flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                {activeTab === 'ai' && <Bot size={24} className="text-pd-teal" />}
                {activeTab === 'shop' && <ShoppingBag size={24} className="text-pd-yellow" />}
                {activeTab === 'coach' && <User size={24} className="text-emerald-400" />}
            </div>
            <div>
                <h3 className="font-impact text-xl tracking-wide leading-none uppercase">
                    {activeTab === 'ai' && 'Izzy AI'}
                    {activeTab === 'shop' && 'Pro Shop'}
                    {activeTab === 'coach' && 'Coach Chat'}
                </h3>
                <p className="text-[10px] text-pd-lightest font-bold uppercase tracking-wider opacity-80">
                    {activeTab === 'ai' && 'Training Assistant'}
                    {activeTab === 'shop' && 'Quick Buy'}
                    {activeTab === 'coach' && 'Mike (Senior Trainer)'}
                </p>
            </div>
         </div>
         <div className="flex items-center gap-2 text-pd-lightest">
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:text-white hover:bg-white/10 rounded"><Maximize2 size={18} /></button>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:text-white hover:bg-white/10 rounded"><ChevronUp size={24} className="rotate-180" /></button>
        </div>
      </div>

      {/* --- BODY CONTENT --- */}
      <div className="flex-1 overflow-hidden relative bg-pd-lightest/30">
          
          {/* 1. IZZY AI TAB */}
          {activeTab === 'ai' && (
              <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {aiMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'ai' && (
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-pd-lightest mr-2 shrink-0">
                                    <img src={IZZY_AVATAR} alt="Izzy" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                                msg.role === 'user' ? 'bg-pd-darkblue text-white rounded-br-none' : 'bg-white text-pd-slate border border-pd-lightest rounded-bl-none'
                            }`}>
                                <div className="markdown-prose whitespace-pre-wrap">{msg.text}</div>
                            </div>
                        </div>
                    ))}
                    {isAiTyping && (
                        <div className="flex justify-start">
                             <div className="w-8 h-8 mr-2"></div>
                             <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-pd-lightest flex gap-1">
                                <div className="w-1.5 h-1.5 bg-pd-slate rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-pd-slate rounded-full animate-bounce delay-75"></div>
                                <div className="w-1.5 h-1.5 bg-pd-slate rounded-full animate-bounce delay-150"></div>
                             </div>
                        </div>
                    )}
                    <div ref={aiMessagesEndRef} />
                  </div>
                  <div className="p-3 bg-white border-t border-pd-lightest flex gap-2">
                      <input 
                        className="flex-1 bg-pd-lightest/50 border border-pd-lightest rounded-xl px-4 py-2 text-sm font-medium focus:border-pd-teal outline-none text-pd-darkblue placeholder-pd-softgrey"
                        placeholder="Ask Izzy..."
                        value={aiInput}
                        onChange={e => setAiInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                      />
                      <Button onClick={() => handleAiSend()} className="!p-2 !rounded-xl" disabled={isAiTyping}>
                          {isAiTyping ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                      </Button>
                  </div>
              </div>
          )}

          {/* 2. SHOP TAB */}
          {activeTab === 'shop' && (
              <div className="flex flex-col h-full overflow-hidden">
                 <div className="flex-1 overflow-y-auto p-4 space-y-6">
                     <div>
                         <h4 className="font-impact text-lg text-pd-darkblue uppercase mb-3 flex items-center gap-2">
                             <Sparkles size={16} className="text-pd-yellow" /> Recommended
                         </h4>
                         <div className="grid grid-cols-2 gap-3">
                             {RECOMMENDED_PRODUCTS.map(prod => (
                                 <div key={prod.id} className="bg-white rounded-xl border border-pd-lightest overflow-hidden hover:border-pd-teal hover:shadow-md transition-all group cursor-pointer" onClick={() => handleQuickAdd(prod)}>
                                     <div className="h-24 bg-pd-lightest overflow-hidden">
                                         <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                     </div>
                                     <div className="p-3">
                                         <p className="font-bold text-pd-darkblue text-xs leading-tight line-clamp-2 mb-1">{prod.name}</p>
                                         <div className="flex justify-between items-center">
                                             <span className="text-pd-teal font-impact text-sm">${prod.price}</span>
                                             <div className="w-6 h-6 bg-pd-lightest rounded-full flex items-center justify-center text-pd-darkblue group-hover:bg-pd-darkblue group-hover:text-white transition-colors">
                                                 <Plus size={12} strokeWidth={3} />
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>

                     {cartItems.length > 0 && (
                         <div className="bg-white rounded-xl border-2 border-pd-lightest p-4">
                             <h4 className="font-impact text-lg text-pd-darkblue uppercase mb-3 border-b border-pd-lightest pb-2">Your Cart</h4>
                             <div className="space-y-3">
                                 {cartItems.map((item) => (
                                     <div key={item.id} className="flex justify-between items-center">
                                         <div className="flex items-center gap-2">
                                             <div className="w-5 h-5 bg-pd-lightest rounded flex items-center justify-center text-xs font-bold text-pd-darkblue">{item.quantity}x</div>
                                             <span className="text-sm font-medium text-pd-slate truncate w-32">{item.title}</span>
                                         </div>
                                         <span className="font-bold text-pd-darkblue text-sm">${(item.finalPrice * item.quantity).toFixed(2)}</span>
                                     </div>
                                 ))}
                                 <div className="pt-2 border-t border-pd-lightest flex justify-between items-end">
                                     <span className="text-xs font-bold text-pd-softgrey uppercase tracking-wider">Total</span>
                                     <span className="font-impact text-xl text-pd-teal">${cartTotal.toFixed(2)}</span>
                                 </div>
                             </div>
                             <Button variant="primary" className="w-full mt-4 !py-3" onClick={openGlobalCart}>
                                 Checkout Now
                             </Button>
                         </div>
                     )}
                 </div>
              </div>
          )}

          {/* 3. COACH TAB */}
          {activeTab === 'coach' && (
              <div className="flex flex-col h-full">
                  <div className="p-3 border-b border-pd-lightest bg-white flex items-center gap-3">
                       <div className="relative">
                           <img src={conversations[0].coachAvatar} alt="Coach" className="w-10 h-10 rounded-full object-cover border border-pd-lightest" />
                           <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                       </div>
                       <div>
                           <p className="font-impact text-pd-darkblue tracking-wide leading-none">{conversations[0].coachName}</p>
                           <p className="text-xs text-pd-slate font-medium">Active Now</p>
                       </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {conversations[0].messages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm ${
                                  msg.sender === 'user' ? 'bg-pd-teal text-white rounded-br-none' : 'bg-white text-pd-slate border border-pd-lightest rounded-bl-none'
                              }`}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                      <div ref={coachMessagesEndRef} />
                  </div>
                  
                  <div className="p-3 bg-white border-t border-pd-lightest flex gap-2">
                      <input 
                        className="flex-1 bg-pd-lightest/50 border border-pd-lightest rounded-xl px-4 py-2 text-sm font-medium focus:border-pd-teal outline-none text-pd-darkblue placeholder-pd-softgrey"
                        placeholder="Message Mike..."
                        value={coachInput}
                        onChange={e => setCoachInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCoachSend()}
                      />
                      <Button onClick={handleCoachSend} className="!p-2 !rounded-xl"><Send size={18} /></Button>
                  </div>
              </div>
          )}
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="bg-white border-t-2 border-pd-lightest p-2 flex justify-between items-center shrink-0">
          {[
             { id: 'ai', icon: Bot, label: 'Izzy' },
             { id: 'shop', icon: ShoppingBag, label: 'Shop' },
             { id: 'coach', icon: User, label: 'Coach' },
          ].map(tab => (
             <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'text-pd-teal bg-pd-teal/5' : 'text-pd-softgrey hover:text-pd-darkblue hover:bg-pd-lightest/30'}`}
             >
                 <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                 <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
             </button>
          ))}
      </div>
    </div>
  );
};

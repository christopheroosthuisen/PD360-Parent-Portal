
import React, { useState } from 'react';
import { DogData, CommunityPost, CommunityEvent } from '../types';
import { MOCK_POSTS, MOCK_EVENTS, LEADERBOARD_DATA } from '../constants';
import { Card, Button, Modal } from './UI';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Calendar, 
  MapPin, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Image as ImageIcon,
  Send,
  CreditCard,
  CheckCircle,
  Users,
  Ticket,
  Clock
} from 'lucide-react';

interface CommunityProps {
  dogData: DogData;
}

export const Community: React.FC<CommunityProps> = ({ dogData }) => {
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_POSTS);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        return {
          ...post,
          likes: post.likedByMe ? post.likes - 1 : post.likes + 1,
          likedByMe: !post.likedByMe
        };
      }
      return post;
    }));
  };

  const handlePost = () => {
    if (!newPostContent.trim()) return;
    
    const newPost: CommunityPost = {
      id: Date.now().toString(),
      authorName: 'You & ' + dogData.name,
      authorAvatar: dogData.avatar,
      timeAgo: 'Just now',
      content: newPostContent,
      likes: 0,
      comments: 0,
      likedByMe: false
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const handleRegister = () => {
    setIsRegistering(true);
    setTimeout(() => {
       setIsRegistering(false);
       setRegistrationSuccess(true);
       // Ideally update event state here to show registered
    }, 1500);
  };

  const closeEventModal = () => {
     setSelectedEvent(null);
     setRegistrationSuccess(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-impact text-5xl text-pd-darkblue tracking-wide uppercase mb-2">PD360 COMMUNITY</h1>
          <p className="text-pd-slate text-lg font-medium">Connect, compete, and celebrate with the pack.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Feed (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create Post */}
          <Card className="bg-white border-2 border-pd-lightest">
            <div className="flex gap-4">
              <img src={dogData.avatar} alt="Me" className="w-12 h-12 rounded-xl object-cover border border-pd-lightest" />
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={`Share a win, ask a question, or post an update about ${dogData.name}...`}
                  className="w-full h-24 bg-pd-lightest/30 rounded-xl p-4 border border-pd-lightest focus:outline-none focus:border-pd-teal focus:bg-white transition-all resize-none text-pd-darkblue font-medium placeholder-pd-softgrey"
                />
                <div className="flex justify-between items-center mt-3">
                  <button className="text-pd-softgrey hover:text-pd-teal transition-colors p-2 rounded-lg hover:bg-pd-lightest flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                    <ImageIcon size={20} /> Photo
                  </button>
                  <Button variant="primary" onClick={handlePost} disabled={!newPostContent.trim()} className="!py-2 !px-6">
                    <Send size={18} /> Post
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map(post => (
              <Card key={post.id} className="bg-white border-2 border-pd-lightest overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img src={post.authorAvatar} alt={post.authorName} className="w-12 h-12 rounded-xl object-cover border border-pd-lightest" />
                    <div>
                      <h4 className="font-impact text-lg text-pd-darkblue tracking-wide leading-none">{post.authorName}</h4>
                      <span className="text-xs text-pd-softgrey font-bold uppercase tracking-wide">{post.timeAgo}</span>
                    </div>
                  </div>
                </div>

                <p className="text-pd-slate leading-relaxed font-medium mb-4 whitespace-pre-wrap">{post.content}</p>
                
                {post.image && (
                  <div className="mb-4 rounded-2xl overflow-hidden">
                    <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
                  </div>
                )}

                {post.tags && (
                  <div className="flex gap-2 mb-4">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs font-bold text-pd-teal bg-pd-lightest/50 px-3 py-1 rounded-full uppercase tracking-wide">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t-2 border-pd-lightest">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition-colors ${post.likedByMe ? 'text-rose-500' : 'text-pd-softgrey hover:text-rose-500'}`}
                  >
                    <Heart size={20} fill={post.likedByMe ? "currentColor" : "none"} />
                    {post.likes} Likes
                  </button>
                  <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-pd-softgrey hover:text-pd-darkblue transition-colors">
                    <MessageSquare size={20} />
                    {post.comments} Comments
                  </button>
                  <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-pd-softgrey hover:text-pd-darkblue transition-colors ml-auto">
                    <Share2 size={20} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Leaderboard & Events (1/3 width) */}
        <div className="space-y-8">
          
          {/* Leaderboard Widget */}
          <Card className="bg-pd-darkblue text-white border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pd-teal rounded-full opacity-10 -mr-10 -mt-10 blur-2xl"></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <Trophy size={24} className="text-pd-yellow" />
              </div>
              <h3 className="font-impact text-2xl tracking-wide uppercase">LEADERBOARD</h3>
            </div>

            <div className="space-y-4 relative z-10">
              {LEADERBOARD_DATA.map((entry, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                    entry.dogName === dogData.name 
                      ? 'bg-pd-teal/20 border-pd-teal' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center font-impact text-xl ${index < 3 ? 'text-pd-yellow' : 'text-pd-softgrey'}`}>
                    #{entry.rank}
                  </div>
                  <img src={entry.avatar} alt={entry.dogName} className="w-10 h-10 rounded-lg object-cover bg-white/10" />
                  <div className="flex-1 min-w-0">
                    <p className="font-impact text-lg tracking-wide truncate">{entry.dogName}</p>
                    <p className="text-xs font-bold text-pd-lightest/70 uppercase">{entry.score} pts</p>
                  </div>
                  <div className="text-pd-lightest">
                    {entry.trend === 'up' && <TrendingUp size={16} className="text-pd-teal" />}
                    {entry.trend === 'down' && <TrendingDown size={16} className="text-rose-400" />}
                    {entry.trend === 'stable' && <Minus size={16} className="text-pd-softgrey" />}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 text-center font-impact text-pd-teal uppercase tracking-wide hover:text-white transition-colors text-sm">
              View Full Rankings
            </button>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-white border-l-8 border-l-pd-teal">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pd-lightest rounded-xl">
                <Calendar size={24} className="text-pd-darkblue" />
              </div>
              <h3 className="font-impact text-2xl text-pd-darkblue tracking-wide uppercase">UPCOMING EVENTS</h3>
            </div>

            <div className="space-y-4">
              {MOCK_EVENTS.map(event => (
                <div key={event.id} className="p-4 bg-pd-lightest/30 rounded-2xl border border-pd-lightest hover:border-pd-teal transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold bg-white text-pd-darkblue px-2 py-1 rounded-md border border-pd-lightest uppercase tracking-wide">
                      {event.type}
                    </span>
                    <span className="text-xs font-bold text-pd-teal">{event.attendees} Going</span>
                  </div>
                  <h4 className="font-impact text-lg text-pd-darkblue tracking-wide mb-1">{event.title}</h4>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-pd-slate font-medium">
                      <Calendar size={14} className="text-pd-softgrey" />
                      {event.date} • {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-pd-slate font-medium">
                      <MapPin size={14} className="text-pd-softgrey" />
                      {event.location}
                    </div>
                  </div>

                  <Button variant="secondary" className="w-full mt-4 !py-2 !text-xs" onClick={() => setSelectedEvent(event)}>
                    {event.price ? `Ticket: $${event.price}` : "RSVP Now"}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Event Registration Modal */}
      <Modal isOpen={!!selectedEvent} onClose={closeEventModal} title={registrationSuccess ? "You're Going!" : "Registration"}>
         {selectedEvent && (
            registrationSuccess ? (
               <div className="text-center space-y-6 py-10 animate-in zoom-in duration-300">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-lg border-4 border-white">
                     <CheckCircle size={48} />
                  </div>
                  <div>
                     <h3 className="font-impact text-4xl text-pd-darkblue uppercase mb-2">Ticket Confirmed</h3>
                     <p className="text-pd-slate font-medium text-lg">See you at <span className="text-pd-teal font-bold">{selectedEvent.title}</span>!</p>
                  </div>
                  <div className="bg-pd-lightest/30 p-4 rounded-xl border border-pd-lightest max-w-xs mx-auto text-sm text-pd-softgrey">
                     Check your email for your digital pass and additional details.
                  </div>
                  <Button variant="primary" onClick={closeEventModal} className="w-full !py-4">Awesome!</Button>
               </div>
            ) : (
               <div className="space-y-8">
                  {/* Event Header */}
                  <div className="flex items-start gap-4 pb-6 border-b-2 border-pd-lightest">
                     <div className="w-16 h-16 bg-pd-darkblue text-white rounded-2xl flex flex-col items-center justify-center shrink-0 font-impact shadow-md">
                         <span className="text-2xl leading-none">{selectedEvent.date.split(' ')[1]}</span>
                         <span className="text-xs text-pd-teal uppercase tracking-wider">{selectedEvent.date.split(' ')[0]}</span>
                     </div>
                     <div>
                        <h3 className="font-impact text-3xl text-pd-darkblue uppercase leading-none mb-2">{selectedEvent.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm font-bold text-pd-softgrey uppercase tracking-wide">
                           <span className="flex items-center gap-1"><Clock size={14} /> {selectedEvent.time}</span>
                           <span className="flex items-center gap-1"><MapPin size={14} /> {selectedEvent.location}</span>
                        </div>
                     </div>
                  </div>

                  {/* Ticket/RSVP Details */}
                  <div className="space-y-4">
                     <div className="bg-pd-lightest/20 rounded-2xl p-5 border-2 border-pd-lightest flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <Ticket size={24} className="text-pd-teal" />
                           <div>
                              <p className="font-impact text-lg text-pd-darkblue uppercase tracking-wide">General Admission</p>
                              <p className="text-xs text-pd-slate font-bold">x1 Adult • x1 Dog</p>
                           </div>
                        </div>
                        <span className="font-impact text-2xl text-pd-darkblue">
                           {selectedEvent.price ? `$${selectedEvent.price}` : "FREE"}
                        </span>
                     </div>

                     {selectedEvent.price && (
                        <div className="bg-white rounded-2xl p-5 border-2 border-pd-lightest">
                           <h4 className="font-bold text-pd-darkblue uppercase text-xs mb-3 flex items-center gap-2 tracking-wider">
                              <CreditCard size={14} /> Payment Method
                           </h4>
                           <div className="flex items-center justify-between p-3 border-2 border-pd-lightest rounded-xl bg-pd-lightest/10">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-6 bg-pd-darkblue rounded flex items-center justify-center">
                                    <div className="w-6 h-4 border-2 border-white/30 rounded-sm"></div>
                                 </div>
                                 <span className="font-bold text-pd-darkblue text-sm">•••• 4242</span>
                              </div>
                              <button className="text-xs font-bold text-pd-teal uppercase hover:text-pd-darkblue">Change</button>
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="flex gap-3 pt-2">
                      <Button variant="ghost" onClick={closeEventModal} className="flex-1">Cancel</Button>
                      <Button 
                         variant="primary" 
                         className="flex-[2] !py-4 !text-lg shadow-lg" 
                         onClick={handleRegister} 
                         disabled={isRegistering}
                      >
                         {isRegistering ? "Processing..." : selectedEvent.price ? `Pay $${selectedEvent.price} & Join` : "Confirm RSVP"}
                      </Button>
                  </div>
               </div>
            )
         )}
      </Modal>
    </div>
  );
};

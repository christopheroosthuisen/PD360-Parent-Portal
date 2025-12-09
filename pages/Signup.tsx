
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card } from '../components/UI';
import { Mail, Lock, User, CheckCircle, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import { Toast } from '../components/Toast';

interface SignupProps {
  onNavigate: (view: string) => void;
  onLoginSuccess: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onNavigate, onLoginSuccess }) => {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setToast({ msg: "Passwords do not match.", type: 'error' });
      return;
    }
    if (!agreed) {
      setToast({ msg: "Please agree to the Terms & Privacy Policy.", type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, name);
      setToast({ msg: "Account created successfully!", type: 'success' });
      setTimeout(onLoginSuccess, 1000);
    } catch (error: any) {
      console.error(error);
      let errorMsg = "Failed to create account.";
      if (error.code === 'auth/email-already-in-use') errorMsg = "Email is already in use.";
      if (error.code === 'auth/weak-password') errorMsg = "Password should be at least 6 characters.";
      setToast({ msg: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pd-darkblue flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pd-teal rounded-full opacity-10 -mr-20 -mt-20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pd-yellow rounded-full opacity-5 -ml-20 -mb-20 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
            <Logo variant="stacked" className="mx-auto" />
            <p className="text-pd-lightest/80 font-medium mt-4">Join the Partners Life</p>
        </div>

        <Card className="bg-white shadow-2xl border-4 border-pd-lightest/10">
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-2 mb-2">
                    <button type="button" onClick={() => onNavigate('login')} className="text-pd-softgrey hover:text-pd-darkblue transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="font-impact text-2xl text-pd-darkblue uppercase flex-1 text-center pr-6">Create Account</h2>
                </div>
                
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-1 block">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-pd-softgrey" size={20} />
                            <input 
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-pd-lightest/30 border-2 border-pd-lightest rounded-xl focus:border-pd-teal outline-none font-medium text-pd-darkblue transition-colors"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-1 block">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-pd-softgrey" size={20} />
                            <input 
                                type="email" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-pd-lightest/30 border-2 border-pd-lightest rounded-xl focus:border-pd-teal outline-none font-medium text-pd-darkblue transition-colors"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-1 block">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-pd-softgrey" size={20} />
                            <input 
                                type="password" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-pd-lightest/30 border-2 border-pd-lightest rounded-xl focus:border-pd-teal outline-none font-medium text-pd-darkblue transition-colors"
                                placeholder="Create password"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-1 block">Confirm Password</label>
                        <div className="relative">
                            <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-pd-softgrey" size={20} />
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-pd-lightest/30 border-2 border-pd-lightest rounded-xl focus:border-pd-teal outline-none font-medium text-pd-darkblue transition-colors"
                                placeholder="Confirm password"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={agreed}
                                    onChange={e => setAgreed(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="w-5 h-5 border-2 border-pd-softgrey rounded bg-white peer-checked:bg-pd-teal peer-checked:border-pd-teal transition-all"></div>
                                <CheckCircle size={14} className="absolute text-white left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                            </div>
                            <span className="text-xs text-pd-slate leading-tight select-none">
                                I agree to the <button type="button" onClick={() => onNavigate('terms')} className="font-bold underline hover:text-pd-darkblue">Terms of Service</button> and <button type="button" onClick={() => onNavigate('privacy')} className="font-bold underline hover:text-pd-darkblue">Privacy Policy</button>.
                            </span>
                        </label>
                    </div>
                </div>

                <Button variant="primary" className="w-full !py-3 !text-lg shadow-lg" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Start Training'}
                </Button>
            </form>
        </Card>
        
        <Footer onNavigate={onNavigate} variant="light" />
      </div>
    </div>
  );
};

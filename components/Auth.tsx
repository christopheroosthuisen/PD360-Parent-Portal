
import React, { useState } from 'react';
import { Button, Card } from './UI';
import { Mail, Lock, User, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { Logo } from './Logo';
import { Footer } from './Footer';

interface AuthProps {
  view: 'login' | 'signup' | 'forgot-password' | 'privacy' | 'terms';
  onNavigate: (view: string) => void;
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ view, onNavigate, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (view === 'signup' && !agreed) {
        setError('You must agree to the Terms & Privacy Policy to continue.');
        return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (view === 'login') {
        if (email && password) onLogin();
        else setError('Invalid credentials');
      } else if (view === 'signup') {
        if (password !== confirmPassword) setError('Passwords do not match');
        else onLogin();
      } else {
        // Forgot password success state handled visually
        alert('Reset link sent to ' + email);
        onNavigate('login');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-pd-darkblue flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pd-teal rounded-full opacity-10 -mr-20 -mt-20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pd-yellow rounded-full opacity-5 -ml-20 -mb-20 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md flex-1 flex flex-col justify-center">
        {/* Brand Header */}
        <div className="text-center mb-8">
            <Logo variant="stacked" className="mx-auto" />
            <p className="text-pd-lightest/80 font-medium mt-4">Your complete training companion.</p>
        </div>

        <Card className="bg-white shadow-2xl border-4 border-pd-lightest/10">
            {view === 'login' && (
                <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="font-impact text-2xl text-pd-darkblue uppercase text-center mb-2">Welcome Back</h2>
                    
                    <div className="space-y-4">
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
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="text-right mt-2">
                                <button type="button" onClick={() => onNavigate('forgot-password')} className="text-xs font-bold text-pd-teal hover:text-pd-darkblue transition-colors">
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-lg flex items-center gap-2 animate-in slide-in-from-top-1">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <Button variant="primary" className="w-full !py-3 !text-lg shadow-lg" disabled={isLoading}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>

                    <div className="text-center pt-4 border-t border-pd-lightest">
                        <p className="text-sm text-pd-slate font-medium">
                            Don't have an account?{' '}
                            <button type="button" onClick={() => onNavigate('signup')} className="text-pd-teal font-bold hover:underline">
                                Create one
                            </button>
                        </p>
                    </div>
                </form>
            )}

            {view === 'signup' && (
                <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                    <h2 className="font-impact text-2xl text-pd-darkblue uppercase text-center mb-2">Create Account</h2>
                    
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

                        {/* Terms & Privacy Checkbox */}
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

                    {error && (
                        <div className="p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-lg flex items-center gap-2 animate-in slide-in-from-top-1">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <Button variant="primary" className="w-full !py-3 !text-lg shadow-lg" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Start Training'}
                    </Button>

                    <div className="text-center pt-4 border-t border-pd-lightest">
                        <p className="text-sm text-pd-slate font-medium">
                            Already have an account?{' '}
                            <button type="button" onClick={() => onNavigate('login')} className="text-pd-teal font-bold hover:underline">
                                Sign In
                            </button>
                        </p>
                    </div>
                </form>
            )}

            {view === 'forgot-password' && (
                <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-left-4">
                    <button type="button" onClick={() => onNavigate('login')} className="text-pd-softgrey hover:text-pd-darkblue transition-colors flex items-center gap-1 text-sm font-bold">
                        <ArrowLeft size={16} /> Back to Login
                    </button>
                    
                    <div className="text-center mb-4">
                        <h2 className="font-impact text-2xl text-pd-darkblue uppercase mb-2">Reset Password</h2>
                        <p className="text-pd-slate text-sm">Enter your email address and we'll send you a link to reset your password.</p>
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

                    <Button variant="primary" className="w-full !py-3 !text-lg shadow-lg" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </form>
            )}
        </Card>
        
        <Footer onNavigate={onNavigate} variant="light" />
      </div>
    </div>
  );
};

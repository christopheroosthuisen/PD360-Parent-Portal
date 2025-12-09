
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card } from '../components/UI';
import { Mail, Lock, AlertCircle, ArrowRight, Phone, MessageSquare } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import { Toast } from '../components/Toast';
import { isFirebaseConfigured, auth } from '../firebaseConfig';
import firebase from 'firebase/compat/app';

interface LoginProps {
  onNavigate: (view: string) => void;
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate, onLoginSuccess }) => {
  const { login, loginWithGoogle, loginWithPhone } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  // Email State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  // Cleanup Recaptcha when switching methods to prevent DOM detachment issues
  useEffect(() => {
    return () => {
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
            } catch (e) {
                // Ignore clearing errors
            }
            window.recaptchaVerifier = undefined;
        }
    };
  }, [loginMethod]);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      setToast({ msg: "Welcome back!", type: 'success' });
      setTimeout(onLoginSuccess, 500);
    } catch (error: any) {
      console.error(error);
      let errorMsg = "Failed to log in.";
      if (error.code === 'auth/wrong-password') errorMsg = "Incorrect password.";
      if (error.code === 'auth/user-not-found') errorMsg = "No account found with this email.";
      if (error.message && error.message.includes('Security Alert')) errorMsg = error.message;
      
      setToast({ msg: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        let appVerifier;
        if (isFirebaseConfigured && auth) {
            // Initialize Recaptcha if not already done
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                    'size': 'invisible',
                    'callback': () => {
                        // reCAPTCHA solved, allow signInWithPhoneNumber.
                    }
                });
            }
            appVerifier = window.recaptchaVerifier;
        }

        const result = await loginWithPhone(phoneNumber, appVerifier);
        setConfirmationResult(result);
        setToast({ msg: "Verification code sent!", type: 'success' });
    } catch (error: any) {
        console.error("Phone Auth Error:", error);
        let msg = "Failed to send code.";
        if (error.code === 'auth/invalid-phone-number') msg = "Invalid phone number.";
        if (error.code === 'auth/too-many-requests') msg = "Too many requests. Try again later.";
        setToast({ msg: msg, type: 'error' });
        // Reset recaptcha if error
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = undefined;
        }
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          await confirmationResult.confirm(verificationCode);
          setToast({ msg: "Phone verified successfully!", type: 'success' });
          setTimeout(onLoginSuccess, 500);
      } catch (error: any) {
          console.error("Verify Error:", error);
          setToast({ msg: "Invalid code. Please try again.", type: 'error' });
      } finally {
          setLoading(false);
      }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      setToast({ msg: "Signed in with Google", type: 'success' });
      setTimeout(onLoginSuccess, 500);
    } catch (error: any) {
      setToast({ msg: "Google sign-in failed.", type: 'error' });
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
            <p className="text-pd-lightest/80 font-medium mt-4">Professional Dog Training Dashboard</p>
        </div>

        <Card className="bg-white shadow-2xl border-4 border-pd-lightest/10">
            <div className="flex bg-pd-lightest/30 p-1 rounded-xl mb-6">
                <button 
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${loginMethod === 'email' ? 'bg-white text-pd-darkblue shadow-sm' : 'text-pd-softgrey hover:text-pd-slate'}`}
                >
                    Email
                </button>
                <button 
                    onClick={() => setLoginMethod('phone')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${loginMethod === 'phone' ? 'bg-white text-pd-darkblue shadow-sm' : 'text-pd-softgrey hover:text-pd-slate'}`}
                >
                    Phone
                </button>
            </div>

            {/* EMAIL LOGIN FORM */}
            {loginMethod === 'email' && (
                <form onSubmit={handleSubmitEmail} className="space-y-5 animate-in fade-in slide-in-from-left-2">
                    <h2 className="font-impact text-2xl text-pd-darkblue uppercase text-center mb-2">Member Login</h2>
                    
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

                    <Button variant="primary" className="w-full !py-3 !text-lg shadow-lg" disabled={loading}>
                        {loading ? 'Verifying...' : 'Sign In'}
                    </Button>
                </form>
            )}

            {/* PHONE LOGIN FORM */}
            {loginMethod === 'phone' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-2">
                    <h2 className="font-impact text-2xl text-pd-darkblue uppercase text-center mb-2">
                        {confirmationResult ? 'Verify Code' : 'Mobile Login'}
                    </h2>

                    {!confirmationResult ? (
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-1 block">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-pd-softgrey" size={20} />
                                    <input 
                                        type="tel" 
                                        value={phoneNumber}
                                        onChange={e => setPhoneNumber(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-pd-lightest/30 border-2 border-pd-lightest rounded-xl focus:border-pd-teal outline-none font-medium text-pd-darkblue transition-colors"
                                        placeholder="+1 555 555 5555"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-pd-softgrey mt-1">Include country code (e.g. +1 for USA)</p>
                            </div>
                            <div id="recaptcha-container" ref={recaptchaRef}></div>
                            <Button variant="primary" className="w-full !py-3 !text-lg shadow-lg" disabled={loading || !phoneNumber}>
                                {loading ? 'Sending Code...' : 'Send Verification Code'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-pd-softgrey uppercase tracking-wider mb-1 block">Enter Code</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-pd-softgrey" size={20} />
                                    <input 
                                        type="text" 
                                        value={verificationCode}
                                        onChange={e => setVerificationCode(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-pd-lightest/30 border-2 border-pd-lightest rounded-xl focus:border-pd-teal outline-none font-bold text-pd-darkblue text-lg tracking-widest transition-colors"
                                        placeholder="123456"
                                        required
                                    />
                                </div>
                            </div>
                            <Button variant="accent" className="w-full !py-3 !text-lg shadow-lg" disabled={loading || !verificationCode}>
                                {loading ? 'Verifying...' : 'Verify & Sign In'}
                            </Button>
                            <button 
                                type="button" 
                                onClick={() => { setConfirmationResult(null); setVerificationCode(''); }}
                                className="w-full text-center text-xs font-bold text-pd-softgrey hover:text-pd-darkblue"
                            >
                                Try a different number
                            </button>
                        </form>
                    )}
                </div>
            )}

            <div className="relative py-2 mt-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-pd-lightest"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-pd-softgrey font-medium">Or continue with</span></div>
            </div>

            <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-pd-lightest hover:border-pd-softgrey text-pd-darkblue font-bold py-3 rounded-xl transition-all"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign in with Google
            </button>

            <div className="text-center pt-4 border-t border-pd-lightest mt-4">
                <p className="text-sm text-pd-slate font-medium">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => onNavigate('signup')} className="text-pd-teal font-bold hover:underline">
                        Join the Pack
                    </button>
                </p>
            </div>
        </Card>
        
        <Footer onNavigate={onNavigate} variant="light" />
      </div>
    </div>
  );
};
declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}

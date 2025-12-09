
import React from 'react';
import { Button } from '../components/UI';
import { Home, HelpCircle, ArrowLeft, Search } from 'lucide-react';
import { Logo } from '../components/Logo';

interface NotFoundProps {
  onNavigate: (view: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-pd-lightest flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-pd-teal/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pd-yellow/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="relative z-10 max-w-lg w-full">
        <div className="mb-8 animate-in zoom-in duration-500 flex justify-center">
           <Logo variant="stacked" />
        </div>

        <div className="bg-white rounded-3xl p-8 border-4 border-pd-lightest shadow-xl space-y-6 relative animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-pd-darkblue rounded-full flex items-center justify-center border-8 border-pd-lightest shadow-lg">
                <Search size={48} className="text-pd-teal" />
            </div>

            <div className="pt-10">
                <h1 className="font-impact text-6xl text-pd-darkblue tracking-wide mb-2">404</h1>
                <h2 className="font-impact text-2xl text-pd-slate uppercase tracking-wide mb-4">Off Leash & Off Map</h2>
                <p className="text-pd-slate font-medium text-lg leading-relaxed">
                    Ruh-roh! We can't find the page you're sniffing around for. It might have been dug up or moved to a new yard.
                </p>
            </div>

            <div className="grid gap-3 pt-4">
                <Button variant="primary" onClick={() => onNavigate('dashboard')} icon={Home} className="w-full !py-4 shadow-lg">
                    Return to Dashboard
                </Button>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => onNavigate('support')} icon={HelpCircle} className="flex-1">
                        Help Center
                    </Button>
                    <Button variant="ghost" onClick={() => window.history.back()} icon={ArrowLeft} className="flex-1">
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

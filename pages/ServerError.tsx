
import React from 'react';
import { Button } from '../components/UI';
import { RefreshCw, MessageSquare, Home, AlertTriangle } from 'lucide-react';
import { Logo } from '../components/Logo';

interface ServerErrorProps {
  onNavigate?: (view: string) => void;
  resetErrorBoundary?: () => void;
}

export const ServerError: React.FC<ServerErrorProps> = ({ onNavigate, resetErrorBoundary }) => {
  const handleRefresh = () => {
    if (resetErrorBoundary) {
        resetErrorBoundary();
    } else {
        window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-pd-darkblue flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-pd-teal/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse"></div>

      <div className="relative z-10 max-w-lg w-full">
        <div className="mb-10 opacity-80 flex justify-center">
           {/* Logo rendered within a lighter container to ensure visibility against dark bg if needed, though darkblue on darkblue is hidden, we rely on white text usually. 
               However, Logo component has fixed colors. We'll wrap it in a white glow or just let the icon speak. 
               Let's simply render the icon version which looks good on dark. */}
           <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/10">
             <Logo variant="icon" />
           </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/10 shadow-2xl space-y-6 text-white animate-in zoom-in duration-500">
            <div className="inline-flex p-4 bg-pd-yellow rounded-full text-pd-darkblue mb-2 shadow-lg animate-bounce">
                <AlertTriangle size={48} strokeWidth={2.5} />
            </div>

            <div>
                <h1 className="font-impact text-5xl tracking-wide mb-2">WHOOPS!</h1>
                <h2 className="font-bold text-xl uppercase tracking-widest text-pd-teal mb-4">System Hiccup</h2>
                <p className="text-pd-lightest font-medium text-lg leading-relaxed opacity-90">
                    Something went wrong on our end. We're chasing the bug (and our tails) to fix it.
                </p>
            </div>

            <div className="grid gap-3 pt-6">
                <Button variant="accent" onClick={handleRefresh} icon={RefreshCw} className="w-full !py-4 shadow-lg !bg-pd-teal !text-pd-darkblue hover:!bg-white">
                    Try Again
                </Button>
                {onNavigate && (
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => onNavigate('dashboard')} icon={Home} className="flex-1 !bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
                            Dashboard
                        </Button>
                        <Button variant="secondary" onClick={() => onNavigate('support')} icon={MessageSquare} className="flex-1 !bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
                            Support
                        </Button>
                    </div>
                )}
            </div>
        </div>
        
        <p className="mt-8 text-pd-lightest/40 text-sm font-mono">Error Code: 500 • Internal Server Error</p>
      </div>
    </div>
  );
};

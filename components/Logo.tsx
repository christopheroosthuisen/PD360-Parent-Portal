import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'stacked' | 'mobile';
  collapsed?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", variant = 'full', collapsed = false }) => {
  // Icon Only (Collapsed Sidebar or small widget)
  if (variant === 'icon' || collapsed) {
    return (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_#34C6B9] transition-transform hover:-translate-y-0.5 bg-pd-darkblue overflow-hidden ${className}`}>
         <img src="logo_1.png" alt="Partners Life" className="w-full h-full object-cover" />
      </div>
    );
  }

  // Stacked (Auth, Loading)
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-[6px_6px_0px_0px_#34C6B9] mb-4 bg-pd-darkblue overflow-hidden relative">
           <img src="logo_1.png" alt="Partners Life" className="w-full h-full object-cover z-10" />
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10 z-20"></div>
        </div>
        <div className="flex flex-col items-center leading-none">
          <span className="font-impact text-5xl text-pd-darkblue tracking-wide">PARTNERS</span>
          <span className="font-impact text-5xl text-pd-teal tracking-widest">LIFE</span>
        </div>
      </div>
    );
  }

  // Mobile Header
  if (variant === 'mobile') {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="w-8 h-8 rounded-lg bg-pd-darkblue overflow-hidden border border-pd-lightest">
               <img src="logo_2.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-1">
                <span className="font-impact text-2xl text-pd-darkblue tracking-wide">PARTNERS</span>
                <span className="font-impact text-2xl text-pd-teal tracking-wide">LIFE</span>
            </div>
        </div>
      );
  }

  // Full Standard (Expanded Sidebar)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_#34C6B9] transition-transform hover:-translate-y-0.5 bg-pd-darkblue overflow-hidden shrink-0">
         <img src="logo_1.png" alt="Partners Life" className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col leading-none select-none">
        <span className="font-impact text-3xl text-pd-darkblue tracking-wide">PARTNERS</span>
        <span className="font-impact text-2xl text-pd-teal tracking-widest">LIFE</span>
      </div>
    </div>
  );
};
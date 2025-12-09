
import React from 'react';

interface FooterProps {
  onNavigate: (view: string) => void;
  className?: string;
  variant?: 'light' | 'dark'; // Light for dark backgrounds (Auth), Dark for light backgrounds (App)
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, className = "", variant = 'dark' }) => {
  // Styles based on background context
  const textColor = variant === 'light' ? 'text-pd-lightest/60 hover:text-white' : 'text-pd-softgrey hover:text-pd-darkblue';
  const copyrightColor = variant === 'light' ? 'text-pd-lightest/40' : 'text-pd-lightest/80';
  const dividerColor = variant === 'light' ? 'text-pd-lightest/20' : 'text-pd-lightest';

  return (
    <footer className={`py-8 text-center text-sm ${className}`}>
      <p className={`mb-3 ${copyrightColor} font-medium`}>
        © {new Date().getFullYear()} Partners Animal Institute, Inc. All rights reserved.
      </p>
      <div className="flex justify-center gap-4 font-bold uppercase tracking-wider text-[10px]">
        <button onClick={() => onNavigate('privacy')} className={`transition-colors ${textColor}`}>
          Privacy Policy
        </button>
        <span className={dividerColor}>•</span>
        <button onClick={() => onNavigate('terms')} className={`transition-colors ${textColor}`}>
          Terms of Service
        </button>
        <span className={dividerColor}>•</span>
        <button onClick={() => onNavigate('support')} className={`transition-colors ${textColor}`}>
          Support
        </button>
      </div>
    </footer>
  );
};

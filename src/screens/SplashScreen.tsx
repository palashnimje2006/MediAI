import React, { useEffect } from 'react';
import { Activity, ShieldCheck, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-sky-600 via-sky-700 to-teal-800 text-white select-none">
      <div />

      <div className="flex flex-col items-center text-center space-y-4">
        {/* Animated App Logo with Medical Cross & AI sparkles */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-2xl shadow-teal-950/50">
            <div className="relative flex items-center justify-center">
              <span className="text-4xl font-extrabold tracking-tighter text-white">M+</span>
              <Sparkles className="w-5 h-5 text-teal-300 absolute -top-3 -right-3 animate-spin duration-3000" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-teal-400 text-slate-900 flex items-center justify-center font-bold text-xs shadow-md">
            AI
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Medi AI</h1>
          <p className="text-sm text-sky-200 mt-1 font-medium">Smart Healthcare & Doctor Booking System</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs text-sky-100 backdrop-blur-sm">
          <Activity className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
          <span>Ask • Find • Book • Consult</span>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="flex flex-col items-center space-y-2 text-center text-xs text-sky-200/80">
        <div className="w-6 h-6 border-2 border-teal-300 border-t-transparent rounded-full animate-spin" />
        <p className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
          <span>NABH & NMC Standard Architecture</span>
        </p>
      </div>
    </div>
  );
};

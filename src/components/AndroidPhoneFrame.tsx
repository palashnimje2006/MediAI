import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Monitor } from 'lucide-react';

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
  isFramed: boolean;
  onToggleFrame: () => void;
  darkTheme: boolean;
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  children,
  isFramed,
  onToggleFrame,
  darkTheme,
}) => {
  const [time, setTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isFramed) {
    return (
      <div className={`min-h-screen ${darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 select-none">
      {/* Frame Controls Bar */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between text-xs text-slate-400 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-300">Android Preview (Pixel 8 Pro)</span>
        </div>
        <button
          onClick={onToggleFrame}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-sky-400 font-medium transition cursor-pointer"
          title="Switch between Android Phone Frame and Fullscreen Responsive Mode"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Switch to Fullscreen</span>
        </button>
      </div>

      {/* Android Device Shell */}
      <div className="relative w-full max-w-[420px] h-[860px] bg-slate-900 rounded-[50px] p-3 shadow-2xl shadow-sky-950/40 ring-1 ring-slate-800 border-4 border-slate-700/80 flex flex-col overflow-hidden">
        {/* Hardware details: Volume & Power keys */}
        <div className="absolute -left-[7px] top-28 w-[4px] h-12 bg-slate-600 rounded-l-md" />
        <div className="absolute -left-[7px] top-44 w-[4px] h-12 bg-slate-600 rounded-l-md" />
        <div className="absolute -right-[7px] top-32 w-[4px] h-16 bg-slate-600 rounded-r-md" />

        {/* Screen Bezel and Inner Display */}
        <div className={`relative w-full h-full rounded-[40px] overflow-hidden flex flex-col ${darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} shadow-inner`}>
          {/* Android Status Bar */}
          <div className="h-8 px-6 flex items-center justify-between text-xs font-semibold z-40 shrink-0 select-none backdrop-blur-md bg-opacity-70">
            {/* Left: Time & notification icons */}
            <div className="flex items-center gap-1.5">
              <span>{time}</span>
            </div>

            {/* Center: Camera Punch Hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-800/60" />

            {/* Right: 5G, Wi-Fi, Battery */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-sky-500">5G</span>
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px]">100%</span>
                <BatteryMedium className="w-3.5 h-3.5 rotate-90" />
              </div>
            </div>
          </div>

          {/* Android App Viewport */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
            {children}
          </div>

          {/* Android Gesture Bar */}
          <div className="h-5 w-full flex items-center justify-center shrink-0 z-40 bg-transparent">
            <div className="w-32 h-1 bg-slate-400/50 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

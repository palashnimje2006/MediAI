import React, { useState } from 'react';
import { Stethoscope, CalendarCheck, FileCheck2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface OnboardingScreenProps {
  onFinish: () => void;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onFinish,
  onGoToLogin,
  onGoToRegister,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Find Verified Specialists',
      desc: 'Browse accredited doctors across top medical centers. Filter by specialty, experience, city, and consultation fees.',
      icon: Stethoscope,
      accent: 'from-sky-500 to-sky-700',
      badge: 'Certified Medical Practitioners',
    },
    {
      title: 'Instant Slot Booking',
      desc: 'View live availability without double bookings. Reserve confirmed morning, afternoon, or evening slots with concurrency protection.',
      icon: CalendarCheck,
      accent: 'from-teal-500 to-teal-700',
      badge: 'Zero Waiting Queue',
    },
    {
      title: 'AI Assistant & Digital Prescriptions',
      desc: 'Triage symptoms with Medi AI health assistant and receive legally valid, digitally signed prescriptions on your phone.',
      icon: FileCheck2,
      accent: 'from-blue-600 to-indigo-700',
      badge: '24x7 Digital Healthcare',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onFinish();
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 bg-slate-900 text-white select-none">
      {/* Top Skip button */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>MEDI AI</span>
        </div>
        <button
          onClick={onFinish}
          className="text-xs text-slate-400 hover:text-white transition font-medium cursor-pointer"
        >
          Skip
        </button>
      </div>

      {/* Slide Illustration Card */}
      <div className="my-auto flex flex-col items-center text-center space-y-6">
        <div
          className={`w-32 h-32 rounded-3xl bg-gradient-to-tr ${slide.accent} flex items-center justify-center shadow-2xl shadow-sky-950/60 transition-transform duration-500`}
        >
          <Icon className="w-16 h-16 text-white stroke-[1.5]" />
        </div>

        <div className="space-y-2 max-w-xs">
          <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-teal-300 text-[11px] font-semibold tracking-wide border border-slate-700">
            {slide.badge}
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">{slide.title}</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{slide.desc}</p>
        </div>

        {/* Indicators */}
        <div className="flex items-center gap-2 pt-2">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-8 bg-sky-500' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-3 pt-4">
        <button
          onClick={handleNext}
          className="w-full py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition active:scale-98 cursor-pointer"
        >
          <span>{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={onGoToLogin}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onGoToRegister}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold transition cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

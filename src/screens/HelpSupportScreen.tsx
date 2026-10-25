import React, { useState } from 'react';
import {
  HelpCircle,
  PhoneCall,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Send,
} from 'lucide-react';

interface HelpSupportScreenProps {
  onBack: () => void;
  onOpenEmergency: () => void;
}

export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({
  onBack,
  onOpenEmergency,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How does Medi AI prevent double bookings of doctor slots?',
      a: 'The Medi AI backend utilizes database-level concurrency protection and unique constraints on (doctor_id, date, time_slot). When a patient selects and confirms an appointment slot, the server executes a synchronized transaction lock so another patient attempting to book the identical slot receives an immediate conflict notice.',
    },
    {
      q: 'Is the Medi AI Health Assistant a substitute for a doctor?',
      a: 'No. Medi AI provides clinical triage advice and healthcare education based on your symptoms. It never prescribes prescription drug dosages or replaces a licensed medical doctor. In case of acute emergencies (chest pain, acute shortness of breath, severe trauma), dial 112 / 108 immediately.',
    },
    {
      q: 'Are digital prescriptions issued here legally recognized?',
      a: 'Yes. Every prescription issued by verified doctors on Medi AI includes the doctor’s National Medical Commission (NMC) registration license number, clinical diagnosis, and a verifiable SHA-256 digital signature conforming to the Information Technology Act 2000 and Telemedicine Practice Guidelines.',
    },
    {
      q: 'What is the appointment cancellation & rescheduling policy?',
      a: 'Patients can cancel or reschedule any upcoming confirmed appointment up to 2 hours prior to the scheduled slot time. Upon cancellation, the slot is immediately released back to the live directory for other patients.',
    },
  ];

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTicketSubject('');
      setTicketMessage('');
    }, 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-[11px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded-full">
          24x7 Support
        </span>
      </div>

      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Help & Emergency Directory</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Frequently asked questions, emergency response hotlines & patient support
        </p>
      </div>

      {/* Emergency Assistance Quick Callout */}
      <div className="p-4 rounded-3xl bg-rose-600 text-white shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs">
            <ShieldAlert className="w-4 h-4 text-white" />
            <span>CRITICAL MEDICAL EMERGENCY</span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
            Toll-Free 24x7
          </span>
        </div>
        <p className="text-xs text-rose-100">
          In case of severe trauma, suspected cardiac arrest, or acute stroke, call emergency ambulance dispatch directly.
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => (window.location.href = 'tel:112')}
            className="py-2.5 px-3 rounded-2xl bg-white text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-50 transition cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 112 (National)</span>
          </button>
          <button
            onClick={() => (window.location.href = 'tel:108')}
            className="py-2.5 px-3 rounded-2xl bg-rose-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-900 transition cursor-pointer border border-white/20"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 108 (Ambulance)</span>
          </button>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-sky-500" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  <span className="pr-2">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-sky-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Support Desk Ticket Form */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
          <MessageSquare className="w-4 h-4 text-teal-600" />
          <span>Contact Healthcare Support Desk</span>
        </div>

        {submitted ? (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Support ticket logged! Reference: SUP-2026-9812. Our coordinator will contact you.</span>
          </div>
        ) : (
          <form onSubmit={handleSupportSubmit} className="space-y-2.5">
            <input
              type="text"
              required
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              placeholder="Inquiry Subject (e.g. Appointment rescheduling help)"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <textarea
              rows={2}
              required
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              placeholder="Describe your issue or query..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Ticket</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

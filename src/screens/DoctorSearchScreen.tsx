import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, ShieldCheck, MapPin, Stethoscope, Clock, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorSearchScreenProps {
  initialSearch?: string;
  initialSpecialty?: string;
  onSelectDoctor: (doctorId: string) => void;
  onBack?: () => void;
}

export const DoctorSearchScreen: React.FC<DoctorSearchScreenProps> = ({
  initialSearch = '',
  initialSpecialty = 'All',
  onSelectDoctor,
  onBack,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [city, setCity] = useState('All');
  const [maxFee, setMaxFee] = useState<number>(2000);
  const [minExp, setMinExp] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const specialties = [
    'All',
    'Cardiologist',
    'Neurologist',
    'Dermatologist',
    'Orthopedic Surgeon',
    'Pediatrician',
    'General Physician',
  ];

  const cities = ['All', 'Bengaluru', 'New Delhi', 'Mumbai', 'Gurugram'];

  const fetchDoctors = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (specialty && specialty !== 'All') params.append('specialty', specialty);
    if (city && city !== 'All') params.append('city', city);
    if (maxFee < 2000) params.append('maxFee', maxFee.toString());
    if (minExp > 0) params.append('minExp', minExp.toString());

    fetch(`/api/doctors?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialty, city, maxFee, minExp]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header with Search and Filter button */}
      <div className="space-y-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Find Doctors</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {doctors.length} Verified medical practitioners available
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              showFilters
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Doctor name, hospital, symptom..."
            className="w-full pl-10 pr-20 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition cursor-pointer"
          >
            Find
          </button>
        </form>
      </div>

      {/* Specialty Filter Horizontal Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {specialties.map((spec) => (
          <button
            key={spec}
            onClick={() => setSpecialty(spec)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              specialty === spec
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Advanced Filter Drawer */}
      {showFilters && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm text-xs">
          <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
            <span>Filter by City & Budget</span>
            <button
              onClick={() => {
                setCity('All');
                setMaxFee(2000);
                setMinExp(0);
              }}
              className="text-[11px] text-sky-600 dark:text-sky-400 font-medium hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-medium">City</label>
            <div className="flex flex-wrap gap-1.5">
              {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium cursor-pointer ${
                    city === c
                      ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Max Fee</span>
                <span className="font-bold text-emerald-600">₹{maxFee}</span>
              </div>
              <input
                type="range"
                min="500"
                max="2000"
                step="100"
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Min Experience</span>
                <span className="font-bold text-sky-600">{minExp}+ Years</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="2"
                value={minExp}
                onChange={(e) => setMinExp(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Doctors List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading verified doctor roster...</span>
          </div>
        ) : doctors.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 mx-auto flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold">No Doctors Found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Try adjusting your specialty, city or fee filters to discover other available practitioners.
            </p>
          </div>
        ) : (
          doctors.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDoctor(doc.id)}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 shadow-sm transition space-y-3 cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 transition">
                        {doc.name}
                      </h3>
                      {doc.isVerified && (
                        <span title="NMC Registered Practitioner">
                          <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                      {doc.specialty}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {doc.qualifications} • {doc.experienceYears} yrs exp
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <span>{doc.rating}</span>
                    <span className="text-[10px] text-slate-400">({doc.reviewCount})</span>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block mt-1">
                    ₹{doc.consultationFee}
                  </span>
                </div>
              </div>

              {/* Hospital Affiliation & Working Days */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1 truncate max-w-[200px]">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">
                    {doc.hospitalName}, {doc.city}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Select Slot</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

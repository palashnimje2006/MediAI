import React, { useState, useEffect } from 'react';
import { Search, Building2, MapPin, Phone, Star, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';
import { Hospital } from '../types';

interface HospitalSearchScreenProps {
  onSelectHospital: (hospitalId: string) => void;
  onBack?: () => void;
}

export const HospitalSearchScreen: React.FC<HospitalSearchScreenProps> = ({
  onSelectHospital,
  onBack,
}) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [loading, setLoading] = useState(true);

  const cities = ['All', 'New Delhi', 'Bengaluru', 'Mumbai', 'Gurugram'];

  const fetchHospitals = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedCity && selectedCity !== 'All') params.append('city', selectedCity);

    fetch(`/api/hospitals?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setHospitals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchHospitals();
  }, [selectedCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHospitals();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      )}

      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Accredited Hospitals</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tertiary care centers, multi-specialty clinics & trauma units
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search AIIMS, Apollo, Fortis, Manipal..."
          className="w-full pl-10 pr-20 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* City Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              selectedCity === city
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Hospitals List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading hospitals...</span>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            No hospital centers match your search.
          </div>
        ) : (
          hospitals.map((hosp) => (
            <div
              key={hosp.id}
              onClick={() => onSelectHospital(hosp.id)}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:border-purple-300 dark:hover:border-purple-800 transition cursor-pointer group"
            >
              <div className="relative h-32 w-full overflow-hidden bg-slate-200">
                <img
                  src={hosp.image}
                  alt={hosp.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                  <div>
                    <h3 className="text-sm font-extrabold leading-tight text-white drop-shadow">
                      {hosp.name}
                    </h3>
                    <p className="text-[11px] text-slate-200 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>{hosp.city}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-bold text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{hosp.rating}</span>
                  </div>
                </div>

                {hosp.hasEmergency24x7 && (
                  <div className="absolute top-2.5 left-3 px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                    <ShieldAlert className="w-3 h-3" />
                    <span>24x7 Emergency</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 space-y-2.5 text-xs">
                {/* Departments pills */}
                <div className="flex flex-wrap gap-1">
                  {hosp.departments.slice(0, 4).map((dept, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-medium"
                    >
                      {dept}
                    </span>
                  ))}
                  {hosp.departments.length > 4 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{hosp.departments.length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>{hosp.doctorCount}+ Specialists on staff</span>
                  <div className="flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition">
                    <span>View Departments & Doctors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

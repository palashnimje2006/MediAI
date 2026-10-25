import React, { useState } from 'react';
import { Mail, Lock, LogIn, Stethoscope, User, Building2, AlertCircle, Sparkles } from 'lucide-react';
import { UserRole } from '../types';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { googleSignIn } from '../lib/googleAuth';

interface LoginScreenProps {
  onLoginSuccess: (userData: any) => void;
  onNavigateToRegisterPatient: () => void;
  onNavigateToRegisterDoctor: () => void;
  onNavigateToForgotPassword: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegisterPatient,
  onNavigateToRegisterDoctor,
  onNavigateToForgotPassword,
}) => {
  const [email, setEmail] = useState('rahul.verma@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Network error during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    setRole(demoRole);
    if (demoRole === 'patient') {
      setEmail('rahul.verma@example.com');
      setPassword('password123');
    } else if (demoRole === 'doctor') {
      setEmail('dr.priya@apollo.med');
      setPassword('docpassword123');
    } else {
      setEmail('admin.blr@apollo.med');
      setPassword('adminpass123');
    }
    setError(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      <div className="space-y-6 max-w-sm mx-auto w-full pt-4">
        {/* Branding Header */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 mx-auto flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-sky-600/20">
            M+
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to Medi AI healthcare network
          </p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleQuickDemo('patient')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              role === 'patient'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('doctor')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              role === 'doctor'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('hospital_admin')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              role === 'hospital_admin'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hospital</span>
          </button>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="p-3 bg-sky-50/80 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 rounded-2xl text-[11px] space-y-1.5">
          <div className="flex items-center gap-1 font-bold text-sky-800 dark:text-sky-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>Quick 1-Click Evaluation Accounts</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('patient')}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 text-slate-700 dark:text-slate-300 hover:border-sky-400 font-medium transition cursor-pointer"
            >
              👤 Patient (Rahul)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('doctor')}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 text-slate-700 dark:text-slate-300 hover:border-sky-400 font-medium transition cursor-pointer"
            >
              🩺 Doctor (Dr. Priya)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('hospital_admin')}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 text-slate-700 dark:text-slate-300 hover:border-sky-400 font-medium transition cursor-pointer"
            >
              🏥 Admin (Apollo)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <button
                type="button"
                onClick={onNavigateToForgotPassword}
                className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/25 transition active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In as {role.replace('_', ' ').toUpperCase()}</span>
              </>
            )}
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">or continue with</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <GoogleSignInButton
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);
                const googleRes = await googleSignIn();
                if (!googleRes) {
                  // User dismissed or closed the Google Sign-in popup
                  return;
                }
                if (googleRes.user) {
                  const googleUser = googleRes.user;
                  // Log in or link with backend user
                  const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: googleUser.email || 'google.user@example.com',
                      role,
                    }),
                  });
                  const data = await res.json();
                  if (data.user) {
                    onLoginSuccess({
                      ...data.user,
                      name: googleUser.displayName || data.user.name,
                      email: googleUser.email || data.user.email,
                      avatar: googleUser.photoURL,
                    });
                  }
                }
              } catch (err: any) {
                if (
                  err?.code === 'auth/popup-closed-by-user' ||
                  err?.code === 'auth/cancelled-popup-request' ||
                  err?.message?.includes('popup-closed-by-user')
                ) {
                  return;
                }
                setError(err.message || 'Google Sign-In failed.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            text="Sign in with Google"
          />
        </form>
      </div>

      {/* Registration Links */}
      <div className="pt-6 pb-2 text-center space-y-2 border-t border-slate-200 dark:border-slate-800 mt-6">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          New to Medi AI?{' '}
          <button
            onClick={onNavigateToRegisterPatient}
            className="text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
          >
            Register as Patient
          </button>
        </p>
        <p className="text-[11px] text-slate-400">
          Medical Practitioner?{' '}
          <button
            onClick={onNavigateToRegisterDoctor}
            className="text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
          >
            Register Doctor Practice
          </button>
        </p>
      </div>
    </div>
  );
};

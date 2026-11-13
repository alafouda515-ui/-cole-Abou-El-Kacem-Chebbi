import React, { useState } from 'react';
import { authService } from '../../services/api';
import {
  GraduationCap,
  Shield,
  Building,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface Props {
  onLoginSuccess: (user: any, school: any) => void;
  onNavigateRegister: () => void;
}

export const LoginPage: React.FC<Props> = ({ onLoginSuccess, onNavigateRegister }) => {
  const [email, setEmail] = useState('direction@ecole-chebbi.tn');
  const [password, setPassword] = useState('Admin2026!');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      if (data.success) {
        onLoginSuccess(data.user, data.school);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la connexion. Vérifiez vos identifiants.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-3">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">EduSaaS Platform</h1>
        <p className="mt-1 text-sm text-slate-400">
          Plateforme multi-établissements de gestion scolaire
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-800/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-700/80">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Connexion à votre espace</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Accédez à votre établissement ou à l'administration de la plateforme
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Adresse e-mail professionnelle
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-3 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  placeholder="nom@ecole.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Vérification en cours...</span>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Comptes de test pré-configurés (1 clic) :</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin@edusaas.com', 'SuperAdmin2026!')}
                className="p-2.5 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/40 rounded-xl text-left transition"
              >
                <div className="font-bold text-purple-300 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Super Admin
                </div>
                <div className="text-slate-400 text-[10px] truncate">superadmin@edusaas.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('direction@ecole-chebbi.tn', 'Admin2026!')}
                className="p-2.5 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-700/40 rounded-xl text-left transition"
              >
                <div className="font-bold text-blue-300 flex items-center gap-1">
                  <Building className="w-3 h-3" /> École Chebbi (Active)
                </div>
                <div className="text-slate-400 text-[10px] truncate">direction@ecole-chebbi.tn</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('youssef.mansour@ecole-chebbi.tn', 'Teacher2026!')}
                className="p-2.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/40 rounded-xl text-left transition"
              >
                <div className="font-bold text-emerald-300 flex items-center gap-1">
                  <User className="w-3 h-3" /> Enseignant Mansour
                </div>
                <div className="text-slate-400 text-[10px] truncate">youssef.mansour@...</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('rayan.bensalem@eleve-chebbi.tn', 'Student2026!')}
                className="p-2.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-700/40 rounded-xl text-left transition"
              >
                <div className="font-bold text-cyan-300 flex items-center gap-1">
                  <User className="w-3 h-3" /> Élève Rayan
                </div>
                <div className="text-slate-400 text-[10px] truncate">rayan.bensalem@...</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('direction@etoiles-avenir.tn', 'Admin2026!')}
                className="p-2.5 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-700/40 rounded-xl text-left transition"
              >
                <div className="font-bold text-indigo-300 flex items-center gap-1">
                  <Building className="w-3 h-3" /> École Étoiles (SaaS 2)
                </div>
                <div className="text-slate-400 text-[10px] truncate">direction@etoiles-avenir.tn</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('contact@almanar-sfax.tn', 'Pending2026!')}
                className="p-2.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/40 rounded-xl text-left transition"
              >
                <div className="font-bold text-amber-300 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> École en attente
                </div>
                <div className="text-slate-400 text-[10px] truncate">contact@almanar-sfax.tn</div>
              </button>
            </div>
          </div>

          {/* New School Registration link */}
          <div className="mt-6 text-center text-xs">
            <span className="text-slate-400">Vous représentez un nouvel établissement ? </span>
            <button
              type="button"
              onClick={onNavigateRegister}
              className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
            >
              Inscrire votre école
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

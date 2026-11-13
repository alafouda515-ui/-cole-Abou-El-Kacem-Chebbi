import React, { useState } from 'react';
import { authService } from '../../services/api';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  GraduationCap,
  Clock,
  Send
} from 'lucide-react';

interface Props {
  onNavigateLogin: () => void;
}

export const RegisterSchoolPage: React.FC<Props> = ({ onNavigateLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    manager_name: '',
    password: '',
    confirm_password: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ name: string; email: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.password !== formData.confirm_password) {
      setErrorMessage('La confirmation du mot de passe ne correspond pas.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.registerSchool(formData);
      if (res.success) {
        setSuccessData({
          name: formData.name,
          email: formData.email
        });
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="inline-flex p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-3">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">Adhésion d'un Établissement</h1>
        <p className="mt-1 text-sm text-slate-400">
          Rejoignez la plateforme SaaS de gestion scolaire EduSaaS
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-slate-800/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-700/80">
          {successData ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Demande Enregistrée avec Succès !</h2>
              <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl text-xs text-slate-300 space-y-2 max-w-lg mx-auto text-left">
                <p>
                  • Établissement : <span className="font-bold text-white">{successData.name}</span>
                </p>
                <p>
                  • Email administrateur : <span className="font-mono text-blue-300">{successData.email}</span>
                </p>
                <p>
                  • Statut actuel : <span className="inline-block px-2 py-0.5 rounded font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30">PENDING (En attente)</span>
                </p>
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Conformément aux règles de sécurité de la plateforme, votre établissement doit être validé par le Super Administrateur avant d'activer votre espace de gestion.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/30"
                >
                  Retour à la page de connexion
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Formulaire d'inscription</h2>
                  <p className="text-xs text-slate-400">Renseignez les coordonnées de l'école et du responsable</p>
                </div>
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour connexion</span>
                </button>
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
                    Nom officiel de l'établissement scolaire *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    placeholder="Ex: École Primaire Ibn Khaldoun"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Email professionnel de l'école *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
                      placeholder="direction@ibnkhaldoun.tn"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Téléphone de contact *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
                      placeholder="+216 71 000 000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Adresse physique complète *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    placeholder="Numéro, rue, ville, code postal"
                  />
                </div>

                <div className="pt-2 border-t border-slate-700/60">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nom & Prénom du directeur / responsable *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.manager_name}
                    onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    placeholder="M. Ahmed Mansour"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Mot de passe administrateur *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Confirmer le mot de passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.confirm_password}
                      onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <span>Enregistrement en cours...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Soumettre la demande d'inscription</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

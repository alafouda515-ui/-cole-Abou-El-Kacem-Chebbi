import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  GraduationCap,
  Calendar,
  UserCheck,
  Server,
  RotateCcw,
  Bell,
  LogOut,
  ShieldAlert,
  Building
} from 'lucide-react';
import { DeploymentGuideModal } from './Deployment/DeploymentGuideModal';

interface Props {
  onBackToSuperAdmin?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<Props> = ({ onBackToSuperAdmin, onLogout }) => {
  const {
    currentUser,
    currentSchool,
    switchRole,
    academicYear,
    setAcademicYear,
    availableYears,
    resetToDefaultData,
    notifications,
    logout
  } = useApp();

  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin Plateforme', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'SCHOOL_ADMIN':
      case 'ADMIN':
        return { label: 'Direction / Admin École', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'TEACHER':
        return { label: 'Enseignant', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'PARENT':
        return { label: 'Parent d\'élève', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'STUDENT':
        return { label: 'Élève', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ACCOUNTANT':
        return { label: 'Comptable / Secrétariat', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Utilisateur', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const currentBadge = getRoleBadge(currentUser.role);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      window.location.reload();
    }
  };

  return (
    <>
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        {/* Super admin impersonation top notice */}
        {onBackToSuperAdmin && (
          <div className="bg-purple-900 text-purple-100 px-4 py-1.5 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-300" />
              <span>
                Session Super Admin : Vous inspectez actuellement l'espace de <strong>{currentSchool?.name}</strong>.
              </span>
            </div>
            <button
              onClick={onBackToSuperAdmin}
              className="px-2.5 py-0.5 rounded bg-purple-700 hover:bg-purple-600 text-white font-bold text-[11px] transition"
            >
              ← Retour au Dashboard Super Admin
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark & Active School */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight truncate max-w-xs sm:max-w-md">
                {currentSchool?.name || 'École Abou El Kacem Chebbi'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-400" />
                {currentSchool?.address || 'Gestion Scolaire Multi-Établissements'}
              </span>
            </div>
          </div>

          {/* Zone 2: Academic Year Selector + Deployment Guide */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/80 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600 font-medium">Année :</span>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="bg-transparent font-bold text-slate-900 cursor-pointer focus:outline-hidden"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowDeploymentModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1.5 transition"
              title="Consulter le guide de déploiement (Cloudflare, Railway, VPS)"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Guide Déploiement</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm("Réinitialiser les données locales de l'école ?")) {
                  resetToDefaultData();
                }
              }}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition"
              title="Réinitialiser les données de test"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Zone 3: Role Switcher & User Profile & Logout */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notifications drop trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                title="Notifications système récentes"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-900">Journal des Notifications</span>
                    <span className="text-[10px] text-slate-400">{notifications.length} récentes</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {notifications.slice(0, 5).map((n) => (
                      <div key={n.id} className="p-3 hover:bg-slate-50">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-semibold text-blue-600">{n.type}</span>
                          <span>{new Date(n.date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <p className="text-slate-700 text-xs line-clamp-2">{n.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Role quick selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <label htmlFor="role-select" className="sr-only">Changer de rôle</label>
              <UserCheck className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                id="role-select"
                value={currentUser.role}
                onChange={(e) => switchRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-semibold text-slate-800 py-1 pr-2 rounded focus:outline-hidden cursor-pointer"
              >
                <option value="ADMIN">Direction (Admin École)</option>
                <option value="TEACHER">Enseignant (M. Youssef Mansour)</option>
                <option value="PARENT">Parent (Mme Samira Ben Salem)</option>
                <option value="STUDENT">Élève (Rayan Ben Salem)</option>
                <option value="ACCOUNTANT">Comptable (M. Karim Trabelsi)</option>
              </select>
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 pl-1">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
              />
              <div className="hidden lg:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {currentUser.name}
                </span>
                <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded border font-semibold ${currentBadge.color}`}>
                  {currentBadge.label}
                </span>
              </div>
            </div>

            {/* Disconnect button */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Déconnexion de l'application"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {showDeploymentModal && <DeploymentGuideModal onClose={() => setShowDeploymentModal(false)} />}
    </>
  );
};

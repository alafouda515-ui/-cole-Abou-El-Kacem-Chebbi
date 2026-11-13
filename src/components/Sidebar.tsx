import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  GraduationCap,
  ClockAlert,
  CreditCard,
  FileCheck2,
  Mail,
  ShieldCheck
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'students'
  | 'academics'
  | 'schedule'
  | 'grades'
  | 'absences'
  | 'finances'
  | 'homework'
  | 'messaging'
  | 'audit';

interface Props {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const { currentUser, currentSchool } = useApp();

  const getNavItems = () => {
    switch (currentUser.role) {
      case 'SUPER_ADMIN':
      case 'SCHOOL_ADMIN':
      case 'ADMIN':
        return [
          { key: 'dashboard' as TabKey, label: 'Tableau de bord', icon: LayoutDashboard },
          { key: 'students' as TabKey, label: 'Élèves & Dossiers', icon: Users },
          { key: 'academics' as TabKey, label: 'Classes, Matières, Salles', icon: BookOpen },
          { key: 'schedule' as TabKey, label: 'Emploi du temps', icon: CalendarDays },
          { key: 'grades' as TabKey, label: 'Notes & Bulletins', icon: GraduationCap },
          { key: 'absences' as TabKey, label: 'Absences & Retards', icon: ClockAlert },
          { key: 'finances' as TabKey, label: 'Gestion Financière', icon: CreditCard },
          { key: 'homework' as TabKey, label: 'Devoirs (Homework)', icon: FileCheck2 },
          { key: 'messaging' as TabKey, label: 'Messagerie & Annonces', icon: Mail },
          { key: 'audit' as TabKey, label: 'Journal d\'Audit (Logs)', icon: ShieldCheck }
        ];

      case 'TEACHER':
        return [
          { key: 'dashboard' as TabKey, label: 'Mon Espace Enseignant', icon: LayoutDashboard },
          { key: 'grades' as TabKey, label: 'Saisie des Notes', icon: GraduationCap },
          { key: 'homework' as TabKey, label: 'Gestion des Devoirs', icon: FileCheck2 },
          { key: 'schedule' as TabKey, label: 'Mon Emploi du temps', icon: CalendarDays },
          { key: 'absences' as TabKey, label: 'Appel & Absences', icon: ClockAlert },
          { key: 'students' as TabKey, label: 'Mes Élèves', icon: Users },
          { key: 'messaging' as TabKey, label: 'Messagerie Parents', icon: Mail }
        ];

      case 'PARENT':
        return [
          { key: 'dashboard' as TabKey, label: 'Espace Famille', icon: LayoutDashboard },
          { key: 'grades' as TabKey, label: 'Notes & Bulletins', icon: GraduationCap },
          { key: 'homework' as TabKey, label: 'Devoirs & Suivi', icon: FileCheck2 },
          { key: 'absences' as TabKey, label: 'Justifier Absences', icon: ClockAlert },
          { key: 'schedule' as TabKey, label: 'Emploi du temps', icon: CalendarDays },
          { key: 'finances' as TabKey, label: 'Paiements & Reçus', icon: CreditCard },
          { key: 'messaging' as TabKey, label: 'Messagerie Enseignants', icon: Mail }
        ];

      case 'STUDENT':
        return [
          { key: 'dashboard' as TabKey, label: 'Mon Espace Élève', icon: LayoutDashboard },
          { key: 'homework' as TabKey, label: 'Mes Devoirs à Rendre', icon: FileCheck2 },
          { key: 'schedule' as TabKey, label: 'Mon Emploi du temps', icon: CalendarDays },
          { key: 'grades' as TabKey, label: 'Mes Notes & Moyennes', icon: GraduationCap },
          { key: 'messaging' as TabKey, label: 'Communications', icon: Mail }
        ];

      case 'ACCOUNTANT':
        return [
          { key: 'dashboard' as TabKey, label: 'Tableau Financier', icon: LayoutDashboard },
          { key: 'finances' as TabKey, label: 'Paiements & Encaissements', icon: CreditCard },
          { key: 'students' as TabKey, label: 'Inscriptions & Pré-inscriptions', icon: Users },
          { key: 'messaging' as TabKey, label: 'Relances & Avis', icon: Mail },
          { key: 'audit' as TabKey, label: 'Journal des Paiements', icon: ShieldCheck }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="no-print w-64 bg-slate-900 text-slate-300 shrink-0 flex flex-col justify-between py-5 border-r border-slate-800">
      <div className="space-y-1 px-3">
        <div className="px-3 pb-3 pt-1 text-[11px] font-bold tracking-wider uppercase text-slate-400">
          Navigation Principale
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* School details footer in sidebar */}
      <div className="px-4 py-3 mx-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-[11px] text-slate-400">
        <p className="font-bold text-slate-200 truncate">{currentSchool?.name || 'Plateforme Scolaire'}</p>
        <p className="text-[10px] text-slate-400">ID: {currentSchool?.id || 'Multi-Tenant'}</p>
        <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px]">
          <span className="text-emerald-400 font-semibold">● SaaS Actif</span>
          <span className="text-slate-400">v2.0 PostgreSQL</span>
        </div>
      </div>
    </aside>
  );
};

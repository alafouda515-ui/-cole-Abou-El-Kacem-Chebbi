import React, { useState, useEffect } from 'react';
import { superAdminService, authService } from '../../services/api';
import {
  Building,
  Users,
  GraduationCap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  Search,
  ExternalLink,
  Shield,
  RefreshCw,
  LogOut,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';

interface SchoolItem {
  id: string;
  name: string;
  slug: string;
  address: string;
  email: string;
  phone: string;
  manager_name: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  created_at: string;
  studentCount: number;
  teacherCount: number;
  classCount: number;
  adminEmail: string;
  adminName: string;
}

interface Stats {
  totalSchools: number;
  activeSchools: number;
  pendingSchools: number;
  suspendedSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalPayments: number;
}

interface Props {
  onLogout: () => void;
  onSelectSchool?: (schoolId: string, schoolName: string) => void;
}

export const SuperAdminDashboard: React.FC<Props> = ({ onLogout, onSelectSchool }) => {
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedSchoolDetails, setSelectedSchoolDetails] = useState<SchoolItem | null>(null);
  const [messageNotice, setMessageNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schoolsRes, statsRes] = await Promise.all([
        superAdminService.getSchools({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: searchQuery.trim() || undefined
        }),
        superAdminService.getGlobalStats()
      ]);

      if (schoolsRes.success) {
        setSchools(schoolsRes.schools);
      }
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (err: any) {
      console.error('Erreur chargement super admin:', err);
      setMessageNotice({
        type: 'error',
        text: 'Impossible de charger les données du Super Admin.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleUpdateStatus = async (
    schoolId: string,
    newStatus: 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'PENDING'
  ) => {
    try {
      setActionLoadingId(schoolId);
      const res = await superAdminService.updateSchoolStatus(schoolId, newStatus);
      if (res.success) {
        setMessageNotice({
          type: 'success',
          text: res.message || `Statut mis à jour : ${newStatus}`
        });
        await fetchData();
      }
    } catch (err: any) {
      setMessageNotice({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de la mise à jour.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteSchool = async (school: SchoolItem) => {
    const confirmation = window.confirm(
      `ATTENTION : Êtes-vous sûr de vouloir supprimer définitivement l'école "${school.name}" ?\n\nToutes les données (élèves, enseignants, classes, notes, paiements) seront effacées de manière irréversible.`
    );
    if (!confirmation) return;

    try {
      setActionLoadingId(school.id);
      const res = await superAdminService.deleteSchool(school.id);
      if (res.success) {
        setMessageNotice({
          type: 'success',
          text: res.message || `L'école a été supprimée.`
        });
        await fetchData();
      }
    } catch (err: any) {
      setMessageNotice({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de la suppression.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: SchoolItem['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active & Approuvée
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" /> En attente de validation
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <PauseCircle className="w-3.5 h-3.5" /> Suspendue
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
            <XCircle className="w-3.5 h-3.5" /> Rejetée
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Bar Super Admin */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">
                  EduSaaS Global Platform
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestionnaire multi-tenant & Contrôle d'accès des établissements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Rafraîchir les données"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="h-6 w-px bg-slate-800"></div>

            <div className="flex items-center gap-2 text-xs">
              <div className="text-right">
                <span className="block font-bold text-white">Super Administrateur</span>
                <span className="text-[11px] text-slate-400">superadmin@edusaas.com</span>
              </div>
            </div>

            <button
              onClick={() => {
                authService.logout();
                onLogout();
              }}
              className="ml-2 px-3 py-1.5 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Alerts / Notices */}
        {messageNotice && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between text-xs ${
              messageNotice.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            <span>{messageNotice.text}</span>
            <button
              onClick={() => setMessageNotice(null)}
              className="font-bold underline ml-4 hover:opacity-80"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Global Statistics KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Établissements</span>
              <Building className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats ? stats.totalSchools : '—'}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{stats?.activeSchools || 0} actives</span>
              <span>·</span>
              <span className="text-amber-400 font-bold">{stats?.pendingSchools || 0} en attente</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Élèves</span>
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats ? stats.totalStudents : '—'}
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Répartis dans {stats?.totalClasses || 0} classes
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Enseignants</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats ? stats.totalTeachers : '—'}
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Comptes actifs sur la plateforme
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Volume Financier Enregistré</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats ? `${stats.totalPayments.toLocaleString()} TND` : '—'}
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Cumul des paiements scolarité
            </div>
          </div>
        </div>

        {/* Schools Management Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Filter Toolbar */}
          <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Établissements Scolaires Inscrits</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 font-bold">
                  {schools.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Validez les demandes d'inscription, activez ou suspendez les accès aux espaces
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Status filter tabs */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    statusFilter === 'ALL'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                    statusFilter === 'PENDING'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>En attente</span>
                  {stats && stats.pendingSchools > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                      {stats.pendingSchools}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    statusFilter === 'ACTIVE'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Actives
                </button>
                <button
                  onClick={() => setStatusFilter('SUSPENDED')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    statusFilter === 'SUSPENDED'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Suspendues
                </button>
              </div>

              {/* Search input */}
              <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Rechercher une école..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </form>
            </div>
          </div>

          {/* Schools Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Établissement</th>
                  <th className="py-3.5 px-4">Responsable / Contact</th>
                  <th className="py-3.5 px-4 text-center">Effectifs</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-4 text-center">Date d'inscription</th>
                  <th className="py-3.5 px-4 text-right">Actions de Contrôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {schools.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      Aucun établissement trouvé pour ce filtre.
                    </td>
                  </tr>
                ) : (
                  schools.map((school) => {
                    const isActing = actionLoadingId === school.id;
                    return (
                      <tr key={school.id} className="hover:bg-slate-800/30 transition">
                        {/* School details */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-300 flex items-center justify-center font-bold">
                              {school.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-white block text-sm">
                                {school.name}
                              </span>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                {school.address}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Manager info */}
                        <td className="py-4 px-4">
                          <div>
                            <span className="font-semibold text-slate-200 block">
                              {school.manager_name}
                            </span>
                            <div className="text-[11px] text-slate-400 space-y-0.5 mt-0.5">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-500" />
                                <span>{school.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-500" />
                                <span>{school.phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Counts */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
                            <span title="Élèves inscrits" className="text-blue-400 font-bold">
                              {school.studentCount} él.
                            </span>
                            <span className="text-slate-600">|</span>
                            <span title="Enseignants" className="text-emerald-400 font-bold">
                              {school.teacherCount} ens.
                            </span>
                            <span className="text-slate-600">|</span>
                            <span title="Classes" className="text-amber-400 font-bold">
                              {school.classCount} cls
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          {getStatusBadge(school.status)}
                        </td>

                        {/* Registered date */}
                        <td className="py-4 px-4 text-center text-slate-400 text-[11px]">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{new Date(school.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* If PENDING: Approve or Reject */}
                            {school.status === 'PENDING' && (
                              <>
                                <button
                                  disabled={isActing}
                                  onClick={() => handleUpdateStatus(school.id, 'ACTIVE')}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
                                  title="Approuver et activer l'établissement"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approuver</span>
                                </button>
                                <button
                                  disabled={isActing}
                                  onClick={() => handleUpdateStatus(school.id, 'REJECTED')}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-1 transition disabled:opacity-50"
                                  title="Rejeter la demande d'inscription"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Rejeter</span>
                                </button>
                              </>
                            )}

                            {/* If ACTIVE: Suspend */}
                            {school.status === 'ACTIVE' && (
                              <button
                                disabled={isActing}
                                onClick={() => handleUpdateStatus(school.id, 'SUSPENDED')}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs flex items-center gap-1 transition disabled:opacity-50"
                                title="Suspendre temporairement l'école"
                              >
                                <PauseCircle className="w-3.5 h-3.5" />
                                <span>Suspendre</span>
                              </button>
                            )}

                            {/* If SUSPENDED: Reactivate */}
                            {school.status === 'SUSPENDED' && (
                              <button
                                disabled={isActing}
                                onClick={() => handleUpdateStatus(school.id, 'ACTIVE')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-1 transition disabled:opacity-50"
                                title="Réactiver l'établissement"
                              >
                                <PlayCircle className="w-3.5 h-3.5" />
                                <span>Réactiver</span>
                              </button>
                            )}

                            {/* Switch into School Workspace (Super Admin impersonate) */}
                            {school.status === 'ACTIVE' && onSelectSchool && (
                              <button
                                onClick={() => onSelectSchool(school.id, school.name)}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs flex items-center gap-1 transition"
                                title="Accéder à l'espace de gestion de cette école"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Gérer</span>
                              </button>
                            )}

                            {/* Delete permanently */}
                            <button
                              disabled={isActing}
                              onClick={() => handleDeleteSchool(school)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="Supprimer définitivement l'école et ses données"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informative Security & Multi-Tenant Notice */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-200">Isolation Multi-Tenant Garantie</span>
            <p>
              Chaque établissement est cloisonné par son identifiant unique <code className="text-purple-300 bg-purple-950/60 px-1 py-0.5 rounded">school_id</code>. Les requêtes REST API côté serveur filtrent systématiquement chaque table (élèves, professeurs, notes, paiements, messages). Aucun établissement ne peut consulter ou interférer avec les données d'un autre.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

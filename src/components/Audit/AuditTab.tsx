import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Search,
  Download,
  Clock,
  User,
  Activity,
  FileSpreadsheet
} from 'lucide-react';

export const AuditTab: React.FC = () => {
  const { auditLogs, notifications, academicYear } = useApp();

  const [activeTab, setActiveTab] = useState<'audit' | 'notifications'>('audit');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter((log) =>
    `${log.userName} ${log.action} ${log.entity} ${log.details}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredNotifs = notifications.filter((notif) =>
    `${notif.recipientName} ${notif.type} ${notif.summary}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const exportAuditCSV = () => {
    const headers = ['ID', 'Date_Heure', 'Utilisateur', 'Role', 'Action', 'Entite', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      l.action,
      l.entity,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `journal_audit_ecole_chebbi_${academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Journal d'Audit, Traçabilité & Sécurité</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              {auditLogs.length} événements
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conformité Chapitre 3, 8.2 & 10.5 : traçabilité des modifications CRUD, envois de reçus et accès aux conversations
          </p>
        </div>

        <button
          onClick={exportAuditCSV}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-2 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter Journal CSV</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Modifications Métier ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'notifications' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Registre des Notifications ({notifications.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filtrer par auteur, entité, action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
          />
        </div>
      </div>

      {/* ----------------- SUBTAB: AUDIT LOGS ----------------- */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Auteur</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entité Cible</th>
                  <th className="py-3 px-4">Description de l'Opération</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map((log) => {
                  const getActionBadge = (act: string) => {
                    switch (act) {
                      case 'CREATION':
                        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
                      case 'MODIFICATION':
                        return 'text-blue-700 bg-blue-50 border-blue-200';
                      case 'SUPPRESSION':
                        return 'text-rose-700 bg-rose-50 border-rose-200';
                      case 'NOTIFICATION_PAIEMENT':
                        return 'text-purple-700 bg-purple-50 border-purple-200';
                      default:
                        return 'text-slate-700 bg-slate-100 border-slate-200';
                    }
                  };

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-800 font-sans">
                        {log.userName}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {log.userRole}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 font-bold">
                        {log.entity}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-sans text-xs">
                        {log.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- SUBTAB: NOTIFICATIONS LOG ----------------- */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Destinataire</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Canal</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Résumé & Reçu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredNotifs.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(n.date).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      <div>{n.recipientName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{n.recipientContact}</span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-blue-700">
                      {n.type}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {n.channel}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {n.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-md">
                      {n.summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

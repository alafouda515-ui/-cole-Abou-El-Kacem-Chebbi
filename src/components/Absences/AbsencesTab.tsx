import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Absence } from '../../types';
import {
  ClockAlert,
  Plus,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Search,
  Check,
  X
} from 'lucide-react';

export const AbsencesTab: React.FC = () => {
  const {
    absences,
    students,
    classes,
    currentUser,
    academicYear,
    addAbsence,
    justifyAbsence,
    validateAbsence,
    deleteAbsence
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showJustifyModal, setShowJustifyModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
  const [justificationReason, setJustificationReason] = useState('');

  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    durationHours: 2,
    academicYear: academicYear,
    isJustified: false,
    justificationReason: '',
    status: 'NON_JUSTIFIEE' as Absence['status']
  });

  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER';
  const isParent = currentUser.role === 'PARENT';

  // Filter absences
  const filteredAbsences = absences.filter((a) => {
    if (a.academicYear !== academicYear) return false;
    if (isParent && a.studentId !== currentUser.linkedStudentId) return false;
    if (currentUser.role === 'STUDENT' && a.studentId !== currentUser.linkedStudentId) return false;
    return true;
  });

  const handleOpenJustify = (abs: Absence) => {
    setSelectedAbsence(abs);
    setJustificationReason(abs.justificationReason || '');
    setShowJustifyModal(true);
  };

  const handleSaveJustification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAbsence) return;
    justifyAbsence(selectedAbsence.id, justificationReason);
    setShowJustifyModal(false);
  };

  const handleAddAbsenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAbsence({
      ...formData,
      status: formData.isJustified ? 'JUSTIFIEE' : 'NON_JUSTIFIEE'
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Suivi des Absences & Retards</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              {filteredAbsences.length} fiches
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Relevé de l'assiduité scolaire et plateforme de justification en ligne pour les parents ({academicYear})
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Signaler une absence</span>
          </button>
        )}
      </div>

      {/* Absences Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
            <tr>
              <th className="py-3 px-4">Élève</th>
              <th className="py-3 px-4">Classe</th>
              <th className="py-3 px-4">Date de l'absence</th>
              <th className="py-3 px-4">Durée</th>
              <th className="py-3 px-4">Motif & Justification</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAbsences.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Aucune absence signalée pour cette période.
                </td>
              </tr>
            ) : (
              filteredAbsences.map((abs) => {
                const student = students.find((s) => s.id === abs.studentId);
                const studentClass = classes.find((c) => c.id === student?.classId);

                return (
                  <tr key={abs.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {student ? `${student.firstName} ${student.lastName}` : 'Élève inconnu'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {studentClass?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {abs.date}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {abs.durationHours} heure(s)
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm">
                      {abs.justificationReason ? (
                        <span>{abs.justificationReason}</span>
                      ) : (
                        <span className="text-slate-400 italic">Aucune justification fournie</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {abs.status === 'JUSTIFIEE' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Justifiée
                        </span>
                      )}
                      {abs.status === 'EN_ATTENTE_VALIDATION' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <AlertCircle className="w-3 h-3" /> À valider
                        </span>
                      )}
                      {abs.status === 'NON_JUSTIFIEE' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <XCircle className="w-3 h-3" /> Non justifiée
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isParent && abs.status === 'NON_JUSTIFIEE' && (
                          <button
                            onClick={() => handleOpenJustify(abs)}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-[11px] transition"
                          >
                            Fournir motif
                          </button>
                        )}

                        {canManage && abs.status === 'EN_ATTENTE_VALIDATION' && (
                          <>
                            <button
                              onClick={() => validateAbsence(abs.id, true)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Valider la justification parentale"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => validateAbsence(abs.id, false)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Rejeter la justification"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {canManage && (
                          <button
                            onClick={() => {
                              if (window.confirm("Supprimer cette entrée d'absence ?")) {
                                deleteAbsence(abs.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Justify Modal (for Parents) */}
      {showJustifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-purple-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Justification d'Absence en Ligne</h3>
              <button onClick={() => setShowJustifyModal(false)} className="text-purple-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveJustification} className="p-6 space-y-4 text-xs text-slate-800">
              <p className="text-slate-600">
                Veuillez indiquer le motif exact de l'absence du <span className="font-bold">{selectedAbsence?.date}</span> :
              </p>
              <div>
                <label className="block font-bold mb-1">Motif de l'absence ou rendez-vous médical *</label>
                <textarea
                  rows={3}
                  required
                  value={justificationReason}
                  onChange={(e) => setJustificationReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="Ex: Rendez-vous médical chez le pédiatre / Certificat médical fourni..."
                ></textarea>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowJustifyModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl"
                >
                  Transmettre à l'école
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Absence Modal (for Admin/Teacher) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Signaler une Absence</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddAbsenceSubmit} className="p-6 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold mb-1">Élève concerné *</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                >
                  {students.filter((s) => s.status === 'ACTIF').map((s) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.matricule})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Nombre d'heures *</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    required
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isJustified}
                    onChange={(e) => setFormData({ ...formData, isJustified: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Absence déjà justifiée avec certificat médical</span>
                </label>
              </div>

              {formData.isJustified && (
                <div>
                  <label className="block font-bold mb-1">Motif justificatif</label>
                  <input
                    type="text"
                    value={formData.justificationReason}
                    onChange={(e) => setFormData({ ...formData, justificationReason: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Certificat du Dr ..."
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Enregistrer l'absence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

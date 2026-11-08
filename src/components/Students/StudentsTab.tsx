import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Download,
  Upload,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';

interface Props {
  onOpenReportCard: (studentId: string) => void;
}

export const StudentsTab: React.FC<Props> = ({ onOpenReportCard }) => {
  const {
    students,
    classes,
    academicYear,
    currentUser,
    addStudent,
    updateStudent,
    deleteStudent,
    validatePreRegistration
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '2016-01-01',
    gender: 'M' as 'M' | 'F',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    academicYear: academicYear,
    classId: classes[0]?.id || '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    address: 'Sousse',
    medicalNotes: 'Aucun antécédent particulier.',
    status: 'ACTIF' as 'ACTIF' | 'PRE_INSCRIPTION' | 'RADIE'
  });

  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'ACCOUNTANT';

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      `${s.firstName} ${s.lastName} ${s.matricule} ${s.parentName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesClass = selectedClassFilter === 'ALL' || s.classId === selectedClassFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || s.status === selectedStatusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Matricule',
      'Prenom',
      'Nom',
      'DateNaissance',
      'Sexe',
      'Classe',
      'Parent',
      'Telephone',
      'Email',
      'Statut'
    ];
    const rows = filteredStudents.map((s) => {
      const cls = classes.find((c) => c.id === s.classId)?.name || 'N/A';
      return [
        s.matricule,
        s.firstName,
        s.lastName,
        s.birthDate,
        s.gender,
        cls,
        `"${s.parentName}"`,
        s.parentPhone,
        s.parentEmail,
        s.status
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eleves_ecole_chebbi_${academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Edit Modal
  const openEdit = (st: Student) => {
    setEditingStudent(st);
    setFormData({
      firstName: st.firstName,
      lastName: st.lastName,
      birthDate: st.birthDate,
      gender: st.gender,
      photoUrl: st.photoUrl,
      academicYear: st.academicYear,
      classId: st.classId,
      parentName: st.parentName,
      parentEmail: st.parentEmail,
      parentPhone: st.parentPhone,
      address: st.address,
      medicalNotes: st.medicalNotes,
      status: st.status
    });
    setShowAddModal(true);
  };

  // Open Create
  const openCreate = (isPreReg: boolean = false) => {
    setEditingStudent(null);
    setFormData({
      firstName: '',
      lastName: '',
      birthDate: '2016-01-01',
      gender: 'M',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      academicYear: academicYear,
      classId: classes[0]?.id || '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      address: 'Sousse',
      medicalNotes: 'Dossier vaccinal à jour.',
      status: isPreReg ? 'PRE_INSCRIPTION' : 'ACTIF'
    });
    setShowAddModal(true);
  };

  // Submit Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.parentName.trim()) {
      alert('Veuillez remplir tous les champs obligatoires (Prénom, Nom, Parent).');
      return;
    }

    // Check class capacity if assigning
    const targetClass = classes.find((c) => c.id === formData.classId);
    if (targetClass && formData.status === 'ACTIF') {
      const currentInClass = students.filter(
        (s) => s.classId === targetClass.id && s.status === 'ACTIF' && s.id !== editingStudent?.id
      ).length;
      if (currentInClass >= targetClass.maxCapacity) {
        if (!window.confirm(`Attention : La classe ${targetClass.name} a atteint sa capacité maximale de ${targetClass.maxCapacity} élèves. Continuer quand même ?`)) {
          return;
        }
      }
    }

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        ...formData
      });
    } else {
      addStudent({
        ...formData,
        registrationDate: new Date().toISOString().split('T')[0]
      });
    }
    setShowAddModal(false);
  };

  // Delete
  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir radier cet élève ? Son historique académique sera conservé en archive (soft delete).")) {
      const res = deleteStudent(id);
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Gestion des Élèves & Dossiers Scolaires</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              {filteredStudents.length} dossiers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Inscriptions, état civil, affectations en classe et fiches médicales ({academicYear})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-2 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>

          {canManage && (
            <>
              <button
                onClick={() => openCreate(true)}
                className="px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl flex items-center gap-1.5 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Pré-inscription</span>
              </button>

              <button
                onClick={() => openCreate(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-2 shadow-xs transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Nouvel Élève</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, matricule ou parent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Class Filter */}
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Toutes les classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIF">Inscrits Actifs</option>
            <option value="PRE_INSCRIPTION">Pré-inscriptions</option>
            <option value="RADIE">Radiés / Archivés</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">Élève</th>
                <th className="py-3 px-4">Matricule</th>
                <th className="py-3 px-4">Classe Affectée</th>
                <th className="py-3 px-4">Parent / Contact</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Aucun dossier élève ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const studentClass = classes.find((c) => c.id === st.classId);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition">
                      {/* Photo & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.photoUrl}
                            alt={st.firstName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {st.firstName} {st.lastName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Né(e) le {st.birthDate} ({st.gender === 'M' ? 'Garçon' : 'Fille'})
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Matricule */}
                      <td className="py-3 px-4 font-mono text-slate-600 font-medium">
                        {st.matricule}
                      </td>

                      {/* Class */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">
                          {studentClass?.name || 'Non affecté'}
                        </span>
                      </td>

                      {/* Parent */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900 block">{st.parentName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{st.parentPhone}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {st.status === 'ACTIF' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Actif
                          </span>
                        )}
                        {st.status === 'PRE_INSCRIPTION' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Pré-inscription
                          </span>
                        )}
                        {st.status === 'RADIE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-300">
                            Radié (Archivé)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {st.status === 'PRE_INSCRIPTION' && canManage && (
                            <button
                              onClick={() => validatePreRegistration(st.id, st.classId)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-[11px] flex items-center gap-1 transition"
                              title="Valider définitivement l'inscription"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Valider
                            </button>
                          )}

                          <button
                            onClick={() => onOpenReportCard(st.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Consulter le bulletin scolaire officiel"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {canManage && (
                            <>
                              <button
                                onClick={() => openEdit(st)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                title="Modifier la fiche élève"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {st.status !== 'RADIE' && (
                                <button
                                  onClick={() => handleDelete(st.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Radier / Archiver l'élève"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
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
      </div>

      {/* Modal Add / Edit Student */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base">
                {editingStudent ? "Modifier le Dossier Élève" : formData.status === 'PRE_INSCRIPTION' ? "Nouvelle Pré-inscription" : "Inscription d'un Élève"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prénom de l'élève *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                    placeholder="Ex: Rayan"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom de famille *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                    placeholder="Ex: Ben Salem"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date de naissance *</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Genre *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="M">Masculin (Garçon)</option>
                    <option value="F">Féminin (Fille)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Classe souhaitée / affectée</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="font-bold text-slate-900 mb-2">Coordonnées Parents & Tuteurs</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Nom du parent/tuteur *</label>
                    <input
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="Mme Samira Ben Salem"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Téléphone de contact *</label>
                    <input
                      type="tel"
                      required
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                      placeholder="+216 22 555 888"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Email pour notifications</label>
                    <input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="parent@email.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Adresse de résidence</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="Avenue Habib Bourguiba, Sousse"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Fiche médicale / Allergies / Remarques</label>
                <textarea
                  rows={2}
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="Allergies, traitement médical ou précautions..."
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs"
                >
                  {editingStudent ? "Enregistrer les modifications" : "Valider l'enregistrement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

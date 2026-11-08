import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Grade, Student } from '../../types';
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  FileText,
  Calculator,
  Search,
  CheckCircle,
  Filter
} from 'lucide-react';

interface Props {
  onOpenReportCard: (studentId: string, term?: 'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3') => void;
}

export const GradesTab: React.FC<Props> = ({ onOpenReportCard }) => {
  const {
    grades,
    students,
    classes,
    subjects,
    currentUser,
    academicYear,
    addGrade,
    updateGrade,
    deleteGrade,
    calculateStudentAverages
  } = useApp();

  const [selectedTerm, setSelectedTerm] = useState<'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3'>('Trimestre 1');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'ALL');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER';

  // Form State
  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    subjectId: subjects[0]?.id || '',
    classId: classes[0]?.id || '',
    term: 'Trimestre 1' as Grade['term'],
    academicYear: academicYear,
    examType: 'Contrôle Continu' as Grade['examType'],
    score: 15,
    coefficient: 1,
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

  // Students of current class
  const classStudents = students.filter(
    (s) => s.status === 'ACTIF' && (selectedClassId === 'ALL' || s.classId === selectedClassId)
  );

  // Filtered grades
  const filteredGrades = grades.filter((g) => {
    if (g.academicYear !== academicYear) return false;
    if (g.term !== selectedTerm) return false;
    if (selectedClassId !== 'ALL' && g.classId !== selectedClassId) return false;
    if (selectedSubjectId !== 'ALL' && g.subjectId !== selectedSubjectId) return false;
    if (currentUser.role === 'STUDENT' && g.studentId !== currentUser.linkedStudentId) return false;
    if (currentUser.role === 'PARENT' && g.studentId !== currentUser.linkedStudentId) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingGrade(null);
    setFormData({
      studentId: classStudents[0]?.id || students[0]?.id || '',
      subjectId: subjects[0]?.id || '',
      classId: selectedClassId !== 'ALL' ? selectedClassId : classes[0]?.id || '',
      term: selectedTerm,
      academicYear: academicYear,
      examType: 'Contrôle Continu',
      score: 15,
      coefficient: 1,
      date: new Date().toISOString().split('T')[0],
      comment: 'Bon travail.'
    });
    setShowAddGradeModal(true);
  };

  const handleOpenEdit = (grd: Grade) => {
    setEditingGrade(grd);
    setFormData({
      studentId: grd.studentId,
      subjectId: grd.subjectId,
      classId: grd.classId,
      term: grd.term,
      academicYear: grd.academicYear,
      examType: grd.examType,
      score: grd.score,
      coefficient: grd.coefficient,
      date: grd.date,
      comment: grd.comment || ''
    });
    setShowAddGradeModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.score < 0 || formData.score > 20) {
      alert('La note doit être comprise entre 0 et 20.');
      return;
    }

    if (editingGrade) {
      updateGrade({
        ...editingGrade,
        ...formData
      });
    } else {
      addGrade(formData);
    }
    setShowAddGradeModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Supprimer cette note d’évaluation ?')) {
      deleteGrade(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Évaluations, Notes & Bulletins Officiels</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              {filteredGrades.length} notes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calcul automatique des moyennes pondérées par coefficients et génération de bulletins PDF ({academicYear})
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Saisir une Note</span>
          </button>
        )}
      </div>

      {/* Control Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['Trimestre 1', 'Trimestre 2', 'Trimestre 3'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTerm(t)}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedTerm === t ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {currentUser.role !== 'PARENT' && currentUser.role !== 'STUDENT' && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">Toutes les classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Toutes les matières</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (coeff {s.coefficient})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Student Averages Cards (if class selected) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">
              Moyennes Générales des Élèves · {selectedTerm}
            </h2>
            <p className="text-xs text-slate-400">Pondération stricte des coefficients et calcul instantané</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {classStudents.map((st) => {
            const avgData = calculateStudentAverages(st.id, selectedTerm);
            const studentClass = classes.find((c) => c.id === st.classId);

            return (
              <div
                key={st.id}
                className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white hover:border-blue-400 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={st.photoUrl}
                    alt={st.firstName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{st.firstName} {st.lastName}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">{studentClass?.name}</p>
                    <p className="text-[11px] font-bold text-blue-900 mt-0.5">
                      Moyenne : <span className="font-mono text-sm">{avgData.generalAverage.toFixed(2)}</span> / 20
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenReportCard(st.id, selectedTerm)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                  title="Générer et imprimer le bulletin PDF officiel"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Bulletin PDF</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grades History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
          <h2 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            Détail des Évaluations Saisies ({selectedTerm})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4">Élève</th>
                <th className="py-3 px-4">Matière</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Note / 20</th>
                <th className="py-3 px-4">Coeff.</th>
                <th className="py-3 px-4">Commentaire Enseignant</th>
                <th className="py-3 px-4">Date</th>
                {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="py-12 text-center text-slate-400">
                    Aucune note enregistrée pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredGrades.map((grd) => {
                  const student = students.find((s) => s.id === grd.studentId);
                  const subject = subjects.find((s) => s.id === grd.subjectId);

                  return (
                    <tr key={grd.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {student ? `${student.firstName} ${student.lastName}` : 'Élève inconnu'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{subject?.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {grd.examType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-sm text-blue-900 tabular-nums">
                        {grd.score.toFixed(1)} / 20
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        x{grd.coefficient}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs truncate">
                        {grd.comment || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {grd.date}
                      </td>
                      {canEdit && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(grd)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(grd.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Grade Modal */}
      {showAddGradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">
                {editingGrade ? "Modifier l'Évaluation" : "Enregistrer une Nouvelle Note"}
              </h3>
              <button onClick={() => setShowAddGradeModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Élève *</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => {
                      const st = students.find((s) => s.id === e.target.value);
                      setFormData({
                        ...formData,
                        studentId: e.target.value,
                        classId: st?.classId || formData.classId
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                  >
                    {students
                      .filter((s) => s.status === 'ACTIF')
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} ({s.matricule})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Matière *</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => {
                      const sub = subjects.find((s) => s.id === e.target.value);
                      setFormData({
                        ...formData,
                        subjectId: e.target.value,
                        coefficient: sub ? sub.coefficient : formData.coefficient
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (coeff {s.coefficient})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Trimestre *</label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Trimestre 1">Trimestre 1</option>
                    <option value="Trimestre 2">Trimestre 2</option>
                    <option value="Trimestre 3">Trimestre 3</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Type d'examen *</label>
                  <select
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Contrôle Continu">Contrôle Continu</option>
                    <option value="Examen Trimestriel">Examen Trimestriel</option>
                  </select>
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Note obtenue (/ 20) *</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    required
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Pondération / Coeff de l'épreuve *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="5"
                    required
                    value={formData.coefficient}
                    onChange={(e) => setFormData({ ...formData, coefficient: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Appréciation / Observation pédagogique</label>
                <textarea
                  rows={2}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="Ex: Excellente maîtrise, raisonnement clair..."
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddGradeModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Enregistrer la note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

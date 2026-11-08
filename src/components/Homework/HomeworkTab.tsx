import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Homework, HomeworkSubmission } from '../../types';
import {
  FileCheck2,
  Plus,
  Calendar,
  Clock,
  Upload,
  Download,
  CheckCircle,
  Eye,
  AlertTriangle,
  Award,
  Trash2,
  Edit,
  FileText,
  UserCheck
} from 'lucide-react';

export const HomeworkTab: React.FC = () => {
  const {
    homeworks,
    submissions,
    classes,
    subjects,
    students,
    currentUser,
    academicYear,
    addHomework,
    updateHomework,
    deleteHomework,
    submitHomework,
    gradeSubmission,
    acknowledgeHomeworkByParent,
    publishCorrection
  } = useApp();

  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [showAddHwModal, setShowAddHwModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);

  // Homework Form
  const [hwFormData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: subjects[0]?.id || '',
    classId: classes[0]?.id || '',
    teacherId: currentUser.id,
    dueDate: '2026-11-20',
    academicYear: academicYear,
    attachments: [] as string[],
    correctionPublished: false,
    maxScore: 20
  });

  // Grade Form
  const [gradeScore, setGradeScore] = useState(18);
  const [gradeFeedback, setGradeFeedback] = useState('Très bon travail, démarches bien expliquées.');

  // Submit Homework Form (for student)
  const [submitContent, setSubmitContent] = useState('');
  const [submitFileName, setSubmitFileName] = useState('Exercices_Devoir_Rayan.pdf');

  // Correction Form
  const [correctionFileName, setCorrectionFileName] = useState('');

  const isTeacher = currentUser.role === 'TEACHER';
  const isAdmin = currentUser.role === 'ADMIN';
  const isStudent = currentUser.role === 'STUDENT';
  const isParent = currentUser.role === 'PARENT';

  const currentStudent = students.find((s) => s.id === currentUser.linkedStudentId);

  // Filter homeworks
  const filteredHomeworks = homeworks.filter((h) => {
    if (h.academicYear !== academicYear) return false;
    if (isStudent && currentStudent && h.classId !== currentStudent.classId) return false;
    if (isParent && currentStudent && h.classId !== currentStudent.classId) return false;
    if (selectedClassFilter !== 'ALL' && h.classId !== selectedClassFilter) return false;
    return true;
  });

  // Open add homework
  const handleOpenAddHw = () => {
    setFormData({
      title: '',
      description: '',
      subjectId: subjects[0]?.id || '',
      classId: classes[0]?.id || '',
      teacherId: currentUser.id,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      academicYear: academicYear,
      attachments: ['Enonce_Fiche_Exercices.pdf'],
      correctionPublished: false,
      maxScore: 20
    });
    setShowAddHwModal(true);
  };

  const handleSaveHw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwFormData.title.trim()) return;
    addHomework(hwFormData);
    setShowAddHwModal(false);
  };

  const handleDeleteHw = (id: string) => {
    const res = deleteHomework(id);
    alert(res.message);
  };

  // Student Submit
  const handleOpenSubmit = (hw: Homework) => {
    setSelectedHomework(hw);
    const existing = submissions.find((s) => s.homeworkId === hw.id && s.studentId === currentStudent?.id);
    if (existing) {
      setSubmitContent(existing.content);
      setSubmitFileName(existing.fileName || 'Devoir_Travail.pdf');
    } else {
      setSubmitContent('');
      setSubmitFileName(`Devoir_${currentStudent?.firstName || 'Eleve'}.pdf`);
    }
    setShowSubmitModal(true);
  };

  const handleSaveSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHomework || !currentStudent) return;

    submitHomework({
      homeworkId: selectedHomework.id,
      studentId: currentStudent.id,
      content: submitContent || 'Travail complet déposé en pièce jointe.',
      fileName: submitFileName
    });

    setShowSubmitModal(false);
    alert('Votre devoir a été déposé avec succès ! Votre enseignant a été notifié.');
  };

  // Grade submission
  const handleOpenGrade = (sub: HomeworkSubmission, hw: Homework) => {
    setSelectedSubmission(sub);
    setSelectedHomework(hw);
    setGradeScore(sub.score || 16);
    setGradeFeedback(sub.teacherFeedback || 'Bon travail.');
    setShowGradeModal(true);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    gradeSubmission(selectedSubmission.id, gradeScore, gradeFeedback);
    setShowGradeModal(false);
  };

  // Publish Answer Key
  const handlePublishCorrection = (hw: Homework) => {
    const fileName = prompt('Nom du fichier corrigé officiel à publier pour les élèves et parents :', 'Corrige_Officiel_Complet.pdf');
    if (fileName) {
      publishCorrection(hw.id, fileName);
      alert('Le corrigé a été publié. Les parents et élèves peuvent désormais le consulter.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Gestion des Devoirs & Travaux (Homework)</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              {filteredHomeworks.length} devoirs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publication des consignes, dépôts des élèves, notation avec barème, corrigés et suivi parental ({academicYear})
          </p>
        </div>

        {(isTeacher || isAdmin) && (
          <button
            onClick={handleOpenAddHw}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Devoir</span>
          </button>
        )}
      </div>

      {/* Homework List */}
      <div className="space-y-4">
        {filteredHomeworks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            Aucun devoir actif pour le moment.
          </div>
        ) : (
          filteredHomeworks.map((hw) => {
            const subject = subjects.find((s) => s.id === hw.subjectId);
            const cls = classes.find((c) => c.id === hw.classId);
            const hwSubmissions = submissions.filter((s) => s.homeworkId === hw.id);
            const currentStudentSub = currentStudent
              ? hwSubmissions.find((s) => s.studentId === currentStudent.id)
              : null;

            return (
              <div
                key={hw.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-slate-300 transition"
              >
                {/* Title & Metadata */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: subject?.color || '#2563eb' }}
                      ></span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {subject?.name} · Classe {cls?.name}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-1">{hw.title}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      Date limite : {hw.dueDate}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                      Barème : /{hw.maxScore}
                    </span>
                    {(isTeacher || isAdmin) && (
                      <button
                        onClick={() => handleDeleteHw(hw.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Supprimer le devoir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                  {hw.description}
                </p>

                {/* Attachments & Corrections */}
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  {hw.attachments && hw.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Énoncé : {att}</span>
                    </div>
                  ))}

                  {hw.correctionPublished && hw.correctionFile && (
                    <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-1.5 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Corrigé type : {hw.correctionFile}</span>
                    </div>
                  )}

                  {(isTeacher || isAdmin) && !hw.correctionPublished && (
                    <button
                      onClick={() => handlePublishCorrection(hw)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Publier la correction</span>
                    </button>
                  )}
                </div>

                {/* Student specific area: submit or view submission */}
                {isStudent && (
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 p-3 rounded-xl">
                    <div>
                      {currentStudentSub ? (
                        <div className="text-xs">
                          <span className="font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Devoir rendu le {new Date(currentStudentSub.submittedAt).toLocaleDateString('fr-FR')}
                            {currentStudentSub.isLate && <span className="text-rose-600 font-bold ml-1">(En retard)</span>}
                          </span>
                          <span className="text-slate-500 block text-[11px] mt-0.5">
                            Fichier : {currentStudentSub.fileName}
                          </span>
                          {currentStudentSub.score !== undefined && (
                            <div className="mt-2 bg-blue-50 border border-blue-200 p-2 rounded-lg">
                              <span className="font-bold text-blue-900">Note obtenue : {currentStudentSub.score} / {hw.maxScore}</span>
                              <p className="text-slate-600 text-[11px] mt-0.5">Appréciation : "{currentStudentSub.teacherFeedback}"</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-amber-700 font-semibold">
                          ⏳ Vous n'avez pas encore déposé votre travail pour ce devoir.
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenSubmit(hw)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{currentStudentSub ? 'Remplacer mon dépôt' : 'Déposer mon travail'}</span>
                    </button>
                  </div>
                )}

                {/* Parent specific area: view child submission & acknowledge "Vu" */}
                {isParent && currentStudent && (
                  <div className="pt-3 border-t border-slate-100 bg-purple-50/40 p-4 rounded-xl border border-purple-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-purple-900 block">
                          Suivi du travail de {currentStudent.firstName} {currentStudent.lastName}
                        </span>
                        {currentStudentSub ? (
                          <div className="text-xs text-slate-700 mt-1 space-y-1">
                            <p>
                              • Statut : <span className="font-bold text-emerald-700">Rendu le {new Date(currentStudentSub.submittedAt).toLocaleDateString('fr-FR')}</span>
                              {currentStudentSub.isLate && <span className="text-rose-600 font-semibold"> (en retard)</span>}
                            </p>
                            {currentStudentSub.score !== undefined && (
                              <p>
                                • Note de l'enseignant : <span className="font-bold text-blue-900 font-mono text-sm">{currentStudentSub.score} / {hw.maxScore}</span>
                                {currentStudentSub.teacherFeedback && ` — "${currentStudentSub.teacherFeedback}"`}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-amber-700 mt-1">
                            L'élève n'a pas encore rendu ce travail. Date limite : {hw.dueDate}.
                          </p>
                        )}
                      </div>

                      {/* Requirement 9.3: Marquage "Vu par les parents" */}
                      {currentStudentSub && (
                        <div>
                          {currentStudentSub.parentAcknowledged ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              Vu par le parent
                            </span>
                          ) : (
                            <button
                              onClick={() => acknowledgeHomeworkByParent(currentStudentSub.id)}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Marquer comme vu</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Teacher specific area: Table of submissions for this class */}
                {(isTeacher || isAdmin) && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-800">
                        Dépôts des élèves ({hwSubmissions.length} reçus)
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Élève</th>
                            <th className="py-2.5 px-3">Dépôt</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Note / {hw.maxScore}</th>
                            <th className="py-2.5 px-3">Vu Parent</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {hwSubmissions.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-4 text-center text-slate-400">
                                Aucun travail déposé pour le moment.
                              </td>
                            </tr>
                          ) : (
                            hwSubmissions.map((sub) => {
                              const st = students.find((s) => s.id === sub.studentId);
                              return (
                                <tr key={sub.id} className="hover:bg-white">
                                  <td className="py-2.5 px-3 font-bold text-slate-900">
                                    {st?.firstName} {st?.lastName}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-600 font-mono">
                                    {sub.fileName || 'Document joint'}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-slate-500">
                                    {new Date(sub.submittedAt).toLocaleDateString('fr-FR')}
                                    {sub.isLate && <span className="text-rose-600 ml-1 font-bold">(Retard)</span>}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                                    {sub.score !== undefined ? `${sub.score} / ${hw.maxScore}` : 'Non noté'}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    {sub.parentAcknowledged ? (
                                      <span className="text-emerald-700 font-semibold text-[11px]">✓ Confirmé</span>
                                    ) : (
                                      <span className="text-slate-400 text-[11px]">En attente</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      onClick={() => handleOpenGrade(sub, hw)}
                                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-semibold transition"
                                    >
                                      {sub.score !== undefined ? 'Modifier note' : 'Noter'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add Homework */}
      {showAddHwModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Publier un Nouveau Devoir (Homework)</h3>
              <button onClick={() => setShowAddHwModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveHw} className="p-6 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold mb-1">Titre du devoir *</label>
                <input
                  type="text"
                  required
                  value={hwFormData.title}
                  onChange={(e) => setFormData({ ...hwFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  placeholder="Ex: Exercices de géométrie et périmètres"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Matière *</label>
                  <select
                    value={hwFormData.subjectId}
                    onChange={(e) => setFormData({ ...hwFormData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Classe concernée *</label>
                  <select
                    value={hwFormData.classId}
                    onChange={(e) => setFormData({ ...hwFormData, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Date limite de remise *</label>
                  <input
                    type="date"
                    required
                    value={hwFormData.dueDate}
                    onChange={(e) => setFormData({ ...hwFormData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Barème de notation (/ N)</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={hwFormData.maxScore}
                    onChange={(e) => setFormData({ ...hwFormData, maxScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Consignes & Détails du travail à réaliser *</label>
                <textarea
                  rows={3}
                  required
                  value={hwFormData.description}
                  onChange={(e) => setFormData({ ...hwFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="Instructions précises, numéros d'exercices..."
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddHwModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Publier le devoir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Submit Homework (Student) */}
      {showSubmitModal && selectedHomework && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Dépôt du Devoir · {selectedHomework.title}</h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-blue-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveSubmission} className="p-6 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold mb-1">Fichier de travail joint (PDF, document ou image)</label>
                <input
                  type="text"
                  required
                  value={submitFileName}
                  onChange={(e) => setSubmitFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  placeholder="Nom_Fichier_Devoir.pdf"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Commentaire pour l'enseignant</label>
                <textarea
                  rows={3}
                  value={submitContent}
                  onChange={(e) => setSubmitContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="Expliquez vos démarches ou posez une question..."
                ></textarea>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Confirmer le dépôt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Grade Submission (Teacher) */}
      {showGradeModal && selectedSubmission && selectedHomework && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Évaluation du Devoir · Barème /{selectedHomework.maxScore}</h3>
              <button onClick={() => setShowGradeModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveGrade} className="p-6 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold mb-1">Note attribuée (sur {selectedHomework.maxScore}) *</label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={selectedHomework.maxScore}
                  required
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-base font-bold text-blue-900"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Commentaire pédagogique & conseils</label>
                <textarea
                  rows={3}
                  required
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="Points forts et axes d'amélioration..."
                ></textarea>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGradeModal(false)}
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

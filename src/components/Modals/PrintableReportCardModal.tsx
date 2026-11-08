import React from 'react';
import { Student, ClassRoom } from '../../types';
import { useApp } from '../../context/AppContext';
import { Printer, Download, X, Award, CheckCircle } from 'lucide-react';

interface Props {
  student: Student;
  term: 'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3';
  onClose: () => void;
}

export const PrintableReportCardModal: React.FC<Props> = ({ student, term, onClose }) => {
  const { classes, users, calculateStudentAverages, academicYear, absences } = useApp();

  const studentClass = classes.find((c) => c.id === student.classId);
  const mainTeacher = users.find((u) => u.id === studentClass?.mainTeacherId);
  const averages = calculateStudentAverages(student.id, term);

  const studentAbsences = absences.filter(
    (a) => a.studentId === student.id && a.academicYear === academicYear
  );
  const totalAbsenceHours = studentAbsences.reduce((acc, a) => acc + a.durationHours, 0);
  const justifiedHours = studentAbsences
    .filter((a) => a.isJustified)
    .reduce((acc, a) => acc + a.durationHours, 0);

  const getMention = (avg: number) => {
    if (avg >= 16) return { label: 'Très Bien - Félicitations', color: 'text-emerald-700 bg-emerald-50' };
    if (avg >= 14) return { label: 'Bien - Tableau d\'Honneur', color: 'text-blue-700 bg-blue-50' };
    if (avg >= 12) return { label: 'Assez Bien - Encouragements', color: 'text-cyan-700 bg-cyan-50' };
    if (avg >= 10) return { label: 'Passable', color: 'text-amber-700 bg-amber-50' };
    return { label: 'Insuffisant - Effort requis', color: 'text-rose-700 bg-rose-50' };
  };

  const mention = getMention(averages.generalAverage);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Actions bar (hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-base">Bulletin Scolaire Officiel - {term}</h2>
              <p className="text-xs text-slate-400">Élève : {student.firstName} {student.lastName} ({student.matricule})</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              Imprimer / Sauvegarder PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 overflow-y-auto print-page text-slate-900 bg-white">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">République Tunisienne · Ministère de l'Éducation</p>
                <h1 className="text-2xl font-black tracking-tight text-blue-950 mt-1">
                  ÉCOLE PRIMAIRE PRIVÉE ABOU EL KACEM CHEBBI
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Sousse Ville · Tél: +216 73 222 100 · Email: contact@ecole-chebbi.tn
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-xs font-bold text-slate-800">
                  ANNÉE : {academicYear}
                </span>
                <p className="text-sm font-bold text-slate-700 mt-2">{term.toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Student & Class Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            <div className="flex items-center gap-4 sm:col-span-2">
              <img
                src={student.photoUrl}
                alt={student.firstName}
                className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm"
              />
              <div>
                <p className="text-xs text-slate-500 font-medium">Nom & Prénom de l'Élève</p>
                <h3 className="text-lg font-bold text-slate-900">{student.firstName} {student.lastName}</h3>
                <p className="text-xs font-mono text-slate-600">Matricule: {student.matricule}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Classe & Niveau</p>
              <p className="text-sm font-bold text-slate-800">{studentClass?.name || 'Non affecté'}</p>
              <p className="text-xs text-slate-600">Né(e) le : {student.birthDate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Titulaire de la classe</p>
              <p className="text-sm font-bold text-slate-800">{mainTeacher?.name || 'Direction'}</p>
              <p className="text-xs text-slate-600">Sexe: {student.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
            </div>
          </div>

          {/* Table of Grades */}
          <div className="mb-6 overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-xs">
                <tr>
                  <th className="py-3 px-4">Matière Enseignée</th>
                  <th className="py-3 px-3 text-center">Coeff.</th>
                  <th className="py-3 px-3 text-center">Moyenne / 20</th>
                  <th className="py-3 px-3 text-center">Points (Moy x Coeff)</th>
                  <th className="py-3 px-4">Appréciation pédagogique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {averages.subjectAverages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Aucune note saisie pour ce trimestre.
                    </td>
                  </tr>
                ) : (
                  averages.subjectAverages.map((item) => {
                    const points = (item.avg * item.subject.coefficient).toFixed(2);
                    return (
                      <tr key={item.subject.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{item.subject.name}</td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-600">
                          {item.subject.coefficient}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold tabular-nums text-blue-900">
                          {item.avg.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-700">
                          {points}
                        </td>
                        <td className="py-2.5 px-4 text-xs text-slate-600">
                          {item.avg >= 16 ? 'Très bonne assimilation des concepts.' : item.avg >= 12 ? 'Travail sérieux et régulier.' : 'Doit approfondir les révisions.'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Results Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Moyenne Générale</p>
              <div className="text-3xl font-extrabold text-blue-950 font-mono tabular-nums my-1">
                {averages.generalAverage.toFixed(2)} <span className="text-sm font-normal text-slate-500">/ 20</span>
              </div>
              <p className="text-xs text-slate-600">Total coefficients : {averages.totalCoefficients}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center flex flex-col justify-center items-center">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Mention du Conseil</p>
              <span className={`mt-2 px-3 py-1 rounded-md text-xs font-bold ${mention.color}`}>
                {mention.label}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Assiduité & Absences</p>
              <p className="text-xl font-bold font-mono text-slate-800 my-1">{totalAbsenceHours} heures</p>
              <p className="text-xs text-slate-600">
                {justifiedHours}h justifiées · {totalAbsenceHours - justifiedHours}h non justifiées
              </p>
            </div>
          </div>

          {/* Observations & Signatures */}
          <div className="border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-8 mb-4">
            <div className="border-r border-slate-200 pr-6">
              <p className="text-xs font-bold text-slate-700 uppercase mb-2">Avis du Conseil des Maîtres :</p>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                {averages.generalAverage >= 15
                  ? "Félicitations pour cet excellent trimestre. Continuez sur cette belle dynamique d'apprentissage."
                  : averages.generalAverage >= 10
                  ? "Bilan trimestriel satisfaisant. Consolider les matières scientifiques au prochain trimestre."
                  : "Attention, travail irrégulier. Un plan de soutien personnalisé est recommandé."}
              </p>
              <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500">
                Signature de l'enseignant titulaire
              </div>
            </div>

            <div className="pl-4 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase mb-2">Direction de l'Établissement :</p>
                <p className="text-xs text-slate-600">Vu et certifié conforme au registre scolaire.</p>
                <div className="inline-flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-semibold">
                  <CheckCircle className="w-4 h-4" /> Cachet Officiel Validé
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
                Dr. Hamdi Hassen · Directeur
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400">
            Document officiel généré par le Système de Gestion Scolaire · École Abou El Kacem Chebbi Sousse
          </div>
        </div>
      </div>
    </div>
  );
};

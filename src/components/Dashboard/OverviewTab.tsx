import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  GraduationCap,
  CreditCard,
  FileCheck2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import { TabKey } from '../Sidebar';

interface Props {
  onNavigate: (tab: TabKey) => void;
  onOpenReportCard: (studentId: string) => void;
}

export const OverviewTab: React.FC<Props> = ({ onNavigate, onOpenReportCard }) => {
  const {
    currentUser,
    students,
    classes,
    payments,
    feePlan,
    homeworks,
    submissions,
    schedule,
    announcements,
    academicYear,
    calculateStudentAverages,
    getStudentFinancialBalance
  } = useApp();

  const activeStudents = students.filter((s) => s.status === 'ACTIF' && s.academicYear === academicYear);
  const preRegistrations = students.filter((s) => s.status === 'PRE_INSCRIPTION');

  // Total collected & due
  const totalCollected = payments
    .filter((p) => p.academicYear === academicYear && p.status === 'PAYE')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpected = activeStudents.length * feePlan.totalAnnual;
  const recoveryRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  // Render Admin View
  if (currentUser.role === 'ADMIN') {
    return (
      <div className="space-y-6">
        {/* Top welcome banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-200 font-bold">Direction de l'Établissement</span>
            <h1 className="text-2xl font-black mt-1">Bonjour, {currentUser.name}</h1>
            <p className="text-xs text-blue-200 mt-1">
              Tableau de bord de pilotage · Année scolaire active : <span className="font-bold text-white">{academicYear}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('students')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <span>Gérer les inscriptions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('finances')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition"
            >
              Point Financier
            </button>
          </div>
        </div>

        {/* 4 Essential KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">Élèves Inscrits</p>
                <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{activeStudents.length}</p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-amber-600">+{preRegistrations.length} pré-inscriptions</span> à valider
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">Classes Ouvertes</p>
                <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{classes.length}</p>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">Du CP au CM2 (sections A)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">Recouvrement Frais</p>
                <p className="text-2xl font-black text-emerald-600 mt-1 tabular-nums">{recoveryRate}%</p>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              <span className="font-mono font-bold text-slate-700">{totalCollected.toLocaleString()} TND</span> encaissés
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">Devoirs & Exercices</p>
                <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{homeworks.length}</p>
              </div>
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <FileCheck2 className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">{submissions.length} travaux rendus au total</p>
          </div>
        </div>

        {/* Classes status & Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classes Capacity Gauge */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900 text-sm">Effectifs & Remplissage des Classes ({academicYear})</h2>
              <button
                onClick={() => onNavigate('academics')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                Gérer les classes <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-4">
              {classes.map((cls) => {
                const count = activeStudents.filter((s) => s.classId === cls.id).length;
                const percent = Math.min(100, Math.round((count / cls.maxCapacity) * 100));
                return (
                  <div key={cls.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800">{cls.name}</span>
                      <span className="text-slate-500 font-mono">
                        {count} / {cls.maxCapacity} élèves ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent >= 90 ? 'bg-rose-500' : percent >= 70 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Announcements */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900 text-sm">Circulaires de l'École</h2>
              <button
                onClick={() => onNavigate('messaging')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Publier
              </button>
            </div>
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-slate-900 block">{ann.title}</span>
                  <p className="text-slate-600 line-clamp-2">{ann.content}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(ann.publishedAt).toLocaleDateString('fr-FR')} · {ann.authorName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Teacher View
  if (currentUser.role === 'TEACHER') {
    const teacherClasses = classes.filter((c) =>
      currentUser.assignedClasses ? currentUser.assignedClasses.includes(c.id) : c.mainTeacherId === currentUser.id
    );
    const teacherHomework = homeworks.filter((h) => h.teacherId === currentUser.id);

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-6 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold">Espace Pédagogique Enseignant</span>
            <h1 className="text-2xl font-black mt-1">Bienvenue, {currentUser.name}</h1>
            <p className="text-xs text-emerald-200 mt-1">Classes assignées : {teacherClasses.map((c) => c.name).join(', ')}</p>
          </div>
          <button
            onClick={() => onNavigate('homework')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            Nouveau Devoir
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Devoirs en cours</span>
            <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{teacherHomework.length}</p>
            <p className="text-xs text-slate-400 mt-2">Dépôts ouverts pour vos classes</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Travaux à évaluer</span>
            <p className="text-2xl font-black text-amber-600 mt-1 tabular-nums">
              {submissions.filter((s) => s.score === undefined).length}
            </p>
            <p className="text-xs text-slate-400 mt-2">En attente de barème</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Cours planifiés</span>
            <p className="text-2xl font-black text-blue-600 mt-1 tabular-nums">
              {schedule.filter((s) => s.teacherId === currentUser.id).length}
            </p>
            <p className="text-xs text-slate-400 mt-2">Créneaux cette semaine</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="font-bold text-slate-900 text-sm mb-4">Accès rapide aux actions clés</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigate('grades')}
              className="p-4 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl text-left transition"
            >
              <GraduationCap className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-xs font-bold text-slate-900">Saisir les notes</p>
              <p className="text-[11px] text-slate-500 mt-1">Contrôles continus et examens trimestriels</p>
            </button>
            <button
              onClick={() => onNavigate('homework')}
              className="p-4 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl text-left transition"
            >
              <FileCheck2 className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-xs font-bold text-slate-900">Corriger les devoirs</p>
              <p className="text-[11px] text-slate-500 mt-1">Attribuer notes, feedbacks et corrigé type</p>
            </button>
            <button
              onClick={() => onNavigate('schedule')}
              className="p-4 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl text-left transition"
            >
              <Calendar className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-xs font-bold text-slate-900">Mon Emploi du Temps</p>
              <p className="text-[11px] text-slate-500 mt-1">Horaires de cours et salles assignées</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Parent View
  if (currentUser.role === 'PARENT') {
    const student = students.find((s) => s.id === currentUser.linkedStudentId) || students[0];
    const studentClass = classes.find((c) => c.id === student?.classId);
    const avgData = student ? calculateStudentAverages(student.id, 'Trimestre 1') : null;
    const balance = student ? getStudentFinancialBalance(student.id) : null;
    const studentHomework = homeworks.filter((h) => h.classId === student?.classId);

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-purple-200 font-bold">Portail Famille & Parents</span>
            <h1 className="text-2xl font-black mt-1">Bonjour, {currentUser.name}</h1>
            <p className="text-xs text-purple-200 mt-1">
              Suivi scolaire de votre enfant : <span className="font-bold text-white">{student?.firstName} {student?.lastName}</span> ({studentClass?.name})
            </p>
          </div>
          {student && (
            <button
              onClick={() => onOpenReportCard(student.id)}
              className="px-4 py-2 bg-white text-purple-950 text-xs font-bold rounded-xl shadow-xs hover:bg-purple-50 transition flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-purple-600" />
              <span>Consulter Bulletin PDF</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Moyenne Trimestre 1</span>
            <p className="text-3xl font-black text-blue-900 mt-1 tabular-nums">
              {avgData ? avgData.generalAverage.toFixed(2) : '--'} <span className="text-xs font-normal text-slate-500">/ 20</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">Calculée sur {avgData?.totalCoefficients || 0} coefficients</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Statut Frais de Scolarité</span>
            <p className="text-xl font-black text-slate-900 mt-1">
              Solde : <span className="font-mono text-emerald-700">{balance?.remaining.toLocaleString()} TND</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Déjà réglé : {balance?.totalPaid.toLocaleString()} TND sur {feePlan.totalAnnual} TND
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Devoirs actifs</span>
            <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{studentHomework.length}</p>
            <p className="text-xs text-slate-500 mt-2">À suivre pour les prochains jours</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="font-bold text-slate-900 text-sm mb-3">Devoirs de votre enfant</h2>
            <div className="space-y-3">
              {studentHomework.map((hw) => {
                const sub = submissions.find((s) => s.homeworkId === hw.id && s.studentId === student?.id);
                return (
                  <div key={hw.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{hw.title}</span>
                      <span className="text-blue-700 font-mono">Date : {hw.dueDate}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-1">{hw.description}</p>
                    <div className="flex justify-between items-center pt-1 text-[11px]">
                      <span className={sub ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                        {sub ? '✓ Travail déposé par l\'élève' : '⏳ Non encore déposé'}
                      </span>
                      {sub?.score !== undefined && (
                        <span className="font-mono font-bold text-blue-900">Note : {sub.score} / {hw.maxScore}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-sm mb-3">Communications récentes avec l'école</h2>
              <p className="text-xs text-slate-600 mb-4">
                La messagerie directe vous permet d'échanger en toute sécurité avec l'enseignant titulaire et le secrétariat.
              </p>
            </div>
            <button
              onClick={() => onNavigate('messaging')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition text-center"
            >
              Accéder à la messagerie interne
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Student View
  if (currentUser.role === 'STUDENT') {
    const student = students.find((s) => s.id === currentUser.linkedStudentId) || students[0];
    const studentClass = classes.find((c) => c.id === student?.classId);
    const studentHomework = homeworks.filter((h) => h.classId === student?.classId);

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-900 to-cyan-900 text-white rounded-2xl p-6 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-wider text-cyan-200 font-bold">Mon Espace Élève</span>
            <h1 className="text-2xl font-black mt-1">Bonjour {student?.firstName} !</h1>
            <p className="text-xs text-cyan-200 mt-1">Classe : {studentClass?.name || 'CM2-A'} · Année : {academicYear}</p>
          </div>
          <button
            onClick={() => onNavigate('homework')}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            Déposer un devoir
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="font-bold text-slate-900 text-sm mb-4">Devoirs à rendre</h2>
            <div className="space-y-3">
              {studentHomework.map((hw) => {
                const sub = submissions.find((s) => s.homeworkId === hw.id && s.studentId === student?.id);
                return (
                  <div key={hw.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{hw.title}</span>
                      <span className="text-rose-600 font-mono">Pour le : {hw.dueDate}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{hw.description}</p>
                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className={`font-semibold ${sub ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {sub ? `Rendu (${sub.fileName || 'Fichier joint'})` : 'À faire'}
                      </span>
                      {sub?.score !== undefined && (
                        <span className="font-mono font-bold text-blue-900">Note : {sub.score} / {hw.maxScore}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="font-bold text-slate-900 text-sm mb-4">Mes cours aujourd'hui</h2>
            <div className="space-y-2.5">
              {schedule
                .filter((s) => s.classId === student?.classId)
                .slice(0, 4)
                .map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-bold text-slate-800">{slot.dayOfWeek} {slot.startTime} - {slot.endTime}</span>
                    </div>
                    <span className="text-slate-600">Salle {slot.roomId}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Accountant View
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-900 to-orange-950 text-white rounded-2xl p-6 shadow-sm flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-200 font-bold">Service Comptabilité & Trésorerie</span>
          <h1 className="text-2xl font-black mt-1">Bonjour, {currentUser.name}</h1>
          <p className="text-xs text-amber-200 mt-1">Suivi financier et encaissements des scolarités ({academicYear})</p>
        </div>
        <button
          onClick={() => onNavigate('finances')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition"
        >
          Encaisser un paiement
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Encaissé ({academicYear})</span>
          <p className="text-2xl font-black text-emerald-700 mt-1 font-mono tabular-nums">
            {totalCollected.toLocaleString()} TND
          </p>
          <p className="text-xs text-slate-500 mt-2">{payments.length} reçus émis au registre</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Taux de recouvrement</span>
          <p className="text-2xl font-black text-blue-900 mt-1 tabular-nums">{recoveryRate}%</p>
          <p className="text-xs text-slate-500 mt-2">Sur un prévisionnel de {totalExpected.toLocaleString()} TND</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Pré-inscriptions en attente</span>
          <p className="text-2xl font-black text-amber-600 mt-1 tabular-nums">{preRegistrations.length}</p>
          <p className="text-xs text-slate-500 mt-2">Dossiers à finaliser avec les parents</p>
        </div>
      </div>
    </div>
  );
};

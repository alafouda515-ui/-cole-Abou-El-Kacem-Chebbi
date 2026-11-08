import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Payment, Student } from '../../types';
import {
  CreditCard,
  Plus,
  FileText,
  Trash2,
  AlertCircle,
  CheckCircle,
  Bell,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Send
} from 'lucide-react';

interface Props {
  onOpenReceipt: (payment: Payment) => void;
}

export const FinancesTab: React.FC<Props> = ({ onOpenReceipt }) => {
  const {
    payments,
    feePlan,
    students,
    classes,
    academicYear,
    currentUser,
    recordPayment,
    deletePayment,
    getStudentFinancialBalance,
    sendMessage
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'payments' | 'unpaid' | 'feePlan'>('payments');
  const [relanceSentStudentId, setRelanceSentStudentId] = useState<string | null>(null);

  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'ACCOUNTANT';
  const isParent = currentUser.role === 'PARENT';

  // Form State
  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    academicYear: academicYear,
    amount: 500,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Espèces' as Payment['paymentMethod'],
    tranche: 'Trimestre 1' as Payment['tranche'],
    status: 'PAYE' as Payment['status'],
    notes: 'Paiement scolarité standard.'
  });

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    if (p.academicYear !== academicYear) return false;
    if (isParent && p.studentId !== currentUser.linkedStudentId) return false;
    const st = students.find((s) => s.id === p.studentId);
    if (!st) return false;
    return `${st.firstName} ${st.lastName} ${p.receiptNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Active students status
  const activeStudents = students.filter(
    (s) => s.status === 'ACTIF' && (isParent ? s.id === currentUser.linkedStudentId : true)
  );

  const unpaidStudents = activeStudents
    .map((st) => ({
      student: st,
      balance: getStudentFinancialBalance(st.id)
    }))
    .filter((item) => item.balance.remaining > 0);

  const totalCollected = filteredPayments
    .filter((p) => p.status === 'PAYE')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleOpenAdd = () => {
    setFormData({
      studentId: students[0]?.id || '',
      academicYear: academicYear,
      amount: 500,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Espèces',
      tranche: 'Trimestre 2',
      status: 'PAYE',
      notes: 'Règlement régulier.'
    });
    setShowPayModal(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      alert('Veuillez saisir un montant valide.');
      return;
    }

    const newPayment = recordPayment(formData);
    setShowPayModal(false);
    // Open receipt modal directly
    onOpenReceipt(newPayment);
  };

  const handleSendRelance = (st: Student, remaining: number) => {
    const parentMsg = `Madame, Monsieur,\n\nNous vous informons qu'un solde de ${remaining.toLocaleString()} TND reste à régler au titre des frais de scolarité de votre enfant ${st.firstName} ${st.lastName} pour l'année académique ${academicYear}.\n\nMerci de bien vouloir régulariser auprès du secrétariat ou par virement bancaire.\n\nCordialement,\nService Comptabilité`;

    // Trigger internal message + notification
    sendMessage({
      recipientId: 'user-parent-1',
      subject: `Rappel de solde de scolarité - ${st.firstName} ${st.lastName}`,
      body: parentMsg,
      studentId: st.id
    });

    setRelanceSentStudentId(st.id);
    setTimeout(() => setRelanceSentStudentId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Gestion Financière & Encaissements</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              {filteredPayments.length} paiements
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grille tarifaire, suivi des encaissements, émission de reçus et notifications automatiques ({academicYear})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Subtabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('payments')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeSubTab === 'payments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Règlements & Reçus
            </button>
            <button
              onClick={() => setActiveSubTab('unpaid')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeSubTab === 'unpaid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Suivi Impayés ({unpaidStudents.length})
            </button>
            <button
              onClick={() => setActiveSubTab('feePlan')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeSubTab === 'feePlan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grille Tarifaire
            </button>
          </div>

          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-2 shadow-xs transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Encaisser un paiement</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Recettes Encaissées</p>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1 tabular-nums">
            {totalCollected.toLocaleString()} TND
          </p>
          <p className="text-xs text-slate-400 mt-2">Total enregistré au grand livre</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Dossiers avec Solde Restant</p>
          <p className="text-2xl font-black text-amber-600 mt-1 tabular-nums">
            {unpaidStudents.length} élèves
          </p>
          <p className="text-xs text-slate-400 mt-2">Relances automatiques disponibles</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Tarif Annuel par Élève</p>
          <p className="text-2xl font-black text-blue-900 font-mono mt-1 tabular-nums">
            {feePlan.totalAnnual.toLocaleString()} TND
          </p>
          <p className="text-xs text-slate-400 mt-2">Inscription + 3 tranches trimestrielles</p>
        </div>
      </div>

      {/* ----------------- SUBTAB: PAYMENTS TABLE ----------------- */}
      {activeSubTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-center gap-3">
            <h2 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Historique des Paiements & Reçus Émis ({academicYear})
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par élève ou N° reçu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">N° Reçu</th>
                  <th className="py-3 px-4">Élève & Classe</th>
                  <th className="py-3 px-4">Tranche / Motif</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Aucun paiement enregistré pour ces critères.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const st = students.find((s) => s.id === p.studentId);
                    const cls = classes.find((c) => c.id === st?.classId);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                          {p.receiptNumber}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{st?.firstName} {st?.lastName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{cls?.name}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {p.tranche}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-sm text-emerald-700 tabular-nums">
                          {p.amount.toLocaleString()} TND
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {p.paymentDate}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenReceipt(p)}
                              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-xs flex items-center gap-1.5 border border-emerald-200 transition"
                              title="Visualiser et imprimer le reçu officiel"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Reçu PDF</span>
                            </button>

                            {canManage && (
                              <button
                                onClick={() => {
                                  if (window.confirm("Annuler / supprimer ce paiement du registre ?")) {
                                    deletePayment(p.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                                title="Supprimer l'encaissement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* ----------------- SUBTAB: UNPAID / RELANCES ----------------- */}
      {activeSubTab === 'unpaid' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
            <h2 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Suivi des Soldes Restants & Relances Automatiques
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Élève</th>
                  <th className="py-3 px-4">Parent / Contact</th>
                  <th className="py-3 px-4">Total Réglé</th>
                  <th className="py-3 px-4">Solde Dû</th>
                  <th className="py-3 px-4">Statut</th>
                  {canManage && <th className="py-3 px-4 text-right">Relance Parent</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unpaidStudents.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 6 : 5} className="py-12 text-center text-slate-400">
                      Tous les élèves sont à jour de paiement ! Félicitations.
                    </td>
                  </tr>
                ) : (
                  unpaidStudents.map(({ student, balance }) => {
                    const isSent = relanceSentStudentId === student.id;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900 block">{student.parentName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{student.parentPhone}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {balance.totalPaid.toLocaleString()} TND
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-700 text-sm">
                          {balance.remaining.toLocaleString()} TND
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Paiement partiel
                          </span>
                        </td>
                        {canManage && (
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleSendRelance(student, balance.remaining)}
                              disabled={isSent}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 ml-auto transition ${
                                isSent
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isSent ? 'Relance envoyée !' : 'Relance 1-clic'}</span>
                            </button>
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
      )}

      {/* ----------------- SUBTAB: FEE PLAN ----------------- */}
      {activeSubTab === 'feePlan' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Grille Tarifaire Officielle ({academicYear})</h2>
          <p className="text-xs text-slate-500">
            Fixation annuelle votée par le conseil d'administration pour l'ensemble des élèves de l'école.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-800">Frais d'inscription & assurance scolaire :</span>
              <span className="font-mono font-bold text-slate-900">{feePlan.registrationFee} TND</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-800">Tranche 1 (Septembre - Novembre) :</span>
              <span className="font-mono font-bold text-slate-900">{feePlan.term1Fee} TND</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-800">Tranche 2 (Décembre - Février) :</span>
              <span className="font-mono font-bold text-slate-900">{feePlan.term2Fee} TND</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-800">Tranche 3 (Mars - Juin) :</span>
              <span className="font-mono font-bold text-slate-900">{feePlan.term3Fee} TND</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-bold text-sm">
              <span>Coût global de la scolarité annuelle :</span>
              <span className="font-mono text-base text-emerald-800">{feePlan.totalAnnual} TND</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Payment */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-emerald-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Encaisser un Nouveau Paiement</h3>
              <button onClick={() => setShowPayModal(false)} className="text-emerald-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSavePayment} className="p-6 space-y-4 text-xs text-slate-800">
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
                  <label className="block font-bold mb-1">Montant perçu (TND) *</label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold text-sm text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Date d'encaissement *</label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Mode de règlement *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Espèces">Espèces</option>
                    <option value="Virement bancaire">Virement bancaire</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Mobile Money">Mobile Money (D17/Flouci)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Tranche / Affectation *</label>
                  <select
                    value={formData.tranche}
                    onChange={(e) => setFormData({ ...formData, tranche: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Frais Inscription">Frais d'inscription</option>
                    <option value="Trimestre 1">Trimestre 1</option>
                    <option value="Trimestre 2">Trimestre 2</option>
                    <option value="Trimestre 3">Trimestre 3</option>
                    <option value="Autre">Autre prestation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Commentaire ou référence de chèque/virement</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="Ex: Chèque BIAT N°..."
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-[11px] text-emerald-800 leading-relaxed">
                ⚡ <strong>Règle 8.2 du Cahier des Charges :</strong> Dès validation, le reçu PDF sera automatiquement généré, et un message interne avec le détail et le solde restant sera expédié au parent.
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Valider & Générer le Reçu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

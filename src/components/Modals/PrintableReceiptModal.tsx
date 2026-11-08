import React from 'react';
import { Payment } from '../../types';
import { useApp } from '../../context/AppContext';
import { Printer, X, CheckCircle, FileText } from 'lucide-react';

interface Props {
  payment: Payment;
  onClose: () => void;
}

export const PrintableReceiptModal: React.FC<Props> = ({ payment, onClose }) => {
  const { students, classes, feePlan, getStudentFinancialBalance } = useApp();

  const student = students.find((s) => s.id === payment.studentId);
  const studentClass = classes.find((c) => c.id === student?.classId);
  const balance = student ? getStudentFinancialBalance(student.id) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Actions bar (hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-bold text-base">Reçu de Paiement Officiel</h2>
              <p className="text-xs text-slate-400">Réf : {payment.receiptNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              Imprimer / Télécharger Reçu PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 sm:p-10 print-page text-slate-900 bg-white">
          {/* Header */}
          <div className="border-b-2 border-emerald-900 pb-4 mb-6 flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Service Comptabilité & Trésorerie</p>
              <h1 className="text-xl font-black text-slate-900">
                ÉCOLE PRIMAIRE PRIVÉE ABOU EL KACEM CHEBBI
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Sousse, Tunisie · Tél: +216 73 222 100 · Agrément N° 2012/48
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold rounded">
                REÇU N° {payment.receiptNumber}
              </span>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">Date : {payment.paymentDate}</p>
            </div>
          </div>

          {/* Student Info Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Reçu de :</span>
                <span className="font-bold text-sm text-slate-900 block mt-0.5">{student?.parentName || 'Parent d\'élève'}</span>
                <span className="text-slate-600">Tél: {student?.parentPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Pour l'élève :</span>
                <span className="font-bold text-sm text-slate-900 block mt-0.5">{student?.firstName} {student?.lastName}</span>
                <span className="text-slate-600">Matricule: {student?.matricule} · Classe: {studentClass?.name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Payment Breakdown Table */}
          <table className="w-full text-left text-sm border border-slate-200 rounded-lg overflow-hidden mb-6">
            <thead className="bg-slate-100 text-xs font-semibold text-slate-700">
              <tr>
                <th className="py-2.5 px-4">Désignation / Objet</th>
                <th className="py-2.5 px-4">Mode de règlement</th>
                <th className="py-2.5 px-4 text-right">Montant Réglé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              <tr>
                <td className="py-3 px-4 font-medium text-slate-800">
                  {payment.tranche} - Année {payment.academicYear}
                  {payment.notes && <p className="text-[11px] text-slate-500 mt-0.5 italic">{payment.notes}</p>}
                </td>
                <td className="py-3 px-4 text-slate-700">{payment.paymentMethod}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-sm text-emerald-700">
                  {payment.amount.toLocaleString()} TND
                </td>
              </tr>
            </tbody>
          </table>

          {/* Financial Balance Summary */}
          {balance && (
            <div className="border border-slate-200 rounded-xl p-4 bg-emerald-50/40 mb-6 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Total annuel scolarité</span>
                <span className="text-xs font-bold font-mono text-slate-800">{feePlan.totalAnnual.toLocaleString()} TND</span>
              </div>
              <div className="border-x border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">Cumul réglé à ce jour</span>
                <span className="text-xs font-bold font-mono text-emerald-800">{balance.totalPaid.toLocaleString()} TND</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">Solde restant à régler</span>
                <span className="text-xs font-bold font-mono text-blue-900">{balance.remaining.toLocaleString()} TND</span>
              </div>
            </div>
          )}

          {/* Signature and stamp */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Paiement Encaissé & Validé
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Merci de conserver ce document comme justificatif de paiement.</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Le Caissier / Secrétariat</p>
              <div className="w-32 h-14 border border-dashed border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400">
                Cachet Officiel
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

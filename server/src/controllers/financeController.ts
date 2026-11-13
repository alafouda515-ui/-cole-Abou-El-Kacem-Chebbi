import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { db } from '../models/dbAdapter';

export const getPayments = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { academicYear, studentId, search } = req.query;
  const database = db.getDb();

  let list = database.payments.filter((p) => p.school_id === schoolId);

  if (academicYear) {
    list = list.filter((p) => p.academic_year === academicYear);
  }

  if (studentId) {
    list = list.filter((p) => p.student_id === studentId);
  }

  const enriched = list.map((p) => {
    const student = database.students.find((s) => s.id === p.student_id);
    const cls = database.classes.find((c) => c.id === student?.class_id);
    return {
      ...p,
      studentName: student ? `${student.first_name} ${student.last_name}` : 'Élève',
      parentName: student?.parent_name || 'Parent',
      className: cls?.name || 'N/A'
    };
  });

  return res.json({ success: true, count: enriched.length, payments: enriched });
};

export const recordPayment = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const {
    student_id,
    academic_year,
    amount,
    payment_date,
    payment_method,
    tranche,
    notes
  } = req.body;

  if (!student_id || !amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Élève et montant valide requis.' });
  }

  const database = db.getDb();
  const student = database.students.find((s) => s.id === student_id && s.school_id === schoolId);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Élève introuvable dans cet établissement.' });
  }

  const year = academic_year || '2025-2026';
  const schoolPayments = database.payments.filter((p) => p.school_id === schoolId);
  const receiptNumber = `REC-${year.split('-')[0]}-${String(schoolPayments.length + 101).padStart(5, '0')}`;
  const now = new Date().toISOString();
  const paymentId = 'pay_' + Date.now();

  const newPayment = {
    id: paymentId,
    school_id: schoolId,
    receipt_number: receiptNumber,
    student_id,
    academic_year: year,
    amount: Number(amount),
    payment_date: payment_date || now.split('T')[0],
    payment_method: payment_method || 'Espèces',
    tranche: tranche || 'Trimestre 1',
    status: 'PAYE',
    notes: notes || '',
    pdf_generated: true,
    created_at: now
  };

  database.payments.unshift(newPayment);

  // Fee plan balance check
  const feePlan = database.fee_plans.find((f) => f.school_id === schoolId && f.academic_year === year) || {
    total_annual: 1750
  };

  const totalPaid = database.payments
    .filter((p) => p.school_id === schoolId && p.student_id === student_id && p.academic_year === year && p.status === 'PAYE')
    .reduce((sum, p) => sum + p.amount, 0);

  const remaining = Math.max(0, feePlan.total_annual - totalPaid);

  // Automated notification message dispatched to Parent (Cahier des charges 8.2)
  const autoMessage = {
    id: 'msg_auto_' + Date.now(),
    school_id: schoolId,
    sender_id: req.user?.id || 'sys',
    sender_name: 'Secrétariat Financier',
    sender_role: 'ACCOUNTANT',
    recipient_id: 'usr_parent_' + student_id,
    recipient_name: student.parent_name,
    recipient_role: 'PARENT',
    student_id,
    subject: `Confirmation de règlement - Reçu N° ${receiptNumber}`,
    body: `Chers parents de ${student.first_name} ${student.last_name},\n\nNous confirmons la bonne réception de votre paiement :\n• Montant versé : ${amount.toLocaleString()} TND\n• Date : ${newPayment.payment_date}\n• Mode : ${newPayment.payment_method}\n• Tranche : ${newPayment.tranche}\n• Solde restant : ${remaining.toLocaleString()} TND\n\nVotre reçu officiel est téléchargeable dans votre espace famille.`,
    sent_at: now,
    is_draft: false,
    download_url: `#receipt-${receiptNumber}`,
    created_at: now
  };

  database.messages.unshift(autoMessage);

  // Audit log
  database.audit_logs.unshift({
    id: 'log_' + Date.now(),
    school_id: schoolId,
    timestamp: now,
    user_id: req.user?.id || 'sys',
    user_name: `${req.user?.first_name} ${req.user?.last_name}`,
    user_role: req.user?.role || 'SCHOOL_ADMIN',
    action: 'NOTIFICATION_PAIEMENT',
    entity: 'Payment',
    entity_id: paymentId,
    details: `Encaissement de ${amount} TND pour l'élève ${student.first_name} ${student.last_name}. Reçu ${receiptNumber} émis.`
  });

  db.persist();

  return res.status(201).json({
    success: true,
    message: 'Paiement enregistré et reçu généré avec succès.',
    payment: newPayment,
    balance: {
      totalPaid,
      remaining,
      totalDue: feePlan.total_annual
    }
  });
};

export const getFeePlan = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const academicYear = (req.query.academicYear as string) || '2025-2026';
  const database = db.getDb();

  const plan = database.fee_plans.find((f) => f.school_id === schoolId && f.academic_year === academicYear) || {
    id: 'fp_' + schoolId,
    school_id: schoolId,
    academic_year: academicYear,
    registration_fee: 250,
    term1_fee: 500,
    term2_fee: 500,
    term3_fee: 500,
    total_annual: 1750
  };

  return res.json({ success: true, plan });
};

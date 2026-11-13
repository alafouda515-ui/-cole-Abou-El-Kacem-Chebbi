import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { db } from '../models/dbAdapter';

export const getAbsences = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const database = db.getDb();
  const { studentId, academicYear } = req.query;

  let absences = database.absences.filter((a) => a.school_id === schoolId);

  if (studentId) {
    absences = absences.filter((a) => a.student_id === studentId);
  }

  if (academicYear) {
    absences = absences.filter((a) => a.academic_year === academicYear);
  }

  const mapped = absences.map((a) => {
    const student = database.students.find((s) => s.id === a.student_id);
    return {
      id: a.id,
      studentId: a.student_id,
      studentName: student ? `${student.first_name} ${student.last_name}` : 'Élève',
      date: a.date,
      durationHours: a.duration_hours,
      academicYear: a.academic_year,
      isJustified: a.is_justified,
      justificationReason: a.justification_reason,
      status: a.status
    };
  });

  return res.json({
    success: true,
    absences: mapped
  });
};

export const createAbsence = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const database = db.getDb();
  const { studentId, date, durationHours, academicYear, justificationReason } = req.body;

  if (!studentId || !date) {
    return res.status(400).json({
      success: false,
      message: 'ID élève et date requis.'
    });
  }

  const newAbsence = {
    id: 'abs_' + Date.now(),
    school_id: schoolId!,
    student_id: studentId,
    date,
    duration_hours: Number(durationHours) || 2,
    academic_year: academicYear || '2025-2026',
    is_justified: !!justificationReason,
    justification_reason: justificationReason || null,
    status: justificationReason ? 'EN_ATTENTE_VALIDATION' : 'NON_JUSTIFIEE'
  };

  database.absences.unshift(newAbsence);

  database.audit_logs.push({
    id: 'log_' + Date.now(),
    school_id: schoolId || null,
    timestamp: new Date().toISOString(),
    user_id: req.user?.id || 'usr_unknown',
    user_name: `${req.user?.first_name} ${req.user?.last_name}`,
    user_role: req.user?.role || 'TEACHER',
    action: 'CREATION',
    entity: 'Absence',
    entity_id: newAbsence.id,
    details: `Saisie absence de ${newAbsence.duration_hours}h le ${date}.`
  });

  db.persist();

  return res.status(201).json({
    success: true,
    absence: {
      id: newAbsence.id,
      studentId: newAbsence.student_id,
      date: newAbsence.date,
      durationHours: newAbsence.duration_hours,
      academicYear: newAbsence.academic_year,
      isJustified: newAbsence.is_justified,
      justificationReason: newAbsence.justification_reason,
      status: newAbsence.status
    }
  });
};

export const justifyAbsence = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { id } = req.params;
  const { reason } = req.body;
  const database = db.getDb();

  const absence = database.absences.find((a) => a.id === id && a.school_id === schoolId);
  if (!absence) {
    return res.status(404).json({
      success: false,
      message: 'Fiche d\'absence non trouvée.'
    });
  }

  absence.justification_reason = reason;
  absence.status = 'EN_ATTENTE_VALIDATION';

  db.persist();

  return res.json({
    success: true,
    message: 'Justification enregistrée avec succès.',
    absence
  });
};

export const validateAbsence = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { id } = req.params;
  const { justified } = req.body;
  const database = db.getDb();

  const absence = database.absences.find((a) => a.id === id && a.school_id === schoolId);
  if (!absence) {
    return res.status(404).json({
      success: false,
      message: 'Fiche d\'absence non trouvée.'
    });
  }

  absence.is_justified = Boolean(justified);
  absence.status = justified ? 'JUSTIFIEE' : 'NON_JUSTIFIEE';

  db.persist();

  return res.json({
    success: true,
    message: `Absence ${justified ? 'justifiée' : 'marquée non justifiée'}.`,
    absence
  });
};

export const deleteAbsence = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { id } = req.params;
  const database = db.getDb();

  const index = database.absences.findIndex((a) => a.id === id && a.school_id === schoolId);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Fiche d\'absence non trouvée.'
    });
  }

  database.absences.splice(index, 1);
  db.persist();

  return res.json({
    success: true,
    message: 'Fiche d\'absence supprimée.'
  });
};

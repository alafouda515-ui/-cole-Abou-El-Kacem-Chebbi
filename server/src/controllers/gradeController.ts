import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { db } from '../models/dbAdapter';

export const getGrades = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { studentId, classId, subjectId, term, academicYear } = req.query;
  const database = db.getDb();

  let list = database.grades.filter((g) => g.school_id === schoolId);

  if (academicYear) {
    list = list.filter((g) => g.academic_year === academicYear);
  }
  if (term) {
    list = list.filter((g) => g.term === term);
  }
  if (studentId) {
    list = list.filter((g) => g.student_id === studentId);
  }
  if (classId && classId !== 'ALL') {
    list = list.filter((g) => g.class_id === classId);
  }
  if (subjectId && subjectId !== 'ALL') {
    list = list.filter((g) => g.subject_id === subjectId);
  }

  // Enrich with names
  const enriched = list.map((g) => {
    const student = database.students.find((s) => s.id === g.student_id);
    const subject = database.subjects.find((s) => s.id === g.subject_id);
    const cls = database.classes.find((c) => c.id === g.class_id);

    return {
      ...g,
      studentName: student ? `${student.first_name} ${student.last_name}` : 'Élève',
      subjectName: subject?.name || 'Matière',
      className: cls?.name || 'Classe'
    };
  });

  return res.json({ success: true, count: enriched.length, grades: enriched });
};

export const createGrade = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const {
    student_id,
    subject_id,
    class_id,
    term,
    academic_year,
    exam_type,
    score,
    coefficient,
    exam_date,
    comment
  } = req.body;

  if (!student_id || !subject_id || score === undefined) {
    return res.status(400).json({ success: false, message: 'Élève, matière et note sont requis.' });
  }

  if (score < 0 || score > 20) {
    return res.status(400).json({ success: false, message: 'La note doit être comprise entre 0 et 20.' });
  }

  const database = db.getDb();
  const student = database.students.find((s) => s.id === student_id && s.school_id === schoolId);

  const newGrade = {
    id: 'grd_' + Date.now(),
    school_id: schoolId,
    student_id,
    subject_id,
    class_id: class_id || student?.class_id || '',
    term: term || 'Trimestre 1',
    academic_year: academic_year || '2025-2026',
    exam_type: exam_type || 'Contrôle Continu',
    score: Number(score),
    coefficient: Number(coefficient) || 1.0,
    exam_date: exam_date || new Date().toISOString().split('T')[0],
    comment: comment || '',
    created_at: new Date().toISOString()
  };

  database.grades.unshift(newGrade);
  db.persist();

  return res.status(201).json({ success: true, message: 'Note enregistrée avec succès.', grade: newGrade });
};

export const deleteGrade = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { id } = req.params;
  const database = db.getDb();

  database.grades = database.grades.filter((g) => !(g.id === id && g.school_id === schoolId));
  db.persist();

  return res.json({ success: true, message: 'Note supprimée.' });
};

export const getStudentAverages = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { studentId } = req.params;
  const term = (req.query.term as string) || 'Trimestre 1';
  const academicYear = (req.query.academicYear as string) || '2025-2026';

  const database = db.getDb();
  const student = database.students.find((s) => s.id === studentId && s.school_id === schoolId);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Élève non trouvé.' });
  }

  const studentGrades = database.grades.filter(
    (g) => g.school_id === schoolId && g.student_id === studentId && g.term === term && g.academic_year === academicYear
  );

  const schoolSubjects = database.subjects.filter((sub) => sub.school_id === schoolId);

  const subjectMap: Record<string, { totalWeighted: number; totalCoeff: number; count: number }> = {};
  studentGrades.forEach((g) => {
    if (!subjectMap[g.subject_id]) {
      subjectMap[g.subject_id] = { totalWeighted: 0, totalCoeff: 0, count: 0 };
    }
    subjectMap[g.subject_id].totalWeighted += g.score * g.coefficient;
    subjectMap[g.subject_id].totalCoeff += g.coefficient;
    subjectMap[g.subject_id].count += 1;
  });

  const subjectAverages = schoolSubjects.map((sub) => {
    const data = subjectMap[sub.id];
    const avg = data && data.totalCoeff > 0 ? Number((data.totalWeighted / data.totalCoeff).toFixed(2)) : 0;
    return {
      subjectId: sub.id,
      subjectName: sub.name,
      coefficient: sub.coefficient,
      avg,
      count: data ? data.count : 0
    };
  }).filter((item) => item.count > 0);

  let sumWeightedAverages = 0;
  let sumCoefficients = 0;
  subjectAverages.forEach((item) => {
    sumWeightedAverages += item.avg * item.coefficient;
    sumCoefficients += item.coefficient;
  });

  const generalAverage = sumCoefficients > 0 ? Number((sumWeightedAverages / sumCoefficients).toFixed(2)) : 0;

  // Absences count
  const studentAbsences = database.absences.filter(
    (a) => a.school_id === schoolId && a.student_id === studentId && a.academic_year === academicYear
  );
  const totalAbsenceHours = studentAbsences.reduce((acc, a) => acc + a.duration_hours, 0);
  const justifiedHours = studentAbsences.filter((a) => a.is_justified).reduce((acc, a) => acc + a.duration_hours, 0);

  return res.json({
    success: true,
    student: {
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      matricule: student.matricule,
      birth_date: student.birth_date,
      photo_url: student.photo_url
    },
    term,
    academicYear,
    subjectAverages,
    generalAverage,
    totalCoefficients: sumCoefficients,
    absences: {
      totalHours: totalAbsenceHours,
      justifiedHours
    }
  });
};

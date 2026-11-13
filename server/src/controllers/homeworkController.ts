import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { db } from '../models/dbAdapter';

export const getHomeworks = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { classId, academicYear } = req.query;
  const database = db.getDb();

  let list = database.homeworks.filter((h) => h.school_id === schoolId);

  if (academicYear) {
    list = list.filter((h) => h.academic_year === academicYear);
  }

  if (classId && classId !== 'ALL') {
    list = list.filter((h) => h.class_id === classId);
  }

  // If student is logged in, attach their submission
  const studentId = req.user?.role === 'STUDENT' ? req.user.linked_student_id : null;

  const enriched = list.map((hw) => {
    const subject = database.subjects.find((s) => s.id === hw.subject_id);
    const cls = database.classes.find((c) => c.id === hw.class_id);
    const teacher = database.users.find((u) => u.id === hw.teacher_id);
    const submissions = database.homework_submissions.filter((hs) => hs.homework_id === hw.id);
    const studentSubmission = studentId ? submissions.find((s) => s.student_id === studentId) : null;

    return {
      ...hw,
      subjectName: subject?.name || 'Matière',
      subjectColor: subject?.color || '#2563eb',
      className: cls?.name || 'Classe',
      teacherName: teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Enseignant',
      submissionsCount: submissions.length,
      studentSubmission
    };
  });

  return res.json({ success: true, count: enriched.length, homeworks: enriched });
};

export const createHomework = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const {
    title,
    description,
    subject_id,
    class_id,
    due_date,
    academic_year,
    attachments,
    max_score
  } = req.body;

  if (!title || !subject_id || !class_id || !due_date) {
    return res.status(400).json({ success: false, message: 'Titre, matière, classe et date limite sont requis.' });
  }

  const database = db.getDb();
  const newHw = {
    id: 'hw_' + Date.now(),
    school_id: schoolId,
    title: title.trim(),
    description: description || '',
    subject_id,
    class_id,
    teacher_id: req.user?.id || 'usr_teacher',
    due_date,
    academic_year: academic_year || '2025-2026',
    attachments: attachments || [],
    correction_file: null,
    correction_published: false,
    max_score: max_score || 20,
    created_at: new Date().toISOString()
  };

  database.homeworks.unshift(newHw);
  db.persist();

  return res.status(201).json({ success: true, message: 'Devoir publié avec succès.', homework: newHw });
};

export const submitHomework = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { homeworkId } = req.params;
  const { content, file_name } = req.body;

  const studentId = req.user?.linked_student_id || req.body.student_id;
  if (!studentId) {
    return res.status(400).json({ success: false, message: 'Identifiant élève manquant.' });
  }

  const database = db.getDb();
  const hw = database.homeworks.find((h) => h.id === homeworkId && h.school_id === schoolId);

  if (!hw) {
    return res.status(404).json({ success: false, message: 'Devoir introuvable.' });
  }

  const now = new Date();
  const dueDate = new Date(hw.due_date + 'T23:59:59');
  const isLate = now.getTime() > dueDate.getTime();

  const existingIdx = database.homework_submissions.findIndex(
    (s) => s.homework_id === homeworkId && s.student_id === studentId
  );

  const submission = {
    id: existingIdx >= 0 ? database.homework_submissions[existingIdx].id : 'sub_' + Date.now(),
    school_id: schoolId,
    homework_id: homeworkId,
    student_id: studentId,
    submitted_at: now.toISOString(),
    content: content || 'Fichier joint déposé.',
    file_name: file_name || 'Devoir.pdf',
    score: existingIdx >= 0 ? database.homework_submissions[existingIdx].score : undefined,
    teacher_feedback: existingIdx >= 0 ? database.homework_submissions[existingIdx].teacher_feedback : undefined,
    graded_at: existingIdx >= 0 ? database.homework_submissions[existingIdx].graded_at : undefined,
    is_late: isLate,
    parent_acknowledged: false
  };

  if (existingIdx >= 0) {
    database.homework_submissions[existingIdx] = submission;
  } else {
    database.homework_submissions.push(submission);
  }

  db.persist();

  return res.json({ success: true, message: 'Devoir déposé avec succès.', submission });
};

export const gradeSubmission = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { submissionId } = req.params;
  const { score, feedback } = req.body;

  const database = db.getDb();
  const sub = database.homework_submissions.find(
    (s) => s.id === submissionId && s.school_id === schoolId
  );

  if (!sub) {
    return res.status(404).json({ success: false, message: 'Dépôt introuvable.' });
  }

  sub.score = Number(score);
  sub.teacher_feedback = feedback || 'Évalué.';
  sub.graded_at = new Date().toISOString();

  db.persist();

  return res.json({ success: true, message: 'Note attribuée.', submission: sub });
};

export const acknowledgeByParent = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { submissionId } = req.params;

  const database = db.getDb();
  const sub = database.homework_submissions.find(
    (s) => s.id === submissionId && s.school_id === schoolId
  );

  if (!sub) {
    return res.status(404).json({ success: false, message: 'Dépôt introuvable.' });
  }

  sub.parent_acknowledged = true;
  sub.parent_acknowledged_at = new Date().toISOString();

  db.persist();

  return res.json({ success: true, message: 'Marquage "Vu par le parent" enregistré.', submission: sub });
};

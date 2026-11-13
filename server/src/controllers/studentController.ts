import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { db } from '../models/dbAdapter';

export const getStudents = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { classId, status, search, academicYear } = req.query;
  const database = db.getDb();

  let list = database.students.filter((s) => s.school_id === schoolId);

  if (academicYear) {
    list = list.filter((s) => s.academic_year === academicYear);
  }

  if (classId && classId !== 'ALL') {
    list = list.filter((s) => s.class_id === classId);
  }

  if (status && status !== 'ALL') {
    list = list.filter((s) => s.status === status);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      (s) =>
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.matricule.toLowerCase().includes(q) ||
        (s.parent_name && s.parent_name.toLowerCase().includes(q))
    );
  }

  // Attach class details
  const enriched = list.map((st) => {
    const cls = database.classes.find((c) => c.id === st.class_id);
    return {
      ...st,
      className: cls?.name || 'Non affecté'
    };
  });

  return res.json({
    success: true,
    count: enriched.length,
    students: enriched
  });
};

export const createStudent = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const {
    first_name,
    last_name,
    birth_date,
    gender,
    photo_url,
    academic_year,
    class_id,
    parent_name,
    parent_email,
    parent_phone,
    address,
    medical_notes,
    status
  } = req.body;

  if (!first_name || !last_name || !parent_name || !parent_phone) {
    return res.status(400).json({
      success: false,
      message: 'Prénom, nom, nom du parent et téléphone sont requis.'
    });
  }

  const database = db.getDb();
  const schoolStudents = database.students.filter((s) => s.school_id === schoolId);
  const matricule = `MAT-${(academic_year || '2025-2026').split('-')[0]}-${String(schoolStudents.length + 1).padStart(3, '0')}`;
  const now = new Date().toISOString();
  const newId = 'stu_' + Date.now();

  const newStudent = {
    id: newId,
    school_id: schoolId,
    matricule,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    birth_date: birth_date || '2016-01-01',
    gender: gender || 'M',
    photo_url: photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    academic_year: academic_year || '2025-2026',
    class_id: class_id || null,
    parent_name: parent_name.trim(),
    parent_email: parent_email ? parent_email.trim() : '',
    parent_phone: parent_phone.trim(),
    address: address || '',
    medical_notes: medical_notes || 'Aucun antécédent particulier.',
    registration_date: now.split('T')[0],
    status: status || 'ACTIF',
    created_at: now,
    updated_at: now
  };

  database.students.unshift(newStudent);

  database.audit_logs.unshift({
    id: 'log_' + Date.now(),
    school_id: schoolId,
    timestamp: now,
    user_id: req.user?.id || 'sys',
    user_name: `${req.user?.first_name} ${req.user?.last_name}`,
    user_role: req.user?.role || 'SCHOOL_ADMIN',
    action: 'CREATION',
    entity: 'Student',
    entity_id: newId,
    details: `Inscription de l'élève ${newStudent.first_name} ${newStudent.last_name} (${matricule}).`
  });

  db.persist();

  return res.status(201).json({
    success: true,
    message: 'Dossier élève créé avec succès.',
    student: newStudent
  });
};

export const updateStudent = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { id } = req.params;
  const database = db.getDb();

  const student = database.students.find(
    (s) => s.id === id && s.school_id === schoolId
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Élève non trouvé dans cet établissement.'
    });
  }

  const allowedFields = [
    'first_name',
    'last_name',
    'birth_date',
    'gender',
    'photo_url',
    'class_id',
    'parent_name',
    'parent_email',
    'parent_phone',
    'address',
    'medical_notes',
    'status'
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      student[field] = req.body[field];
    }
  });

  student.updated_at = new Date().toISOString();

  database.audit_logs.unshift({
    id: 'log_' + Date.now(),
    school_id: schoolId,
    timestamp: new Date().toISOString(),
    user_id: req.user?.id || 'sys',
    user_name: `${req.user?.first_name} ${req.user?.last_name}`,
    user_role: req.user?.role || 'SCHOOL_ADMIN',
    action: 'MODIFICATION',
    entity: 'Student',
    entity_id: id,
    details: `Mise à jour du dossier élève ${student.first_name} ${student.last_name}.`
  });

  db.persist();

  return res.json({
    success: true,
    message: 'Dossier élève mis à jour.',
    student
  });
};

export const deleteStudent = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { id } = req.params;
  const database = db.getDb();

  const student = database.students.find(
    (s) => s.id === id && s.school_id === schoolId
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Élève introuvable dans cet établissement.'
    });
  }

  // Soft delete / Archival to preserve academic history as required
  student.status = 'RADIE';
  student.updated_at = new Date().toISOString();

  database.audit_logs.unshift({
    id: 'log_' + Date.now(),
    school_id: schoolId,
    timestamp: new Date().toISOString(),
    user_id: req.user?.id || 'sys',
    user_name: `${req.user?.first_name} ${req.user?.last_name}`,
    user_role: req.user?.role || 'SCHOOL_ADMIN',
    action: 'SUPPRESSION',
    entity: 'Student',
    entity_id: id,
    details: `Radiation (suppression logique) de l'élève ${student.first_name} ${student.last_name}.`
  });

  db.persist();

  return res.json({
    success: true,
    message: `L'élève ${student.first_name} ${student.last_name} a été radié et son dossier archivé.`
  });
};

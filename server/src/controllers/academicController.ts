import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middlewares/auth';
import { db, User } from '../models/dbAdapter';

// =================== CLASSES ===================
export const getClasses = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { academicYear } = req.query;
  const database = db.getDb();

  let list = database.classes.filter((c) => c.school_id === schoolId);
  if (academicYear) {
    list = list.filter((c) => c.academic_year === academicYear);
  }

  const enriched = list.map((cls) => {
    const studentCount = database.students.filter(
      (s) => s.school_id === schoolId && s.class_id === cls.id && s.status === 'ACTIF'
    ).length;
    const mainTeacher = database.users.find((u) => u.id === cls.main_teacher_id);
    return {
      ...cls,
      studentCount,
      mainTeacherName: mainTeacher ? `${mainTeacher.first_name} ${mainTeacher.last_name}` : 'Non désigné'
    };
  });

  return res.json({ success: true, count: enriched.length, classes: enriched });
};

export const createClass = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { name, level, section, max_capacity, academic_year, main_teacher_id } = req.body;

  if (!name || !level || !section) {
    return res.status(400).json({ success: false, message: 'Nom, niveau et section sont requis.' });
  }

  const database = db.getDb();
  const newClass = {
    id: 'cls_' + Date.now(),
    school_id: schoolId,
    name: name.trim(),
    level,
    section,
    max_capacity: max_capacity || 25,
    academic_year: academic_year || '2025-2026',
    main_teacher_id: main_teacher_id || null,
    created_at: new Date().toISOString()
  };

  database.classes.push(newClass);
  db.persist();

  return res.status(201).json({ success: true, message: 'Classe créée avec succès.', class: newClass });
};

export const updateClass = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { id } = req.params;
  const database = db.getDb();

  const cls = database.classes.find((c) => c.id === id && c.school_id === schoolId);
  if (!cls) {
    return res.status(404).json({ success: false, message: 'Classe non trouvée.' });
  }

  const { name, level, section, max_capacity, main_teacher_id } = req.body;
  if (name) cls.name = name.trim();
  if (level) cls.level = level;
  if (section) cls.section = section;
  if (max_capacity) cls.max_capacity = max_capacity;
  if (main_teacher_id !== undefined) cls.main_teacher_id = main_teacher_id;

  db.persist();
  return res.json({ success: true, message: 'Classe mise à jour.', class: cls });
};

export const deleteClass = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { id } = req.params;
  const database = db.getDb();

  const studentsAssigned = database.students.filter(
    (s) => s.school_id === schoolId && s.class_id === id && s.status === 'ACTIF'
  );

  if (studentsAssigned.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Suppression impossible : cette classe compte ${studentsAssigned.length} élève(s) actif(s). Veuillez d'abord les réaffecter.`
    });
  }

  database.classes = database.classes.filter((c) => !(c.id === id && c.school_id === schoolId));
  db.persist();

  return res.json({ success: true, message: 'Classe supprimée avec succès.' });
};

// =================== SUBJECTS ===================
export const getSubjects = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const database = db.getDb();
  const list = database.subjects.filter((s) => s.school_id === schoolId);
  return res.json({ success: true, count: list.length, subjects: list });
};

export const createSubject = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { name, coefficient, level, color } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Nom de la matière requis.' });
  }

  const database = db.getDb();
  const newSubject = {
    id: 'sub_' + Date.now(),
    school_id: schoolId,
    name: name.trim(),
    coefficient: coefficient || 1.0,
    level: level || 'Tous',
    color: color || '#2563eb',
    created_at: new Date().toISOString()
  };

  database.subjects.push(newSubject);
  db.persist();

  return res.status(201).json({ success: true, message: 'Matière ajoutée.', subject: newSubject });
};

export const deleteSubject = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { id } = req.params;
  const database = db.getDb();

  const gradesLinked = database.grades.filter(
    (g) => g.school_id === schoolId && g.subject_id === id
  );

  if (gradesLinked.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Suppression refusée : ${gradesLinked.length} note(s) sont déjà enregistrées pour cette matière.`
    });
  }

  database.subjects = database.subjects.filter((s) => !(s.id === id && s.school_id === schoolId));
  db.persist();

  return res.json({ success: true, message: 'Matière supprimée avec succès.' });
};

// =================== ROOMS ===================
export const getRooms = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const database = db.getDb();
  const list = database.rooms.filter((r) => r.school_id === schoolId);
  return res.json({ success: true, count: list.length, rooms: list });
};

export const createRoom = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { name, capacity, type } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Nom de la salle requis.' });
  }

  const database = db.getDb();
  const newRoom = {
    id: 'rm_' + Date.now(),
    school_id: schoolId,
    name: name.trim(),
    capacity: capacity || 30,
    type: type || 'Classe',
    is_available: true,
    created_at: new Date().toISOString()
  };

  database.rooms.push(newRoom);
  db.persist();

  return res.status(201).json({ success: true, message: 'Salle ajoutée.', room: newRoom });
};

export const deleteRoom = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { id } = req.params;
  const database = db.getDb();

  database.rooms = database.rooms.filter((r) => !(r.id === id && r.school_id === schoolId));
  db.persist();

  return res.json({ success: true, message: 'Salle supprimée.' });
};

// =================== TEACHERS ===================
export const getTeachers = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const database = db.getDb();

  const teachers = database.users
    .filter((u) => u.school_id === schoolId && u.role === 'TEACHER')
    .map((t) => {
      const assignedClasses = database.classes.filter(
        (c) => c.school_id === schoolId && c.main_teacher_id === t.id
      );
      return {
        id: t.id,
        email: t.email,
        first_name: t.first_name,
        last_name: t.last_name,
        name: `${t.first_name} ${t.last_name}`,
        phone: t.phone,
        avatar_url: t.avatar_url,
        is_active: t.is_active,
        classes: assignedClasses.map((c) => c.name)
      };
    });

  return res.json({ success: true, count: teachers.length, teachers });
};

export const createTeacher = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { first_name, last_name, email, phone, password } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ success: false, message: 'Prénom, nom et email sont requis.' });
  }

  const database = db.getDb();
  const emailLower = email.trim().toLowerCase();

  if (database.users.some((u) => u.email.toLowerCase() === emailLower)) {
    return res.status(400).json({ success: false, message: 'Cette adresse email est déjà prise.' });
  }

  const newTeacher: User = {
    id: 'usr_teacher_' + Date.now(),
    school_id: schoolId || null,
    email: emailLower,
    password_hash: bcrypt.hashSync(password || 'Teacher2026!', 10),
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    role: 'TEACHER',
    phone: phone || '',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  database.users.push(newTeacher);
  db.persist();

  return res.status(201).json({
    success: true,
    message: 'Compte enseignant créé avec succès.',
    teacher: {
      id: newTeacher.id,
      name: `${newTeacher.first_name} ${newTeacher.last_name}`,
      email: newTeacher.email,
      role: newTeacher.role
    }
  });
};

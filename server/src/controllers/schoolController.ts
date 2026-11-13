import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { db } from '../models/dbAdapter';

export const getSchoolProfile = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const database = db.getDb();
  const school = database.schools.find((s) => s.id === schoolId);

  if (!school) {
    return res.status(404).json({ success: false, message: 'Établissement introuvable.' });
  }

  const studentCount = database.students.filter(
    (s) => s.school_id === schoolId && s.status === 'ACTIF'
  ).length;
  const teacherCount = database.users.filter(
    (u) => u.school_id === schoolId && u.role === 'TEACHER'
  ).length;
  const classCount = database.classes.filter(
    (c) => c.school_id === schoolId
  ).length;
  const totalRevenue = database.payments
    .filter((p) => p.school_id === schoolId && p.status === 'PAYE')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return res.json({
    success: true,
    school,
    stats: {
      studentCount,
      teacherCount,
      classCount,
      totalRevenue
    }
  });
};

export const updateSchoolProfile = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { name, address, phone, manager_name } = req.body;
  const database = db.getDb();

  const school = database.schools.find((s) => s.id === schoolId);
  if (!school) {
    return res.status(404).json({ success: false, message: 'Établissement introuvable.' });
  }

  if (name) school.name = name.trim();
  if (address) school.address = address.trim();
  if (phone) school.phone = phone.trim();
  if (manager_name) school.manager_name = manager_name.trim();
  school.updated_at = new Date().toISOString();

  db.persist();

  return res.json({
    success: true,
    message: 'Informations de l\'établissement mises à jour.',
    school
  });
};

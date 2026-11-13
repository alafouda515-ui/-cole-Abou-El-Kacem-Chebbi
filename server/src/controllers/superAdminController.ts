import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { db } from '../models/dbAdapter';

export const getSchools = (req: AuthenticatedRequest, res: Response) => {
  const database = db.getDb();
  const { status, search } = req.query;

  let result = database.schools.map((school) => {
    const studentCount = database.students.filter(
      (s) => s.school_id === school.id && s.status === 'ACTIF'
    ).length;
    const teacherCount = database.users.filter(
      (u) => u.school_id === school.id && u.role === 'TEACHER' && u.is_active
    ).length;
    const classCount = database.classes.filter(
      (c) => c.school_id === school.id
    ).length;
    const adminUser = database.users.find(
      (u) => u.school_id === school.id && u.role === 'SCHOOL_ADMIN'
    );

    return {
      ...school,
      studentCount,
      teacherCount,
      classCount,
      adminEmail: adminUser?.email || school.email,
      adminName: adminUser ? `${adminUser.first_name} ${adminUser.last_name}` : school.manager_name
    };
  });

  if (status && status !== 'ALL') {
    result = result.filter((s) => s.status === status);
  }

  if (search) {
    const query = (search as string).toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.manager_name.toLowerCase().includes(query)
    );
  }

  return res.json({
    success: true,
    count: result.length,
    schools: result
  });
};

export const updateSchoolStatus = (req: AuthenticatedRequest, res: Response) => {
  const { schoolId } = req.params;
  const { status } = req.body;

  if (!['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Statut invalide. Doit être PENDING, ACTIVE, SUSPENDED ou REJECTED.'
    });
  }

  const database = db.getDb();
  const schoolIndex = database.schools.findIndex((s) => s.id === schoolId);

  if (schoolIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Établissement non trouvé.'
    });
  }

  database.schools[schoolIndex].status = status;
  database.schools[schoolIndex].updated_at = new Date().toISOString();

  // If active, ensure school admin is active too
  if (status === 'ACTIVE') {
    database.users
      .filter((u) => u.school_id === schoolId && u.role === 'SCHOOL_ADMIN')
      .forEach((u) => {
        u.is_active = true;
      });
  }

  // Audit log
  database.audit_logs.push({
    id: 'log_' + Date.now(),
    school_id: schoolId,
    timestamp: new Date().toISOString(),
    user_id: req.user?.id || 'usr_superadmin',
    user_name: `${req.user?.first_name} ${req.user?.last_name}`,
    user_role: 'SUPER_ADMIN',
    action: 'MODIFICATION_STATUT_ECOLE',
    entity: 'School',
    entity_id: schoolId,
    details: `Statut de l'école "${database.schools[schoolIndex].name}" modifié en ${status}.`
  });

  db.persist();

  return res.json({
    success: true,
    message: `Le statut de l'école a été mis à jour avec succès : ${status}.`,
    school: database.schools[schoolIndex]
  });
};

export const deleteSchool = (req: AuthenticatedRequest, res: Response) => {
  const { schoolId } = req.params;
  const database = db.getDb();

  const school = database.schools.find((s) => s.id === schoolId);
  if (!school) {
    return res.status(404).json({
      success: false,
      message: 'Établissement non trouvé.'
    });
  }

  // Cascade delete all records belonging to this school
  database.schools = database.schools.filter((s) => s.id !== schoolId);
  database.users = database.users.filter((u) => u.school_id !== schoolId);
  database.classes = database.classes.filter((c) => c.school_id !== schoolId);
  database.subjects = database.subjects.filter((sub) => sub.school_id !== schoolId);
  database.rooms = database.rooms.filter((r) => r.school_id !== schoolId);
  database.students = database.students.filter((st) => st.school_id !== schoolId);
  database.schedule_slots = database.schedule_slots.filter((sc) => sc.school_id !== schoolId);
  database.grades = database.grades.filter((g) => g.school_id !== schoolId);
  database.absences = database.absences.filter((a) => a.school_id !== schoolId);
  database.fee_plans = database.fee_plans.filter((f) => f.school_id !== schoolId);
  database.payments = database.payments.filter((p) => p.school_id !== schoolId);
  database.homeworks = database.homeworks.filter((h) => h.school_id !== schoolId);
  database.homework_submissions = database.homework_submissions.filter((hs) => hs.school_id !== schoolId);
  database.messages = database.messages.filter((m) => m.school_id !== schoolId);
  database.announcements = database.announcements.filter((ann) => ann.school_id !== schoolId);

  database.audit_logs.push({
    id: 'log_' + Date.now(),
    school_id: null,
    timestamp: new Date().toISOString(),
    user_id: req.user?.id || 'usr_superadmin',
    user_name: `${req.user?.first_name} ${req.user?.last_name}`,
    user_role: 'SUPER_ADMIN',
    action: 'SUPPRESSION_ECOLE',
    entity: 'School',
    entity_id: schoolId,
    details: `Suppression définitive de l'école "${school.name}" et de toutes ses données associées.`
  });

  db.persist();

  return res.json({
    success: true,
    message: `L'établissement "${school.name}" et l'ensemble de ses données ont été supprimés.`
  });
};

export const getGlobalStats = (req: AuthenticatedRequest, res: Response) => {
  const database = db.getDb();

  const totalSchools = database.schools.length;
  const activeSchools = database.schools.filter((s) => s.status === 'ACTIVE').length;
  const pendingSchools = database.schools.filter((s) => s.status === 'PENDING').length;
  const suspendedSchools = database.schools.filter((s) => s.status === 'SUSPENDED').length;

  const totalStudents = database.students.filter((s) => s.status === 'ACTIF').length;
  const totalTeachers = database.users.filter((u) => u.role === 'TEACHER').length;
  const totalClasses = database.classes.length;
  const totalPayments = database.payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return res.json({
    success: true,
    stats: {
      totalSchools,
      activeSchools,
      pendingSchools,
      suspendedSchools,
      totalStudents,
      totalTeachers,
      totalClasses,
      totalPayments
    }
  });
};

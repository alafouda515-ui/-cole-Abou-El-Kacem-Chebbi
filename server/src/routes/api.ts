import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';
import { enforceTenant } from '../middlewares/tenant';

import * as authCtrl from '../controllers/authController';
import * as superAdminCtrl from '../controllers/superAdminController';
import * as schoolCtrl from '../controllers/schoolController';
import * as studentCtrl from '../controllers/studentController';
import * as academicCtrl from '../controllers/academicController';
import * as scheduleCtrl from '../controllers/scheduleController';
import * as gradeCtrl from '../controllers/gradeController';
import * as financeCtrl from '../controllers/financeController';
import * as homeworkCtrl from '../controllers/homeworkController';
import * as messageCtrl from '../controllers/messageController';
import * as absenceCtrl from '../controllers/absenceController';

const router = Router();

// =================== AUTH ROUTES ===================
router.post('/auth/login', authCtrl.login);
router.post('/auth/register-school', authCtrl.registerSchool);
router.get('/auth/me', authenticateToken, authCtrl.getMe);

// =================== SUPER ADMIN ROUTES ===================
router.get(
  '/super-admin/schools',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  superAdminCtrl.getSchools
);
router.patch(
  '/super-admin/schools/:schoolId/status',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  superAdminCtrl.updateSchoolStatus
);
router.delete(
  '/super-admin/schools/:schoolId',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  superAdminCtrl.deleteSchool
);
router.get(
  '/super-admin/stats',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  superAdminCtrl.getGlobalStats
);

// =================== SCHOOL PROFILE ===================
router.get('/school/profile', authenticateToken, enforceTenant, schoolCtrl.getSchoolProfile);
router.put('/school/profile', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), schoolCtrl.updateSchoolProfile);

// =================== STUDENTS ===================
router.get('/students', authenticateToken, enforceTenant, studentCtrl.getStudents);
router.post('/students', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT']), studentCtrl.createStudent);
router.put('/students/:id', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT']), studentCtrl.updateStudent);
router.delete('/students/:id', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), studentCtrl.deleteStudent);

// =================== ACADEMICS (CLASSES, SUBJECTS, ROOMS, TEACHERS) ===================
router.get('/academics/classes', authenticateToken, enforceTenant, academicCtrl.getClasses);
router.post('/academics/classes', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), academicCtrl.createClass);
router.put('/academics/classes/:id', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), academicCtrl.updateClass);
router.delete('/academics/classes/:id', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), academicCtrl.deleteClass);

router.get('/academics/subjects', authenticateToken, enforceTenant, academicCtrl.getSubjects);
router.post('/academics/subjects', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), academicCtrl.createSubject);
router.delete('/academics/subjects/:id', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), academicCtrl.deleteSubject);

router.get('/academics/rooms', authenticateToken, enforceTenant, academicCtrl.getRooms);
router.post('/academics/rooms', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), academicCtrl.createRoom);
router.delete('/academics/rooms/:id', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), academicCtrl.deleteRoom);

router.get('/academics/teachers', authenticateToken, enforceTenant, academicCtrl.getTeachers);
router.post('/academics/teachers', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), academicCtrl.createTeacher);

// =================== SCHEDULE ===================
router.get('/schedule', authenticateToken, enforceTenant, scheduleCtrl.getSchedule);
router.post('/schedule', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), scheduleCtrl.createScheduleSlot);
router.delete('/schedule/:id', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), scheduleCtrl.deleteScheduleSlot);

// =================== GRADES & AVERAGES ===================
router.get('/grades', authenticateToken, enforceTenant, gradeCtrl.getGrades);
router.post('/grades', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']), gradeCtrl.createGrade);
router.delete('/grades/:id', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']), gradeCtrl.deleteGrade);
router.get('/grades/student/:studentId/averages', authenticateToken, enforceTenant, gradeCtrl.getStudentAverages);

// =================== ABSENCES ===================
router.get('/absences', authenticateToken, enforceTenant, absenceCtrl.getAbsences);
router.post('/absences', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']), absenceCtrl.createAbsence);
router.patch('/absences/:id/justify', authenticateToken, enforceTenant, absenceCtrl.justifyAbsence);
router.patch('/absences/:id/validate', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), absenceCtrl.validateAbsence);
router.delete('/absences/:id', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), absenceCtrl.deleteAbsence);

// =================== FINANCES ===================
router.get('/finances/payments', authenticateToken, enforceTenant, financeCtrl.getPayments);
router.post('/finances/payments', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT']), financeCtrl.recordPayment);
router.get('/finances/fee-plan', authenticateToken, enforceTenant, financeCtrl.getFeePlan);

// =================== HOMEWORK ===================
router.get('/homework', authenticateToken, enforceTenant, homeworkCtrl.getHomeworks);
router.post('/homework', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']), homeworkCtrl.createHomework);
router.post('/homework/:homeworkId/submit', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'STUDENT']), homeworkCtrl.submitHomework);
router.post('/homework/submissions/:submissionId/grade', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']), homeworkCtrl.gradeSubmission);
router.post('/homework/submissions/:submissionId/acknowledge', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'PARENT']), homeworkCtrl.acknowledgeByParent);

// =================== MESSAGING & AUDIT ===================
router.get('/messages', authenticateToken, enforceTenant, messageCtrl.getMessages);
router.post('/messages', authenticateToken, enforceTenant, messageCtrl.sendMessage);
router.patch('/messages/:id/hide', authenticateToken, enforceTenant, messageCtrl.hideMessage);

router.get('/announcements', authenticateToken, enforceTenant, messageCtrl.getAnnouncements);
router.post('/announcements', authenticateToken, enforceTenant, requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), messageCtrl.createAnnouncement);

router.get('/audit', authenticateToken, enforceTenant, messageCtrl.getAuditLogs);

export default router;

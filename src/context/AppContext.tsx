import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  School,
  Student,
  ClassRoom,
  Subject,
  Room,
  ScheduleSlot,
  Grade,
  Absence,
  PaymentFeePlan,
  Payment,
  Homework,
  HomeworkSubmission,
  Message,
  Announcement,
  AuditLog,
  NotificationLog,
  UserRole
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_ROOMS,
  INITIAL_STUDENTS,
  INITIAL_SCHEDULE,
  INITIAL_GRADES,
  INITIAL_ABSENCES,
  INITIAL_FEE_PLAN,
  INITIAL_PAYMENTS,
  INITIAL_HOMEWORK,
  INITIAL_SUBMISSIONS,
  INITIAL_MESSAGES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';
import {
  authService,
  schoolService,
  studentService,
  academicService,
  scheduleService,
  gradeService,
  absenceService,
  financeService,
  homeworkService,
  messageService
} from '../services/api';

interface ConflictCheckResult {
  hasConflict: boolean;
  message?: string;
}

interface AppContextType {
  // Session & Multi-Tenant School
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentSchool: School | null;
  setCurrentSchool: (school: School | null) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  availableYears: string[];
  
  // Data Collections
  users: User[];
  classes: ClassRoom[];
  subjects: Subject[];
  rooms: Room[];
  students: Student[];
  schedule: ScheduleSlot[];
  grades: Grade[];
  absences: Absence[];
  feePlan: PaymentFeePlan;
  payments: Payment[];
  homeworks: Homework[];
  submissions: HomeworkSubmission[];
  messages: Message[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  notifications: NotificationLog[];

  // Data Loading
  reloadSchoolData: () => Promise<void>;
  isLoadingData: boolean;

  // CRUD Students
  addStudent: (student: Omit<Student, 'id' | 'matricule'>) => Student;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => { success: boolean; message: string };
  validatePreRegistration: (id: string, classId: string) => void;

  // CRUD Classes
  addClass: (cls: Omit<ClassRoom, 'id'>) => ClassRoom;
  updateClass: (cls: ClassRoom) => void;
  deleteClass: (id: string) => { success: boolean; message: string };

  // CRUD Subjects
  addSubject: (sub: Omit<Subject, 'id'>) => Subject;
  updateSubject: (sub: Subject) => void;
  deleteSubject: (id: string) => { success: boolean; message: string };

  // CRUD Rooms
  addRoom: (rm: Omit<Room, 'id'>) => Room;
  updateRoom: (rm: Room) => void;
  deleteRoom: (id: string) => { success: boolean; message: string };

  // Schedule & Conflict Detection
  checkScheduleConflict: (slot: Omit<ScheduleSlot, 'id'>, ignoreSlotId?: string) => ConflictCheckResult;
  addScheduleSlot: (slot: Omit<ScheduleSlot, 'id'>) => { success: boolean; error?: string };
  updateScheduleSlot: (slot: ScheduleSlot) => { success: boolean; error?: string };
  deleteScheduleSlot: (id: string) => void;

  // Grades & Calculations
  addGrade: (grd: Omit<Grade, 'id'>) => void;
  updateGrade: (grd: Grade) => void;
  deleteGrade: (id: string) => void;
  calculateStudentAverages: (studentId: string, term: 'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3') => {
    subjectAverages: { subject: Subject; avg: number; count: number }[];
    generalAverage: number;
    totalCoefficients: number;
  };

  // Absences
  addAbsence: (abs: Omit<Absence, 'id'>) => void;
  justifyAbsence: (id: string, reason: string) => void;
  validateAbsence: (id: string, justified: boolean) => void;
  deleteAbsence: (id: string) => void;

  // Finance & Automated Notifications
  recordPayment: (payment: Omit<Payment, 'id' | 'receiptNumber' | 'pdfGenerated'>) => Payment;
  updatePayment: (pay: Payment) => void;
  deletePayment: (id: string) => void;
  getStudentFinancialBalance: (studentId: string) => {
    totalDue: number;
    totalPaid: number;
    remaining: number;
    status: 'A_JOUR' | 'PARTIEL' | 'EN_RETARD';
  };

  // Homework
  addHomework: (hw: Omit<Homework, 'id'>) => Homework;
  updateHomework: (hw: Homework) => void;
  deleteHomework: (id: string) => { success: boolean; message: string };
  submitHomework: (submission: Omit<HomeworkSubmission, 'id' | 'submittedAt' | 'isLate' | 'parentAcknowledged'>) => void;
  gradeSubmission: (id: string, score: number, feedback: string) => void;
  acknowledgeHomeworkByParent: (submissionId: string) => void;
  publishCorrection: (homeworkId: string, correctionFileName: string) => void;

  // Messaging & Announcements
  sendMessage: (msg: {
    recipientId: string;
    subject: string;
    body: string;
    studentId?: string;
    isDraft?: boolean;
    attachments?: string[];
  }) => { success: boolean; error?: string };
  deleteDraft: (id: string) => void;
  hideMessageForRecipient: (id: string) => void;
  publishAnnouncement: (ann: Omit<Announcement, 'id' | 'publishedAt' | 'authorName'>) => void;
  publishCorrectiveAnnouncement: (originalId: string, newTitle: string, newContent: string) => void;
  logConversationAccess: (conversationInfo: string) => void;

  // Reset
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [academicYear, setAcademicYear] = useState<string>('2025-2026');
  const availableYears = ['2024-2025', '2025-2026', '2026-2027'];
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Active School state
  const [currentSchool, setCurrentSchool] = useState<School | null>(() => {
    const saved = localStorage.getItem('edusaas_school');
    return saved
      ? JSON.parse(saved)
      : {
          id: 'sch_chebbi_001',
          name: 'École Primaire Abou El Kacem Chebbi',
          slug: 'ecole-chebbi',
          address: 'Avenue Habib Bourguiba, Sousse, Tunisie',
          email: 'direction@ecole-chebbi.tn',
          phone: '+216 73 224 800',
          manager_name: 'Dr. Hamdi Hassen',
          status: 'ACTIVE'
        };
  });

  // Current User (Defaults to stored auth or Dr. Hamdi Hassen)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('edusaas_user');
    if (saved) {
      const u = JSON.parse(saved);
      // Map role to match format
      const normalizedRole: UserRole =
        u.role === 'SCHOOL_ADMIN' ? 'ADMIN' : (u.role as UserRole);
      return {
        id: u.id,
        name: u.first_name ? `${u.first_name} ${u.last_name}` : u.name || 'Utilisateur',
        email: u.email,
        role: normalizedRole,
        avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        phone: u.phone,
        schoolId: u.school_id,
        linkedStudentId: u.linked_student_id
      };
    }
    return INITIAL_USERS[0];
  });

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [classes, setClasses] = useState<ClassRoom[]>(INITIAL_CLASSES);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(INITIAL_SCHEDULE);
  const [grades, setGrades] = useState<Grade[]>(INITIAL_GRADES);
  const [absences, setAbsences] = useState<Absence[]>(INITIAL_ABSENCES);
  const [feePlan] = useState<PaymentFeePlan>(INITIAL_FEE_PLAN);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [homeworks, setHomeworks] = useState<Homework[]>(INITIAL_HOMEWORK);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>(INITIAL_SUBMISSIONS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationLog[]>(INITIAL_NOTIFICATIONS);

  // Fetch school data from REST API backend
  const reloadSchoolData = async () => {
    const token = localStorage.getItem('edusaas_token');
    if (!token) return;

    try {
      setIsLoadingData(true);
      const [
        studentsRes,
        classesRes,
        subjectsRes,
        roomsRes,
        scheduleRes,
        gradesRes,
        absencesRes,
        paymentsRes,
        homeworkRes,
        messagesRes,
        annRes,
        auditRes
      ] = await Promise.allSettled([
        studentService.getStudents(),
        academicService.getClasses(),
        academicService.getSubjects(),
        academicService.getRooms(),
        scheduleService.getSchedule(),
        gradeService.getGrades(),
        absenceService.getAbsences(),
        financeService.getPayments(),
        homeworkService.getHomeworks(),
        messageService.getMessages(),
        messageService.getAnnouncements(),
        messageService.getAuditLogs()
      ]);

      if (studentsRes.status === 'fulfilled' && studentsRes.value?.students) {
        setStudents(studentsRes.value.students);
      }
      if (classesRes.status === 'fulfilled' && classesRes.value?.classes) {
        setClasses(classesRes.value.classes);
      }
      if (subjectsRes.status === 'fulfilled' && subjectsRes.value?.subjects) {
        setSubjects(subjectsRes.value.subjects);
      }
      if (roomsRes.status === 'fulfilled' && roomsRes.value?.rooms) {
        setRooms(roomsRes.value.rooms);
      }
      if (scheduleRes.status === 'fulfilled' && scheduleRes.value?.slots) {
        setSchedule(scheduleRes.value.slots);
      }
      if (gradesRes.status === 'fulfilled' && gradesRes.value?.grades) {
        setGrades(gradesRes.value.grades);
      }
      if (absencesRes.status === 'fulfilled' && absencesRes.value?.absences) {
        setAbsences(absencesRes.value.absences);
      }
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.payments) {
        setPayments(paymentsRes.value.payments);
      }
      if (homeworkRes.status === 'fulfilled' && homeworkRes.value?.homeworks) {
        setHomeworks(homeworkRes.value.homeworks);
      }
      if (messagesRes.status === 'fulfilled' && messagesRes.value?.messages) {
        setMessages(messagesRes.value.messages);
      }
      if (annRes.status === 'fulfilled' && annRes.value?.announcements) {
        setAnnouncements(annRes.value.announcements);
      }
      if (auditRes.status === 'fulfilled' && auditRes.value?.auditLogs) {
        setAuditLogs(auditRes.value.auditLogs);
      }
    } catch (err) {
      console.warn('Erreur chargement backend API:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Initial load on mount or when token changes
  useEffect(() => {
    reloadSchoolData();
  }, [currentSchool?.id]);

  const logout = () => {
    authService.logout();
    setCurrentSchool(null);
  };

  // Audit Logger Helper
  const logAudit = (
    action: AuditLog['action'],
    entity: string,
    entityId: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entity,
      entityId,
      details
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Switch role with pre-configured users
  const switchRole = (role: UserRole) => {
    const userFound = users.find((u) => u.role === role);
    if (userFound) {
      setCurrentUser(userFound);
    } else {
      // Fallback update current role
      setCurrentUser((prev) => ({ ...prev, role }));
    }
  };

  // ----------------------------------------------------
  // CRUD STUDENTS
  // ----------------------------------------------------
  const addStudent = (stData: Omit<Student, 'id' | 'matricule'>) => {
    const newId = 'stu-' + Date.now();
    const matricule = `MAT-${academicYear.split('-')[0]}-${String(students.length + 1).padStart(3, '0')}`;
    const newStudent: Student = {
      ...stData,
      id: newId,
      matricule
    };
    setStudents((prev) => [newStudent, ...prev]);

    // Async sync with REST API
    studentService.createStudent({
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      birthDate: newStudent.birthDate,
      gender: newStudent.gender,
      classId: newStudent.classId,
      parentName: newStudent.parentName,
      parentEmail: newStudent.parentEmail,
      parentPhone: newStudent.parentPhone,
      address: newStudent.address,
      medicalNotes: newStudent.medicalNotes,
      academicYear: newStudent.academicYear
    }).catch((err) => console.warn('API error createStudent:', err));

    logAudit('CREATION', 'Student', newId, `Inscription élève: ${newStudent.firstName} ${newStudent.lastName} (${matricule})`);
    return newStudent;
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    studentService.updateStudent(updatedStudent.id, updatedStudent).catch((err) =>
      console.warn('API error updateStudent:', err)
    );
    logAudit('MODIFICATION', 'Student', updatedStudent.id, `Mise à jour dossier de l'élève ${updatedStudent.firstName} ${updatedStudent.lastName}`);
  };

  const deleteStudent = (id: string): { success: boolean; message: string } => {
    const student = students.find((s) => s.id === id);
    if (!student) return { success: false, message: 'Élève non trouvé' };

    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'RADIE' } : s)));
    studentService.deleteStudent(id).catch((err) => console.warn('API error deleteStudent:', err));

    logAudit('SUPPRESSION', 'Student', id, `Radiation (suppression logique) de l'élève ${student.firstName} ${student.lastName}`);
    return { success: true, message: `L'élève ${student.firstName} ${student.lastName} a été radié et son historique archivé.` };
  };

  const validatePreRegistration = (id: string, classId: string) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;

    const matricule = `MAT-${academicYear.split('-')[0]}-${String(students.length + 1).padStart(3, '0')}`;
    const updated: Student = {
      ...student,
      matricule,
      classId,
      status: 'ACTIF'
    };
    updateStudent(updated);
    logAudit('MODIFICATION', 'Student', id, `Validation de la pré-inscription de ${student.firstName} ${student.lastName} affecté en classe.`);
  };

  // ----------------------------------------------------
  // CRUD CLASSES
  // ----------------------------------------------------
  const addClass = (clsData: Omit<ClassRoom, 'id'>) => {
    const newId = 'cls-' + Date.now();
    const newCls: ClassRoom = { ...clsData, id: newId };
    setClasses((prev) => [...prev, newCls]);

    academicService.createClass(newCls).catch((err) =>
      console.warn('API error createClass:', err)
    );

    logAudit('CREATION', 'ClassRoom', newId, `Création classe: ${newCls.name} (${newCls.academicYear})`);
    return newCls;
  };

  const updateClass = (updated: ClassRoom) => {
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    logAudit('MODIFICATION', 'ClassRoom', updated.id, `Modification classe ${updated.name}`);
  };

  const deleteClass = (id: string): { success: boolean; message: string } => {
    const studentsInClass = students.filter((s) => s.classId === id && s.status === 'ACTIF');
    if (studentsInClass.length > 0) {
      return {
        success: false,
        message: `Suppression impossible : cette classe contient ${studentsInClass.length} élève(s) actif(s). Veuillez d'abord réaffecter les élèves.`
      };
    }
    const cls = classes.find((c) => c.id === id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
    academicService.deleteClass(id).catch((err) => console.warn('API error deleteClass:', err));

    logAudit('SUPPRESSION', 'ClassRoom', id, `Suppression classe ${cls?.name || id}`);
    return { success: true, message: 'Classe supprimée avec succès.' };
  };

  // ----------------------------------------------------
  // CRUD SUBJECTS
  // ----------------------------------------------------
  const addSubject = (subData: Omit<Subject, 'id'>) => {
    const newId = 'sub-' + Date.now();
    const newSub: Subject = { ...subData, id: newId };
    setSubjects((prev) => [...prev, newSub]);

    academicService.createSubject(newSub).catch((err) =>
      console.warn('API error createSubject:', err)
    );

    logAudit('CREATION', 'Subject', newId, `Ajout matière ${newSub.name} (coeff ${newSub.coefficient})`);
    return newSub;
  };

  const updateSubject = (updated: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    logAudit('MODIFICATION', 'Subject', updated.id, `Mise à jour matière ${updated.name}`);
  };

  const deleteSubject = (id: string): { success: boolean; message: string } => {
    const gradesLinked = grades.filter((g) => g.subjectId === id);
    if (gradesLinked.length > 0) {
      return {
        success: false,
        message: `Suppression refusée : ${gradesLinked.length} note(s) sont déjà enregistrées pour cette matière.`
      };
    }
    const sub = subjects.find((s) => s.id === id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    academicService.deleteSubject(id).catch((err) => console.warn('API error deleteSubject:', err));

    logAudit('SUPPRESSION', 'Subject', id, `Suppression matière ${sub?.name || id}`);
    return { success: true, message: 'Matière supprimée avec succès.' };
  };

  // ----------------------------------------------------
  // CRUD ROOMS
  // ----------------------------------------------------
  const addRoom = (rmData: Omit<Room, 'id'>) => {
    const newId = 'rm-' + Date.now();
    const newRm: Room = { ...rmData, id: newId };
    setRooms((prev) => [...prev, newRm]);

    academicService.createRoom(newRm).catch((err) =>
      console.warn('API error createRoom:', err)
    );

    logAudit('CREATION', 'Room', newId, `Ajout salle ${newRm.name} (capacité ${newRm.capacity})`);
    return newRm;
  };

  const updateRoom = (updated: Room) => {
    setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    logAudit('MODIFICATION', 'Room', updated.id, `Mise à jour salle ${updated.name}`);
  };

  const deleteRoom = (id: string): { success: boolean; message: string } => {
    const slotsUsing = schedule.filter((s) => s.roomId === id);
    if (slotsUsing.length > 0) {
      return {
        success: false,
        message: `Suppression impossible : cette salle est affectée à ${slotsUsing.length} cours dans l'emploi du temps.`
      };
    }
    const rm = rooms.find((r) => r.id === id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
    academicService.deleteRoom(id).catch((err) => console.warn('API error deleteRoom:', err));

    logAudit('SUPPRESSION', 'Room', id, `Suppression salle ${rm?.name || id}`);
    return { success: true, message: 'Salle supprimée avec succès.' };
  };

  // ----------------------------------------------------
  // SCHEDULE & CONFLICT DETECTION
  // ----------------------------------------------------
  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const checkScheduleConflict = (
    newSlot: Omit<ScheduleSlot, 'id'>,
    ignoreSlotId?: string
  ): ConflictCheckResult => {
    const newStart = timeToMinutes(newSlot.startTime);
    const newEnd = timeToMinutes(newSlot.endTime);

    if (newStart >= newEnd) {
      return { hasConflict: true, message: "L'heure de début doit être antérieure à l'heure de fin." };
    }

    for (const existing of schedule) {
      if (existing.id === ignoreSlotId) continue;
      if (existing.academicYear !== newSlot.academicYear) continue;
      if (existing.dayOfWeek !== newSlot.dayOfWeek) continue;

      const exStart = timeToMinutes(existing.startTime);
      const exEnd = timeToMinutes(existing.endTime);

      const overlaps = Math.max(newStart, exStart) < Math.min(newEnd, exEnd);

      if (overlaps) {
        if (existing.teacherId === newSlot.teacherId) {
          const teacher = users.find((u) => u.id === newSlot.teacherId);
          return {
            hasConflict: true,
            message: `Conflit d'enseignant : ${teacher?.name || "Cet enseignant"} est déjà en cours sur ce créneau (${existing.dayOfWeek} ${existing.startTime}-${existing.endTime}).`
          };
        }
        if (existing.roomId === newSlot.roomId) {
          const room = rooms.find((r) => r.id === newSlot.roomId);
          return {
            hasConflict: true,
            message: `Conflit de salle : La ${room?.name || "salle"} est déjà occupée sur ce créneau (${existing.dayOfWeek} ${existing.startTime}-${existing.endTime}).`
          };
        }
        if (existing.classId === newSlot.classId) {
          const cls = classes.find((c) => c.id === newSlot.classId);
          return {
            hasConflict: true,
            message: `Conflit de classe : La classe ${cls?.name || ""} a déjà un cours programmé (${existing.dayOfWeek} ${existing.startTime}-${existing.endTime}).`
          };
        }
      }
    }

    return { hasConflict: false };
  };

  const addScheduleSlot = (slotData: Omit<ScheduleSlot, 'id'>) => {
    const check = checkScheduleConflict(slotData);
    if (check.hasConflict) {
      return { success: false, error: check.message };
    }
    const newId = 'slot-' + Date.now();
    const newSlot: ScheduleSlot = { ...slotData, id: newId };
    setSchedule((prev) => [...prev, newSlot]);

    scheduleService.createSlot(newSlot).catch((err) =>
      console.warn('API error createSlot:', err)
    );

    logAudit('CREATION', 'ScheduleSlot', newId, `Créneau programmé : ${newSlot.dayOfWeek} ${newSlot.startTime}-${newSlot.endTime}`);
    return { success: true };
  };

  const updateScheduleSlot = (slot: ScheduleSlot) => {
    const check = checkScheduleConflict(slot, slot.id);
    if (check.hasConflict) {
      return { success: false, error: check.message };
    }
    setSchedule((prev) => prev.map((s) => (s.id === slot.id ? slot : s)));
    logAudit('MODIFICATION', 'ScheduleSlot', slot.id, `Mise à jour créneau ${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`);
    return { success: true };
  };

  const deleteScheduleSlot = (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
    scheduleService.deleteSlot(id).catch((err) => console.warn('API error deleteSlot:', err));
    logAudit('SUPPRESSION', 'ScheduleSlot', id, `Suppression d'un créneau d'emploi du temps`);
  };

  // ----------------------------------------------------
  // GRADES & AVERAGES CALCULATION
  // ----------------------------------------------------
  const addGrade = (grdData: Omit<Grade, 'id'>) => {
    const newId = 'grd-' + Date.now();
    const newGrade: Grade = { ...grdData, id: newId };
    setGrades((prev) => [...prev, newGrade]);

    gradeService.createGrade(newGrade).catch((err) =>
      console.warn('API error createGrade:', err)
    );

    logAudit('CREATION', 'Grade', newId, `Attribution note: ${newGrade.score}/20 (coeff ${newGrade.coefficient})`);
  };

  const updateGrade = (updated: Grade) => {
    setGrades((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    logAudit('MODIFICATION', 'Grade', updated.id, `Modification de la note de l'élève à ${updated.score}/20`);
  };

  const deleteGrade = (id: string) => {
    setGrades((prev) => prev.filter((g) => g.id !== id));
    gradeService.deleteGrade(id).catch((err) => console.warn('API error deleteGrade:', err));
    logAudit('SUPPRESSION', 'Grade', id, `Suppression d'une note d'évaluation`);
  };

  const calculateStudentAverages = (studentId: string, term: 'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3') => {
    const studentGrades = grades.filter(
      (g) => g.studentId === studentId && g.term === term && g.academicYear === academicYear
    );

    const subjectMap: Record<string, { totalWeighted: number; totalCoeff: number; count: number }> = {};

    studentGrades.forEach((g) => {
      if (!subjectMap[g.subjectId]) {
        subjectMap[g.subjectId] = { totalWeighted: 0, totalCoeff: 0, count: 0 };
      }
      subjectMap[g.subjectId].totalWeighted += g.score * g.coefficient;
      subjectMap[g.subjectId].totalCoeff += g.coefficient;
      subjectMap[g.subjectId].count += 1;
    });

    const subjectAverages = subjects.map((sub) => {
      const data = subjectMap[sub.id];
      const avg = data && data.totalCoeff > 0 ? Number((data.totalWeighted / data.totalCoeff).toFixed(2)) : 0;
      return {
        subject: sub,
        avg,
        count: data ? data.count : 0
      };
    }).filter((item) => item.count > 0);

    let sumWeightedAverages = 0;
    let sumCoefficients = 0;

    subjectAverages.forEach((item) => {
      sumWeightedAverages += item.avg * item.subject.coefficient;
      sumCoefficients += item.subject.coefficient;
    });

    const generalAverage = sumCoefficients > 0 ? Number((sumWeightedAverages / sumCoefficients).toFixed(2)) : 0;

    return {
      subjectAverages,
      generalAverage,
      totalCoefficients: sumCoefficients
    };
  };

  // ----------------------------------------------------
  // ABSENCES
  // ----------------------------------------------------
  const addAbsence = (absData: Omit<Absence, 'id'>) => {
    const newId = 'abs-' + Date.now();
    const newAbs: Absence = { ...absData, id: newId };
    setAbsences((prev) => [newAbs, ...prev]);

    absenceService.createAbsence(newAbs).catch((err) =>
      console.warn('API error createAbsence:', err)
    );

    logAudit('CREATION', 'Absence', newId, `Enregistrement absence (${newAbs.durationHours}h le ${newAbs.date})`);
  };

  const justifyAbsence = (id: string, reason: string) => {
    setAbsences((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              justificationReason: reason,
              justifiedByParentDate: new Date().toISOString(),
              status: 'EN_ATTENTE_VALIDATION'
            }
          : a
      )
    );
    absenceService.justifyAbsence(id, reason).catch((err) =>
      console.warn('API error justifyAbsence:', err)
    );
    logAudit('MODIFICATION', 'Absence', id, `Dépôt de justification par le parent: ${reason}`);
  };

  const validateAbsence = (id: string, justified: boolean) => {
    setAbsences((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              isJustified: justified,
              status: justified ? 'JUSTIFIEE' : 'NON_JUSTIFIEE'
            }
          : a
      )
    );
    absenceService.validateAbsence(id, justified).catch((err) =>
      console.warn('API error validateAbsence:', err)
    );
    logAudit('MODIFICATION', 'Absence', id, `Validation administrative de l'absence: ${justified ? 'Justifiée' : 'Rejetée'}`);
  };

  const deleteAbsence = (id: string) => {
    setAbsences((prev) => prev.filter((a) => a.id !== id));
    absenceService.deleteAbsence(id).catch((err) =>
      console.warn('API error deleteAbsence:', err)
    );
    logAudit('SUPPRESSION', 'Absence', id, `Suppression fiche d'absence`);
  };

  // ----------------------------------------------------
  // FINANCES & AUTOMATED NOTIFICATIONS
  // ----------------------------------------------------
  const getStudentFinancialBalance = (studentId: string) => {
    const studentPayments = payments.filter(
      (p) => p.studentId === studentId && p.academicYear === academicYear && p.status === 'PAYE'
    );
    const totalPaid = studentPayments.reduce((acc, p) => acc + p.amount, 0);
    const totalDue = feePlan.totalAnnual;
    const remaining = Math.max(0, totalDue - totalPaid);

    let status: 'A_JOUR' | 'PARTIEL' | 'EN_RETARD' = 'EN_RETARD';
    if (remaining === 0) status = 'A_JOUR';
    else if (totalPaid > 0) status = 'PARTIEL';

    return { totalDue, totalPaid, remaining, status };
  };

  const recordPayment = (
    paymentData: Omit<Payment, 'id' | 'receiptNumber' | 'pdfGenerated'>
  ): Payment => {
    const newId = 'pay-' + Date.now();
    const receiptNumber = `REC-${paymentData.academicYear.split('-')[0]}-${String(payments.length + 101).padStart(5, '0')}`;
    const newPayment: Payment = {
      ...paymentData,
      id: newId,
      receiptNumber,
      pdfGenerated: true
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Async sync with REST API
    financeService.recordPayment(newPayment).catch((err) =>
      console.warn('API error recordPayment:', err)
    );

    const student = students.find((s) => s.id === paymentData.studentId);
    const currentPaid = payments
      .filter((p) => p.studentId === paymentData.studentId && p.academicYear === paymentData.academicYear && p.status === 'PAYE')
      .reduce((sum, p) => sum + p.amount, 0) + paymentData.amount;
    const remainingBalance = Math.max(0, feePlan.totalAnnual - currentPaid);

    const parentUser = users.find((u) => u.role === 'PARENT' && u.linkedStudentId === paymentData.studentId);
    const parentRecipientId = parentUser ? parentUser.id : 'user-parent-1';
    const parentName = student ? student.parentName : 'Parent d\'élève';

    const autoMessage: Message = {
      id: 'msg-auto-' + Date.now(),
      senderId: currentUser.id,
      senderName: 'Secrétariat Financier',
      senderRole: 'ACCOUNTANT',
      recipientId: parentRecipientId,
      recipientName: parentName,
      recipientRole: 'PARENT',
      studentId: paymentData.studentId,
      subject: `Confirmation de règlement - Reçu N° ${receiptNumber}`,
      body: `Chers parents de ${student ? student.firstName + ' ' + student.lastName : 'l\'élève'},\n\nNous confirmons la bonne réception de votre paiement :\n• Montant versé : ${paymentData.amount.toLocaleString()} TND\n• Date : ${paymentData.paymentDate}\n• Mode de paiement : ${paymentData.paymentMethod}\n• Tranche : ${paymentData.tranche}\n• Nouveau solde restant dû : ${remainingBalance.toLocaleString()} TND\n\nLe reçu officiel N° ${receiptNumber} est téléchargeable et imprimable dans votre espace famille.`,
      sentAt: new Date().toISOString(),
      isDraft: false,
      downloadUrl: `#receipt-${receiptNumber}`
    };

    setMessages((prev) => [autoMessage, ...prev]);

    const notificationEntry: NotificationLog = {
      id: 'notif-' + Date.now(),
      date: new Date().toISOString(),
      recipientName: parentName,
      recipientContact: student ? `${student.parentEmail} / ${student.parentPhone}` : 'Parent d\'élève',
      type: 'PAIEMENT',
      channel: 'Messagerie Interne',
      status: 'ENVOYE',
      summary: `Paiement ${paymentData.amount} TND enregistré. Reçu ${receiptNumber} émis. Solde restant : ${remainingBalance} TND.`
    };
    setNotifications((prev) => [notificationEntry, ...prev]);

    logAudit(
      'NOTIFICATION_PAIEMENT',
      'Payment',
      newId,
      `Paiement ${paymentData.amount} TND enregistré (${receiptNumber}) pour ${student?.firstName} ${student?.lastName}. Notification et reçu générés.`
    );

    return newPayment;
  };

  const updatePayment = (updated: Payment) => {
    setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    logAudit('MODIFICATION', 'Payment', updated.id, `Mise à jour du paiement ${updated.receiptNumber}`);
  };

  const deletePayment = (id: string) => {
    const pay = payments.find((p) => p.id === id);
    setPayments((prev) => prev.filter((p) => p.id !== id));
    logAudit('SUPPRESSION', 'Payment', id, `Suppression / Annulation du paiement ${pay?.receiptNumber || id}`);
  };

  // ----------------------------------------------------
  // HOMEWORK
  // ----------------------------------------------------
  const addHomework = (hwData: Omit<Homework, 'id'>) => {
    const newId = 'hw-' + Date.now();
    const newHw: Homework = { ...hwData, id: newId };
    setHomeworks((prev) => [newHw, ...prev]);

    homeworkService.createHomework(newHw).catch((err) =>
      console.warn('API error createHomework:', err)
    );

    const cls = classes.find((c) => c.id === newHw.classId);
    const sub = subjects.find((s) => s.id === newHw.subjectId);
    const notif: NotificationLog = {
      id: 'notif-hw-' + Date.now(),
      date: new Date().toISOString(),
      recipientName: `Classe ${cls?.name || ''}`,
      recipientContact: `Tous les élèves et parents de ${cls?.name || ''}`,
      type: 'DEVOIR',
      channel: 'Push PWA',
      status: 'ENVOYE',
      summary: `Nouveau devoir en ${sub?.name || ''} : "${newHw.title}" (À rendre avant le ${newHw.dueDate}).`
    };
    setNotifications((prev) => [notif, ...prev]);

    logAudit('CREATION', 'Homework', newId, `Publication nouveau devoir "${newHw.title}" pour ${cls?.name || ''}`);
    return newHw;
  };

  const updateHomework = (updated: Homework) => {
    setHomeworks((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    logAudit('MODIFICATION', 'Homework', updated.id, `Mise à jour devoir "${updated.title}"`);
  };

  const deleteHomework = (id: string): { success: boolean; message: string } => {
    const existingSubs = submissions.filter((s) => s.homeworkId === id);
    if (existingSubs.length > 0) {
      return {
        success: false,
        message: `Suppression impossible : ${existingSubs.length} élève(s) ont déjà rendu leur travail pour ce devoir.`
      };
    }
    const hw = homeworks.find((h) => h.id === id);
    setHomeworks((prev) => prev.filter((h) => h.id !== id));
    logAudit('SUPPRESSION', 'Homework', id, `Suppression devoir "${hw?.title || id}"`);
    return { success: true, message: 'Devoir supprimé avec succès.' };
  };

  const submitHomework = (
    subData: Omit<HomeworkSubmission, 'id' | 'submittedAt' | 'isLate' | 'parentAcknowledged'>
  ) => {
    const hw = homeworks.find((h) => h.id === subData.homeworkId);
    const now = new Date();
    const dueDate = hw ? new Date(hw.dueDate + 'T23:59:59') : now;
    const isLate = now.getTime() > dueDate.getTime();

    const existingIndex = submissions.findIndex(
      (s) => s.homeworkId === subData.homeworkId && s.studentId === subData.studentId
    );

    const submissionRecord: HomeworkSubmission = {
      ...subData,
      id: existingIndex >= 0 ? submissions[existingIndex].id : 'sub-' + Date.now(),
      submittedAt: now.toISOString(),
      isLate,
      parentAcknowledged: false
    };

    if (existingIndex >= 0) {
      setSubmissions((prev) => prev.map((s, idx) => (idx === existingIndex ? submissionRecord : s)));
      logAudit('MODIFICATION', 'HomeworkSubmission', submissionRecord.id, `Remplacement du devoir déposé par l'élève.`);
    } else {
      setSubmissions((prev) => [submissionRecord, ...prev]);
      logAudit('CREATION', 'HomeworkSubmission', submissionRecord.id, `Dépôt de devoir par l'élève.`);
    }

    homeworkService.submitHomework(subData.homeworkId, submissionRecord).catch((err) =>
      console.warn('API error submitHomework:', err)
    );

    if (hw) {
      const teacher = users.find((u) => u.id === hw.teacherId);
      const student = students.find((s) => s.id === subData.studentId);
      const notif: NotificationLog = {
        id: 'notif-sub-' + Date.now(),
        date: now.toISOString(),
        recipientName: teacher?.name || 'Enseignant',
        recipientContact: teacher?.email || '',
        type: 'DEVOIR',
        channel: 'Push PWA',
        status: 'ENVOYE',
        summary: `L'élève ${student?.firstName} ${student?.lastName} a déposé son travail pour "${hw.title}".`
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const gradeSubmission = (id: string, score: number, feedback: string) => {
    const now = new Date().toISOString();
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, score, teacherFeedback: feedback, gradedAt: now } : s))
    );

    homeworkService.gradeSubmission(id, score, feedback).catch((err) =>
      console.warn('API error gradeSubmission:', err)
    );

    const sub = submissions.find((s) => s.id === id);
    if (sub) {
      const student = students.find((st) => st.id === sub.studentId);
      const hw = homeworks.find((h) => h.id === sub.homeworkId);
      const notif: NotificationLog = {
        id: 'notif-grade-' + Date.now(),
        date: now,
        recipientName: `${student?.firstName} ${student?.lastName} & Parents`,
        recipientContact: student?.parentEmail || '',
        type: 'NOTE',
        channel: 'Push PWA',
        status: 'ENVOYE',
        summary: `Note attribuée pour le devoir "${hw?.title || ''}" : ${score}/${hw?.maxScore || 20}.`
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    logAudit('MODIFICATION', 'HomeworkSubmission', id, `Notation devoir : ${score}/20 attribuée`);
  };

  const acknowledgeHomeworkByParent = (submissionId: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? { ...s, parentAcknowledged: true, parentAcknowledgedAt: new Date().toISOString() }
          : s
      )
    );
    homeworkService.acknowledgeByParent(submissionId).catch((err) =>
      console.warn('API error acknowledgeByParent:', err)
    );
    logAudit('MODIFICATION', 'HomeworkSubmission', submissionId, `Marquage "Vu par le parent" effectué.`);
  };

  const publishCorrection = (homeworkId: string, correctionFileName: string) => {
    setHomeworks((prev) =>
      prev.map((h) =>
        h.id === homeworkId ? { ...h, correctionFile: correctionFileName, correctionPublished: true } : h
      )
    );
    logAudit('MODIFICATION', 'Homework', homeworkId, `Publication du corrigé officiel type`);
  };

  // ----------------------------------------------------
  // MESSAGING & ANNOUNCEMENTS
  // ----------------------------------------------------
  const sendMessage = (msgData: {
    recipientId: string;
    subject: string;
    body: string;
    studentId?: string;
    isDraft?: boolean;
    attachments?: string[];
  }): { success: boolean; error?: string } => {
    const recipient = users.find((u) => u.id === msgData.recipientId);
    if (!recipient) return { success: false, error: 'Destinataire introuvable' };

    const senderRole = currentUser.role;
    const recipientRole = recipient.role;

    const allowed =
      senderRole === 'ADMIN' ||
      senderRole === 'SUPER_ADMIN' ||
      senderRole === 'SCHOOL_ADMIN' ||
      (senderRole === 'TEACHER' && recipientRole === 'PARENT') ||
      (senderRole === 'PARENT' && (recipientRole === 'TEACHER' || recipientRole === 'ADMIN')) ||
      (senderRole === 'ACCOUNTANT' && recipientRole === 'PARENT') ||
      (senderRole === 'STUDENT' && recipientRole === 'ADMIN');

    if (!allowed && !msgData.isDraft) {
      return {
        success: false,
        error: `Règles RBAC : le rôle ${senderRole} n'est pas autorisé à initier un message direct vers ${recipientRole}.`
      };
    }

    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientRole: recipient.role,
      studentId: msgData.studentId,
      subject: msgData.subject,
      body: msgData.body,
      sentAt: msgData.isDraft ? undefined : new Date().toISOString(),
      isDraft: !!msgData.isDraft,
      attachments: msgData.attachments
    };

    setMessages((prev) => [newMsg, ...prev]);

    messageService.sendMessage(newMsg).catch((err) =>
      console.warn('API error sendMessage:', err)
    );

    if (!msgData.isDraft) {
      const notif: NotificationLog = {
        id: 'notif-msg-' + Date.now(),
        date: new Date().toISOString(),
        recipientName: recipient.name,
        recipientContact: recipient.email,
        type: 'MESSAGE',
        channel: 'Messagerie Interne',
        status: 'ENVOYE',
        summary: `Nouveau message de ${currentUser.name} : "${msgData.subject}"`
      };
      setNotifications((prev) => [notif, ...prev]);

      logAudit('CREATION', 'Message', newMsg.id, `Message scellé et envoyé à ${recipient.name} : "${msgData.subject}"`);
    }

    return { success: true };
  };

  const deleteDraft = (id: string) => {
    const msg = messages.find((m) => m.id === id);
    if (msg && msg.isDraft) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      logAudit('SUPPRESSION', 'Message', id, `Brouillon supprimé.`);
    }
  };

  const hideMessageForRecipient = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, hiddenByRecipient: true } : m))
    );
    messageService.hideMessage(id).catch((err) => console.warn('API error hideMessage:', err));
  };

  const publishAnnouncement = (annData: Omit<Announcement, 'id' | 'publishedAt' | 'authorName'>) => {
    const newId = 'ann-' + Date.now();
    const newAnn: Announcement = {
      ...annData,
      id: newId,
      publishedAt: new Date().toISOString(),
      authorName: currentUser.name
    };
    setAnnouncements((prev) => [newAnn, ...prev]);

    messageService.createAnnouncement(newAnn).catch((err) =>
      console.warn('API error createAnnouncement:', err)
    );

    logAudit('CREATION', 'Announcement', newId, `Publication annonce officielle : "${newAnn.title}" (Cible: ${newAnn.targetRole})`);
  };

  const publishCorrectiveAnnouncement = (originalId: string, newTitle: string, newContent: string) => {
    const original = announcements.find((a) => a.id === originalId);
    if (!original) return;

    const newId = 'ann-corr-' + Date.now();
    const corrAnn: Announcement = {
      id: newId,
      title: `[RECTIFICATIF] ${newTitle}`,
      content: newContent,
      targetRole: original.targetRole,
      publishedAt: new Date().toISOString(),
      authorName: currentUser.name,
      isCorrective: true,
      correctedAnnouncementId: originalId
    };

    setAnnouncements((prev) => [corrAnn, ...prev]);
    logAudit('CREATION', 'Announcement', newId, `Publication d'une annonce corrective pour l'annonce ${originalId}`);
  };

  const logConversationAccess = (conversationInfo: string) => {
    logAudit('ACCES_HISTORIQUE', 'MessageConversation', 'conv', `Consultation de l'historique : ${conversationInfo}`);
  };

  const resetToDefaultData = () => {
    setClasses(INITIAL_CLASSES);
    setSubjects(INITIAL_SUBJECTS);
    setRooms(INITIAL_ROOMS);
    setStudents(INITIAL_STUDENTS);
    setSchedule(INITIAL_SCHEDULE);
    setGrades(INITIAL_GRADES);
    setAbsences(INITIAL_ABSENCES);
    setPayments(INITIAL_PAYMENTS);
    setHomeworks(INITIAL_HOMEWORK);
    setSubmissions(INITIAL_SUBMISSIONS);
    setMessages(INITIAL_MESSAGES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(INITIAL_USERS[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentSchool,
        setCurrentSchool,
        switchRole,
        logout,
        academicYear,
        setAcademicYear,
        availableYears,
        users,
        classes,
        subjects,
        rooms,
        students,
        schedule,
        grades,
        absences,
        feePlan,
        payments,
        homeworks,
        submissions,
        messages,
        announcements,
        auditLogs,
        notifications,
        reloadSchoolData,
        isLoadingData,
        addStudent,
        updateStudent,
        deleteStudent,
        validatePreRegistration,
        addClass,
        updateClass,
        deleteClass,
        addSubject,
        updateSubject,
        deleteSubject,
        addRoom,
        updateRoom,
        deleteRoom,
        checkScheduleConflict,
        addScheduleSlot,
        updateScheduleSlot,
        deleteScheduleSlot,
        addGrade,
        updateGrade,
        deleteGrade,
        calculateStudentAverages,
        addAbsence,
        justifyAbsence,
        validateAbsence,
        deleteAbsence,
        recordPayment,
        updatePayment,
        deletePayment,
        getStudentFinancialBalance,
        addHomework,
        updateHomework,
        deleteHomework,
        submitHomework,
        gradeSubmission,
        acknowledgeHomeworkByParent,
        publishCorrection,
        sendMessage,
        deleteDraft,
        hideMessageForRecipient,
        publishAnnouncement,
        publishCorrectiveAnnouncement,
        logConversationAccess,
        resetToDefaultData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

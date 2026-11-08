export type UserRole = 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT' | 'ACCOUNTANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  linkedStudentId?: string; // For parents and students
  assignedSubjects?: string[]; // Subject IDs for teachers
  assignedClasses?: string[]; // Class IDs for teachers
}

export interface Student {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'M' | 'F';
  photoUrl: string;
  academicYear: string; // e.g. "2025-2026"
  classId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  medicalNotes: string;
  registrationDate: string;
  status: 'ACTIF' | 'PRE_INSCRIPTION' | 'RADIE';
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "CP-A", "CE1-B", "CM2-A"
  level: 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2';
  section: 'A' | 'B' | 'C';
  maxCapacity: number;
  academicYear: string;
  mainTeacherId: string; // Enseignant titulaire
}

export interface Subject {
  id: string;
  name: string; // e.g. "Mathématiques", "Français", "Arabe"
  coefficient: number; // e.g. 1, 2, 3
  level: string; // e.g. "Tous", "CP", "CE1"...
  color?: string;
}

export interface Room {
  id: string;
  name: string; // e.g. "Salle 101", "Labo Informatique"
  capacity: number;
  type: 'Classe' | 'Informatique' | 'Polyvalente' | 'Sport';
  isAvailable: boolean;
}

export interface ScheduleSlot {
  id: string;
  academicYear: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  dayOfWeek: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "10:00"
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  term: 'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3';
  academicYear: string;
  examType: 'Contrôle Continu' | 'Examen Trimestriel';
  score: number; // out of 20
  coefficient: number;
  date: string;
  comment?: string;
}

export interface Absence {
  id: string;
  studentId: string;
  date: string;
  durationHours: number;
  academicYear: string;
  isJustified: boolean;
  justificationReason?: string;
  justifiedByParentDate?: string;
  status: 'NON_JUSTIFIEE' | 'EN_ATTENTE_VALIDATION' | 'JUSTIFIEE';
}

export interface PaymentFeePlan {
  id: string;
  academicYear: string;
  registrationFee: number;
  term1Fee: number;
  term2Fee: number;
  term3Fee: number;
  totalAnnual: number;
}

export interface Payment {
  id: string;
  receiptNumber: string;
  studentId: string;
  academicYear: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Espèces' | 'Virement bancaire' | 'Chèque' | 'Mobile Money';
  tranche: 'Frais Inscription' | 'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3' | 'Autre';
  status: 'PAYE' | 'ANNULE';
  notes?: string;
  pdfGenerated: boolean;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  dueDate: string; // YYYY-MM-DD
  academicYear: string;
  attachments?: string[];
  correctionFile?: string;
  correctionPublished: boolean;
  maxScore: number;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  submittedAt: string;
  content: string;
  fileName?: string;
  score?: number;
  teacherFeedback?: string;
  gradedAt?: string;
  isLate: boolean;
  parentAcknowledged: boolean; // Marquage "vu" par le parent
  parentAcknowledgedAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  recipientRole: UserRole;
  studentId?: string; // Contexte d'élève pour fil de discussion Enseignant-Parent
  subject: string;
  body: string;
  sentAt?: string;
  isDraft: boolean;
  hiddenByRecipient?: boolean;
  downloadUrl?: string; // Lien de reçu de paiement automatique
  attachments?: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'ALL' | 'PARENTS' | 'TEACHERS' | 'STUDENTS';
  publishedAt: string;
  authorName: string;
  isCorrective?: boolean;
  correctedAnnouncementId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'CREATION' | 'MODIFICATION' | 'SUPPRESSION' | 'ACCES_HISTORIQUE' | 'NOTIFICATION_PAIEMENT';
  entity: string;
  entityId: string;
  details: string;
}

export interface NotificationLog {
  id: string;
  date: string;
  recipientName: string;
  recipientContact: string;
  type: 'PAIEMENT' | 'DEVOIR' | 'NOTE' | 'MESSAGE' | 'RELANCE';
  channel: 'Messagerie Interne' | 'Email / SMS' | 'Push PWA';
  status: 'ENVOYE' | 'ECHEC';
  summary: string;
}

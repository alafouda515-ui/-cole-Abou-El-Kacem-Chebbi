import {
  User,
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
  NotificationLog
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Dr. Hamdi Hassen',
    email: 'direction@ecole-chebbi.tn',
    role: 'ADMIN',
    phone: '+216 73 222 100',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-teacher-1',
    name: 'M. Youssef Mansour',
    email: 'youssef.mansour@ecole-chebbi.tn',
    role: 'TEACHER',
    phone: '+216 98 123 456',
    assignedSubjects: ['sub-math', 'sub-science'],
    assignedClasses: ['cls-cm2-a', 'cls-cm1-a'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-teacher-2',
    name: 'Mme Leïla Gharbi',
    email: 'leila.gharbi@ecole-chebbi.tn',
    role: 'TEACHER',
    phone: '+216 97 654 321',
    assignedSubjects: ['sub-fr', 'sub-ar'],
    assignedClasses: ['cls-cm2-a', 'cls-ce1-a'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-parent-1',
    name: 'Mme Samira Ben Salem',
    email: 'samira.bensalem@gmail.com',
    role: 'PARENT',
    phone: '+216 22 555 888',
    linkedStudentId: 'stu-1',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-student-1',
    name: 'Rayan Ben Salem',
    email: 'rayan.bensalem@eleve-chebbi.tn',
    role: 'STUDENT',
    linkedStudentId: 'stu-1',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-accountant',
    name: 'M. Karim Trabelsi',
    email: 'compta@ecole-chebbi.tn',
    role: 'ACCOUNTANT',
    phone: '+216 73 222 105',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'cls-cp-a',
    name: 'CP - Section A',
    level: 'CP',
    section: 'A',
    maxCapacity: 25,
    academicYear: '2025-2026',
    mainTeacherId: 'user-teacher-2'
  },
  {
    id: 'cls-ce1-a',
    name: 'CE1 - Section A',
    level: 'CE1',
    section: 'A',
    maxCapacity: 25,
    academicYear: '2025-2026',
    mainTeacherId: 'user-teacher-2'
  },
  {
    id: 'cls-ce2-a',
    name: 'CE2 - Section A',
    level: 'CE2',
    section: 'A',
    maxCapacity: 26,
    academicYear: '2025-2026',
    mainTeacherId: 'user-teacher-1'
  },
  {
    id: 'cls-cm1-a',
    name: 'CM1 - Section A',
    level: 'CM1',
    section: 'A',
    maxCapacity: 28,
    academicYear: '2025-2026',
    mainTeacherId: 'user-teacher-1'
  },
  {
    id: 'cls-cm2-a',
    name: 'CM2 - Section A',
    level: 'CM2',
    section: 'A',
    maxCapacity: 26,
    academicYear: '2025-2026',
    mainTeacherId: 'user-teacher-1'
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-ar', name: 'Langue Arabe', coefficient: 3, level: 'Tous', color: '#0284c7' },
  { id: 'sub-fr', name: 'Langue Française', coefficient: 3, level: 'Tous', color: '#4f46e5' },
  { id: 'sub-math', name: 'Mathématiques', coefficient: 3, level: 'Tous', color: '#0d9488' },
  { id: 'sub-science', name: 'Éveil Scientifique & Sciences', coefficient: 2, level: 'Tous', color: '#16a34a' },
  { id: 'sub-hist', name: 'Histoire & Géographie', coefficient: 1.5, level: 'Tous', color: '#d97706' },
  { id: 'sub-civic', name: 'Éducation Civique & Islamique', coefficient: 1.5, level: 'Tous', color: '#9333ea' },
  { id: 'sub-art', name: 'Arts Plastiques & Musique', coefficient: 1, level: 'Tous', color: '#db2777' },
  { id: 'sub-sport', name: 'Éducation Physique', coefficient: 1, level: 'Tous', color: '#e11d48' }
];

export const INITIAL_ROOMS: Room[] = [
  { id: 'room-101', name: 'Salle 101 (RDC)', capacity: 28, type: 'Classe', isAvailable: true },
  { id: 'room-102', name: 'Salle 102 (RDC)', capacity: 28, type: 'Classe', isAvailable: true },
  { id: 'room-201', name: 'Salle 201 (1er étage)', capacity: 30, type: 'Classe', isAvailable: true },
  { id: 'room-lab', name: 'Labo Informatique & Multimédia', capacity: 25, type: 'Informatique', isAvailable: true },
  { id: 'room-poly', name: 'Salle Polyvalente & Théâtre', capacity: 60, type: 'Polyvalente', isAvailable: true }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    matricule: 'MAT-2025-001',
    firstName: 'Rayan',
    lastName: 'Ben Salem',
    birthDate: '2015-04-12',
    gender: 'M',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    academicYear: '2025-2026',
    classId: 'cls-cm2-a',
    parentName: 'Mme Samira Ben Salem',
    parentEmail: 'samira.bensalem@gmail.com',
    parentPhone: '+216 22 555 888',
    address: 'Avenue Habib Bourguiba, Sousse',
    medicalNotes: 'Légère allergie aux arachides. Aucun aménagement particulier.',
    registrationDate: '2025-09-02',
    status: 'ACTIF'
  },
  {
    id: 'stu-2',
    matricule: 'MAT-2025-002',
    firstName: 'Nour',
    lastName: 'Chahed',
    birthDate: '2015-08-20',
    gender: 'F',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    academicYear: '2025-2026',
    classId: 'cls-cm2-a',
    parentName: 'M. Tarek Chahed',
    parentEmail: 'tarek.chahed@topnet.tn',
    parentPhone: '+216 55 444 333',
    address: 'Route Touristique Kantaoui, Sousse',
    medicalNotes: 'Porte des lunettes pour vision de loin.',
    registrationDate: '2025-09-03',
    status: 'ACTIF'
  },
  {
    id: 'stu-3',
    matricule: 'MAT-2025-003',
    firstName: 'Yassine',
    lastName: 'Mejri',
    birthDate: '2016-02-14',
    gender: 'M',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    academicYear: '2025-2026',
    classId: 'cls-cm1-a',
    parentName: 'Mme Fatma Mejri',
    parentEmail: 'fatma.mejri@gmail.com',
    parentPhone: '+216 24 111 222',
    address: 'Sahloul 4, Sousse',
    medicalNotes: 'Asthme léger à l effort en hiver.',
    registrationDate: '2025-09-04',
    status: 'ACTIF'
  },
  {
    id: 'stu-4',
    matricule: 'MAT-2025-004',
    firstName: 'Meriem',
    lastName: 'Jaziri',
    birthDate: '2018-11-05',
    gender: 'F',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    academicYear: '2025-2026',
    classId: 'cls-cp-a',
    parentName: 'M. Hichem Jaziri',
    parentEmail: 'hichem.jaziri@gnet.tn',
    parentPhone: '+216 99 777 666',
    address: 'Hammam Sousse',
    medicalNotes: 'Aucun problème médical signalé.',
    registrationDate: '2025-09-05',
    status: 'ACTIF'
  },
  {
    id: 'stu-5',
    matricule: 'PRE-2025-010',
    firstName: 'Adam',
    lastName: 'Khelifi',
    birthDate: '2019-01-22',
    gender: 'M',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    academicYear: '2025-2026',
    classId: 'cls-cp-a',
    parentName: 'Mme Ines Khelifi',
    parentEmail: 'ines.khelifi@yahoo.fr',
    parentPhone: '+216 20 888 999',
    address: 'Bouhsina, Sousse',
    medicalNotes: 'Dossier vaccinal à jour.',
    registrationDate: '2025-10-15',
    status: 'PRE_INSCRIPTION'
  }
];

export const INITIAL_SCHEDULE: ScheduleSlot[] = [
  {
    id: 'slot-1',
    academicYear: '2025-2026',
    classId: 'cls-cm2-a',
    subjectId: 'sub-math',
    teacherId: 'user-teacher-1',
    roomId: 'room-201',
    dayOfWeek: 'Lundi',
    startTime: '08:00',
    endTime: '10:00'
  },
  {
    id: 'slot-2',
    academicYear: '2025-2026',
    classId: 'cls-cm2-a',
    subjectId: 'sub-fr',
    teacherId: 'user-teacher-2',
    roomId: 'room-201',
    dayOfWeek: 'Lundi',
    startTime: '10:15',
    endTime: '12:15'
  },
  {
    id: 'slot-3',
    academicYear: '2025-2026',
    classId: 'cls-cm2-a',
    subjectId: 'sub-ar',
    teacherId: 'user-teacher-2',
    roomId: 'room-201',
    dayOfWeek: 'Mardi',
    startTime: '08:00',
    endTime: '10:00'
  },
  {
    id: 'slot-4',
    academicYear: '2025-2026',
    classId: 'cls-cm2-a',
    subjectId: 'sub-science',
    teacherId: 'user-teacher-1',
    roomId: 'room-lab',
    dayOfWeek: 'Mardi',
    startTime: '10:15',
    endTime: '12:15'
  },
  {
    id: 'slot-5',
    academicYear: '2025-2026',
    classId: 'cls-cm2-a',
    subjectId: 'sub-hist',
    teacherId: 'user-teacher-2',
    roomId: 'room-201',
    dayOfWeek: 'Mercredi',
    startTime: '08:30',
    endTime: '10:30'
  },
  {
    id: 'slot-6',
    academicYear: '2025-2026',
    classId: 'cls-cm1-a',
    subjectId: 'sub-math',
    teacherId: 'user-teacher-1',
    roomId: 'room-102',
    dayOfWeek: 'Lundi',
    startTime: '14:00',
    endTime: '16:00'
  }
];

export const INITIAL_GRADES: Grade[] = [
  // Rayan Ben Salem - Trimestre 1
  {
    id: 'grd-1',
    studentId: 'stu-1',
    subjectId: 'sub-math',
    classId: 'cls-cm2-a',
    term: 'Trimestre 1',
    academicYear: '2025-2026',
    examType: 'Contrôle Continu',
    score: 17.5,
    coefficient: 1,
    date: '2025-10-20',
    comment: 'Excellente maîtrise du calcul mental et géométrie.'
  },
  {
    id: 'grd-2',
    studentId: 'stu-1',
    subjectId: 'sub-math',
    classId: 'cls-cm2-a',
    term: 'Trimestre 1',
    academicYear: '2025-2026',
    examType: 'Examen Trimestriel',
    score: 18.0,
    coefficient: 2,
    date: '2025-11-28',
    comment: 'Raisonnement rigoureux et soigné.'
  },
  {
    id: 'grd-3',
    studentId: 'stu-1',
    subjectId: 'sub-fr',
    classId: 'cls-cm2-a',
    term: 'Trimestre 1',
    academicYear: '2025-2026',
    examType: 'Contrôle Continu',
    score: 15.0,
    coefficient: 1,
    date: '2025-10-25',
    comment: 'Bonne expression écrite, attention à l orthographe.'
  },
  {
    id: 'grd-4',
    studentId: 'stu-1',
    subjectId: 'sub-fr',
    classId: 'cls-cm2-a',
    term: 'Trimestre 1',
    academicYear: '2025-2026',
    examType: 'Examen Trimestriel',
    score: 16.5,
    coefficient: 2,
    date: '2025-12-02',
    comment: 'Très bonne compréhension de texte.'
  },
  {
    id: 'grd-5',
    studentId: 'stu-1',
    subjectId: 'sub-ar',
    classId: 'cls-cm2-a',
    term: 'Trimestre 1',
    academicYear: '2025-2026',
    examType: 'Examen Trimestriel',
    score: 17.0,
    coefficient: 3,
    date: '2025-12-05',
    comment: 'Élève très attentif et actif en classe.'
  },
  {
    id: 'grd-6',
    studentId: 'stu-1',
    subjectId: 'sub-science',
    classId: 'cls-cm2-a',
    term: 'Trimestre 1',
    academicYear: '2025-2026',
    examType: 'Examen Trimestriel',
    score: 16.0,
    coefficient: 2,
    date: '2025-12-08',
    comment: 'Grand esprit de curiosité.'
  },
  {
    id: 'grd-7',
    studentId: 'stu-1',
    subjectId: 'sub-hist',
    classId: 'cls-cm2-a',
    term: 'Trimestre 1',
    academicYear: '2025-2026',
    examType: 'Examen Trimestriel',
    score: 15.5,
    coefficient: 1.5,
    date: '2025-12-10',
    comment: 'Bien assimilé.'
  },
  {
    id: 'grd-8',
    studentId: 'stu-1',
    subjectId: 'sub-civic',
    classId: 'cls-cm2-a',
    term: 'Trimestre 1',
    academicYear: '2025-2026',
    examType: 'Examen Trimestriel',
    score: 18.0,
    coefficient: 1.5,
    date: '2025-12-12',
    comment: 'Très bon comportement citoyen.'
  },
  {
    id: 'grd-9',
    studentId: 'stu-1',
    subjectId: 'sub-art',
    classId: 'cls-cm2-a',
    term: 'Trimestre 1',
    academicYear: '2025-2026',
    examType: 'Examen Trimestriel',
    score: 16.0,
    coefficient: 1,
    date: '2025-12-14',
    comment: 'Créativité affirmée.'
  },
  {
    id: 'grd-10',
    studentId: 'stu-1',
    subjectId: 'sub-sport',
    classId: 'cls-cm2-a',
    term: 'Trimestre 1',
    academicYear: '2025-2026',
    examType: 'Examen Trimestriel',
    score: 17.0,
    coefficient: 1,
    date: '2025-12-15',
    comment: 'Participation exemplaire.'
  },
  // Nour Chahed
  {
    id: 'grd-11',
    studentId: 'stu-2',
    subjectId: 'sub-math',
    classId: 'cls-cm2-a',
    term: 'Trimestre 1',
    academicYear: '2025-2026',
    examType: 'Examen Trimestriel',
    score: 16.0,
    coefficient: 2,
    date: '2025-11-28',
    comment: 'Très bon travail régulier.'
  }
];

export const INITIAL_ABSENCES: Absence[] = [
  {
    id: 'abs-1',
    studentId: 'stu-1',
    date: '2025-10-18',
    durationHours: 2,
    academicYear: '2025-2026',
    isJustified: true,
    justificationReason: 'Rendez-vous médical chez le dentiste (certificat fourni).',
    justifiedByParentDate: '2025-10-19',
    status: 'JUSTIFIEE'
  },
  {
    id: 'abs-2',
    studentId: 'stu-2',
    date: '2025-11-12',
    durationHours: 4,
    academicYear: '2025-2026',
    isJustified: false,
    status: 'NON_JUSTIFIEE'
  }
];

export const INITIAL_FEE_PLAN: PaymentFeePlan = {
  id: 'plan-2025-2026',
  academicYear: '2025-2026',
  registrationFee: 250,
  term1Fee: 500,
  term2Fee: 500,
  term3Fee: 500,
  totalAnnual: 1750
};

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    receiptNumber: 'REC-2025-00101',
    studentId: 'stu-1',
    academicYear: '2025-2026',
    amount: 250,
    paymentDate: '2025-09-02',
    paymentMethod: 'Virement bancaire',
    tranche: 'Frais Inscription',
    status: 'PAYE',
    notes: 'Inscription officielle rentrée 2025.',
    pdfGenerated: true
  },
  {
    id: 'pay-2',
    receiptNumber: 'REC-2025-00142',
    studentId: 'stu-1',
    academicYear: '2025-2026',
    amount: 500,
    paymentDate: '2025-10-05',
    paymentMethod: 'Chèque',
    tranche: 'Trimestre 1',
    status: 'PAYE',
    notes: 'Chèque BIAT N° 458921 encaissé.',
    pdfGenerated: true
  },
  {
    id: 'pay-3',
    receiptNumber: 'REC-2025-00210',
    studentId: 'stu-2',
    academicYear: '2025-2026',
    amount: 750,
    paymentDate: '2025-09-04',
    paymentMethod: 'Espèces',
    tranche: 'Frais Inscription',
    status: 'PAYE',
    notes: 'Inscription + Trimestre 1 réglés en espèces.',
    pdfGenerated: true
  }
];

export const INITIAL_HOMEWORK: Homework[] = [
  {
    id: 'hw-1',
    title: 'Exercices fractions et calculs décimaux',
    description: 'Compléter la fiche N°4 page 32 du manuel : exercices 1 à 6 sur les additions de fractions de même dénominateur et conversions décimales.',
    subjectId: 'sub-math',
    classId: 'cls-cm2-a',
    teacherId: 'user-teacher-1',
    dueDate: '2026-11-15',
    academicYear: '2025-2026',
    attachments: ['Fiche_Fractions_CM2.pdf'],
    correctionFile: 'Corrige_Type_Fractions_CM2.pdf',
    correctionPublished: true,
    maxScore: 20
  },
  {
    id: 'hw-2',
    title: 'Rédaction : Récit d aventure fantastique',
    description: 'Rédiger un texte narratif de 15 à 20 lignes au passé composé et imparfait racontant la découverte d un passage secret dans un vieux château.',
    subjectId: 'sub-fr',
    classId: 'cls-cm2-a',
    teacherId: 'user-teacher-2',
    dueDate: '2026-11-20',
    academicYear: '2025-2026',
    attachments: ['Consignes_Redaction_CM2.pdf'],
    correctionPublished: false,
    maxScore: 20
  }
];

export const INITIAL_SUBMISSIONS: HomeworkSubmission[] = [
  {
    id: 'sub-1',
    homeworkId: 'hw-1',
    studentId: 'stu-1',
    submittedAt: '2026-11-12T14:30:00Z',
    content: 'Monsieur, voici mon devoir sur les fractions. J ai fait tous les exercices 1 à 6 et vérifié les résultats au brouillon.',
    fileName: 'Devoir_Rayan_Fractions.pdf',
    score: 18.5,
    teacherFeedback: 'Excellent travail Rayan ! Tous les calculs sont exacts et les étapes sont bien détaillées.',
    gradedAt: '2026-11-13T10:00:00Z',
    isLate: false,
    parentAcknowledged: true,
    parentAcknowledgedAt: '2026-11-13T18:45:00Z'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    senderId: 'user-teacher-1',
    senderName: 'M. Youssef Mansour (Enseignant)',
    senderRole: 'TEACHER',
    recipientId: 'user-parent-1',
    recipientName: 'Mme Samira Ben Salem',
    recipientRole: 'PARENT',
    studentId: 'stu-1',
    subject: 'Suivi du travail en mathématiques de Rayan',
    body: 'Bonjour Madame Ben Salem,\n\nJe tiens à vous féliciter pour les excellents résultats de Rayan en calcul mental et résolution de problèmes. Il fait preuve d un investissement remarquable en classe.\n\nBien cordialement,\nM. Mansour',
    sentAt: '2025-10-22T14:15:00Z',
    isDraft: false
  },
  {
    id: 'msg-2',
    senderId: 'user-accountant',
    senderName: 'Secrétariat Financier',
    senderRole: 'ACCOUNTANT',
    recipientId: 'user-parent-1',
    recipientName: 'Mme Samira Ben Salem',
    recipientRole: 'PARENT',
    studentId: 'stu-1',
    subject: 'Confirmation de paiement - Reçu N° REC-2025-00142',
    body: 'Chers parents de Rayan Ben Salem,\n\nNous vous confirmons la bonne réception de votre paiement de 500 TND (Trimestre 1) en date du 05/10/2025 par Chèque.\nNouveau solde restant dû : 1 000 TND.\nVotre reçu de paiement est disponible en téléchargement dans votre espace.',
    sentAt: '2025-10-05T09:30:00Z',
    isDraft: false,
    downloadUrl: '#recu-REC-2025-00142'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Réunion générale des parents d élèves et conseil de rentrée',
    content: 'La direction de l École Primaire Abou El Kacem Chebbi a le plaisir de convier tous les parents à la réunion de rentrée le samedi 27 septembre à 10h00 dans la grande salle polyvalente.',
    targetRole: 'ALL',
    publishedAt: '2025-09-15T08:00:00Z',
    authorName: 'Dr. Hamdi Hassen (Direction)'
  },
  {
    id: 'ann-2',
    title: 'Journée culturelle et ateliers scientifiques d automne',
    content: 'Les ateliers d expérimentation scientifique débuteront le mois prochain pour les classes de CM1 et CM2. Pensez à vérifier le matériel demandé.',
    targetRole: 'PARENTS',
    publishedAt: '2025-10-02T11:00:00Z',
    authorName: 'Dr. Hamdi Hassen (Direction)'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2025-09-02T08:30:00Z',
    userId: 'user-admin',
    userName: 'Dr. Hamdi Hassen',
    userRole: 'ADMIN',
    action: 'CREATION',
    entity: 'Student',
    entityId: 'stu-1',
    details: 'Création du dossier élève Rayan Ben Salem (MAT-2025-001).'
  },
  {
    id: 'log-2',
    timestamp: '2025-10-05T09:28:00Z',
    userId: 'user-accountant',
    userName: 'M. Karim Trabelsi',
    userRole: 'ACCOUNTANT',
    action: 'CREATION',
    entity: 'Payment',
    entityId: 'pay-2',
    details: 'Enregistrement paiement 500 TND pour élève Rayan Ben Salem (Reçu REC-2025-00142).'
  },
  {
    id: 'log-3',
    timestamp: '2025-10-05T09:30:00Z',
    userId: 'user-accountant',
    userName: 'Système Automatique',
    userRole: 'ACCOUNTANT',
    action: 'NOTIFICATION_PAIEMENT',
    entity: 'Payment',
    entityId: 'pay-2',
    details: 'Envoi automatique notification + reçu PDF à Mme Samira Ben Salem (Parent).'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif-1',
    date: '2025-10-05T09:30:00Z',
    recipientName: 'Mme Samira Ben Salem',
    recipientContact: 'samira.bensalem@gmail.com / +216 22 555 888',
    type: 'PAIEMENT',
    channel: 'Messagerie Interne',
    status: 'ENVOYE',
    summary: 'Paiement reçu 500 TND (Trimestre 1). Solde restant : 1 000 TND. Reçu REC-2025-00142 attaché.'
  },
  {
    id: 'notif-2',
    date: '2026-11-10T16:00:00Z',
    recipientName: 'Élèves & Parents CM2-A',
    recipientContact: 'Diffusion classe CM2-A',
    type: 'DEVOIR',
    channel: 'Push PWA',
    status: 'ENVOYE',
    summary: 'Nouveau devoir publié : Fractions et calculs décimaux par M. Mansour.'
  }
];

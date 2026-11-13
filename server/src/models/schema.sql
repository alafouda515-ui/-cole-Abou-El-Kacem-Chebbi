-- ============================================================================
-- Plateforme SaaS de Gestion Scolaire Multi-Établissements (Multi-Tenant)
-- Schéma Relationnel PostgreSQL avec isolation par school_id
-- ============================================================================

-- 1. Table des Établissements Scolaires (Tenants)
CREATE TABLE IF NOT EXISTS schools (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    manager_name VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED')),
    subscription_plan VARCHAR(50) DEFAULT 'STANDARD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherche rapide et filtrage de statut
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);
CREATE INDEX IF NOT EXISTS idx_schools_email ON schools(email);

-- 2. Table des Utilisateurs (Comptes avec RBAC et school_id)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT')),
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    linked_student_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. Table des Classes (associées à une école)
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(20) NOT NULL,
    section VARCHAR(10) NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 30,
    academic_year VARCHAR(20) NOT NULL,
    main_teacher_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_classes_school ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year);

-- 4. Table des Matières
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    coefficient NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
    level VARCHAR(50) DEFAULT 'Tous',
    color VARCHAR(20) DEFAULT '#2563eb',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subjects_school ON subjects(school_id);

-- 5. Table des Salles
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 30,
    type VARCHAR(50) DEFAULT 'Classe',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rooms_school ON rooms(school_id);

-- 6. Table des Étudiants (Dossiers élèves)
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    matricule VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('M', 'F')),
    photo_url TEXT,
    academic_year VARCHAR(20) NOT NULL,
    class_id VARCHAR(64) REFERENCES classes(id) ON DELETE SET NULL,
    parent_name VARCHAR(255) NOT NULL,
    parent_email VARCHAR(255),
    parent_phone VARCHAR(50) NOT NULL,
    address TEXT,
    medical_notes TEXT,
    registration_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIF' CHECK (status IN ('ACTIF', 'PRE_INSCRIPTION', 'RADIE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_matricule_per_school UNIQUE (school_id, matricule)
);

CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- 7. Table des Affectations Enseignant-Matière-Classe
CREATE TABLE IF NOT EXISTS teacher_assignments (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    class_id VARCHAR(64) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_teacher_assignments_school ON teacher_assignments(school_id);

-- 8. Table des Créneaux d'Emploi du Temps
CREATE TABLE IF NOT EXISTS schedule_slots (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    class_id VARCHAR(64) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id VARCHAR(64) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schedule_school ON schedule_slots(school_id);
CREATE INDEX IF NOT EXISTS idx_schedule_conflict ON schedule_slots(school_id, day_of_week, start_time, end_time);

-- 9. Table des Évaluations et Notes
CREATE TABLE IF NOT EXISTS grades (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    class_id VARCHAR(64) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    term VARCHAR(30) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    coefficient NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
    exam_date DATE NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_grades_school_student ON grades(school_id, student_id);

-- 10. Table des Absences
CREATE TABLE IF NOT EXISTS absences (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 1,
    academic_year VARCHAR(20) NOT NULL,
    is_justified BOOLEAN NOT NULL DEFAULT FALSE,
    justification_reason TEXT,
    justified_by_parent_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'NON_JUSTIFIEE' CHECK (status IN ('NON_JUSTIFIEE', 'EN_ATTENTE_VALIDATION', 'JUSTIFIEE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_absences_school ON absences(school_id);

-- 11. Table des Plans Tarifaires
CREATE TABLE IF NOT EXISTS fee_plans (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    registration_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    term1_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    term2_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    term3_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_annual NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_fee_plan_school_year UNIQUE (school_id, academic_year)
);

-- 12. Table des Paiements et Encaissements
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    receipt_number VARCHAR(100) NOT NULL,
    student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    tranche VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PAYE',
    notes TEXT,
    pdf_generated BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_school ON payments(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(school_id, student_id);

-- 13. Table des Devoirs (Homework)
CREATE TABLE IF NOT EXISTS homeworks (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    class_id VARCHAR(64) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    attachments JSONB DEFAULT '[]',
    correction_file TEXT,
    correction_published BOOLEAN NOT NULL DEFAULT FALSE,
    max_score INTEGER NOT NULL DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_homeworks_school ON homeworks(school_id);
CREATE INDEX IF NOT EXISTS idx_homeworks_class ON homeworks(class_id);

-- 14. Table des Dépôts de Devoirs (Submissions)
CREATE TABLE IF NOT EXISTS homework_submissions (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    homework_id VARCHAR(64) NOT NULL REFERENCES homeworks(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    content TEXT,
    file_name VARCHAR(255),
    score NUMERIC(5, 2),
    teacher_feedback TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    parent_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    parent_acknowledged_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_submission_student_hw UNIQUE (homework_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_school ON homework_submissions(school_id);

-- 15. Table des Messages Sécurisés (RBAC & Immuables)
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    sender_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(30) NOT NULL,
    recipient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_role VARCHAR(30) NOT NULL,
    student_id VARCHAR(64),
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    is_draft BOOLEAN NOT NULL DEFAULT FALSE,
    hidden_by_recipient BOOLEAN NOT NULL DEFAULT FALSE,
    download_url TEXT,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_school ON messages(school_id);

-- 16. Table des Circulaires / Annonces Officielles (Immuables)
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_role VARCHAR(30) NOT NULL DEFAULT 'ALL',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author_name VARCHAR(255) NOT NULL,
    is_corrective BOOLEAN NOT NULL DEFAULT FALSE,
    corrected_announcement_id VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_announcements_school ON announcements(school_id);

-- 17. Table du Journal d'Audit & Sécurité
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(30) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    details TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_school ON audit_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

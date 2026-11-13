import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, School, User } from '../models/dbAdapter';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt';
import { AuthenticatedRequest } from '../middlewares/auth';

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez saisir votre email et votre mot de passe.'
    });
  }

  const database = db.getDb();
  const user = database.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Identifiants invalides (email ou mot de passe incorrect).'
    });
  }

  // Check password
  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Identifiants invalides (email ou mot de passe incorrect).'
    });
  }

  // Check School status if not SUPER_ADMIN
  let school: School | undefined = undefined;
  if (user.role !== 'SUPER_ADMIN' && user.school_id) {
    school = database.schools.find((s) => s.id === user.school_id);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Établissement rattaché introuvable.'
      });
    }

    if (school.status === 'PENDING') {
      return res.status(403).json({
        success: false,
        code: 'SCHOOL_PENDING',
        message: 'L\'inscription de votre établissement est actuellement en attente d\'approbation par le Super Administrateur.'
      });
    }

    if (school.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        code: 'SCHOOL_SUSPENDED',
        message: 'L\'accès de votre établissement a été suspendu par l\'administration de la plateforme.'
      });
    }

    if (school.status === 'REJECTED') {
      return res.status(403).json({
        success: false,
        code: 'SCHOOL_REJECTED',
        message: 'La demande d\'inscription de votre établissement a été refusée.'
      });
    }
  }

  // Check user active status
  if (!user.is_active) {
    return res.status(403).json({
      success: false,
      message: 'Ce compte utilisateur a été désactivé.'
    });
  }

  // Generate JWT Token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      school_id: user.school_id,
      first_name: user.first_name,
      last_name: user.last_name,
      linked_student_id: user.linked_student_id
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return res.json({
    success: true,
    message: 'Connexion réussie.',
    token,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      school_id: user.school_id,
      phone: user.phone,
      avatar_url: user.avatar_url,
      linked_student_id: user.linked_student_id
    },
    school: school || null
  });
};

export const registerSchool = (req: Request, res: Response) => {
  const {
    name,
    address,
    email,
    phone,
    manager_name,
    password,
    confirm_password
  } = req.body;

  // Validation
  if (!name || !address || !email || !phone || !manager_name || !password) {
    return res.status(400).json({
      success: false,
      message: 'Tous les champs obligatoires doivent être renseignés.'
    });
  }

  if (password !== confirm_password) {
    return res.status(400).json({
      success: false,
      message: 'Les deux mots de passe ne correspondent pas.'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Le mot de passe doit comporter au moins 6 caractères.'
    });
  }

  const database = db.getDb();

  // Check duplicate email in schools and users
  const emailLower = email.trim().toLowerCase();
  if (database.schools.some((s) => s.email.toLowerCase() === emailLower)) {
    return res.status(400).json({
      success: false,
      message: 'Un établissement avec cette adresse email existe déjà.'
    });
  }

  if (database.users.some((u) => u.email.toLowerCase() === emailLower)) {
    return res.status(400).json({
      success: false,
      message: 'Cette adresse email est déjà utilisée par un compte existant.'
    });
  }

  const now = new Date().toISOString();
  const schoolId = 'sch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const userId = 'usr_admin_' + Date.now();

  const newSchool: School = {
    id: schoolId,
    name: name.trim(),
    address: address.trim(),
    email: emailLower,
    phone: phone.trim(),
    manager_name: manager_name.trim(),
    status: 'PENDING', // Requirement: Pending until Super Admin approves
    subscription_plan: 'STANDARD',
    created_at: now,
    updated_at: now
  };

  const nameParts = manager_name.trim().split(' ');
  const firstName = nameParts[0] || 'Responsable';
  const lastName = nameParts.slice(1).join(' ') || 'Établissement';

  const newUser: User = {
    id: userId,
    school_id: schoolId,
    email: emailLower,
    password_hash: bcrypt.hashSync(password, 10),
    first_name: firstName,
    last_name: lastName,
    role: 'SCHOOL_ADMIN',
    phone: phone.trim(),
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    is_active: true,
    created_at: now,
    updated_at: now
  };

  database.schools.push(newSchool);
  database.users.push(newUser);

  // Add audit log
  database.audit_logs.push({
    id: 'log_' + Date.now(),
    school_id: schoolId,
    timestamp: now,
    user_id: userId,
    user_name: manager_name,
    user_role: 'SCHOOL_ADMIN',
    action: 'INSCRIPTION_ECOLE',
    entity: 'School',
    entity_id: schoolId,
    details: `Demande d'inscription de l'établissement "${newSchool.name}" (Statut: PENDING).`
  });

  db.persist();

  return res.status(201).json({
    success: true,
    message: 'Votre demande d\'inscription a été enregistrée avec succès. Votre établissement est actuellement au statut "En attente" (Pending). Vous pourrez vous connecter dès que le Super Administrateur aura validé votre dossier.',
    school: {
      id: newSchool.id,
      name: newSchool.name,
      status: newSchool.status,
      email: newSchool.email
    }
  });
};

export const getMe = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Non authentifié.' });
  }

  const database = db.getDb();
  const user = database.users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
  }

  const school = user.school_id
    ? database.schools.find((s) => s.id === user.school_id)
    : null;

  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      school_id: user.school_id,
      phone: user.phone,
      avatar_url: user.avatar_url,
      linked_student_id: user.linked_student_id
    },
    school
  });
};

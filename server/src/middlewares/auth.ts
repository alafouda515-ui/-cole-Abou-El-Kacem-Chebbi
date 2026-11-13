import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';
import { db } from '../models/dbAdapter';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'ACCOUNTANT';
  school_id: string | null;
  first_name: string;
  last_name: string;
  linked_student_id?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  schoolId?: string;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé : jeton d\'authentification manquant.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    
    // Verify user exists and is active in database
    const database = db.getDb();
    const userFound = database.users.find((u) => u.id === decoded.id);
    
    if (!userFound || !userFound.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Compte inactif ou utilisateur introuvable.'
      });
    }

    req.user = {
      id: userFound.id,
      email: userFound.email,
      role: userFound.role,
      school_id: userFound.school_id,
      first_name: userFound.first_name,
      last_name: userFound.last_name,
      linked_student_id: userFound.linked_student_id
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Jeton de session invalide ou expiré. Veuillez vous reconnecter.'
    });
  }
};

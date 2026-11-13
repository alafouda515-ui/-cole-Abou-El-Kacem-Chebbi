import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { db } from '../models/dbAdapter';

export const enforceTenant = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Utilisateur non authentifié.'
    });
  }

  // Super Admin can specify a schoolId via header or query or param, or operate globally
  if (req.user.role === 'SUPER_ADMIN') {
    const targetSchoolId =
      (req.headers['x-school-id'] as string) ||
      (req.query.schoolId as string) ||
      req.params.schoolId ||
      undefined;
    req.schoolId = targetSchoolId;
    return next();
  }

  // For all school actors, school_id MUST come strictly from the authenticated JWT session!
  if (!req.user.school_id) {
    return res.status(403).json({
      success: false,
      message: 'Compte non rattaché à un établissement scolaire.'
    });
  }

  const database = db.getDb();
  const school = database.schools.find((s) => s.id === req.user?.school_id);

  if (!school) {
    return res.status(404).json({
      success: false,
      message: 'Établissement scolaire introuvable.'
    });
  }

  if (school.status === 'PENDING') {
    return res.status(403).json({
      success: false,
      code: 'SCHOOL_PENDING',
      message: 'Votre établissement est en attente d\'approbation par le Super Administrateur.'
    });
  }

  if (school.status === 'SUSPENDED') {
    return res.status(403).json({
      success: false,
      code: 'SCHOOL_SUSPENDED',
      message: 'L\'accès de cet établissement est temporairement suspendu.'
    });
  }

  if (school.status === 'REJECTED') {
    return res.status(403).json({
      success: false,
      code: 'SCHOOL_REJECTED',
      message: 'La demande d\'inscription de cet établissement a été refusée.'
    });
  }

  // Enforce isolated school_id
  req.schoolId = req.user.school_id;
  next();
};

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { db } from '../models/dbAdapter';

export const getMessages = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const userId = req.user?.id;
  const { folder } = req.query; // 'inbox', 'sent', 'drafts'
  const database = db.getDb();

  let list = database.messages.filter((m) => m.school_id === schoolId);

  if (folder === 'sent') {
    list = list.filter((m) => m.sender_id === userId && !m.is_draft);
  } else if (folder === 'drafts') {
    list = list.filter((m) => m.sender_id === userId && m.is_draft);
  } else {
    // Default inbox
    list = list.filter((m) => m.recipient_id === userId && !m.is_draft && !m.hidden_by_recipient);
  }

  return res.json({ success: true, count: list.length, messages: list });
};

export const sendMessage = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { recipient_id, subject, body, student_id, is_draft } = req.body;

  if (!recipient_id || !subject || !body) {
    return res.status(400).json({ success: false, message: 'Destinataire, objet et message requis.' });
  }

  const database = db.getDb();
  const recipient = database.users.find((u) => u.id === recipient_id && u.school_id === schoolId);

  if (!recipient && req.user?.role !== 'SUPER_ADMIN') {
    return res.status(404).json({ success: false, message: 'Destinataire introuvable dans votre établissement.' });
  }

  const now = new Date().toISOString();
  const newMsg = {
    id: 'msg_' + Date.now(),
    school_id: schoolId,
    sender_id: req.user?.id || 'sys',
    sender_name: `${req.user?.first_name} ${req.user?.last_name}`,
    sender_role: req.user?.role || 'SCHOOL_ADMIN',
    recipient_id,
    recipient_name: recipient ? `${recipient.first_name} ${recipient.last_name}` : 'Utilisateur',
    recipient_role: recipient?.role || 'USER',
    student_id: student_id || null,
    subject: subject.trim(),
    body: body.trim(),
    sent_at: is_draft ? null : now,
    is_draft: !!is_draft,
    hidden_by_recipient: false,
    created_at: now
  };

  database.messages.unshift(newMsg);
  db.persist();

  return res.status(201).json({
    success: true,
    message: is_draft ? 'Brouillon sauvegardé.' : 'Message scellé et envoyé.',
    messageData: newMsg
  });
};

export const hideMessage = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { id } = req.params;
  const database = db.getDb();

  const msg = database.messages.find(
    (m) => m.id === id && m.school_id === schoolId && m.recipient_id === req.user?.id
  );

  if (!msg) {
    return res.status(404).json({ success: false, message: 'Message introuvable.' });
  }

  // Soft hide on recipient side only (Chapter 10.2)
  msg.hidden_by_recipient = true;
  db.persist();

  return res.json({ success: true, message: 'Message masqué de votre boîte.' });
};

// =================== ANNOUNCEMENTS ===================
export const getAnnouncements = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const database = db.getDb();

  let list = database.announcements.filter((a) => a.school_id === schoolId);

  // Role filtering
  const userRole = req.user?.role;
  list = list.filter((a) => {
    if (a.target_role === 'ALL') return true;
    if (userRole === 'SUPER_ADMIN' || userRole === 'SCHOOL_ADMIN') return true;
    if (a.target_role === 'PARENTS' && userRole === 'PARENT') return true;
    if (a.target_role === 'TEACHERS' && userRole === 'TEACHER') return true;
    if (a.target_role === 'STUDENTS' && userRole === 'STUDENT') return true;
    return false;
  });

  return res.json({ success: true, count: list.length, announcements: list });
};

export const createAnnouncement = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { title, content, target_role, is_corrective, corrected_announcement_id } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Titre et contenu requis.' });
  }

  const database = db.getDb();
  const newAnn = {
    id: 'ann_' + Date.now(),
    school_id: schoolId,
    title: title.trim(),
    content: content.trim(),
    target_role: target_role || 'ALL',
    published_at: new Date().toISOString(),
    author_name: `${req.user?.first_name} ${req.user?.last_name} (Direction)`,
    is_corrective: !!is_corrective,
    corrected_announcement_id: corrected_announcement_id || null
  };

  database.announcements.unshift(newAnn);
  db.persist();

  return res.status(201).json({ success: true, message: 'Circulaire officielle publiée.', announcement: newAnn });
};

export const getAuditLogs = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const database = db.getDb();

  let list = req.user?.role === 'SUPER_ADMIN'
    ? database.audit_logs
    : database.audit_logs.filter((l) => l.school_id === schoolId);

  return res.json({ success: true, count: list.length, logs: list.slice(0, 100) });
};

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { db } from '../models/dbAdapter';

const timeToMinutes = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export const getSchedule = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { classId, teacherId, academicYear } = req.query;
  const database = db.getDb();

  let slots = database.schedule_slots.filter((s) => s.school_id === schoolId);

  if (academicYear) {
    slots = slots.filter((s) => s.academic_year === academicYear);
  }

  // If role is TEACHER, filter only their slots
  if (req.user?.role === 'TEACHER') {
    slots = slots.filter((s) => s.teacher_id === req.user?.id);
  } else if (teacherId) {
    slots = slots.filter((s) => s.teacher_id === teacherId);
  }

  if (classId && classId !== 'ALL') {
    slots = slots.filter((s) => s.class_id === classId);
  }

  // Enrich with names
  const enriched = slots.map((slot) => {
    const cls = database.classes.find((c) => c.id === slot.class_id);
    const sub = database.subjects.find((s) => s.id === slot.subject_id);
    const tch = database.users.find((u) => u.id === slot.teacher_id);
    const rm = database.rooms.find((r) => r.id === slot.room_id);

    return {
      ...slot,
      className: cls?.name || 'Classe',
      subjectName: sub?.name || 'Matière',
      teacherName: tch ? `${tch.first_name} ${tch.last_name}` : 'Enseignant',
      roomName: rm?.name || 'Salle'
    };
  });

  return res.json({ success: true, count: enriched.length, slots: enriched });
};

export const createScheduleSlot = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const {
    academic_year,
    class_id,
    subject_id,
    teacher_id,
    room_id,
    day_of_week,
    start_time,
    end_time
  } = req.body;

  if (!class_id || !subject_id || !teacher_id || !room_id || !day_of_week || !start_time || !end_time) {
    return res.status(400).json({ success: false, message: 'Tous les champs du créneau sont obligatoires.' });
  }

  const newStart = timeToMinutes(start_time);
  const newEnd = timeToMinutes(end_time);

  if (newStart >= newEnd) {
    return res.status(400).json({ success: false, message: 'L\'heure de début doit être antérieure à l\'heure de fin.' });
  }

  const database = db.getDb();
  const existingSlots = database.schedule_slots.filter(
    (s) => s.school_id === schoolId && s.day_of_week === day_of_week && s.academic_year === (academic_year || '2025-2026')
  );

  // CONFLICT DETECTION ALGORITHM (Chapter 6)
  for (const slot of existingSlots) {
    const exStart = timeToMinutes(slot.start_time);
    const exEnd = timeToMinutes(slot.end_time);
    const overlaps = Math.max(newStart, exStart) < Math.min(newEnd, exEnd);

    if (overlaps) {
      if (slot.teacher_id === teacher_id) {
        const teacher = database.users.find((u) => u.id === teacher_id);
        return res.status(409).json({
          success: false,
          conflictType: 'TEACHER_CONFLICT',
          message: `Conflit d'enseignant : ${teacher ? teacher.first_name + ' ' + teacher.last_name : 'L\'enseignant'} est déjà en cours sur ce créneau (${day_of_week} ${slot.start_time}-${slot.end_time}).`
        });
      }
      if (slot.room_id === room_id) {
        const room = database.rooms.find((r) => r.id === room_id);
        return res.status(409).json({
          success: false,
          conflictType: 'ROOM_CONFLICT',
          message: `Conflit de salle : La salle "${room ? room.name : 'sélectionnée'}" est déjà occupée sur ce créneau (${day_of_week} ${slot.start_time}-${slot.end_time}).`
        });
      }
      if (slot.class_id === class_id) {
        const cls = database.classes.find((c) => c.id === class_id);
        return res.status(409).json({
          success: false,
          conflictType: 'CLASS_CONFLICT',
          message: `Conflit de classe : La classe "${cls ? cls.name : 'sélectionnée'}" a déjà un cours programmé (${day_of_week} ${slot.start_time}-${slot.end_time}).`
        });
      }
    }
  }

  const newSlot = {
    id: 'slot_' + Date.now(),
    school_id: schoolId,
    academic_year: academic_year || '2025-2026',
    class_id,
    subject_id,
    teacher_id,
    room_id,
    day_of_week,
    start_time,
    end_time,
    created_at: new Date().toISOString()
  };

  database.schedule_slots.push(newSlot);
  db.persist();

  return res.status(201).json({ success: true, message: 'Créneau programmé sans conflit.', slot: newSlot });
};

export const deleteScheduleSlot = (req: AuthenticatedRequest, res: Response) => {
  const schoolId = req.schoolId;
  const { id } = req.params;
  const database = db.getDb();

  database.schedule_slots = database.schedule_slots.filter(
    (s) => !(s.id === id && s.school_id === schoolId)
  );
  db.persist();

  return res.json({ success: true, message: 'Créneau supprimé.' });
};

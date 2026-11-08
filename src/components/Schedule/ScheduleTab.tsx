import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScheduleSlot } from '../../types';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  DoorOpen,
  User,
  BookOpen,
  Filter
} from 'lucide-react';

export const ScheduleTab: React.FC = () => {
  const {
    schedule,
    classes,
    subjects,
    rooms,
    users,
    academicYear,
    currentUser,
    addScheduleSlot,
    deleteScheduleSlot
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'ALL');
  const [selectedDay, setSelectedDay] = useState<string>('TOUS');
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const days: ScheduleSlot['dayOfWeek'][] = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi'
  ];

  const teachers = users.filter((u) => u.role === 'TEACHER');
  const canManage = currentUser.role === 'ADMIN';

  // Form State
  const [formData, setFormData] = useState({
    academicYear: academicYear,
    classId: classes[0]?.id || '',
    subjectId: subjects[0]?.id || '',
    teacherId: teachers[0]?.id || '',
    roomId: rooms[0]?.id || '',
    dayOfWeek: 'Lundi' as ScheduleSlot['dayOfWeek'],
    startTime: '08:00',
    endTime: '10:00'
  });

  // Filter slots
  const filteredSlots = schedule.filter((s) => {
    if (s.academicYear !== academicYear) return false;
    if (currentUser.role === 'TEACHER' && s.teacherId !== currentUser.id) return false;
    if (selectedClassId !== 'ALL' && s.classId !== selectedClassId) return false;
    if (selectedDay !== 'TOUS' && s.dayOfWeek !== selectedDay) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setErrorMessage(null);
    setFormData({
      academicYear: academicYear,
      classId: selectedClassId !== 'ALL' ? selectedClassId : classes[0]?.id || '',
      subjectId: subjects[0]?.id || '',
      teacherId: teachers[0]?.id || '',
      roomId: rooms[0]?.id || '',
      dayOfWeek: 'Lundi',
      startTime: '08:00',
      endTime: '10:00'
    });
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = addScheduleSlot(formData);
    if (!res.success) {
      setErrorMessage(res.error || 'Erreur lors de la planification');
      return;
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Emploi du Temps Scolaire</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              {filteredSlots.length} créneaux
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Planning hebdomadaire avec détection automatique des conflits de salles et d'enseignants ({academicYear})
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter un créneau</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filtres :</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Class Filter */}
          {currentUser.role !== 'TEACHER' && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">Toutes les classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Day Filter */}
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="TOUS">Toute la semaine</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Weekly Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days
          .filter((day) => selectedDay === 'TOUS' || selectedDay === day)
          .map((day) => {
            const daySlots = filteredSlots
              .filter((s) => s.dayOfWeek === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div
                key={day}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col"
              >
                <div className="bg-slate-900 text-white px-4 py-2.5 flex justify-between items-center">
                  <span className="font-bold text-xs uppercase tracking-wider">{day}</span>
                  <span className="text-[11px] font-mono text-slate-400">{daySlots.length} cours</span>
                </div>

                <div className="p-3 space-y-2.5 flex-1 bg-slate-50/50">
                  {daySlots.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Aucun cours programmé ce jour.
                    </div>
                  ) : (
                    daySlots.map((slot) => {
                      const subject = subjects.find((s) => s.id === slot.subjectId);
                      const cls = classes.find((c) => c.id === slot.classId);
                      const teacher = users.find((u) => u.id === slot.teacherId);
                      const room = rooms.find((r) => r.id === slot.roomId);

                      return (
                        <div
                          key={slot.id}
                          className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-blue-400 transition space-y-1.5 relative group"
                        >
                          <div className="flex justify-between items-start">
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3" />
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{cls?.name}</span>
                          </div>

                          <div className="text-xs font-bold text-slate-800">
                            {subject?.name}
                          </div>

                          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {teacher?.name}
                            </span>
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <DoorOpen className="w-3 h-3 text-slate-400" />
                              {room?.name}
                            </span>
                          </div>

                          {canManage && (
                            <button
                              onClick={() => {
                                if (window.confirm("Supprimer ce créneau d'emploi du temps ?")) {
                                  deleteScheduleSlot(slot.id);
                                }
                              }}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-50 rounded transition"
                              title="Supprimer ce cours"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Programmer un Nouveau Créneau de Cours</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {errorMessage && (
              <div className="bg-rose-50 border-b border-rose-200 p-3 px-6 flex items-start gap-2 text-xs text-rose-700">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <span className="font-bold block">Conflit détecté :</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Classe concernée *</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Matière *</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} (coeff {s.coefficient})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Enseignant affecté *</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Salle de cours *</label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>{r.name} ({r.capacity} pl.)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Jour *</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Début *</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Fin *</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                ⚡ Le système vérifie automatiquement qu'aucun enseignant ni aucune salle n'est déjà réservé(e) sur ce créneau horaire.
              </p>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Valider et Planifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

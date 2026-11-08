import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassRoom, Subject, Room } from '../../types';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Users,
  DoorOpen,
  Layers,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export const AcademicsTab: React.FC = () => {
  const {
    classes,
    subjects,
    rooms,
    students,
    users,
    academicYear,
    currentUser,
    addClass,
    updateClass,
    deleteClass,
    addSubject,
    updateSubject,
    deleteSubject,
    addRoom,
    updateRoom,
    deleteRoom
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'classes' | 'subjects' | 'rooms'>('classes');

  // Modal States
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [classForm, setClassForm] = useState({
    name: '',
    level: 'CP' as ClassRoom['level'],
    section: 'A' as ClassRoom['section'],
    maxCapacity: 25,
    academicYear: academicYear,
    mainTeacherId: users.find((u) => u.role === 'TEACHER')?.id || ''
  });

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    coefficient: 2,
    level: 'Tous',
    color: '#0d9488'
  });

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    name: '',
    capacity: 30,
    type: 'Classe' as Room['type'],
    isAvailable: true
  });

  const teachers = users.filter((u) => u.role === 'TEACHER');
  const canManage = currentUser.role === 'ADMIN';

  // --- Handlers Classes ---
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassForm({
      name: 'CP - Section B',
      level: 'CP',
      section: 'B',
      maxCapacity: 25,
      academicYear: academicYear,
      mainTeacherId: teachers[0]?.id || ''
    });
    setShowClassModal(true);
  };

  const handleOpenEditClass = (cls: ClassRoom) => {
    setEditingClass(cls);
    setClassForm({
      name: cls.name,
      level: cls.level,
      section: cls.section,
      maxCapacity: cls.maxCapacity,
      academicYear: cls.academicYear,
      mainTeacherId: cls.mainTeacherId
    });
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateClass({ ...editingClass, ...classForm });
    } else {
      addClass(classForm);
    }
    setShowClassModal(false);
  };

  const handleDeleteClass = (id: string) => {
    const res = deleteClass(id);
    if (!res.success) {
      alert(res.message);
    } else {
      alert(res.message);
    }
  };

  // --- Handlers Subjects ---
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectForm({
      name: '',
      coefficient: 2,
      level: 'Tous',
      color: '#2563eb'
    });
    setShowSubjectModal(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectForm({
      name: sub.name,
      coefficient: sub.coefficient,
      level: sub.level,
      color: sub.color || '#2563eb'
    });
    setShowSubjectModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateSubject({ ...editingSubject, ...subjectForm });
    } else {
      addSubject(subjectForm);
    }
    setShowSubjectModal(false);
  };

  const handleDeleteSubject = (id: string) => {
    const res = deleteSubject(id);
    if (!res.success) {
      alert(res.message);
    } else {
      alert(res.message);
    }
  };

  // --- Handlers Rooms ---
  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({
      name: '',
      capacity: 30,
      type: 'Classe',
      isAvailable: true
    });
    setShowRoomModal(true);
  };

  const handleOpenEditRoom = (rm: Room) => {
    setEditingRoom(rm);
    setRoomForm({
      name: rm.name,
      capacity: rm.capacity,
      type: rm.type,
      isAvailable: rm.isAvailable
    });
    setShowRoomModal(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      updateRoom({ ...editingRoom, ...roomForm });
    } else {
      addRoom(roomForm);
    }
    setShowRoomModal(false);
  };

  const handleDeleteRoom = (id: string) => {
    const res = deleteRoom(id);
    if (!res.success) {
      alert(res.message);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Structure Académique & Équipements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestion complète des classes, des matières avec coefficients et des salles de cours ({academicYear})
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('classes')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'classes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Classes ({classes.length})
          </button>
          <button
            onClick={() => setActiveSubTab('subjects')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'subjects' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matières ({subjects.length})
          </button>
          <button
            onClick={() => setActiveSubTab('rooms')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'rooms' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Salles ({rooms.length})
          </button>
        </div>
      </div>

      {/* ----------------- SUBTAB: CLASSES ----------------- */}
      {activeSubTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">Liste des Classes Ouvertes</h2>
            {canManage && (
              <button
                onClick={handleOpenAddClass}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer une classe</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const studentsInClass = students.filter(
                (s) => s.classId === cls.id && s.status === 'ACTIF' && s.academicYear === academicYear
              );
              const mainTeacher = teachers.find((t) => t.id === cls.mainTeacherId);
              const fillRate = Math.min(100, Math.round((studentsInClass.length / cls.maxCapacity) * 100));

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono font-semibold text-blue-600 uppercase">
                        Niveau {cls.level} · Section {cls.section}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{cls.name}</h3>
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditClass(cls)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-xs space-y-1 text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <span className="text-slate-400">Titulaire :</span>
                      <span className="font-semibold text-slate-800">{mainTeacher?.name || 'Non désigné'}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-slate-400">Année :</span>
                      <span className="font-mono text-slate-700">{cls.academicYear}</span>
                    </p>
                  </div>

                  {/* Capacity Bar */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Effectif actuel</span>
                      <span className="font-mono font-bold text-slate-800">
                        {studentsInClass.length} / {cls.maxCapacity} élèves
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          fillRate >= 95 ? 'bg-rose-500' : fillRate >= 75 ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${fillRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- SUBTAB: SUBJECTS ----------------- */}
      {activeSubTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">Matières Enseignées & Coefficients</h2>
            {canManage && (
              <button
                onClick={handleOpenAddSubject}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une matière</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Matière</th>
                  <th className="py-3 px-4">Coefficient</th>
                  <th className="py-3 px-4">Niveau d'application</th>
                  <th className="py-3 px-4">Enseignants Affectés</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => {
                  const assignedTeachers = teachers.filter(
                    (t) => t.assignedSubjects && t.assignedSubjects.includes(sub.id)
                  );
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: sub.color || '#2563eb' }}
                          ></span>
                          <span className="font-bold text-slate-900">{sub.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-900 text-sm">
                        {sub.coefficient}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {sub.level}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {assignedTeachers.length > 0
                          ? assignedTeachers.map((t) => t.name).join(', ')
                          : 'Aucun titulaire exclusif'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canManage && (
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditSubject(sub)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(sub.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- SUBTAB: ROOMS ----------------- */}
      {activeSubTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">Salles de Cours & Espaces Pédagogiques</h2>
            {canManage && (
              <button
                onClick={handleOpenAddRoom}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une salle</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((rm) => (
              <div
                key={rm.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                      <DoorOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{rm.name}</h3>
                      <span className="text-[11px] text-slate-400">Type : {rm.type}</span>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditRoom(rm)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(rm.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Capacité assise</span>
                  <span className="font-mono font-bold text-slate-800">{rm.capacity} places</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Disponibilité</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" /> Opérationnelle
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">
                {editingClass ? 'Modifier la Classe' : 'Créer une Nouvelle Classe'}
              </h3>
              <button onClick={() => setShowClassModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveClass} className="p-6 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold mb-1">Nom complet de la classe *</label>
                <input
                  type="text"
                  required
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="Ex: CM2 - Section A"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Niveau *</label>
                  <select
                    value={classForm.level}
                    onChange={(e) => setClassForm({ ...classForm, level: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="CP">CP</option>
                    <option value="CE1">CE1</option>
                    <option value="CE2">CE2</option>
                    <option value="CM1">CM1</option>
                    <option value="CM2">CM2</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Section *</label>
                  <select
                    value={classForm.section}
                    onChange={(e) => setClassForm({ ...classForm, section: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Capacité maximale *</label>
                  <input
                    type="number"
                    min={10}
                    max={40}
                    required
                    value={classForm.maxCapacity}
                    onChange={(e) => setClassForm({ ...classForm, maxCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Enseignant titulaire</label>
                  <select
                    value={classForm.mainTeacherId}
                    onChange={(e) => setClassForm({ ...classForm, mainTeacherId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">
                {editingSubject ? 'Modifier la Matière' : 'Ajouter une Matière'}
              </h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveSubject} className="p-6 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold mb-1">Nom de la matière *</label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="Ex: Langue Anglaise"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Coefficient officiel *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    required
                    value={subjectForm.coefficient}
                    onChange={(e) => setSubjectForm({ ...subjectForm, coefficient: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Niveau concerné</label>
                  <input
                    type="text"
                    value={subjectForm.level}
                    onChange={(e) => setSubjectForm({ ...subjectForm, level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Ex: Tous, ou CP, CM2..."
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">
                {editingRoom ? 'Modifier la Salle' : 'Ajouter une Salle de Cours'}
              </h3>
              <button onClick={() => setShowRoomModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveRoom} className="p-6 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold mb-1">Nom / Numéro de la salle *</label>
                <input
                  type="text"
                  required
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="Ex: Salle 202"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Capacité assise *</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    required
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Type de salle</label>
                  <select
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Classe">Classe standard</option>
                    <option value="Informatique">Labo Informatique</option>
                    <option value="Polyvalente">Salle Polyvalente</option>
                    <option value="Sport">Gymnase / Sport</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

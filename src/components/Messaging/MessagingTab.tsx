import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Message, Announcement, UserRole, User } from '../../types';
import {
  Mail,
  Send,
  FileEdit,
  Trash2,
  Lock,
  Megaphone,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Eye,
  FileText,
  ShieldAlert
} from 'lucide-react';

export const MessagingTab: React.FC = () => {
  const {
    messages,
    announcements,
    users,
    students,
    currentUser,
    sendMessage,
    deleteDraft,
    hideMessageForRecipient,
    publishAnnouncement,
    publishCorrectiveAnnouncement,
    logConversationAccess
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'sent' | 'drafts' | 'announcements'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showCorrectiveModal, setShowCorrectiveModal] = useState(false);
  const [targetCorrectionAnn, setTargetCorrectionAnn] = useState<Announcement | null>(null);

  // Compose Message Form
  const [composeData, setComposeData] = useState({
    recipientId: '',
    subject: '',
    body: '',
    studentId: currentUser.linkedStudentId || '',
    isDraft: false
  });

  // Announcement Form
  const [annData, setAnnData] = useState({
    title: '',
    content: '',
    targetRole: 'ALL' as Announcement['targetRole']
  });

  // Corrective Announcement Form
  const [corrTitle, setCorrTitle] = useState('');
  const [corrContent, setCorrContent] = useState('');

  // Eligible Recipients based on RBAC (Section 10.1 & 10.2)
  const getEligibleRecipients = (): User[] => {
    switch (currentUser.role) {
      case 'SUPER_ADMIN':
      case 'SCHOOL_ADMIN':
      case 'ADMIN':
        return users.filter((u) => u.id !== currentUser.id);
      case 'TEACHER':
        // Teachers can message parents of their assigned students
        return users.filter((u) => u.role === 'PARENT');
      case 'PARENT':
        // Parents can message teachers and administration
        return users.filter((u) => u.role === 'TEACHER' || u.role === 'ADMIN' || u.role === 'SCHOOL_ADMIN');
      case 'ACCOUNTANT':
        // Accountant can message parents
        return users.filter((u) => u.role === 'PARENT');
      case 'STUDENT':
        // Students can message administration
        return users.filter((u) => u.role === 'ADMIN' || u.role === 'SCHOOL_ADMIN');
      default:
        return users.filter((u) => u.id !== currentUser.id);
    }
  };

  const eligibleRecipients = getEligibleRecipients();

  // Messages filtered
  const inboxMessages = messages.filter(
    (m) => m.recipientId === currentUser.id && !m.isDraft && !m.hiddenByRecipient
  );

  const sentMessages = messages.filter(
    (m) => m.senderId === currentUser.id && !m.isDraft
  );

  const draftMessages = messages.filter(
    (m) => m.senderId === currentUser.id && m.isDraft
  );

  // Filter announcements for current user's role
  const visibleAnnouncements = announcements.filter((a) => {
    if (a.targetRole === 'ALL') return true;
    if (currentUser.role === 'ADMIN') return true;
    if (a.targetRole === 'PARENTS' && currentUser.role === 'PARENT') return true;
    if (a.targetRole === 'TEACHERS' && currentUser.role === 'TEACHER') return true;
    if (a.targetRole === 'STUDENTS' && currentUser.role === 'STUDENT') return true;
    return false;
  });

  // Open Compose
  const handleOpenCompose = () => {
    setComposeData({
      recipientId: eligibleRecipients[0]?.id || '',
      subject: '',
      body: '',
      studentId: currentUser.linkedStudentId || '',
      isDraft: false
    });
    setShowComposeModal(true);
  };

  // Submit Send or Draft
  const handleSaveMessage = (saveAsDraft: boolean) => {
    if (!composeData.recipientId) {
      alert('Veuillez sélectionner un destinataire valide.');
      return;
    }
    if (!composeData.subject.trim() || !composeData.body.trim()) {
      alert('Veuillez renseigner un objet et un message.');
      return;
    }

    const res = sendMessage({
      ...composeData,
      isDraft: saveAsDraft
    });

    if (!res.success) {
      alert(res.error);
      return;
    }

    setShowComposeModal(false);
    if (!saveAsDraft) {
      alert('Votre message a été envoyé avec succès. Conformément à la règle 10.2, les messages envoyés sont certifiés immuables.');
    }
  };

  // Select message and log access (Section 10.5)
  const handleSelectMessage = (msg: Message) => {
    setSelectedMessage(msg);
    logConversationAccess(`Lecture message id ${msg.id} ("${msg.subject}") par ${currentUser.name}`);
  };

  // Handle corrective announcement
  const handleOpenCorrection = (ann: Announcement) => {
    setTargetCorrectionAnn(ann);
    setCorrTitle(`Rectification : ${ann.title}`);
    setCorrContent(`Veuillez noter la précision suivante concernant notre précédente annonce : `);
    setShowCorrectiveModal(true);
  };

  const handlePublishCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCorrectionAnn) return;
    publishCorrectiveAnnouncement(targetCorrectionAnn.id, corrTitle, corrContent);
    setShowCorrectiveModal(false);
    alert('Annonce corrective publiée avec succès.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Messagerie Sécurisée & Circulaires Officielles</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              {inboxMessages.length} reçus
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Canaux cloisonnés RBAC, immuabilité des échanges, annonces officielles et traçabilité légale
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => {
                setAnnData({ title: '', content: '', targetRole: 'ALL' });
                setShowAnnouncementModal(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl flex items-center gap-1.5 transition"
            >
              <Megaphone className="w-3.5 h-3.5 text-purple-600" />
              <span>Publier Circulaire</span>
            </button>
          )}

          <button
            onClick={handleOpenCompose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-2 shadow-xs transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nouveau Message</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs text-xs font-semibold gap-1">
        <button
          onClick={() => {
            setActiveSubTab('inbox');
            setSelectedMessage(null);
          }}
          className={`px-4 py-2 rounded-xl transition ${
            activeSubTab === 'inbox' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Boîte de réception ({inboxMessages.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab('sent');
            setSelectedMessage(null);
          }}
          className={`px-4 py-2 rounded-xl transition ${
            activeSubTab === 'sent' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Messages Envoyés ({sentMessages.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab('drafts');
            setSelectedMessage(null);
          }}
          className={`px-4 py-2 rounded-xl transition ${
            activeSubTab === 'drafts' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Brouillons ({draftMessages.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab('announcements');
            setSelectedMessage(null);
          }}
          className={`px-4 py-2 rounded-xl transition ${
            activeSubTab === 'announcements' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Circulaires & Annonces ({visibleAnnouncements.length})
        </button>
      </div>

      {/* ----------------- ANNOUNCEMENTS VIEW ----------------- */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>Règle d'immuabilité (Chapitre 10.3) :</strong> Une annonce officielle publiée ne peut être ni altérée ni supprimée. En cas de modification, une annonce corrective est ajoutée.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs space-y-3 ${
                  ann.isCorrective ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Cible : {ann.targetRole === 'ALL' ? 'Tous les membres' : ann.targetRole}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1.5">{ann.title}</h3>
                  </div>
                  {currentUser.role === 'ADMIN' && !ann.isCorrective && (
                    <button
                      onClick={() => handleOpenCorrection(ann)}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-bold transition"
                    >
                      Rectifier
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>

                <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
                  <span>Auteur : {ann.authorName}</span>
                  <span>{new Date(ann.publishedAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- MESSAGES INBOX / SENT / DRAFTS ----------------- */}
      {activeSubTab !== 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List panel */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800">
              <span>
                {activeSubTab === 'inbox' && 'Messages reçus'}
                {activeSubTab === 'sent' && 'Messages envoyés'}
                {activeSubTab === 'drafts' && 'Brouillons non expédiés'}
              </span>
              <span className="text-slate-400 font-normal">
                {activeSubTab === 'inbox' && `${inboxMessages.length} messages`}
                {activeSubTab === 'sent' && `${sentMessages.length} messages`}
                {activeSubTab === 'drafts' && `${draftMessages.length} brouillons`}
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {(activeSubTab === 'inbox' ? inboxMessages : activeSubTab === 'sent' ? sentMessages : draftMessages).map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleSelectMessage(m)}
                  className={`p-4 cursor-pointer transition text-xs space-y-1 ${
                    selectedMessage?.id === m.id
                      ? 'bg-blue-50/80 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-900">
                      {activeSubTab === 'sent' ? `À : ${m.recipientName}` : m.senderName}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {m.sentAt ? new Date(m.sentAt).toLocaleDateString('fr-FR') : 'Brouillon'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 truncate">{m.subject}</h4>
                  <p className="text-slate-500 line-clamp-1">{m.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reading panel */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-900">{selectedMessage.subject}</h3>
                    <div className="flex items-center gap-1">
                      {/* Section 10.2: Immutability badge */}
                      {!selectedMessage.isDraft && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          <Lock className="w-3 h-3 text-slate-500" />
                          Message Scellé
                        </span>
                      )}

                      {/* Recipient hide */}
                      {activeSubTab === 'inbox' && (
                        <button
                          onClick={() => {
                            hideMessageForRecipient(selectedMessage.id);
                            setSelectedMessage(null);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg text-xs"
                          title="Masquer de ma boîte de réception"
                        >
                          Masquer
                        </button>
                      )}

                      {/* Draft delete */}
                      {selectedMessage.isDraft && (
                        <button
                          onClick={() => {
                            deleteDraft(selectedMessage.id);
                            setSelectedMessage(null);
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                          title="Supprimer ce brouillon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                    <p>
                      <strong>De :</strong> {selectedMessage.senderName} ({selectedMessage.senderRole})
                    </p>
                    <p>
                      <strong>À :</strong> {selectedMessage.recipientName} ({selectedMessage.recipientRole})
                    </p>
                    {selectedMessage.sentAt && (
                      <p>
                        <strong>Date d'expédition :</strong> {new Date(selectedMessage.sentAt).toLocaleString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line py-2">
                  {selectedMessage.body}
                </div>

                {selectedMessage.downloadUrl && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-emerald-900 font-bold">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span>Reçu officiel de paiement disponible</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold">
                      Réf: {selectedMessage.downloadUrl.replace('#', '')}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 text-xs">
                Sélectionnez un message dans la liste pour afficher son contenu scellé.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Compose Message */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Rédiger un Nouveau Message Sécurisé</h3>
              <button onClick={() => setShowComposeModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold mb-1">Destinataire (autorisé par rôle) *</label>
                <select
                  value={composeData.recipientId}
                  onChange={(e) => setComposeData({ ...composeData, recipientId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                >
                  {eligibleRecipients.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role === 'TEACHER' ? 'Enseignant' : u.role === 'PARENT' ? 'Parent' : u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Objet du message *</label>
                <input
                  type="text"
                  required
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  placeholder="Ex: Suivi des devoirs ou demande de rendez-vous"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Corps du message *</label>
                <textarea
                  rows={5}
                  required
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs leading-relaxed"
                  placeholder="Votre message ici..."
                ></textarea>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                🔒 <strong>Contrôle d'intégrité (10.2) :</strong> Dès l'envoi, le message sera définitivement scellé dans l'historique et ne pourra plus être modifié ni supprimé par son expéditeur.
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleSaveMessage(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Enregistrer en Brouillon</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowComposeModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveMessage(false)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer Scellé</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Publish Announcement (Admin) */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-purple-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Publier une Circulaire Officielle</h3>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-purple-300 hover:text-white">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                publishAnnouncement(annData);
                setShowAnnouncementModal(false);
              }}
              className="p-6 space-y-4 text-xs text-slate-800"
            >
              <div>
                <label className="block font-bold mb-1">Titre de l'annonce *</label>
                <input
                  type="text"
                  required
                  value={annData.title}
                  onChange={(e) => setAnnData({ ...annData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  placeholder="Ex: Calendrier des vacances et réunions pédagogiques"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Destinataires cibles *</label>
                <select
                  value={annData.targetRole}
                  onChange={(e) => setAnnData({ ...annData, targetRole: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="ALL">Tous les acteurs (Parents, Enseignants, Élèves)</option>
                  <option value="PARENTS">Parents uniquement</option>
                  <option value="TEACHERS">Enseignants uniquement</option>
                  <option value="STUDENTS">Élèves uniquement</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Contenu officiel *</label>
                <textarea
                  rows={4}
                  required
                  value={annData.content}
                  onChange={(e) => setAnnData({ ...annData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  placeholder="Texte de la circulaire administrative..."
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl"
                >
                  Diffuser l'Annonce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Corrective Announcement */}
      {showCorrectiveModal && targetCorrectionAnn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-amber-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Publier un Rectificatif Officiel</h3>
              <button onClick={() => setShowCorrectiveModal(false)} className="text-amber-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handlePublishCorrection} className="p-6 space-y-4 text-xs text-slate-800">
              <p className="text-slate-600">
                Rectification rattachée à l'annonce d'origine : <span className="font-bold">"{targetCorrectionAnn.title}"</span>
              </p>
              <div>
                <label className="block font-bold mb-1">Titre de la rectification *</label>
                <input
                  type="text"
                  required
                  value={corrTitle}
                  onChange={(e) => setCorrTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Texte rectificatif *</label>
                <textarea
                  rows={4}
                  required
                  value={corrContent}
                  onChange={(e) => setCorrContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                ></textarea>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCorrectiveModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl"
                >
                  Diffuser le Rectificatif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

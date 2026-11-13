# EduSaaS — Plateforme Professionnelle de Gestion Scolaire Multi-Écoles (SaaS)

EduSaaS est une plateforme logicielle moderne en mode **SaaS Multi-Tenant** dédiée à la gestion intégrale des établissements scolaires (écoles primaires, collèges, instituts privés).

Chaque école inscrite dispose de son propre espace étanche, de ses propres effectifs (élèves, enseignants, classes), de son administration, de ses finances et de ses statistiques, avec une garantie absolue d'isolation des données via `school_id`.

---

## 1. Architecture du Système

Le projet applique une séparation stricte entre le **Frontend** et le **Backend** :

```
school-management/
│
├── client/ (ou racine Vite)
│   ├── src/
│   │   ├── components/      # Composants UI (Dashboard, Élèves, Académique, Emploi du temps, Notes, Absences, Devoirs, Finances, Messagerie, Audit)
│   │   ├── context/         # AppContext (synchronisation REST API & état multi-tenant)
│   │   ├── pages/           # Pages d'authentification, inscription école, dashboard Super Admin
│   │   ├── services/        # Client Axios apiClient avec intercepteurs JWT
│   │   ├── types/           # Définitions TypeScript
│   │   └── data/            # Données de démonstration initiales
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── config/          # Configurations JWT et variables d'environnement
│   │   ├── models/          # Schéma PostgreSQL (schema.sql) & Adaptateur DB persistant (database.json)
│   │   ├── controllers/     # Contrôleurs MVC (Auth, SuperAdmin, School, Students, Academics, Schedule, Grades, Absences, Finances, Homework, Messages)
│   │   ├── routes/          # Master router Express avec guards d'authentification et de tenant
│   │   ├── middlewares/     # Auth JWT, RBAC (requireRole), Isolation Multi-Tenant (enforceTenant)
│   │   └── app.ts           # Instance Express avec CORS et JSON parser
│   ├── data/
│   │   └── database.json    # Persistance disque multi-tenant (sans localStorage)
│   ├── package.json
│   └── server.js            # Entrée autonome Node.js (port 5000)
│
├── server.ts                # Entrée fullstack unifiée (Express + Vite sur le port 3000)
└── README.md                # Documentation complète
```

---

## 2. Rôles et Matrice des Permissions (RBAC)

| Rôle | Niveau | Description & Accès |
|---|---|---|
| **SUPER_ADMIN** | Plateforme | Administration globale du SaaS. Consultation de toutes les écoles inscrites, approbation des demandes (Pending → Active), rejet, suspension ou suppression d'écoles, statistiques globales consolidées. |
| **SCHOOL_ADMIN** | Établissement | Directeur/trice de l'école. Gestion des élèves, des enseignants, des classes, des salles, des matières, validation des inscriptions, configuration scolaire et consultation des audits. |
| **TEACHER** | Pédagogique | Enseignant rattaché à une école. Consultation de ses classes assignées, de son emploi du temps, saisie des notes et moyennes, publication et correction des devoirs, gestion des présences. |
| **STUDENT** | Élève | Consultation de son profil, de sa classe, de ses devoirs à rendre avec dépôt en ligne, de ses notes/bulletins et de son emploi du temps. |
| **PARENT** | Famille | Suivi scolaire de ses enfants, dépôt de devoirs, justification d'absences, paiement des frais de scolarité et téléchargement des reçus officiels. |
| **ACCOUNTANT** | Trésorerie | Saisie des encaissements, suivi du plan tarifaire, émission automatique des reçus numérotés et notifications aux parents. |

---

## 3. Workflow d'Inscription d'un Établissement

1. **Formulaire d'inscription public** (`/auth/register-school`) :
   - Nom officiel de l'école
   - Adresse physique complète
   - Email professionnel
   - Téléphone
   - Nom & Prénom du responsable
   - Mot de passe administrateur sécurisé (haché via `bcryptjs`)
2. **Statut initial `PENDING`** :
   - L'école est enregistrée en base mais **bloquée à la connexion**.
   - Si l'administrateur tente de se connecter, le middleware retourne : `Votre établissement est en attente de validation par le Super Administrateur.`
3. **Approbation Super Admin** :
   - Le Super Admin examine la demande sur son tableau de bord et clique sur **Approuver**.
   - Le statut passe à `ACTIVE`. Le compte administrateur est activé et l'accès à l'espace de gestion est immédiatement ouvert.

---

## 4. Isolation des Données (Multi-Tenancy)

- Chaque table de la base de données (`students`, `classes`, `subjects`, `rooms`, `schedule_slots`, `grades`, `absences`, `payments`, `homeworks`, `messages`) contient une colonne clé étrangère `school_id`.
- Le middleware `enforceTenant` extrait l'identifiant de l'école depuis le token JWT vérifié (`req.user.school_id`).
- Aucun client ne peut injecter ou usurper le `school_id` d'un autre établissement : les filtres SQL/BD sont obligatoirement appliqués côté serveur.
- Si une école est dans le statut `SUSPENDED` ou `REJECTED`, l'accès API est immédiatement refusé (HTTP 403).

---

## 5. Démarrage de l'Application

### Option A — Mode Fullstack Développeur (Recommandé dans AI Studio)
Un seul serveur unifié lance le backend Express et le middleware Vite :
```bash
npm run dev
# L'application est accessible sur http://localhost:3000
```

### Option B — Démarrage Séparé (Frontend + Backend Indépendants)
**1. Démarrer le Backend Express :**
```bash
cd server
npm install
npm run dev
# Le serveur API REST démarre sur http://localhost:5000
```

**2. Démarrer le Frontend React Vite :**
```bash
# Dans un autre terminal à la racine
npm install
npm run dev
# Le client web démarre sur http://localhost:3000 et communique avec l'API
```

---

## 6. Comptes de Démonstration Pré-configurés (Connexion en 1 clic)

Vous pouvez tester l'ensemble des rôles directement depuis les boutons d'accès rapide de la page de connexion :

| Rôle | Identifiant (Email) | Mot de passe | Statut / Établissement |
|---|---|---|---|
| **Super Admin** | `superadmin@edusaas.com` | `SuperAdmin2026!` | Super Admin Global Plateforme |
| **School Admin (École Chebbi)** | `direction@ecole-chebbi.tn` | `Admin2026!` | École Active 1 (Sousse) |
| **School Admin (École Étoiles)** | `direction@etoiles-avenir.tn` | `Admin2026!` | École Active 2 (Tunis) |
| **School Admin (Al Manar - En attente)** | `contact@almanar-sfax.tn` | `Pending2026!` | École en attente d'approbation (Pending) |
| **Enseignant (M. Mansour)** | `youssef.mansour@ecole-chebbi.tn` | `Teacher2026!` | Enseignant École Chebbi |
| **Élève (Rayan Ben Salem)** | `rayan.bensalem@eleve-chebbi.tn` | `Student2026!` | Élève École Chebbi |

---

## 7. Fonctionnalités Scolaires Incluses

- **Gestion des Élèves & Inscriptions** : dossiers complets, photos, matricules automatiques, statuts (Actif, Pré-inscription, Radié/Archivé).
- **Structure Académique** : classes par niveaux (CP, CE1, CE2, CM1, CM2), matières avec coefficients, salles avec capacités.
- **Emploi du temps & Détection des Conflits** : algorithme temps réel bloquant les chevauchements enseignant, salle ou classe.
- **Notes, Moyennes Pondérées & Bulletins Officiels** : calcul automatique des moyennes trimestrielles avec coefficients et génération de bulletins imprimables/PDF.
- **Absences & Retards** : saisie des heures d'absence, dépôt de justification par les parents, validation administrative.
- **Gestion Financière** : émission de reçus numérotés uniques (`REC-YYYY-XXXXX`), calcul des soldes restant dus, notification automatique aux parents.
- **Cahier de Devoirs (Homework)** : publication de devoirs avec date limite, dépôt des travaux, notation avec feedback enseignant, publication du corrigé type et accusé "Vu par le parent".
- **Messagerie Interne Sécurisée & Annonces** : respect des règles de communication strictes (Enseignant ↔ Parent, Admin ↔ Tous), scellement des messages envoyés, annonces correctives horodatées.
- **Journal d'Audit (Logs)** : traçabilité complète de chaque action (création, modification, suppression, consultation) avec horodatage ISO et identité de l'auteur.

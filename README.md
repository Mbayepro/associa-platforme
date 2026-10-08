# ASSOCIA — Phase 1 + Phase 2

Socle multi-tenant pour la plateforme ASSOCIA. Organisation pilote : **ADS**.

## Ce qui est livré

**Phase 1 — Fondations**
- Authentification (inscription / connexion) via Supabase Auth
- Création d'organisation avec onboarding (fonction RPC atomique : org + OWNER)
- Architecture multi-tenant : `organizations`, `profiles`, `organization_members`
- Row Level Security complète (un utilisateur ne peut jamais lire/modifier les
  données d'une organisation à laquelle il n'appartient pas)
- Dashboard avec branding dynamique (couleurs de l'organisation injectées en
  CSS, aucune couleur ADS codée en dur dans le code)
- Seed de démonstration ADS (`0002_seed_ads_demo.sql`)

**Phase 2 — Membres et Cartes**
- Module Membres complet : liste, ajout, fiche détail
- Numérotation automatique et atomique (`ADS-2026-000001`, verrouillée en
  base pour éviter les doublons en cas de créations simultanées)
- Génération de carte membre avec QR code réel, aux couleurs de
  l'organisation (dégradé vert/bleu pour ADS)
- Page de vérification publique `/verify/card/{token}` — accessible sans
  connexion, n'affiche que nom / organisation / numéro / statut / expiration
- Révocation de carte, avec mise à jour immédiate de la page de vérification
  (`CARTE RÉVOQUÉE`)
- Aucune policy RLS publique sur `member_cards` ou `members` : la
  vérification passe uniquement par une fonction `SECURITY DEFINER` qui ne
  renvoie que les champs strictement nécessaires

**Phase 3 — Formations, Événements et Présences**
- Modules Formations et Événements : création, liste, fiche détail
- Inscription de membres (gérée par un administrateur/manager — le
  portail d'auto-inscription des membres viendra avec les comptes membres,
  voir limite ci-dessous)
- Scanner de présence réel : caméra (via `jsqr`) ou saisie manuelle du
  lien/token de la carte membre
- La présence est enregistrée via une fonction serveur unique
  (`record_attendance`) qui vérifie que la carte est active, empêche les
  doublons de scan et met à jour automatiquement le statut d'inscription
  en `ATTENDED`
- Le scanner réutilise le `verification_token` déjà présent sur la carte
  membre (même QR que pour `/verify/card/{token}`) — un seul système de
  QR pour tout, comme prévu par le cahier des charges

Ce qui n'est **pas encore construit** (prochaines phases, voir plus bas) :
Attestations, Impact, Partenaires, Actualités, Super Admin SaaS. Éditeur
visuel de templates de carte (la Phase 2 utilise un design fixe basé sur
les couleurs de l'organisation ; l'éditeur recto/verso configurable
viendra plus tard). Le QR code des cartes utilise actuellement une API
publique tierce (`api.qrserver.com`) — à remplacer par une génération
locale (librairie `qrcode`) avant mise en production. Portail
d'auto-inscription pour les membres (nécessite de lier `members` à des
comptes `auth.users`, actuellement `members` est un carnet géré par les
admins/managers sans connexion propre).

## Mise en route

### 1. Créer un projet Supabase
Sur https://supabase.com, créer un nouveau projet, puis récupérer :
- `Project URL`
- `anon public key`
- `service_role key` (à garder secrète)

### 2. Appliquer les migrations
Dans l'éditeur SQL de Supabase (ou via la CLI `supabase db push`), exécuter
dans l'ordre :
1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_seed_ads_demo.sql`
3. `supabase/migrations/0003_members_and_cards.sql`
4. `supabase/migrations/0004_trainings_events_attendance.sql`

### 3. Variables d'environnement
Copier `.env.example` vers `.env.local` et renseigner les 3 clés.

### 4. Installer et lancer
```bash
npm install
npm run dev
```
Ouvrir http://localhost:3000

### 5. Tester le scénario Phase 1
1. Créer un compte sur `/signup`
2. Créer une organisation sur `/onboarding`
3. Arriver sur `/dashboard` et voir les vraies données (comptes rattachés,
   nom de l'organisation, couleurs appliquées)

### 6. (Optionnel) Rejoindre la démo ADS
Depuis l'éditeur SQL Supabase, connecté avec un utilisateur créé :
```sql
select public.join_demo_ads_as_owner();
```
Cela rattache le compte courant comme OWNER de l'organisation de démo ADS
(vert/bleu, données marquées `is_demo = true`).

### 7. Tester le scénario Phase 2
1. Depuis `/dashboard/members`, cliquer sur « + Ajouter un membre »
2. Remplir prénom/nom/fonction (ex : Gade Gaye, Coordonnateur) → le numéro
   `ADS-2026-000001` est généré automatiquement
3. Sur la fiche membre, cliquer sur « + Générer une carte »
4. La carte s'affiche avec un vrai QR code fonctionnel
5. Copier le lien `/verify/card/{token}` affiché et l'ouvrir dans un onglet
   privé (sans connexion) → la page affiche « Carte authentifiée »
6. Cliquer sur « Révoquer » puis recharger la page de vérification →
   elle affiche maintenant « Carte révoquée »

### 8. Tester le scénario Phase 3
1. Depuis `/dashboard/trainings`, créer une formation (titre + date)
2. Sur la fiche formation, inscrire Gade Gaye
3. Cliquer sur « Ouvrir le scanner de présence pour cette formation »
4. Coller le lien de vérification de sa carte (ou scanner le QR via la
   caméra) → « PRÉSENCE ENREGISTRÉE » s'affiche, et son inscription passe
   à `ATTENDED`
5. Rescanner immédiatement la même carte → message « Présence déjà
   enregistrée » (pas de doublon)
6. Même test possible depuis `/dashboard/events` pour un événement

## Sécurité — points vérifiés dans cette phase

- Toutes les tables ont RLS activé (`enable row level security`)
- Aucune policy publique dangereuse
- La clé `service_role` n'est utilisée que côté serveur (`createAdminClient`),
  jamais exposée au navigateur
- La création d'organisation + OWNER se fait dans une transaction atomique
  (fonction `SECURITY DEFINER`), pour éviter un état intermédiaire non protégé
- Le middleware protège `/dashboard` et `/onboarding` des utilisateurs non
  connectés
- Le scan de présence vérifie que la carte appartient bien à la même
  organisation que la session scannée, avant tout enregistrement

## Prochaines phases (rappel de la feuille de route)

- **Phase 4** — Attestations + vérification publique, Impact, Partenaires,
  Actualités
- **Phase 5** — Plans SaaS, limites par plan, dashboard SUPER_ADMIN

## Si tu continues avec Gemini Pro

Donne-lui ce dossier complet + ce README, et demande-lui de construire
uniquement la **Phase 2** en respectant :
- le schéma et les conventions déjà en place (RLS, `organization_id` partout,
  fonctions `SECURITY DEFINER` pour les opérations sensibles)
- l'interdiction de casser l'existant (voir section "NE PAS TOUT CASSER" du
  cahier des charges original)

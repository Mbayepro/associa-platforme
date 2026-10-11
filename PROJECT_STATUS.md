# PROJECT STATUS — ASSOCIA PLATFORME

**Dernière mise à jour :** 11 Octobre 2026  
**Statut actuel :** P0 TRAITÉ & VALIDÉ (Phase d'alignement exécutée)

---

## 1. Inventaire Réel du Codebase

### 1.1. Migrations Supabase
| Fichier | Nom / Description | Objets créés / Rôle |
|---|---|---|
| `0001_init.sql` | Init & Core Auth | `organizations`, `organization_members`, `user_profiles`, rôles enum, fonctions RLS |
| `0002_seed_ads_demo.sql` | Seed Démo ADS | Organisation démo ADS et compte test |
| `0003_members_and_cards.sql` | Membres et Cartes | `members`, `member_cards`, RPCs `create_member`, `issue_member_card`, `revoke_member_card` |
| `0004_trainings_events_attendance.sql` | Formations, Événements, Présences | `trainings`, `events`, présences, RPC `record_attendance` |
| `0005_phase4_attestations_impact_partners_news.sql` | Attestations, Impact, Partenaires, Posts | `certificates`, `actions`, `impact_metrics`, `partners`, `posts`, RPCs attestations |
| `0006_fix_rls_isolation.sql` | Correctif RLS & Impact Public | RLS isolation et RPC `get_organization_public_impact` |
| `0006_issue_certificates_bulk.sql` | Attestations en masse | RPC `issue_bulk_certificates` |
| `0007_bulk_issue_cards_and_storage.sql` | Cartes en masse & Bucket members | Bucket `members` (public), RLS storage, RPC `issue_missing_member_cards` |
| `0008_organizations_bucket.sql` | Bucket Logos Organisations | Bucket `organizations` (public, 2Mo max), RLS upload admin |
| `0009_fix_base64url.sql` | Correctif encodage base64 | Helper SQL `base64url_encode` |
| `0010_member_prefix.sql` | Préfixe et sigle d'adhérent | Colonne `member_prefix`, mise à jour séquence adhérent |
| `0011_update_create_org.sql` | Paramètre sigle à la création d'org | Mise à jour de `create_organization_with_owner` avec `p_member_prefix` |
| `0012_elearning_courses.sql` | E-learning / Petits cours | Tables de base e-learning (`courses`, `course_modules`, `course_lessons`, etc.) |
| `0013_fix_actions_and_courses_rls.sql` | RLS Actions et Visibilité Cours | Insert actions membres & lecture publique cours |
| `0014_drop_old_create_org_function.sql` | Résolution PGRST203 | Drop de l'ancienne signature à 6 paramètres de `create_organization_with_owner` |
| `0015_elearning_alignment_and_quiz.sql` | *(Préparée - non appliquée)* | Alignement colonnes, tables quiz, bucket `courses` |

### 1.2. Fonctions SQL `SECURITY DEFINER`
1. `public.handle_new_user()` (`0001_init.sql:85`)
2. `public.create_organization_with_owner(...)` (`0011_update_create_org.sql:12`, nettoyée par `0014`)
3. `public.is_org_member(uid, org_id)` (`0001_init.sql:122`)
4. `public.is_org_admin(uid, org_id)` (`0001_init.sql:133`)
5. `public.is_super_admin(uid)` (`0001_init.sql:143`)
6. `public.get_user_organizations(uid)` (`0001_init.sql:156`)
7. `public.can_scan(uid, org_id)` (`0004_trainings_events_attendance.sql:146`)
8. `public.create_member(...)` (`0003_members_and_cards.sql:183`)
9. `public.issue_member_card(p_member_id)` (`0003_members_and_cards.sql:223`)
10. `public.revoke_member_card(p_card_id, p_reason)` (`0003_members_and_cards.sql:260`)
11. `public.get_card_public_info(p_token)` (`0003_members_and_cards.sql:292`)
12. `public.issue_missing_member_cards(p_org_id)` (`0007_bulk_issue_cards_and_storage.sql:36`)
13. `public.record_attendance(...)` (`0004_trainings_events_attendance.sql:228`)
14. `public.issue_certificate(...)` (`0005_phase4_attestations_impact_partners_news.sql:249`)
15. `public.revoke_certificate(...)` (`0005_phase4_attestations_impact_partners_news.sql:274`)
16. `public.get_certificate_public_info(...)` (`0005_phase4_attestations_impact_partners_news.sql:301`)
17. `public.issue_bulk_certificates(...)` (`0006_issue_certificates_bulk.sql:14`)
18. `public.get_organization_public_impact(...)` (`0006_fix_rls_isolation.sql:28`)

---

## 2. Comparaison au Cahier des Charges

| Module | Statut | Preuve dans le code |
|---|---|---|
| **Auth & Onboarding** | **PARTIEL** | `app/(auth)/signup/page.tsx`, `app/onboarding/onboarding-form.tsx` |
| **Paramètres Organisation** | **PARTIEL** | `app/dashboard/settings/settings-client.tsx` |
| **Membres** | **PARTIEL** | `app/dashboard/members/page.tsx`, `app/dashboard/members/[id]/page.tsx` |
| **Cartes** | **FAIT** | `app/dashboard/cards/cards-client.tsx`, `components/card-visual.tsx` |
| **Formations / Événements** | **PARTIEL** | `app/dashboard/trainings/page.tsx`, `app/dashboard/events/page.tsx`, `app/dashboard/scan/scanner-client.tsx` |
| **Attestations** | **PARTIEL** | `app/dashboard/certificates/page.tsx`, `components/certificate-visual.tsx` |
| **Impact, Partenaires, Actualités** | **PARTIEL** | `app/dashboard/impact/page.tsx`, `app/dashboard/partners/page.tsx`, `app/dashboard/posts/page.tsx` |
| **Espace membre ("Ma carte")** | **MANQUANT** | *Aucune route membre dédiée sans compte* |
| **Rôles & Permissions UI** | **PARTIEL** | `app/dashboard/sidebar.tsx`, `app/dashboard/mobile-nav.tsx` |
| **Notifications, Audit logs, i18n** | **MANQUANT** | *Inexistant* |
| **Stockage Supabase** | **FAIT** | `0007_bulk_issue_cards_and_storage.sql`, `0008_organizations_bucket.sql` |
| **Dashboard** | **PARTIEL** | `app/dashboard/page.tsx`, `app/dashboard/mobile-nav.tsx` |
| **Landing, Tarifs, FAQ, SEO, PWA** | **PARTIEL** | `app/page.tsx`, `app/layout.tsx` |
| **Phase 5 (Subscriptions, Plans, Super Admin)** | **MANQUANT** | *Inexistant* |

---

## 3. Scénario d'Acceptation (22 Étapes du Cahier des Charges)

| N° | Étape du scénario | Résultat | Justification / Exécution |
|---|---|---|---|
| 1 | Inscription utilisateur (email/password) | **PASS** | Exécutée avec succès dans `test-rls.ts` via Supabase Auth (`signUp`) |
| 2 | Onboarding : création organisation avec slug et sigle déduit | **PASS** | Exécutée avec succès dans `test-rls.ts` via RPC `create_organization_with_owner` |
| 3 | Personnalisation identité visuelle (logo, couleurs) | **NON TESTÉ** | Code fonctionnel dans settings mais non simulé de bout en bout |
| 4 | Affichage du Dashboard avec KPI à zéro | **NON TESTÉ** | Page prête, non exécutée sous navigateur |
| 5 | Création d'un membre avec génération du numéro (ex: ADS-0001) | **PASS** | Exécutée avec succès dans `test-rls.ts` (Member ID généré) |
| 6 | Upload de la photo du membre | **NON TESTÉ** | Bucket `members` prêt avec RLS, non testé avec fichier binaire réel |
| 7 | Génération de la carte de membre | **NON TESTÉ** | RPC disponible, non déclenchée dans le test automatisé |
| 8 | Visualisation carte recto/verso avec flip 3D | **NON TESTÉ** | Rendu CSS 3D présent |
| 9 | Impression d'une carte au format CR80 (PVC) | **NON TESTÉ** | Styles `@media print` prêts, rendu PDF imprimante non validé |
| 10 | Impression d'une planche A4 de cartes | **NON TESTÉ** | Grille d'impression prête dans `/dashboard/cards` |
| 11 | Scan du QR code de la carte (URL publique de vérification) | **NON TESTÉ** | Route `/verify/card/[token]` prête |
| 12 | Création d'une formation avec date et formateur | **NON TESTÉ** | Formulaire présent |
| 13 | Inscription de membres à la formation | **NON TESTÉ** | Formulaire présent |
| 14 | Pointage des présences via caméra scanner QR | **NON TESTÉ** | `record_attendance` non validé avec flux vidéo caméra |
| 15 | Pointage manuel par saisie du jeton | **NON TESTÉ** | Code présent |
| 16 | Génération d'attestations de formation | **NON TESTÉ** | RPC testée en blocage de sécurité, non testée en émission légitime |
| 17 | Aperçu et impression de l'attestation A4 paysage | **NON TESTÉ** | Composant visual prêt |
| 18 | Vérification publique de l'authenticité de l'attestation | **NON TESTÉ** | Route `/verify/certificate/[token]` prête |
| 19 | Révocation d'une attestation et vérification du statut révoqué | **NON TESTÉ** | Bouton présent, non validé |
| 20 | Saisie d'une action et indicateur d'impact | **PASS** | Exécutée avec succès dans `test-rls.ts` (Action & Impact créés) |
| 21 | Consultation de la page publique `/[slug]/impact` | **PASS** | Exécutée avec succès dans `test-rls.ts` via RPC publique anonyme |
| 22 | Vérification de l'étanchéité stricte RLS multi-tenant | **PASS** | Exécutée avec succès dans `test-rls.ts` (aucune fuite entre Org A et Org B) |

---

## 4. Bilan P0 Exécuté

1. **P0-1 Résolution Conflit RPC :**
   - Migration `0014_drop_old_create_org_function.sql` créée pour supprimer l'ancienne signature à 6 paramètres.
   - Script `test-rls.ts` exécuté avec **OVERALL RESULT: PASS**.
2. **P0-2 Module Cours & Cohérence :**
   - Écarts réels constatés et documentés.
   - Entrée "Cours" / "E-Learning" masquée dans `sidebar.tsx`, `mobile-nav.tsx` et `menu/page.tsx` derrière `NEXT_PUBLIC_ENABLE_COURSES=false` (par défaut).
   - Migration `0015_elearning_alignment_and_quiz.sql` préparée sans être appliquée.
   - Tests d'isolation de cours ajoutés dans `test-rls.ts` et validés avec succès.
3. **P0-3 Tableaux d'Acceptation & Audit :**
   - Tableaux complets étape 2 et étape 4 intégrés.
4. **P0-4 Déploiement Vercel & Liste de Vérification QR :**
   - Procédure de déploiement et variables documentées.

---

## 5. Commandes de Test & Validation

```bash
# Exécution du test d'étanchéité multi-tenant
npx tsx test-rls.ts

# Lancement local
npm run dev
```

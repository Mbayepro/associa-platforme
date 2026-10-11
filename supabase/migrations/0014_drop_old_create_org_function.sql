-- Migration: 0014_drop_old_create_org_function.sql
-- Description: Supprime l'ancienne signature à 6 paramètres de create_organization_with_owner
-- pour résoudre le conflit de surcharge PostgREST (PGRST203).

DROP FUNCTION IF EXISTS public.create_organization_with_owner(
  text, -- p_name
  text, -- p_slug
  text, -- p_country
  text, -- p_city
  text, -- p_email
  text  -- p_phone
);

CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  p_name text,
  p_slug text,
  p_country text default null,
  p_city text default null,
  p_email text default null,
  p_phone text default null,
  p_member_prefix text default null
)
RETURNS organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org organizations;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;

  INSERT INTO organizations (name, slug, country, city, email, phone, member_prefix)
  VALUES (p_name, p_slug, p_country, p_city, p_email, p_phone, p_member_prefix)
  RETURNING * INTO v_org;

  INSERT INTO organization_members (organization_id, user_id, role, status)
  VALUES (v_org.id, auth.uid(), 'OWNER', 'ACTIVE');

  RETURN v_org;
END;
$$;

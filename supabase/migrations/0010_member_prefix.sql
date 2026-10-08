-- 1. Add member_prefix column to organizations
ALTER TABLE public.organizations 
ADD COLUMN member_prefix text;

-- 2. Add CHECK constraint for 2 to 6 uppercase alphanumeric characters
ALTER TABLE public.organizations 
ADD CONSTRAINT check_member_prefix 
CHECK (member_prefix ~ '^[A-Z0-9]{2,6}$');

-- 3. Update generate_member_number to use member_prefix or upper(slug)
CREATE OR REPLACE FUNCTION public.generate_member_number(p_organization_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefix text;
  v_seq integer;
  v_year text := to_char(current_date, 'YYYY');
BEGIN
  SELECT coalesce(member_prefix, upper(slug)), member_sequence + 1
  INTO v_prefix, v_seq
  FROM organizations
  WHERE id = p_organization_id
  FOR UPDATE;

  IF v_prefix IS NULL THEN
    RAISE EXCEPTION 'Organisation introuvable';
  END IF;

  UPDATE organizations
  SET member_sequence = v_seq
  WHERE id = p_organization_id;

  RETURN v_prefix || '-' || v_year || '-' || lpad(v_seq::text, 6, '0');
END;
$$;

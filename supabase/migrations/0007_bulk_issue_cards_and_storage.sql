-- Create the bucket for member photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('members', 'members', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public viewing of member photos
CREATE POLICY "Public Access to Member Photos" ON storage.objects
FOR SELECT
USING (bucket_id = 'members');

-- Policy to allow authenticated users to upload photos
CREATE POLICY "Auth Users Can Upload Member Photos" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'members');

-- Policy to allow authenticated users to update photos
CREATE POLICY "Auth Users Can Update Member Photos" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'members');

-- Policy to allow authenticated users to delete photos
CREATE POLICY "Auth Users Can Delete Member Photos" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'members');


-- Create bulk issue cards RPC
create or replace function public.issue_missing_member_cards(
  p_org_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member record;
  v_count integer := 0;
begin
  -- Vérifier les permissions
  if not exists (
    select 1 from organization_members 
    where organization_id = p_org_id 
    and user_id = auth.uid() 
    and role in ('OWNER', 'ADMIN')
    and status = 'ACTIVE'
  ) then
    raise exception 'Unauthorized';
  end if;

  for v_member in 
    select m.id 
    from members m
    left join member_cards c on c.member_id = m.id and c.status = 'ACTIVE'
    where m.organization_id = p_org_id 
    and m.deleted_at is null
    and c.id is null
  loop
    perform public.issue_member_card(v_member.id);
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

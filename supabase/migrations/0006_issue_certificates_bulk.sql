-- Migration 0006 : issue_certificates_bulk

create or replace function public.issue_certificates_bulk(
  p_organization_id uuid,
  p_member_ids uuid[],
  p_type certificate_type,
  p_title text,
  p_description text default null,
  p_training_id uuid default null,
  p_event_id uuid default null,
  p_issued_at date default current_date
) returns uuid[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cert_ids uuid[];
  v_member_id uuid;
  v_id uuid;
begin
  -- Verification rights
  if not (public.is_org_admin(auth.uid(), p_organization_id)) then
    raise exception 'Unauthorized to issue certificates for this organization';
  end if;

  v_cert_ids := '{}';

  foreach v_member_id in array p_member_ids loop
    insert into public.certificates (
      organization_id, member_id, type, title, description, training_id, event_id, issued_at, created_by
    ) values (
      p_organization_id, v_member_id, p_type, p_title, p_description, p_training_id, p_event_id, p_issued_at, auth.uid()
    ) returning id into v_id;
    
    v_cert_ids := array_append(v_cert_ids, v_id);
  end loop;

  return v_cert_ids;
end;
$$;

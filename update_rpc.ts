import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fix() {
  const sql = `
CREATE OR REPLACE FUNCTION get_certificate_public_info(p_token text)
RETURNS json
AS $$
DECLARE
  v_cert RECORD;
  v_member RECORD;
  v_org RECORD;
  v_source_title text;
BEGIN
  SELECT * INTO v_cert FROM certificates WHERE verification_token = p_token;
  IF NOT FOUND THEN
    RETURN json_build_object('status', 'NOT_FOUND');
  END IF;

  IF v_cert.status = 'REVOKED' THEN
    RETURN json_build_object('status', 'REVOKED');
  END IF;

  SELECT id, first_name, last_name, member_number, organization_id 
    INTO v_member FROM members WHERE id = v_cert.member_id;

  SELECT id, name, logo_url 
    INTO v_org FROM organizations WHERE id = v_member.organization_id;

  IF v_cert.training_id IS NOT NULL THEN
    SELECT title INTO v_source_title FROM trainings WHERE id = v_cert.training_id;
  ELSIF v_cert.event_id IS NOT NULL THEN
    SELECT title INTO v_source_title FROM events WHERE id = v_cert.event_id;
  ELSE
    v_source_title := v_cert.title;
  END IF;

  RETURN json_build_object(
    'status', 'VALID',
    'member', json_build_object(
      'first_name', v_member.first_name,
      'last_name', v_member.last_name,
      'member_number', v_member.member_number
    ),
    'certificate', json_build_object(
      'type', v_cert.type,
      'title', v_source_title,
      'issued_at', v_cert.issued_at,
      'verification_token', v_cert.verification_token,
      'training_id', v_cert.training_id,
      'event_id', v_cert.event_id
    ),
    'organization', json_build_object(
      'name', v_org.name,
      'logo_url', v_org.logo_url
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  // Try to use exec_sql if it exists, otherwise just tell the user to run it
  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('Error (exec_sql might not exist). Please run this SQL in Supabase dashboard manually:\\n\\n', sql);
  } else {
    console.log('Successfully updated RPC via exec_sql');
  }
}

fix();

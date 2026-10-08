import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fix() {
  const { data: orgs } = await supabase.from('organizations').select('id, name');
  const adsOrg = orgs?.find(o => o.name.toLowerCase().includes('association pour'));
  
  if (adsOrg) {
    console.log('Found org:', adsOrg);
    await supabase.from('organizations').update({ member_prefix: 'ADS' }).eq('id', adsOrg.id);
    
    const { data: members } = await supabase
      .from('members')
      .select('id, member_number')
      .eq('organization_id', adsOrg.id)
      .order('created_at', { ascending: true });
      
    if (members) {
      for (let i = 0; i < members.length; i++) {
        const newNum = 'ADS-2026-' + String(i + 1).padStart(6, '0');
        await supabase.from('members').update({ member_number: newNum }).eq('id', members[i].id);
        console.log('Updated', members[i].member_number, 'to', newNum);
      }
    }
  } else {
    console.log('Org not found', orgs);
  }
}

fix();

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase URL or Anon Key");
  process.exit(1);
}

// Helper to wait a bit
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function runTests() {
  console.log('=== STARTING RLS ISOLATION TESTS ===\n');

  // Generate random emails to avoid conflicts
  const timestamp = Date.now();
  const emailA = `orgA_${timestamp}@example.com`;
  const emailB = `orgB_${timestamp}@example.com`;
  const password = 'TestPassword123!';

  // Client A
  const supabaseA = createClient(SUPABASE_URL!, SUPABASE_KEY!);
  // Client B
  const supabaseB = createClient(SUPABASE_URL!, SUPABASE_KEY!);

  console.log(`1. Creating User A (${emailA}) and Org A...`);
  const { data: authA, error: errAuthA } = await supabaseA.auth.signUp({
    email: emailA,
    password,
  });
  if (errAuthA) {
    console.error('FAIL: Could not create User A', errAuthA);
    return;
  }
  
  // Wait a moment for auth trigger if any
  await sleep(1000);

  const { data: orgAData, error: errOrgA } = await supabaseA.rpc('create_organization_with_owner', {
    p_name: `Org A ${timestamp}`,
    p_slug: `org-a-${timestamp}`,
    p_country: 'France',
    p_city: 'Paris',
    p_phone: '0123456789',
    p_member_prefix: 'OA'
  });
  if (errOrgA) {
    console.error('FAIL: Could not create Org A', errOrgA);
    return;
  }
  
  // We need the orgA ID. Let's fetch it.
  const { data: orgA, error: errFetchOrgA } = await supabaseA.from('organizations').select('id, slug').eq('slug', `org-a-${timestamp}`).single();
  if (errFetchOrgA || !orgA) {
    console.error('FAIL: Could not fetch Org A ID', errFetchOrgA);
    return;
  }
  console.log(`PASS: User A and Org A created (ID: ${orgA.id})\n`);

  console.log(`2. Creating User B (${emailB}) and Org B...`);
  const { data: authB, error: errAuthB } = await supabaseB.auth.signUp({
    email: emailB,
    password,
  });
  if (errAuthB) {
    console.error('FAIL: Could not create User B', errAuthB);
    return;
  }
  
  await sleep(1000);

  const { data: orgBData, error: errOrgB } = await supabaseB.rpc('create_organization_with_owner', {
    p_name: `Org B ${timestamp}`,
    p_slug: `org-b-${timestamp}`,
    p_country: 'Belgium',
    p_city: 'Brussels',
    p_phone: '0987654321',
    p_member_prefix: 'OB'
  });
  if (errOrgB) {
    console.error('FAIL: Could not create Org B', errOrgB);
    return;
  }

  const { data: orgB, error: errFetchOrgB } = await supabaseB.from('organizations').select('id, slug').eq('slug', `org-b-${timestamp}`).single();
  if (errFetchOrgB || !orgB) {
    console.error('FAIL: Could not fetch Org B ID', errFetchOrgB);
    return;
  }
  console.log(`PASS: User B and Org B created (ID: ${orgB.id})\n`);


  console.log(`3. Populating Org A with data...`);
  // Insert a member
  const { data: memberA, error: errMemberA } = await supabaseA.from('members').insert({
    organization_id: orgA.id,
    first_name: 'Alice',
    last_name: 'Smith',
    email: `alice_${timestamp}@test.com`,
    member_number: `M-${timestamp}`,
    status: 'ACTIVE'
  }).select().single();
  if (errMemberA) { console.error('FAIL inserting member', errMemberA); return; }

  // Insert a partner
  const { data: partnerA, error: errPartnerA } = await supabaseA.from('partners').insert({
    organization_id: orgA.id,
    name: 'Partner A',
    is_active: true
  }).select().single();
  if (errPartnerA) { console.error('FAIL inserting partner', errPartnerA); return; }

  // Insert an action
  const { data: actionA, error: errActionA } = await supabaseA.from('actions').insert({
    organization_id: orgA.id,
    title: 'Action A',
    date: new Date().toISOString()
  }).select().single();
  if (errActionA) { console.error('FAIL inserting action', errActionA); return; }

  // Insert an impact metric
  const { data: impactA, error: errImpactA } = await supabaseA.from('impact_metrics').insert({
    organization_id: orgA.id,
    action_id: actionA.id,
    title: 'Metric A',
    value: 100
  }).select().single();
  if (errImpactA) { console.error('FAIL inserting impact', errImpactA); return; }

  console.log(`PASS: Data created in Org A (Member: ${memberA.id}, Action: ${actionA.id})\n`);

  console.log(`4. Testing RLS: User B attempts to read Org A data...`);
  let hasLeak = false;

  const tables = ['members', 'actions', 'partners', 'impact_metrics'];
  for (const table of tables) {
    const { data: leakedData, error: leakError } = await supabaseB.from(table)
      .select('*')
      .eq('organization_id', orgA.id);
    
    if (leakError) {
      console.log(`[${table}] Result: Error returned (Expected) - ${leakError.message}`);
    } else if (leakedData && leakedData.length > 0) {
      console.error(`FAIL: [${table}] User B could read ${leakedData.length} records from Org A! LEAK DETECTED.`);
      hasLeak = true;
    } else {
      console.log(`[${table}] Result: Empty array (Expected)`);
    }
  }

  if (hasLeak) {
    console.error('\n!!! CRITICAL RLS FAILURE: Data leaked across organizations !!!');
  } else {
    console.log('\nPASS: No data leaked during direct SELECTs.\n');
  }

  console.log(`5. Testing RPC Permissions: User B attempts to manipulate Org A data...`);
  let rpcFail = false;

  // issue_certificate
  const { data: issueRes, error: issueErr } = await supabaseB.rpc('issue_certificate', {
    p_organization_id: orgA.id,
    p_member_id: memberA.id,
    p_type: 'MEMBERSHIP',
    p_title: 'Test Cert'
  });
  
  if (!issueErr) {
    console.error(`FAIL: User B successfully called issue_certificate for Org A member! Result:`, issueRes);
    rpcFail = true;
  } else {
    console.log(`[issue_certificate] Denied as expected: ${issueErr.message}`);
  }



  if (rpcFail) {
    console.error('\n!!! CRITICAL RPC FAILURE: User B can execute RPCs on Org A data !!!');
  } else {
    console.log('\nPASS: RPC functions properly blocked cross-org access.\n');
  }

  console.log(`6. Testing Anonymous Access: Public RPC vs Direct SELECTs...`);
  // Client Anon (no session)
  const supabaseAnon = createClient(SUPABASE_URL!, SUPABASE_KEY!);
  
  // Test direct selects
  let anonDirectFail = false;
  for (const table of tables) {
    const { data: anonData, error: anonError } = await supabaseAnon.from(table)
      .select('*')
      .eq('organization_id', orgA.id);
    
    if (anonError) {
      console.log(`[anon] Direct select [${table}]: Error returned (Expected) - ${anonError.message}`);
    } else if (anonData && anonData.length > 0) {
      console.error(`FAIL: [anon] Direct select [${table}]: Anonymous user could read ${anonData.length} records! LEAK DETECTED.`);
      anonDirectFail = true;
    } else {
      console.log(`[anon] Direct select [${table}]: Empty array (Expected)`);
    }
  }

  // Test RPC
  const { data: anonRpcData, error: anonRpcError } = await supabaseAnon.rpc('get_organization_public_impact', {
    p_slug: orgA.slug
  });

  let anonRpcFail = false;
  if (anonRpcError) {
    console.error(`FAIL: [anon] RPC call failed: ${anonRpcError.message}`);
    anonRpcFail = true;
  } else if (!anonRpcData || anonRpcData.found === false) {
    console.error(`FAIL: [anon] RPC call returned not found for ${orgA.slug}`);
    anonRpcFail = true;
  } else {
    console.log(`[anon] RPC call successful. Retrieved public data for ${orgA.slug}:`, anonRpcData.organization.name);
  }

  if (anonDirectFail || anonRpcFail) {
    console.error('\n!!! CRITICAL ANONYMOUS ACCESS FAILURE !!!');
  } else {
    console.log('\nPASS: Anonymous users can only access data via the RPC.\n');
  }

  console.log(`7. Testing Course Isolation: Org A Course vs User B...`);
  let courseLeak = false;

  // Insert a course for Org A
  const { data: courseA, error: errCourseA } = await supabaseA.from('courses').insert({
    organization_id: orgA.id,
    title: `Cours Privé Org A ${timestamp}`,
    is_published: false
  }).select().single();

  if (errCourseA) {
    console.log(`[courses] Note: Insert course A returned ${errCourseA.message} (schema status)`);
  } else if (courseA) {
    // User B tries to select draft course of Org A
    const { data: bReadCourse, error: errBReadCourse } = await supabaseB.from('courses')
      .select('*')
      .eq('id', courseA.id);

    if (bReadCourse && bReadCourse.length > 0) {
      console.error(`FAIL: [courses] User B could read Org A DRAFT course! LEAK DETECTED.`);
      courseLeak = true;
    } else {
      console.log(`[courses] Result: User B cannot read Org A draft course (Expected)`);
    }

    // User B tries to update Org A course
    const { error: errBUpdateCourse } = await supabaseB.from('courses')
      .update({ title: 'Hacked by B' })
      .eq('id', courseA.id);

    // Verify it wasn't updated
    const { data: checkCourse } = await supabaseA.from('courses').select('title').eq('id', courseA.id).single();
    if (checkCourse?.title === 'Hacked by B') {
      console.error(`FAIL: [courses] User B updated Org A course!`);
      courseLeak = true;
    } else {
      console.log(`[courses] Result: User B cannot update Org A course (Expected)`);
    }
  }

  console.log(`\n=== TEST SUITE COMPLETED ===`);
  if (hasLeak || rpcFail || anonDirectFail || anonRpcFail || courseLeak) {
    console.error('OVERALL RESULT: FAIL (See above for details)');
  } else {
    console.log('OVERALL RESULT: PASS (All data isolated correctly)');
  }

  // Not deleting test orgs for now so they can be inspected if needed.
  console.log(`\nTest Orgs preserved: A(${orgA.slug}), B(${orgB.slug})`);
}

runTests().catch(console.error);

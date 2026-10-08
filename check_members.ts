import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('id, member_number, organization_id')

  if (membersError) {
    console.error('Error fetching members:', membersError)
    return
  }

  console.log(`Found ${members.length} members`)
  
  // Group by org
  const orgs = [...new Set(members.map(m => m.organization_id))]
  console.log('Orgs present in members:', orgs)

  for (const orgId of orgs) {
    // get org slug
    const { data: orgData } = await supabase.from('organizations').select('slug').eq('id', orgId).single()
    const slug = orgData ? orgData.slug : 'unknown'

    const prefix = slug.substring(0, 3).toUpperCase()

    // update org
    await supabase.from('organizations').update({ member_prefix: prefix }).eq('id', orgId)

    const orgMembers = members.filter(m => m.organization_id === orgId)
    let sequence = 0
    const year = new Date().getFullYear()

    for (const member of orgMembers) {
      sequence++
      const newNumber = `${prefix}-${year}-${sequence.toString().padStart(6, '0')}`
      console.log(`Updating member ${member.id} from ${member.member_number} to ${newNumber}`)
      
      await supabase
        .from('members')
        .update({ member_number: newNumber })
        .eq('id', member.id)
    }

    await supabase
      .from('organizations')
      .update({ member_sequence: sequence })
      .eq('id', orgId)
  }

  console.log('Done.')
}

main()

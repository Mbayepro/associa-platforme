import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We use the service role key to bypass RLS for generating dummy data
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "L'ID de l'organisation est requis" }, { status: 400 });
    }

    // 1. Generate Fake Members
    const fakeMembers = [
      { first_name: "Amadou", last_name: "Diallo", email: "amadou.d@demo.com", phone: "+221770000001", function: "Membre Actif", join_date: "2023-01-15" },
      { first_name: "Fatou", last_name: "Sow", email: "fatou.s@demo.com", phone: "+221770000002", function: "Trésorière", join_date: "2022-11-20" },
      { first_name: "Cheikh", last_name: "Fall", email: "cheikh.f@demo.com", phone: "+221770000003", function: "Sympathisant", join_date: "2024-02-10" },
      { first_name: "Aissatou", last_name: "Diop", email: "aissa.d@demo.com", phone: "+221770000004", function: "Secrétaire", join_date: "2023-05-05" },
      { first_name: "Ousmane", last_name: "Ndiaye", email: "ousmane.n@demo.com", phone: "+221770000005", function: "Membre Actif", join_date: "2023-08-12" },
      { first_name: "Marie", last_name: "Gomis", email: "marie.g@demo.com", phone: "+221770000006", function: "Membre Actif", join_date: "2023-09-01" },
      { first_name: "Ibrahima", last_name: "Faye", email: "ibrahima.f@demo.com", phone: "+221770000007", function: "Responsable Logistique", join_date: "2024-01-20" },
      { first_name: "Aminata", last_name: "Sy", email: "aminata.s@demo.com", phone: "+221770000008", function: "Vice-Présidente", join_date: "2022-06-15" },
      { first_name: "Mamadou", last_name: "Ba", email: "mamadou.b@demo.com", phone: "+221770000009", function: "Membre Actif", join_date: "2023-11-30" },
      { first_name: "Ndèye", last_name: "Seck", email: "ndeye.s@demo.com", phone: "+221770000010", function: "Membre Actif", join_date: "2024-03-08" },
    ].map((m, index) => ({
      organization_id: organizationId,
      member_number: `DEMO-${new Date().getFullYear()}-${String(index + 1).padStart(6, '0')}`,
      status: 'ACTIVE',
      ...m
    }));

    const { error: membersError } = await supabaseAdmin
      .from('members')
      .insert(fakeMembers);

    if (membersError) throw membersError;

    // 2. Generate Fake Events
    const today = new Date();
    const plus14Days = new Date(today); plus14Days.setDate(plus14Days.getDate() + 14);
    const plus30Days = new Date(today); plus30Days.setDate(plus30Days.getDate() + 30);
    const minus5Days = new Date(today); minus5Days.setDate(minus5Days.getDate() - 5);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const fakeEvents = [
      {
        organization_id: organizationId,
        title: "Assemblée Générale Annuelle",
        description: "Bilan moral et financier de l'année écoulée et élection du nouveau bureau.",
        event_date: formatDate(plus14Days),
        location: "Dakar, Siège de l'association",
        event_type: "AUTRE",
        status: "PUBLISHED"
      },
      {
        organization_id: organizationId,
        title: "Journée de reboisement",
        description: "Plantation de 500 arbres pour lutter contre la déforestation. Rejoignez-nous pour protéger notre environnement.",
        event_date: formatDate(plus30Days),
        location: "Forêt classée de Mbao",
        event_type: "ENVIRONNEMENT",
        status: "PUBLISHED"
      },
      {
        organization_id: organizationId,
        title: "Formation aux premiers secours",
        description: "Apprenez les gestes qui sauvent avec la Croix-Rouge.",
        event_date: formatDate(minus5Days),
        location: "Centre culturel",
        event_type: "FORMATION",
        status: "COMPLETED"
      }
    ];

    const { error: eventsError } = await supabaseAdmin
      .from('events')
      .insert(fakeEvents);

    if (eventsError) throw eventsError;

    // 3. Update the Organization description so the public showcase page looks good
    await supabaseAdmin
      .from('organizations')
      .update({
        description: "Bienvenue sur notre plateforme officielle ! Nous sommes une association dynamique engagée pour notre communauté. Découvrez nos événements, nos actions et rejoignez-nous pour avoir un impact positif ensemble."
      })
      .eq('id', organizationId);

    return NextResponse.json({ success: true, message: "10 Membres et 3 Événements ont été générés avec succès !" });
  } catch (error: any) {
    console.error("Erreur Générateur Démo:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

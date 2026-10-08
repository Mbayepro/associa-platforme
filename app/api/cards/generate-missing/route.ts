import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { orgId } = await req.json();

    if (!orgId) {
      return NextResponse.json({ error: "L'ID de l'organisation est requis" }, { status: 400 });
    }

    // 1. Fetch active members without a card
    const { data: members, error: membersError } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('organization_id', orgId)
      .eq('status', 'ACTIVE')
      .is('deleted_at', null);

    if (membersError) throw membersError;

    const { data: existingCards, error: cardsError } = await supabaseAdmin
      .from('member_cards')
      .select('member_id')
      .eq('organization_id', orgId)
      .in('status', ['ACTIVE', 'SUSPENDED']); // don't reissue if active or suspended

    if (cardsError) throw cardsError;

    const existingCardMemberIds = new Set(existingCards.map(c => c.member_id));
    const membersNeedingCards = members.filter(m => !existingCardMemberIds.has(m.id));

    if (membersNeedingCards.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "Aucune carte manquante." });
    }

    // 2. Generate new cards for these members
    const newCards = membersNeedingCards.map(m => {
      // Generate a verification token manually using base64 random
      const randomValues = new Uint8Array(24);
      crypto.getRandomValues(randomValues);
      const token = btoa(String.fromCharCode.apply(null, Array.from(randomValues)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
        
      return {
        organization_id: orgId,
        member_id: m.id,
        status: 'ACTIVE',
        verification_token: token,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 an
      };
    });

    const { error: insertError } = await supabaseAdmin
      .from('member_cards')
      .insert(newCards);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, count: newCards.length });
  } catch (error: any) {
    console.error("Erreur Génération Cartes:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

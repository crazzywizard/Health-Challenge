import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { profile_id, subscription } = await request.json();

    if (!profile_id || !subscription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if subscription already exists for this profile
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('profile_id', profile_id)
      .eq('subscription', JSON.stringify(subscription))
      .single();

    if (!existing) {
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          profile_id,
          subscription: subscription, // Supabase JSONB stores objects
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in push subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { profile_id, subscription } = await request.json();

    if (!profile_id || !subscription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('profile_id', profile_id)
      .eq('subscription', JSON.stringify(subscription));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting push subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

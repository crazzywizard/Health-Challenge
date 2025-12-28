import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateParticipantInput } from '@/app/types';

// Middleware to check authentication
function checkAuth(request: NextRequest): boolean {
  const session = request.cookies.get('app_session');
  return session?.value === 'authenticated';
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const input: CreateParticipantInput = await request.json();

    if (!input.challenge_id || !input.name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('participants')
      .insert({
        challenge_id: input.challenge_id,
        name: input.name,
        email: input.email || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating participant:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/participants:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId');

    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', participantId);

    if (error) {
      console.error('Error deleting participant:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/participants:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

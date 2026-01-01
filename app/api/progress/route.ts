import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UpdateProgressInput } from '@/app/types';
import { verifyParticipantOwnership, verifyProgressOwnership } from '@/lib/security';

// Middleware to check authentication
function checkAuth(request: NextRequest): boolean {
  const session = request.cookies.get('app_session');
  return session?.value === 'authenticated';
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId');
    const date = searchParams.get('date');

    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let query = supabase
      .from('daily_progress')
      .select('*')
      .eq('participant_id', participantId);

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching progress:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/progress:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const input: UpdateProgressInput = await request.json();

    if (!input.participant_id || !input.rule_id || !input.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Security Check: Ensure participant belongs to the current profile
    const currentProfileId = request.cookies.get('current_profile_id')?.value;
    if (currentProfileId) {
      const isOwner = await verifyParticipantOwnership(supabase, input.participant_id, currentProfileId);
      if (!isOwner) {
        return NextResponse.json(
          { error: 'Forbidden: You can only update your own progress' },
          { status: 403 }
        );
      }
    }

    // Upsert progress (insert or update if exists)
    const { data, error } = await supabase
      .from('daily_progress')
      .upsert(
        {
          participant_id: input.participant_id,
          rule_id: input.rule_id,
          date: input.date,
          completed: input.completed,
          value: input.value || null,
          notes: input.notes || null,
        },
        {
          onConflict: 'participant_id,rule_id,date',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating progress:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in POST /api/progress:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Progress ID is required' },
        { status: 400 }
      );
    }

    // Security Check: Ensure progress record belongs to a participant of the current profile
    const currentProfileId = request.cookies.get('current_profile_id')?.value;
    if (currentProfileId) {
      const isOwner = await verifyProgressOwnership(supabase, id, currentProfileId);
      if (!isOwner) {
        // Distinguish between not found and forbidden if needed, but for security, generic 403 or 404 is fine.
        // We'll stick to 403 if it exists but not owned, but verifyProgressOwnership returns false for both.
        return NextResponse.json(
          { error: 'Forbidden or not found' },
          { status: 403 }
        );
      }
    }

    const { data, error } = await supabase
      .from('daily_progress')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating progress:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PUT /api/progress:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

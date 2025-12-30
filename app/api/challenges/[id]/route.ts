import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enrichParticipantWithProgress } from '@/lib/progress';
import { Participant } from '@/app/types';

// Middleware to check authentication
function checkAuth(request: NextRequest): boolean {
  const session = request.cookies.get('app_session');
  return session?.value === 'authenticated';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        rules(*),
        participants(
          *,
          profile:profiles(id, avatar_url, avatar_color),
          progress:daily_progress(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Challenge not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching challenge:', error);
      const isFetchError = error.message?.includes('fetch failed');
      return NextResponse.json(
        { 
          error: isFetchError 
            ? 'Supabase fetch failed. This usually indicates a configuration or connection issue in production.' 
            : error.message 
        }, 
        { status: 500 }
      );
    }
    if (data) {
      data.participants = data.participants.map((p: Participant) => 
        enrichParticipantWithProgress(p, data.rules, data.start_date, data.duration_days)
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/challenges/[id]:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = await createClient();
    const updates = await request.json();

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;

    const { data, error } = await supabase
      .from('challenges')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating challenge:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PUT /api/challenges/[id]:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Cascade delete is handled by database foreign keys
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting challenge:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/challenges/[id]:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

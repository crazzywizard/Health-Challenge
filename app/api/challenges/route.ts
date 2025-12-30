import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateChallengeInput, ChallengeWithDetails, Participant } from '@/app/types';
import { enrichParticipantWithProgress } from '@/lib/progress';

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
    const supabase = await createClient();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabase
      .from('challenges')
      .select('*, rules(*), participants(*, progress:daily_progress(*))', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching challenges:', error);
      const isFetchError = error.message?.includes('fetch failed');
      return NextResponse.json(
        { 
          error: isFetchError 
            ? 'Supabase fetch failed. This usually indicates a configuration or connection issue in production.' 
            : error.message,
          details: isFetchError ? 'Check if NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correctly set.' : undefined
        }, 
        { status: 500 }
      );
    }

    if (data) {
      data.forEach((challenge: ChallengeWithDetails) => {
        challenge.participants = challenge.participants.map((p: Participant) => 
          enrichParticipantWithProgress(p, challenge.rules, challenge.start_date, challenge.duration_days)
        );
      });
    }

    return NextResponse.json({
      data,
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error in GET /api/challenges:', error);
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
    const input: CreateChallengeInput = await request.json();

    // Validate input
    if (!input.name || !input.duration_days || !input.start_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate end date
    const startDate = new Date(input.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + input.duration_days);

    // Determine status
    const now = new Date();
    let status: 'upcoming' | 'active' | 'completed';
    if (startDate > now) {
      status = 'upcoming';
    } else if (endDate < now) {
      status = 'completed';
    } else {
      status = 'active';
    }

    // Insert challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .insert({
        name: input.name,
        description: input.description || null,
        duration_days: input.duration_days,
        start_date: input.start_date,
        end_date: endDate.toISOString().split('T')[0],
        status,
      })
      .select()
      .single();

    if (challengeError) {
      console.error('Error creating challenge:', challengeError);
      return NextResponse.json(
        { error: challengeError.message },
        { status: 500 }
      );
    }

    // Insert rules if provided
    if (input.rules && input.rules.length > 0) {
      const rulesData = input.rules.map((rule) => ({
        challenge_id: challenge.id,
        description: rule.description,
        rule_type: rule.rule_type,
        target_value: rule.target_value || null,
        order_index: rule.order_index,
      }));

      const { error: rulesError } = await supabase
        .from('rules')
        .insert(rulesData);

      if (rulesError) {
        console.error('Error creating rules:', rulesError);
        // Challenge was created, but rules failed
        // You might want to delete the challenge or handle this differently
      }
    }

    // Fetch complete challenge with rules
    const { data: completeChallenge, error: fetchError } = await supabase
      .from('challenges')
      .select('*, rules(*), participants(*)')
      .eq('id', challenge.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ data: challenge });
    }

    return NextResponse.json({ data: completeChallenge }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/challenges:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

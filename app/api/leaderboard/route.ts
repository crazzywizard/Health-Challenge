import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enrichParticipantWithProgress } from '@/lib/progress';
import { Participant, ChallengeWithDetails, DailyProgress } from '@/app/types';

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

    // 1. Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) throw profilesError;

    // 2. Fetch all challenges with their rules and participants to calculate streaks/completion
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*, rules(*), participants(*, progress:daily_progress(*))');

    if (challengesError) throw challengesError;

    // 3. Aggregate data per profile
    const leaderboard = profiles.map((profile) => {
      let totalCompletions = 0;
      let maxStreak = 0;
      let challengesJoined = 0;
      let totalPotentialCompetitions = 0;

      (challenges as unknown as ChallengeWithDetails[]).forEach((challenge) => {
        const participant = challenge.participants.find((p) => p.profile_id === profile.id);
        
        if (participant) {
          challengesJoined++;
          
          // Enrich with progress stats
          const enriched = enrichParticipantWithProgress(
            participant as Participant,
            challenge.rules,
            challenge.start_date,
            challenge.duration_days
          );

          totalCompletions += (participant.progress as DailyProgress[])?.filter((p) => p.completed).length || 0;
          totalPotentialCompetitions += (challenge.duration_days * challenge.rules.length);
          
          if ((enriched.current_streak || 0) > maxStreak) {
            maxStreak = enriched.current_streak || 0;
          }
        }
      });

      const overallCompletion = totalPotentialCompetitions > 0 
        ? Math.round((totalCompletions / totalPotentialCompetitions) * 100) 
        : 0;

      return {
        profile_id: profile.id,
        name: profile.name,
        avatar_url: profile.avatar_url,
        avatar_color: profile.avatar_color,
        total_completions: totalCompletions,
        max_streak: maxStreak,
        challenges_joined: challengesJoined,
        overall_completion: overallCompletion,
      };
    });

    // 4. Sort by total completions (primary) then max streak (secondary)
    leaderboard.sort((a, b) => {
      if (b.total_completions !== a.total_completions) {
        return b.total_completions - a.total_completions;
      }
      return b.max_streak - a.max_streak;
    });

    return NextResponse.json({ data: leaderboard });
  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

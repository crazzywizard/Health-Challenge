import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPushToProfiles } from '@/lib/push-notifications';

/**
 * API Route to be called by a cron job (e.g., Vercel Cron)
 * Sends notifications to participants of challenges starting tomorrow.
 */
export async function GET(request: NextRequest) {
  // Check for cron secret security
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    
    // Calculate tomorrow’s date in YYYY-MM-DD format
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    console.log(`Checking for challenges starting on ${dateStr}`);
    
    // 1. Find challenges starting tomorrow
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('id, name')
      .eq('start_date', dateStr);
      
    if (challengesError) {
      console.error('Error fetching tomorrow\'s challenges:', challengesError);
      throw challengesError;
    }
    
    if (!challenges || challenges.length === 0) {
      return NextResponse.json({ message: `No challenges starting on ${dateStr}`, date: dateStr });
    }
    
    let totalSent = 0;
    const summary = [];

    // 2. Process each challenge
    for (const challenge of challenges) {
      // Find participants for this challenge who have a profile_id
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('profile_id')
        .eq('challenge_id', challenge.id)
        .not('profile_id', 'is', null);
        
      if (participantsError) {
        console.error(`Error fetching participants for challenge ${challenge.id}:`, participantsError);
        continue;
      }
      
      const profileIds = participants
        .map(p => p.profile_id)
        .filter((id): id is string => !!id);
      
      if (profileIds.length > 0) {
        // 3. Send notifications
        const notificationPayload = {
          title: 'Challenge Starting Tomorrow!',
          body: `Get ready! The challenge "${challenge.name}" starts tomorrow.`,
          url: `/challenges/${challenge.id}`
        };
        
        const results = await sendPushToProfiles(profileIds, notificationPayload);
        
        // Count successes
        let challengeSentCount = 0;
        results.forEach(pResult => {
          if ('results' in pResult && pResult.results) {
            challengeSentCount += pResult.results.filter(sr => sr.success).length;
          }
        });
        
        totalSent += challengeSentCount;
        summary.push({
          challengeId: challenge.id,
          challengeName: challenge.name,
          participantsNotified: profileIds.length,
          notificationsSent: challengeSentCount
        });
      }
    }
    
    return NextResponse.json({ 
      date: dateStr,
      challengesFound: challenges.length,
      totalNotificationsSent: totalSent,
      summary
    });
    
  } catch (error) {
    console.error('Error in challenge-start reminder cron:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      date: new Date().toISOString()
    }, { status: 500 });
  }
}

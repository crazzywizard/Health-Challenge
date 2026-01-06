import { ChallengeStatus, Challenge } from '@/app/types';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Calculates the current status of a challenge based on today's date.
 * Assumes startDate and endDate are in 'YYYY-MM-DD' format or can be parsed as such.
 */
export function calculateChallengeStatus(startDate: string, endDate: string): ChallengeStatus {
  // Use local date for comparison to match "midnight strikes" requirement
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Extract date parts if they are full ISO strings
  const startStr = startDate.split('T')[0];
  const endStr = endDate.split('T')[0];

  if (todayStr < startStr) {
    return 'upcoming';
  } else if (todayStr > endStr) {
    return 'completed';
  } else {
    return 'active';
  }
}

/**
 * Checks if a challenge's status in the DB is correct and updates it if not.
 * This is used for "just-in-time" updates when challenges are retrieved.
 */
export async function syncChallengeStatus(supabase: SupabaseClient, challenge: Challenge): Promise<Challenge> {
  const currentStatus = calculateChallengeStatus(challenge.start_date, challenge.end_date);
  
  if (challenge.status !== currentStatus) {
    const { data: updatedChallenge, error } = await supabase
      .from('challenges')
      .update({ status: currentStatus })
      .eq('id', challenge.id)
      .select()
      .single();
    
    if (error) {
      console.error(`Failed to sync status for challenge ${challenge.id}:`, error);
      return challenge;
    }
    
    return updatedChallenge || challenge;
  }
  
  return challenge;
}

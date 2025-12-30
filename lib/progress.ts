import { DailyProgress, Rule, ParticipantWithProgress, Participant } from '@/app/types';

/**
 * Calculates the current streak for a participant in a challenge.
 * A streak is the number of consecutive days (leading up to today or yesterday)
 * where ALL rules were completed.
 */
export function calculateStreak(progress: DailyProgress[], rules: Rule[], startDateStr: string): number {
  if (!rules.length) return 0;

  const progressByDate: Record<string, DailyProgress[]> = {};
  progress.forEach((p) => {
    if (!progressByDate[p.date]) {
      progressByDate[p.date] = [];
    }
    progressByDate[p.date].push(p);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);

  let streak = 0;
  const checkDate = new Date(today);

  // If today isn't fully complete yet, check starting from yesterday
  const isTodayComplete = areAllRulesComplete(progressByDate[checkDate.toLocaleDateString('en-CA')], rules);
  
  if (!isTodayComplete) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (checkDate >= startDate) {
    const dateStr = checkDate.toLocaleDateString('en-CA');
    if (areAllRulesComplete(progressByDate[dateStr], rules)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates the overall completion percentage for a participant.
 */
export function calculateCompletionPercentage(
  progress: DailyProgress[],
  rules: Rule[],
  durationDays: number
): number {
  if (!rules.length || durationDays === 0) return 0;

  const totalPossibleTasks = durationDays * rules.length;
  const completedTasks = progress.filter((p) => p.completed).length;

  return Math.round((completedTasks / totalPossibleTasks) * 100);
}

/**
 * Helper to check if all rules for a specific date are marked as complete.
 */
function areAllRulesComplete(dayProgress: DailyProgress[] | undefined, rules: Rule[]): boolean {
  if (!dayProgress || dayProgress.length < rules.length) return false;
  
  // Create a map of rule completion for the day
  const completedRuleIds = new Set(
    dayProgress.filter(p => p.completed).map(p => p.rule_id)
  );

  return rules.every(rule => completedRuleIds.has(rule.id));
}

/**
 * Enriches participant data with calculated stats.
 */
export function enrichParticipantWithProgress(
  participant: Participant & { progress?: DailyProgress[] },
  rules: Rule[],
  challengeStartDate: string,
  durationDays: number
): ParticipantWithProgress {
  const progress = participant.progress || [];
  
  return {
    ...participant,
    progress,
    current_streak: calculateStreak(progress, rules, challengeStartDate),
    completion_percentage: calculateCompletionPercentage(progress, rules, durationDays),
  };
}

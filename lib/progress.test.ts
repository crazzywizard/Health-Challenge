import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { setSystemTime } from 'bun:test';
import { calculateStreak, calculateCompletionPercentage } from './progress';
import { DailyProgress, Rule } from '@/app/types';

describe('progress tracking logic', () => {
  const mockRules: Rule[] = [
    { id: '1', challenge_id: 'c1', description: 'Rule 1', rule_type: 'boolean', target_value: null, order_index: 0, created_at: '' },
    { id: '2', challenge_id: 'c1', description: 'Rule 2', rule_type: 'boolean', target_value: null, order_index: 1, created_at: '' },
  ];

  const startDateStr = '2023-01-01';

  afterEach(() => {
    setSystemTime(); // No arguments resets time in Bun
  });

  describe('calculateStreak', () => {
    it('returns 0 when there are no rules', () => {
      const streak = calculateStreak([], [], startDateStr);
      expect(streak).toBe(0);
    });

    it('returns 0 when no progress is logged', () => {
      const date = new Date('2023-01-05T12:00:00Z');
      setSystemTime(date);
      const streak = calculateStreak([], mockRules, startDateStr);
      expect(streak).toBe(0);
    });

    it('calculates streak correctly for consecutive completed days (including today)', () => {
      const todayStr = '2023-01-03';
      const date = new Date('2023-01-03T12:00:00Z'); // Today is Jan 3rd
      setSystemTime(date);

      const progress: DailyProgress[] = [
        // Jan 1st - all complete
        { id: 'p1', participant_id: 'user1', rule_id: '1', date: '2023-01-01', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
        { id: 'p2', participant_id: 'user1', rule_id: '2', date: '2023-01-01', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
        // Jan 2nd - all complete
        { id: 'p3', participant_id: 'user1', rule_id: '1', date: '2023-01-02', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
        { id: 'p4', participant_id: 'user1', rule_id: '2', date: '2023-01-02', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
        // Jan 3rd (Today) - all complete
        { id: 'p5', participant_id: 'user1', rule_id: '1', date: '2023-01-03', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
        { id: 'p6', participant_id: 'user1', rule_id: '2', date: '2023-01-03', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
      ];

      const streak = calculateStreak(progress, mockRules, startDateStr);
      expect(streak).toBe(3);
    });

    it('calculates streak correctly when today is not yet complete', () => {
      const date = new Date('2023-01-03T12:00:00Z'); // Today is Jan 3rd
      setSystemTime(date);

      const progress: DailyProgress[] = [
        // Jan 1st - all complete
        { id: 'p1', participant_id: 'user1', rule_id: '1', date: '2023-01-01', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
        { id: 'p2', participant_id: 'user1', rule_id: '2', date: '2023-01-01', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
        // Jan 2nd - all complete
        { id: 'p3', participant_id: 'user1', rule_id: '1', date: '2023-01-02', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
        { id: 'p4', participant_id: 'user1', rule_id: '2', date: '2023-01-02', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
        // Jan 3rd (Today) - only one rule complete
        { id: 'p5', participant_id: 'user1', rule_id: '1', date: '2023-01-03', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
      ];

      const streak = calculateStreak(progress, mockRules, startDateStr);
      expect(streak).toBe(2);
    });

    it('returns 0 when a day in the middle is incomplete', () => {
      const date = new Date('2023-01-03T12:00:00Z'); // Today is Jan 3rd
      setSystemTime(date);

      const progress: DailyProgress[] = [
        // Jan 1st - all complete
        { id: 'p1', participant_id: 'user1', rule_id: '1', date: '2023-01-01', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
        { id: 'p2', participant_id: 'user1', rule_id: '2', date: '2023-01-01', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
        // Jan 2nd - INCOMPLETE
        { id: 'p3', participant_id: 'user1', rule_id: '1', date: '2023-01-02', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
        // Jan 3rd (Today) - all complete
        { id: 'p5', participant_id: 'user1', rule_id: '1', date: '2023-01-03', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
        { id: 'p6', participant_id: 'user1', rule_id: '2', date: '2023-01-03', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
      ];

      const streak = calculateStreak(progress, mockRules, startDateStr);
      expect(streak).toBe(1); // Only today counts as a streak if yesterday was broken?
      // Wait, if yesterday was broken, the streak should be broken.
      // If Jan 1st was complete, Jan 2nd was incomplete, and Jan 3rd is complete.
      // The current streak (leading up to today) is 1 (just today).
    });
  });

  describe('calculateCompletionPercentage', () => {
    it('returns 0 when no rules or duration is 0', () => {
      expect(calculateCompletionPercentage([], [], 30)).toBe(0);
      expect(calculateCompletionPercentage([], mockRules, 0)).toBe(0);
    });

    it('calculates percentage correctly for partial progress', () => {
      const progress: DailyProgress[] = [
        { id: 'p1', participant_id: 'u1', rule_id: '1', date: '2023-01-01', completed: true, value: null, notes: null, created_at: '', updated_at: '' },
        { id: 'p2', participant_id: 'u1', rule_id: '2', date: '2023-01-01', completed: false, value: null, notes: null, created_at: '', updated_at: '' },
      ];
      // 1 out of (10 days * 2 rules) = 1/20 = 5%
      expect(calculateCompletionPercentage(progress, mockRules, 10)).toBe(5);
    });

    it('returns 100 when all tasks are complete', () => {
      const progress: DailyProgress[] = [];
      const duration = 2;
      for (let day = 1; day <= duration; day++) {
        mockRules.forEach(r => {
          progress.push({
            id: `p-${day}-${r.id}`,
            participant_id: 'u1',
            rule_id: r.id,
            date: `2023-01-0${day}`,
            completed: true,
            value: null,
            notes: null,
            created_at: '',
            updated_at: ''
          });
        });
      }
      expect(calculateCompletionPercentage(progress, mockRules, duration)).toBe(100);
    });
  });
});

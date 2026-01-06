import { describe, expect, it, spyOn, afterEach } from 'bun:test';
import { calculateChallengeStatus } from './challenges';

describe('calculateChallengeStatus', () => {
  const originalDate = Date;

  afterEach(() => {
    global.Date = originalDate;
  });

  const mockDate = (dateStr: string) => {
    const mockedDate = new Date(dateStr);
    spyOn(global, 'Date').mockImplementation(() => mockedDate);
  };

  it('should return upcoming if today is before start date', () => {
    mockDate('2026-01-01T12:00:00');
    const status = calculateChallengeStatus('2026-01-05', '2026-03-20');
    expect(status).toBe('upcoming');
  });

  it('should return active if today is exactly the start date', () => {
    mockDate('2026-01-05T08:00:00');
    const status = calculateChallengeStatus('2026-01-05', '2026-03-20');
    expect(status).toBe('active');
  });

  it('should return active if today is between start and end date', () => {
    mockDate('2026-02-15T10:00:00');
    const status = calculateChallengeStatus('2026-01-05', '2026-03-20');
    expect(status).toBe('active');
  });

  it('should return active if today is exactly the end date', () => {
    mockDate('2026-03-20T23:59:59');
    const status = calculateChallengeStatus('2026-01-05', '2026-03-20');
    expect(status).toBe('active');
  });

  it('should return completed if today is after end date', () => {
    mockDate('2026-03-21T00:00:01');
    const status = calculateChallengeStatus('2026-01-05', '2026-03-20');
    expect(status).toBe('completed');
  });
});

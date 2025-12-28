'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChallengeWithDetails, DailyProgress } from '@/app/types';
import AddParticipantModal from '@/components/AddParticipantModal';
import DeleteChallengeModal from '@/components/DeleteChallengeModal';

export default function ChallengeDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [challenge, setChallenge] = useState<ChallengeWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [selectedDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  });
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchChallenge = async () => {
    try {
      const response = await fetch(`/api/challenges/${id}`);
      const data = await response.json();
      if (response.ok) {
        setChallenge(data.data);
      } else {
        setError(data.error || 'Challenge not found');
      }
    } catch (err) {
      setError('Failed to fetch challenge details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchChallenge();
    }
  }, [id]);

  const handleToggleProgress = async (participantId: string, ruleId: string, currentCompleted: boolean) => {
    setUpdatingProgress(`${participantId}-${ruleId}`);
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: participantId,
          rule_id: ruleId,
          date: selectedDate,
          completed: !currentCompleted,
        }),
      });

      if (response.ok) {
        // Refresh data to show updated progress and streaks
        fetchChallenge();
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    } finally {
      setUpdatingProgress(null);
    }
  };

  const handleDeleteChallenge = async () => {
    try {
      const response = await fetch(`/api/challenges/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete challenge');
      }
    } catch (err) {
      console.error('Failed to delete challenge:', err);
      throw err;
    }
  };

  const getProgressForDay = (participantId: string, ruleId: string) => {
    const participant = challenge?.participants.find(p => p.id === participantId);
    return participant?.progress?.find(p => p.rule_id === ruleId && p.date === selectedDate);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-primary">
        <div className="animate-pulse text-white text-xl font-bold">Loading Challenge...</div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-text-secondary mb-6">{error || 'Challenge not found'}</p>
          <Link href="/" className="btn btn-primary w-full">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const today = new Date();
  const isStarted = today >= startDate;
  const isEnded = today > endDate;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-border pt-[var(--safe-area-top)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="p-2 hover:bg-border rounded-full transition-colors flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold gradient-text truncate">{challenge.name}</h1>
              <p className="text-[10px] sm:text-xs text-text-secondary">
                {challenge.duration_days} Days • {challenge.status}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
              title="Delete Challenge"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={() => setShowAddParticipant(true)}
              className="btn btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4"
            >
              <span className="hidden sm:inline">Add Participant</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Challenge Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card md:col-span-2">
              <h3 className="text-lg font-bold mb-4">About Challenge</h3>
              <p className="text-text-secondary text-sm sm:text-base mb-6">
                {challenge.description || 'No description provided.'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-[10px] text-text-tertiary uppercase font-bold mb-1">Start</p>
                  <p className="text-sm font-medium">{new Date(challenge.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-tertiary uppercase font-bold mb-1">End</p>
                  <p className="text-sm font-medium">{new Date(challenge.end_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-tertiary uppercase font-bold mb-1">Rules</p>
                  <p className="text-sm font-medium">{challenge.rules.length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-tertiary uppercase font-bold mb-1">Members</p>
                  <p className="text-sm font-medium">{challenge.participants.length}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold mb-4">Rules</h3>
              <ul className="space-y-3">
                {challenge.rules.map((rule, idx) => (
                  <li key={rule.id} className="flex items-start gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-text-secondary">{rule.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-xl sm:text-2xl font-bold">Daily Progress</h3>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label htmlFor="date-picker" className="text-xs sm:text-sm font-medium whitespace-nowrap">Tracking for:</label>
                <input
                  id="date-picker"
                  type="date"
                  value={selectedDate}
                  disabled
                  className="bg-surface-elevated border-border rounded-lg text-sm opacity-70 cursor-not-allowed flex-1 sm:flex-none"
                />
              </div>
            </div>

            {challenge.participants.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-text-secondary mb-4">No participants added yet.</p>
                <button
                  onClick={() => setShowAddParticipant(true)}
                  className="btn btn-secondary mx-auto"
                >
                  Add Your First Participant
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {challenge.participants.map((participant) => (
                  <div key={participant.id} className="card overflow-hidden !p-0">
                    <div className="p-4 bg-surface-elevated border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                          {participant.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold">{participant.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-text-secondary">
                            <span>Streak: <span className="text-orange-500 font-bold">{participant.current_streak || 0} days</span></span>
                            <span>Total Completion: <span className="text-primary font-bold">{participant.completion_percentage || 0}%</span></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 sm:p-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {challenge.rules.map((rule) => {
                        const progress = getProgressForDay(participant.id, rule.id);
                        const isCompleted = progress?.completed || false;
                        const isUpdating = updatingProgress === `${participant.id}-${rule.id}`;

                        return (
                          <button
                            key={rule.id}
                            disabled={isUpdating}
                            onClick={() => handleToggleProgress(participant.id, rule.id, isCompleted)}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all touch-manipulation min-h-[4.5rem] ${
                              isCompleted
                                ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400 shadow-sm'
                                : 'bg-surface border-border hover:border-primary/30 text-text-secondary active:scale-[0.98]'
                            } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            <span className="text-sm font-semibold text-left line-clamp-2 pr-4 leading-tight">
                              {rule.description}
                            </span>
                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${
                              isCompleted
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-border'
                            }`}>
                              {isCompleted && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <AddParticipantModal
        isOpen={showAddParticipant}
        onClose={() => setShowAddParticipant(false)}
        onSuccess={fetchChallenge}
        challengeId={challenge.id}
      />

      <DeleteChallengeModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteChallenge}
        challengeName={challenge.name}
      />
    </div>
  );
}

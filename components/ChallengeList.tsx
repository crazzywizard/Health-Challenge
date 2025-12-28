import Link from 'next/link';
import { ChallengeWithDetails } from '@/app/types';

interface ChallengeListProps {
  challenges: ChallengeWithDetails[];
  loading: boolean;
  onDelete?: (challenge: ChallengeWithDetails) => void;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

export default function ChallengeList({ 
  challenges, 
  loading, 
  onDelete,
  showCreateButton = false,
  onCreateClick
}: ChallengeListProps) {
  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-pulse">
          <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4" />
          <div className="h-4 bg-border rounded w-32 mx-auto mb-2" />
          <div className="h-3 bg-border rounded w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="card text-center py-12 animate-scale-in">
        <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center opacity-50">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h4 className="text-xl font-semibold mb-2">No challenges yet</h4>
        <p className="text-text-secondary mb-6">
          Create your first challenge to get started on your health journey
        </p>
        {showCreateButton && onCreateClick && (
          <button className="btn btn-primary" onClick={onCreateClick}>
            Get Started
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {challenges.map((challenge) => (
        <div key={challenge.id} className="card hover:shadow-xl transition-all !p-0 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg sm:text-xl font-bold">{challenge.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    challenge.status === 'active' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : challenge.status === 'upcoming'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {challenge.status}
                  </span>
                </div>
                {challenge.description && (
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">{challenge.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{challenge.duration_days} days</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span>{challenge.rules?.length || 0} rules</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{challenge.participants?.length || 0}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-row-reverse sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
                <Link 
                  href={`/challenges/${challenge.id}`}
                  className="btn btn-primary text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  View Details
                </Link>
                {onDelete && (
                  <button
                    onClick={() => onDelete(challenge)}
                    className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    title="Delete Challenge"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

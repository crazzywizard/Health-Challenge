import { ParticipantWithProgress } from '@/app/types';
import Image from 'next/image';

interface LeaderboardProps {
  participants: ParticipantWithProgress[];
  currentProfileId: string | null;
  durationDays?: number;
}

export default function Leaderboard({ participants, currentProfileId, durationDays }: LeaderboardProps) {
  // Sort participants by current_streak (primary) and completion_percentage (secondary)
  const sortedParticipants = [...participants].sort((a, b) => {
    const streakA = a.current_streak || 0;
    const streakB = b.current_streak || 0;
    
    if (streakB !== streakA) {
      return streakB - streakA;
    }
    
    return (b.completion_percentage || 0) - (a.completion_percentage || 0);
  });

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return 'from-yellow-400 to-yellow-600 shadow-yellow-500/20';
      case 1: return 'from-slate-300 to-slate-500 shadow-slate-400/20';
      case 2: return 'from-amber-600 to-amber-800 shadow-amber-700/20';
      default: return 'from-surface-elevated to-surface border border-border';
    }
  };

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return index + 1;
    }
  };

  if (participants.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-secondary">No participants yet. Be the first to join!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="grid grid-cols-1 gap-4">
        {sortedParticipants.map((participant, index) => {
          const isTopThree = index < 3;
          const isCurrentProfile = participant.profile_id === currentProfileId;
          
          return (
            <div 
              key={participant.id}
              className={`relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${
                isTopThree ? 'card !p-0' : 'card !p-4'
              } ${isCurrentProfile ? 'ring-2 ring-primary/50' : ''}`}
            >
              {isTopThree && (
                <div className={`h-1.5 w-full bg-gradient-to-r ${getRankStyle(index)}`} />
              )}
              
              <div className={`flex items-center gap-4 ${isTopThree ? 'p-4 sm:p-6' : ''}`}>
                {/* Rank Indicator */}
                <div className={`w-8 sm:w-10 flex-shrink-0 text-center font-bold text-lg sm:text-xl ${
                  index === 0 ? 'text-yellow-500' : 
                  index === 1 ? 'text-slate-400' : 
                  index === 2 ? 'text-amber-700' : 
                  'text-text-tertiary'
                }`}>
                  {getMedalIcon(index)}
                </div>

                {/* Avatar */}
                <div className="relative group">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${participant.profile?.avatar_color || 'gradient-primary'} flex items-center justify-center text-white font-bold text-xl overflow-hidden relative shadow-lg`}>
                    {participant.profile?.avatar_url ? (
                      <Image 
                        src={participant.profile.avatar_url} 
                        alt={participant.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      participant.name.charAt(0)
                    )}
                  </div>
                  {isCurrentProfile && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-surface flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base sm:text-lg truncate">{participant.name}</h4>
                    {isCurrentProfile && (
                      <span className="bg-primary/20 text-primary text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">You</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-orange-500 font-bold text-xs">{participant.current_streak || 0}d</span>
                      <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-tight">Streak</span>
                    </div>
                    {durationDays && (
                      <div className="flex items-center gap-1">
                        <span className="text-primary font-bold text-xs">{participant.days_completed || 0}/{durationDays}</span>
                        <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-tight">Days</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-text-tertiary uppercase font-bold mb-1">Completion</div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 sm:w-20 bg-border/30 rounded-full h-1.5 hidden sm:block">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${participant.completion_percentage || 0}%` }} 
                      />
                    </div>
                    <span className="text-sm sm:text-base font-black text-primary">
                      {participant.completion_percentage || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

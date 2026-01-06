'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface GlobalStat {
  profile_id: string;
  name: string;
  avatar_url: string | null;
  avatar_color: string | null;
  total_completions: number;
  max_streak: number;
  challenges_joined: number;
  overall_completion: number;
}

export default function OverallLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<GlobalStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentProfileId(localStorage.getItem('current_profile_id'));
    
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        if (response.ok) {
          setLeaderboard(data.data);
        } else {
          setError(data.error || 'Failed to fetch leaderboard');
        }
      } catch {
        setError('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl font-bold">Loading Global Rankings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <main className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-3xl sm:text-5xl font-black gradient-text mb-4">Global Hall of Fame</h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            The elite performers across all challenges. Consistency is the only metric that matters.
          </p>
        </header>

        {error ? (
          <div className="card text-center py-8 text-red-500 border-red-500/20">
            {error}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
             {leaderboard.map((stat, index) => {
                const isTopThree = index < 3;
                const isCurrentProfile = stat.profile_id === currentProfileId;
                
                return (
                  <div 
                    key={stat.profile_id}
                    className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                      isTopThree ? 'card !p-0' : 'card !p-5'
                    } ${isCurrentProfile ? 'ring-2 ring-primary' : ''}`}
                  >
                    {isTopThree && (
                      <div className={`h-1.5 w-full bg-gradient-to-r ${getRankStyle(index)}`} />
                    )}
                    
                    <div className={`flex flex-col sm:flex-row sm:items-center gap-6 ${isTopThree ? 'p-6' : ''}`}>
                      {/* Left: Rank & Info */}
                      <div className="flex items-center gap-6 flex-grow">
                        <div className={`w-10 flex-shrink-0 text-center font-black text-2xl ${
                          index === 0 ? 'text-yellow-500' : 
                          index === 1 ? 'text-slate-400' : 
                          index === 2 ? 'text-amber-700' : 
                          'text-text-tertiary'
                        }`}>
                          {getMedalIcon(index)}
                        </div>

                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${stat.avatar_color || 'gradient-primary'} flex items-center justify-center text-white font-black text-2xl overflow-hidden relative shadow-xl`}>
                          {stat.avatar_url ? (
                            <Image src={stat.avatar_url} alt={stat.name} fill className="object-cover" />
                          ) : (
                            stat.name.charAt(0)
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-black text-xl sm:text-2xl truncate flex items-center gap-2">
                            {stat.name}
                            {isCurrentProfile && (
                              <span className="bg-primary/20 text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Legend</span>
                            )}
                          </h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                             <div className="flex items-center gap-1.5 ">
                                <span className="text-text-tertiary text-[10px] uppercase font-bold">Best Streak</span>
                                <span className="text-orange-500 font-black text-sm">{stat.max_streak} 🔥</span>
                             </div>
                             <div className="flex items-center gap-1.5">
                                <span className="text-text-tertiary text-[10px] uppercase font-bold">Challenges</span>
                                <span className="text-primary font-black text-sm">{stat.challenges_joined}</span>
                             </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Score */}
                      <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end gap-2 border-t sm:border-t-0 border-border pt-4 sm:pt-0">
                         <div>
                            <div className="text-[10px] text-text-tertiary uppercase font-black tracking-widest">Rules Completed</div>
                            <div className="text-2xl sm:text-3xl font-black text-primary">{stat.total_completions}</div>
                         </div>
                         <div className="hidden sm:block w-32 bg-border/30 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${stat.overall_completion}%` }} 
                            />
                         </div>
                      </div>
                    </div>
                  </div>
                );
             })}
          </div>
        )}
      </main>
    </div>
  );
}

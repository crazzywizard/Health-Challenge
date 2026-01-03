'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoginPage from '@/components/LoginPage';
import InstallPWA from '@/components/InstallPWA';
import { ChallengeWithDetails } from '@/app/types';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [challenges, setChallenges] = useState<ChallengeWithDetails[]>([]);
  const [profileName, setProfileName] = useState<string>('');
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        
        if (response.ok && data.authenticated) {
          setIsAuthenticated(true);
          // Check for profile selection ONLY if authenticated
          const currentProfileId = localStorage.getItem('current_profile_id');
          const currentName = localStorage.getItem('current_profile_name');
          
          if (!currentProfileId) {
            router.push('/select-profile');
          } else {
            setCurrentProfileId(currentProfileId);
            setProfileName(currentName || 'User');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch challenges
      fetch('/api/challenges')
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setChallenges(data.data);
          }
        })
        .catch(err => console.error('Failed to fetch challenges', err));
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    // After login, always go to select profile
    router.push('/select-profile');
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-primary">
        <div className="animate-pulse">
           {/* Spinner */}
           <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
           </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const myChallenges = challenges.filter(c => 
    c.participants?.some(p => p.profile_id === currentProfileId)
  );

  const availableChallenges = challenges.filter(c => 
    !c.participants?.some(p => p.profile_id === currentProfileId) && 
    (c.status === 'active' || c.status === 'upcoming')
  );

  const activeChallenge = myChallenges.find(c => c.status === 'active');

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Hi, {profileName}! 👋</h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Ready to crush your goals today?
            </p>
          </div>

          <InstallPWA />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-8 animate-slide-up">
             <div className="card">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg gradient-primary flex items-center justify-center">
                   <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <div>
                  <p className="text-text-secondary text-[10px] sm:text-sm uppercase font-bold sm:normal-case sm:font-normal">Active</p>
                  <p className="text-lg sm:text-2xl font-bold">{activeChallenge ? 1 : 0}</p>
                </div>
              </div>
            </div>
             <div className="card">
               <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg gradient-accent flex items-center justify-center">
                   <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                   </svg>
                 </div>
                 <div>
                   <p className="text-text-secondary text-[10px] sm:text-sm uppercase font-bold sm:normal-case sm:font-normal">Streak</p>
                   <p className="text-lg sm:text-2xl font-bold">
                     {activeChallenge?.participants?.find(p => p.profile_id === currentProfileId)?.current_streak || 0} days
                   </p>
                 </div>
               </div>
             </div>
          </div>

          {/* My Challenges Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">My Challenges</h3>
              <Link href="/challenges" className="text-primary text-sm hover:underline">View All</Link>
            </div>
             {myChallenges.length > 0 ? (
               <div className="grid gap-4 sm:grid-cols-2">
                 {myChallenges.map(challenge => (
                    <div key={challenge.id} className="card hover:shadow-xl transition-all p-4 sm:p-6 cursor-pointer" onClick={() => window.location.href = `/challenges/${challenge.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-bold truncate">{challenge.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          challenge.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {challenge.status}
                        </span>
                      </div>
                      <p className="text-text-secondary text-sm mb-4 line-clamp-1">{challenge.description}</p>
                      {(() => {
                        const participant = challenge.participants?.find(p => p.profile_id === currentProfileId);
                        const percentage = participant?.completion_percentage || 0;
                        return (
                          <>
                           <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                           </div>
                           <div className="flex justify-between items-center mt-1">
                             <p className="text-[10px] text-text-secondary">{participant?.current_streak || 0} day streak</p>
                             <p className="text-[10px] text-text-secondary font-bold">{percentage}% Complete</p>
                           </div>
                          </>
                        );
                      })()}
                    </div>
                 ))}
               </div>
             ) : (
                <div className="card text-center py-8">
                  <p className="text-text-secondary mb-4">You haven't joined any challenges yet.</p>
                  <Link href="/challenges" className="btn btn-primary">Discover Challenges</Link>
                </div>
             )}
          </div>

          {/* Available to Join Section */}
          {availableChallenges.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Available to Join</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableChallenges.map(challenge => (
                  <div key={challenge.id} className="card hover:shadow-xl transition-all p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold truncate">{challenge.name}</h4>
                      <span className="text-[10px] text-text-secondary">{challenge.duration_days} days</span>
                    </div>
                    <p className="text-text-secondary text-xs mb-4 line-clamp-2 flex-grow">{challenge.description}</p>
                    <Link href={`/challenges/${challenge.id}`} className="btn btn-secondary text-xs py-2 w-full text-center">
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>

  );
}

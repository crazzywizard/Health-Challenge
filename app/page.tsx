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
  const [activeChallenge, setActiveChallenge] = useState<ChallengeWithDetails | null>(null);
  const [profileName, setProfileName] = useState<string>('');

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
      // Fetch only active challenge for dashboard summary
      fetch('/api/challenges')
        .then(res => res.json())
        .then(data => {
          if (data.data) {
             const active = data.data.find((c: ChallengeWithDetails) => c.status === 'active');
             setActiveChallenge(active || null);
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('current_profile_id');
      localStorage.removeItem('current_profile_name');
      setIsAuthenticated(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header - Desktop Only mainly, but kept simple */}
      <header className="glass sticky top-0 z-50 border-b border-border desktop-only">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <h1 className="text-xl font-bold gradient-text">Health Challenge</h1>
           </div>
           <div className="flex items-center gap-4">
             <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
               <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs text-white font-bold">
                 {profileName.charAt(0).toUpperCase()}
               </div>
               <span className="text-sm font-medium">{profileName}</span>
             </Link>
             <button 
               onClick={handleLogout}
               className="btn btn-secondary text-sm py-2 px-4 text-red-500 border-red-200 dark:border-red-900/30"
             >
               Sign Out
             </button>
           </div>
        </div>
      </header>
       
       {/* Mobile Header */}
      <header className="glass sticky top-0 z-50 border-b border-border mobile-only pt-[var(--safe-area-top)]">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold gradient-text">Dashboard</h1>
           {/* Mini Profile Avatar in Header */}
           <Link href="/profile" className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs text-white font-bold">
              {profileName.charAt(0).toUpperCase()}
           </Link>
        </div>
      </header>

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
             {/* Same stats cards as before */}
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
                   <p className="text-lg sm:text-2xl font-bold">0 days</p>
                 </div>
               </div>
             </div>
          </div>

          {/* Active Challenge Preview */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Active Challenge</h3>
             {activeChallenge ? (
               <div className="card hover:shadow-xl transition-all p-4 sm:p-6 cursor-pointer" onClick={() => window.location.href = `/challenges/${activeChallenge.id}`}>
                 <div className="flex items-center justify-between mb-2">
                   <h4 className="text-lg font-bold">{activeChallenge.name}</h4>
                   <span className="text-primary text-sm">View &rarr;</span>
                 </div>
                 <p className="text-text-secondary text-sm mb-4 line-clamp-2">{activeChallenge.description}</p>
                 <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '0%' }}></div>
                 </div>
                 <p className="text-xs text-text-secondary mt-1 text-right">0% Complete</p>
               </div>
             ) : (
                <div className="card text-center py-8">
                  <p className="text-text-secondary mb-4">No active challenges. Start one today!</p>
                  <Link href="/challenges" className="btn btn-primary">Go to Challenges</Link>
                </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/app/types';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // Load profile from local storage (or potentially fetch fresh from API using ID)
    const profileId = localStorage.getItem('current_profile_id');
    
    // For now, we can just fetch all profiles and find ours, or just rely on local Name for speed
    // Ideally we fetch from /api/profiles to get the latest avatar color etc.
    if (profileId) {
      fetch('/api/profiles')
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            const current = data.data.find((p: Profile) => p.id === profileId);
            if (current) setProfile(current);
          }
        })
        .catch(console.error);
    }
  }, []);

  const handleSwitchProfile = () => {
    localStorage.removeItem('current_profile_id');
    localStorage.removeItem('current_profile_name');
    router.push('/select-profile');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('current_profile_id');
      localStorage.removeItem('current_profile_name');
      router.push('/');
      router.refresh(); 
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!profile) {
     // Basic fallback if waiting for load
     return (
       <div className="container mx-auto px-4 py-8 pb-24">
         <div className="animate-pulse flex items-center gap-4 mb-6">
           <div className="w-16 h-16 rounded-full bg-gray-200"></div>
           <div className="h-4 bg-gray-200 w-32 rounded"></div>
         </div>
       </div>
     )
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-full ${profile.avatar_color} shadow-lg flex items-center justify-center text-2xl font-bold text-white`}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-text-secondary">Keep crushing it!</p>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleSwitchProfile}
            className="w-full btn btn-secondary flex items-center justify-center gap-2"
          >
             <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
             </svg>
            Switch Profile
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full btn btn-secondary text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-200 dark:border-red-900/30"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Card Placeholder - To be connected to real data later */}
      <div className="card mb-6">
        <h3 className="text-lg font-bold mb-4">Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
           <div className="text-center p-3 bg-background rounded-lg">
             <div className="text-2xl font-bold gradient-text">0</div>
             <div className="text-xs text-text-secondary uppercase font-bold mt-1">Active</div>
           </div>
           <div className="text-center p-3 bg-background rounded-lg">
             <div className="text-2xl font-bold text-gray-400">0</div>
             <div className="text-xs text-text-secondary uppercase font-bold mt-1">Completed</div>
           </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-text-secondary">
        <p>Version 0.2.0 (Pro)</p>
        <p className="text-xs mt-1 opacity-50">Global ID: {profile.id}</p>
      </div>
    </div>
  );
}

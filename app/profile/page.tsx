'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Profile } from '@/app/types';
import AvatarPicker from '@/components/AvatarPicker';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  const fetchProfile = useCallback(async () => {
    const profileId = localStorage.getItem('current_profile_id');
    if (profileId) {
      try {
        const res = await fetch(`/api/profiles/${profileId}`);
        const data = await res.json();
        if (data.data) {
          setProfile(data.data);
          // Sync local storage
          localStorage.setItem('current_profile_name', data.data.name);
          localStorage.setItem('current_profile_avatar', data.data.avatar_url || '');
          localStorage.setItem('current_profile_color', data.data.avatar_color);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  const handleSwitchProfile = () => {
    localStorage.removeItem('current_profile_id');
    localStorage.removeItem('current_profile_name');
    router.push('/select-profile');
  };

  const handleUpdateAvatar = async (url: string) => {
    if (!profile) return;
    
    try {
      const res = await fetch(`/api/profiles/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: url }),
      });

      if (res.ok) {
        setIsEditingAvatar(false);
        fetchProfile(); // Refresh
        router.refresh(); // Refresh header
      }
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('current_profile_id');
      localStorage.removeItem('current_profile_name');
      localStorage.removeItem('current_profile_avatar');
      localStorage.removeItem('current_profile_color');
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
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="relative group">
            <div className={`w-24 h-24 rounded-2xl ${profile.avatar_color} shadow-lg flex items-center justify-center text-3xl font-bold text-white overflow-hidden`}>
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.name} fill className="object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <button 
              onClick={() => setIsEditingAvatar(!isEditingAvatar)}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-black rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-text-secondary">Keep crushing it!</p>
          </div>
        </div>

        {isEditingAvatar && (
          <div className="mb-8 p-6 bg-surface-elevated rounded-2xl border border-border animate-fade-in">
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-tertiary mb-4">Choose New Icon</h3>
            <AvatarPicker 
              onSelect={handleUpdateAvatar}
              currentUrl={profile.avatar_url || undefined}
            />
          </div>
        )}

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

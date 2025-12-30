'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Profile } from '@/app/types';
import AvatarPicker from '@/components/AvatarPicker';

export default function SelectProfilePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | undefined>();
  const [authChecked, setAuthChecked] = useState(false);

  const checkAuthAndFetchProfiles = useCallback(async () => {
    try {
      // 1. Check Auth
      const authRes = await fetch('/api/auth/verify');
      const authData = await authRes.json();
      
      if (!authRes.ok || !authData.authenticated) {
        router.push('/'); // Will redirect to login via page logic if not auth
        return;
      }
      setAuthChecked(true);

      // 2. Fetch Profiles
      const res = await fetch('/api/profiles');
      const data = await res.json();
      
      if (res.ok) {
        setProfiles(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthAndFetchProfiles();
  }, [checkAuthAndFetchProfiles]);

  const handleSelectProfile = (profile: Profile) => {
    // Store selected profile ID
    localStorage.setItem('current_profile_id', profile.id);
    localStorage.setItem('current_profile_name', profile.name);
    localStorage.setItem('current_profile_avatar', profile.avatar_url || '');
    localStorage.setItem('current_profile_color', profile.avatar_color);
    
    // Redirect to Dashboard
    router.push('/');
    router.refresh();
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    try {
      // Random gradient for avatar
      const gradients = [
        'bg-gradient-to-br from-blue-400 to-blue-600',
        'bg-gradient-to-br from-purple-400 to-purple-600',
        'bg-gradient-to-br from-pink-400 to-pink-600',
        'bg-gradient-to-br from-green-400 to-green-600',
        'bg-gradient-to-br from-yellow-400 to-orange-600',
        'bg-gradient-to-br from-teal-400 to-teal-600',
      ];
      const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProfileName,
          avatar_color: randomGradient,
          avatar_url: selectedAvatarUrl
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNewProfileName('');
        setSelectedAvatarUrl(undefined);
        setIsCreating(false);
        // Refresh list
        checkAuthAndFetchProfiles();
        // Optionally auto-select the new profile
        handleSelectProfile(data.data);
      }
    } catch (error) {
      console.error('Failed to create profile:', error);
    }
  };

  if (isLoading || !authChecked) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse">
           <span className="text-white text-xl font-bold tracking-widest">LOADING...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-bold mb-12">Select profile</h1>
        
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {profiles.map((profile) => (
            <div 
              key={profile.id}
              onClick={() => handleSelectProfile(profile)}
              className="group cursor-pointer flex flex-col items-center gap-3 w-32"
            >
              <div className={`w-32 h-32 rounded-lg ${profile.avatar_color} shadow-lg group-hover:ring-4 group-hover:ring-white transition-all transform group-hover:scale-105 flex items-center justify-center overflow-hidden relative`}>
                 {profile.avatar_url ? (
                   <Image 
                     src={profile.avatar_url} 
                     alt={profile.name}
                     fill
                     className="object-cover"
                   />
                 ) : (
                   <span className="text-4xl font-bold text-white opacity-80 uppercase">{profile.name.charAt(0)}</span>
                 )}
              </div>
              <span className="text-lg text-gray-400 group-hover:text-white transition-colors">{profile.name}</span>
            </div>
          ))}

          {/* Add Profile Button */}
          <div 
             onClick={() => setIsCreating(true)}
             className="group cursor-pointer flex flex-col items-center gap-3 w-32"
          >
             <div className="w-32 h-32 rounded-lg border-2 border-gray-600 hover:border-white bg-transparent flex items-center justify-center transition-all group-hover:bg-gray-800">
               <svg className="w-12 h-12 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
               </svg>
             </div>
             <span className="text-lg text-gray-400 group-hover:text-white transition-colors">Add Profile</span>
          </div>
        </div>
      </div>

      {/* Create Profile Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-[#141414] p-8 rounded-lg max-w-xl w-full border border-gray-800 max-h-[90vh] overflow-y-auto">
             <h2 className="text-2xl font-bold mb-6">Add Profile</h2>
             <form onSubmit={handleCreateProfile}>
               <div className="mb-6">
                 <label className="block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">Name</label>
                 <input 
                   type="text" 
                   value={newProfileName}
                   onChange={(e) => setNewProfileName(e.target.value)}
                   placeholder="Enter your name"
                   className="w-full bg-[#333] border-none text-white placeholder-gray-500 rounded p-3 focus:ring-2 focus:ring-white"
                   autoFocus
                 />
               </div>

               <div className="mb-8">
                 <label className="block text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Choose an Icon</label>
                 <AvatarPicker 
                   onSelect={(url) => setSelectedAvatarUrl(url)}
                   currentUrl={selectedAvatarUrl}
                 />
               </div>

               <div className="flex gap-4">
                 <button 
                   type="submit"
                   className={`flex-1 bg-white text-black font-bold py-2 rounded hover:bg-red-600 hover:text-white transition-colors ${!newProfileName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={!newProfileName.trim()}
                 >
                   Save
                 </button>
                 <button 
                   type="button"
                   onClick={() => setIsCreating(false)}
                   className="flex-1 bg-transparent border border-gray-500 text-gray-400 font-bold py-2 rounded hover:border-white hover:text-white transition-colors"
                 >
                   Cancel
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

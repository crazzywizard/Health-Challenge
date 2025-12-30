'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

const PREDEFINED_ICONS = [
  { id: 'kettlebell', url: '/avatars/kettlebell.png', label: 'Kettlebell' },
  { id: 'biceps', url: '/avatars/biceps.png', label: 'Strength' },
  { id: 'running_shoe', url: '/avatars/running_shoe.png', label: 'Cardio' },
  { id: 'heart_pulse', url: '/avatars/heart_pulse.png', label: 'Health' },
  { id: 'water_bottle', url: '/avatars/water_bottle.png', label: 'Hydration' },
  { id: 'avocado', url: '/avatars/avocado.png', label: 'Nutrition' },
  { id: 'stopwatch', url: '/avatars/stopwatch.png', label: 'Timing' },
  { id: 'lotus', url: '/avatars/lotus.png', label: 'Mindfulness' },
  { id: 'mountain', url: '/avatars/mountain.png', label: 'Achievement' },
  { id: 'checklist', url: '/avatars/checklist.png', label: 'Consistency' },
];

interface AvatarPickerProps {
  onSelect: (url: string) => void;
  currentUrl?: string;
}

export default function AvatarPicker({ onSelect, currentUrl }: AvatarPickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        onSelect(data.url);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        {PREDEFINED_ICONS.map((icon) => (
          <button
            key={icon.id}
            type="button"
            onClick={() => onSelect(icon.url)}
            className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
              currentUrl === icon.url ? 'border-white scale-105 shadow-lg lg:shadow-white/20' : 'border-transparent hover:border-gray-600'
            } bg-gray-900 group`}
          >
            <Image
              src={icon.url}
              alt={icon.label}
              fill
              className="object-contain p-2 group-hover:scale-110 transition-transform"
            />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-700 hover:border-white hover:bg-gray-900 transition-all flex items-center justify-center gap-2 group"
      >
        {isUploading ? (
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
        <span className="text-gray-400 group-hover:text-white font-medium">
          {isUploading ? 'Uploading...' : 'Upload from gallery'}
        </span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}

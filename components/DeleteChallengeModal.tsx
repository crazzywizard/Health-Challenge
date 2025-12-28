'use client';

import { useState } from 'react';

interface DeleteChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  challengeName: string;
}

export default function DeleteChallengeModal({ isOpen, onClose, onConfirm, challengeName }: DeleteChallengeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete challenge');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md glass rounded-2xl p-6 animate-scale-in border border-red-500/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-red-500">Delete Challenge</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-border transition-colors flex items-center justify-center"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-text-secondary font-medium">
            Are you sure you want to delete <span className="text-text font-bold">"{challengeName}"</span>?
          </p>
          <p className="text-sm text-text-tertiary">
            This action cannot be undone. All participants, rules, and daily progress for this challenge will be permanently deleted.
          </p>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="btn bg-red-600 hover:bg-red-700 text-white flex-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Challenge'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

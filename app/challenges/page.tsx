'use client';

import { useState, useEffect } from 'react';
import ChallengeList from '@/components/ChallengeList';
import CreateChallengeModal from '@/components/CreateChallengeModal';
import DeleteChallengeModal from '@/components/DeleteChallengeModal';
import { ChallengeWithDetails } from '@/app/types';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<ChallengeWithDetails | null>(null);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/challenges');
      const data = await response.json();
      if (response.ok) {
        setChallenges(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleCreateSuccess = () => {
    fetchChallenges();
  };

  const handleDeleteChallenge = async () => {
    if (!challengeToDelete) return;
    try {
      const response = await fetch(`/api/challenges/${challengeToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChallengeToDelete(null);
        fetchChallenges();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete challenge');
      }
    } catch (error) {
      console.error('Failed to delete challenge:', error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Challenges</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create
        </button>
      </div>

      <ChallengeList 
        challenges={challenges} 
        loading={loading}
        onDelete={setChallengeToDelete}
        showCreateButton={true}
        onCreateClick={() => setShowCreateModal(true)}
      />

      <CreateChallengeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {challengeToDelete && (
        <DeleteChallengeModal
          isOpen={!!challengeToDelete}
          onClose={() => setChallengeToDelete(null)}
          onConfirm={handleDeleteChallenge}
          challengeName={challengeToDelete.name}
        />
      )}
    </div>
  );
}

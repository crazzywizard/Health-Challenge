'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginPage from '@/components/LoginPage';
import CreateChallengeModal from '@/components/CreateChallengeModal';
import DeleteChallengeModal from '@/components/DeleteChallengeModal';
import { ChallengeWithDetails } from '@/app/types';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [challenges, setChallenges] = useState<ChallengeWithDetails[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<ChallengeWithDetails | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        if (response.ok && data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const response = await fetch('/api/challenges');
      const data = await response.json();
      if (response.ok) {
        setChallenges(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoadingChallenges(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchChallenges();
    }
  }, [isAuthenticated]);

  const handleCreateSuccess = () => {
    fetchChallenges();
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-primary">
        <div className="animate-pulse">
          <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold gradient-text">Health Challenge</h1>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 animate-slide-up">
            <h2 className="text-3xl font-bold mb-2">Welcome Back! 👋</h2>
            <p className="text-text-secondary">
              Track your health challenges and stay motivated
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Active Challenges</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg gradient-secondary flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Participants</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Current Streak</p>
                  <p className="text-2xl font-bold">0 days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Challenges Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Your Challenges</h3>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                <svg
                  className="w-5 h-5"
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
                Create Challenge
              </button>
            </div>

            {loadingChallenges ? (
              <div className="card text-center py-12">
                <div className="animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4" />
                  <div className="h-4 bg-border rounded w-32 mx-auto mb-2" />
                  <div className="h-3 bg-border rounded w-48 mx-auto" />
                </div>
              </div>
            ) : challenges.length === 0 ? (
              <div className="card text-center py-12 animate-scale-in">
                <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center opacity-50">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2">No challenges yet</h4>
                <p className="text-text-secondary mb-6">
                  Create your first challenge to get started on your health journey
                </p>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                  Get Started
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="card hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold">{challenge.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            challenge.status === 'active' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : challenge.status === 'upcoming'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {challenge.status}
                          </span>
                        </div>
                        {challenge.description && (
                          <p className="text-text-secondary mb-3">{challenge.description}</p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-text-secondary">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{challenge.duration_days} days</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <span>{challenge.rules?.length || 0} rules</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>{challenge.participants?.length || 0} participants</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setChallengeToDelete(challenge)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                          title="Delete Challenge"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <Link 
                          href={`/challenges/${challenge.id}`}
                          className="btn btn-secondary text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Challenge Modal */}
      <CreateChallengeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Delete Challenge Modal */}
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
